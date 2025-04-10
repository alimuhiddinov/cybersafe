import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { debounce } from 'lodash'; // Add debounce for search optimization

// Component imports
import Layout from '../../components/layout/Layout';
import ModuleCard from '../../components/modules/ModuleCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import ModuleNavigation from '../../components/modules/ModuleNavigation';
import ModuleSidebar from '../../components/modules/ModuleSidebar';
import ModuleProgressTracker from '../../components/modules/ModuleProgressTracker';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Types
export type Module = {
  id: number;
  title: string;
  description: string;
  difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  estimatedTimeMinutes: number;
  points: number;
  imageUrl: string | null;
  isPublished: boolean;
  completionStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progressPercentage?: number;
};

export type ModuleFiltersType = {
  search: string;
  difficulty: string;
  status: string;
  sort: string;
  category?: string;
  length?: string; // Add length property to fix type error
};

const ITEMS_PER_PAGE = 9;

const ModulesPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // State
  const [modules, setModules] = useState<Module[]>([]);
  const [featuredModules, setFeaturedModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalModules, setTotalModules] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [filters, setFilters] = useState<ModuleFiltersType>({
    search: '',
    difficulty: '',
    status: '',
    sort: 'newest',
    category: ''
  });
  
  // State for filter dropdowns
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  
  // State for user's in-progress modules (for the tracker)
  const [userModules, setUserModules] = useState<{
    id: number;
    title: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    progressPercentage: number;
  }[]>([]);
  
  // Filter options
  const difficultyOptions = ['All', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
  const categoryOptions = ['All', 'Assessment', 'Social Engineering', 'Password Security', 'Phishing', 'Device Security', 'Network Security', 'Incident Response'];
  const lengthOptions = ['All', 'Under 30 min', '30-60 min', 'Over 60 min'];
  
  // Default images for different module categories
  const getModuleImage = (moduleTitle: string): string => {
    // Map titles to generalized categories for images
    if (moduleTitle.toLowerCase().includes('iq') || moduleTitle.toLowerCase().includes('assessment')) {
      return '/images/modules/assessment.png';
    } else if (moduleTitle.toLowerCase().includes('social')) {
      return '/images/modules/social.png';
    } else if (moduleTitle.toLowerCase().includes('password')) {
      return '/images/modules/password.png';
    } else if (moduleTitle.toLowerCase().includes('phishing')) {
      return '/images/modules/phishing.png';
    } else if (moduleTitle.toLowerCase().includes('device') || moduleTitle.toLowerCase().includes('physical')) {
      return '/images/modules/device.png';
    } else if (moduleTitle.toLowerCase().includes('wireless') || moduleTitle.toLowerCase().includes('wifi') || moduleTitle.toLowerCase().includes('wi-fi')) {
      return '/images/modules/wifi.png';
    } else if (moduleTitle.toLowerCase().includes('incident') || moduleTitle.toLowerCase().includes('response')) {
      return '/images/modules/incident.png';
    }
    // Default image if no category matches
    return '/images/modules/default.png';
  };

  // Fetch modules with filters - use signal for cancellation
  const fetchModules = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal // Add AbortSignal to cancel requests
      };
      
      // Construct query parameters
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.difficulty && filters.difficulty !== 'All') queryParams.append('difficulty', filters.difficulty);
      if (filters.category && filters.category !== 'All') queryParams.append('category', filters.category);
      
      // Add tab-specific filters
      if (activeTab === 'myModules') {
        queryParams.append('userProgress', 'true');
      } else if (activeTab === 'featured') {
        queryParams.append('featured', 'true');
      } else if (activeTab === 'newReleases') {
        queryParams.append('newReleases', 'true');
      }
      
      // Add published filter - only admins see unpublished modules
      if (!(user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR')) {
        queryParams.append('published', 'true');
      }
      
      // Add sorting
      let orderBy = 'createdAt';
      let orderDirection = 'desc';
      
      switch (filters.sort) {
        case 'oldest':
          orderBy = 'createdAt';
          orderDirection = 'asc';
          break;
        case 'a-z':
          orderBy = 'title';
          orderDirection = 'asc';
          break;
        case 'z-a':
          orderBy = 'title';
          orderDirection = 'desc';
          break;
        case 'easiest':
          orderBy = 'difficultyLevel';
          orderDirection = 'asc';
          break;
        case 'hardest':
          orderBy = 'difficultyLevel';
          orderDirection = 'desc';
          break;
      }
      
      queryParams.append('orderBy', orderBy);
      queryParams.append('orderDirection', orderDirection);
      
      // Add pagination
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', ITEMS_PER_PAGE.toString());
      
      try {
        // Fetch modules
        const response = await axios.get(
          `${API_URL}/modules?${queryParams.toString()}`,
          config
        );
        
        if (response.data && Array.isArray(response.data.items)) {
          const fetchedModules = response.data.items;
          setModules(fetchedModules);
          setTotalModules(response.data.total || fetchedModules.length);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching modules:', error);
        setError('Failed to fetch modules. Using sample data instead.');
        
        // Use sample data as fallback
        console.log('Using sample module data as fallback');
        const sampleModules: Module[] = [
          {
            id: 1,
            title: "Cybersecurity IQ Check",
            description: "Assess your current cybersecurity awareness level and identify areas for improvement through a comprehensive self-assessment.",
            difficultyLevel: "BEGINNER",
            estimatedTimeMinutes: 30,
            points: 100,
            imageUrl: "/images/modules/cybersecurity-iq.jpg",
            isPublished: true
          },
          {
            id: 2,
            title: "Social Engineering",
            description: "Learn to recognize and defend against psychological manipulation tactics used by attackers to gain access to systems and sensitive information.",
            difficultyLevel: "INTERMEDIATE",
            estimatedTimeMinutes: 60,
            points: 150,
            imageUrl: "/images/modules/social-engineering.jpg",
            isPublished: true
          },
          {
            id: 3,
            title: "Password Strength",
            description: "Understand what makes a password vulnerable and learn strategies for creating and managing strong, unique passwords across all your accounts.",
            difficultyLevel: "BEGINNER",
            estimatedTimeMinutes: 45,
            points: 120,
            imageUrl: "/images/modules/password-strength.jpg",
            isPublished: true
          },
          {
            id: 4,
            title: "Phishing Awareness",
            description: "Develop the skills to identify suspicious emails, messages, and websites designed to steal your information or install malware.",
            difficultyLevel: "BEGINNER",
            estimatedTimeMinutes: 50,
            points: 130,
            imageUrl: "/images/modules/phishing-awareness.jpg",
            isPublished: true
          },
          {
            id: 5,
            title: "Physical Hacking and Device Security",
            description: "Protect your devices from physical tampering and learn security measures for hardware vulnerabilities.",
            difficultyLevel: "INTERMEDIATE",
            estimatedTimeMinutes: 55,
            points: 140,
            imageUrl: "/images/modules/device-security.jpg",
            isPublished: true
          },
          {
            id: 6,
            title: "Wireless Threats (Wi-Fi Security)",
            description: "Understand the risks of wireless networks and implement proper security measures for your Wi-Fi connections.",
            difficultyLevel: "INTERMEDIATE",
            estimatedTimeMinutes: 60,
            points: 150,
            imageUrl: "/images/modules/wifi-security.jpg",
            isPublished: true
          },
          {
            id: 7,
            title: "Incident Response",
            description: "Learn how to respond effectively to security incidents and minimize damage when breaches occur.",
            difficultyLevel: "ADVANCED",
            estimatedTimeMinutes: 70,
            points: 170,
            imageUrl: "/images/modules/incident-response.jpg",
            isPublished: true
          }
        ];
        
        // Set featured modules using sample data
        if (activeTab === 'featured' || activeTab === 'all') {
          setFeaturedModules(sampleModules.slice(0, 3));
        }
        
        setModules(sampleModules);
        setTotalModules(sampleModules.length);
      } finally {
        setLoading(false);
      }
    } catch (err: any) {
      // Only set error if request wasn't cancelled
      if (!axios.isCancel(err)) {
        console.error('Error fetching modules:', err);
        setError(err.response?.data?.message || 'Failed to load modules. Please try again.');
      }
    }
  }, [filters, currentPage, activeTab, isAuthenticated, user?.role]);

  // Debounced search handler to prevent excessive API calls
  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      setFilters(prev => ({ ...prev, search: searchValue }));
      setCurrentPage(1); // Reset to first page on search
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  // Apply filters and reset to page 1
  const applyFilters = (newFilters: Partial<ModuleFiltersType>) => {
    setCurrentPage(1);
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
    // Close filter dropdown after selection
    setOpenFilter(null);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    // Validate page is within bounds
    const validPage = Math.max(1, Math.min(page, Math.ceil(totalModules / ITEMS_PER_PAGE)));
    setCurrentPage(validPage);
  };

  // Navigate to module details
  const handleViewModule = (moduleId: number) => {
    router.push(`/modules/${moduleId}`);
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    // Reset ALL filters when changing tabs, not just search
    setFilters({
      search: '',
      difficulty: '',
      status: '',
      sort: 'newest',
      category: ''
    });
    // Close any open filter dropdown
    setOpenFilter(null);
  };
  
  // Toggle filter dropdown
  const toggleFilter = (filterName: string) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  // Calculate total pages for pagination
  const totalPages = Math.ceil(totalModules / ITEMS_PER_PAGE);

  // Fetch modules when filters, page, or active tab changes
  useEffect(() => {
    // Use AbortController to cancel previous requests
    const controller = new AbortController();
    
    // Try to fetch modules from API first
    fetchModules(controller.signal)
      .catch(err => {
        console.error("Error fetching modules:", err);
      });
    
    // Cleanup function to cancel in-flight requests
    return () => {
      controller.abort();
    };
  }, [fetchModules]);

  // Fetch user's modules for progress tracker
  useEffect(() => {
    const fetchUserModules = async () => {
      if (!isAuthenticated) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get(`${API_URL}/progress/modules`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && Array.isArray(response.data)) {
          setUserModules(response.data.map(module => ({
            id: module.id,
            title: module.title,
            status: module.completionStatus || 'NOT_STARTED',
            progressPercentage: module.progressPercentage || 0
          })));
        }
      } catch (error) {
        console.error('Error fetching user modules:', error);
      }
    };
    
    fetchUserModules();
  }, [isAuthenticated]);

  return (
    <Layout title="Learning Modules | CyberSafe" description="Browse cybersecurity learning modules">
      {/* Module Navigation */}
      <div className="container mx-auto px-4 pt-8">
        <ModuleNavigation currentStep="selection" />
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block">
            <ModuleSidebar 
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
            
            {/* Progress Tracker (only visible for authenticated users) */}
            {isAuthenticated && userModules.length > 0 && (
              <div className="mt-8">
                <ModuleProgressTracker 
                  modules={userModules} 
                  title="Your Learning Progress"
                  showCompleted={false}
                />
              </div>
            )}
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Search bar */}
            <div className="relative mb-8">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-navy-700 rounded-md leading-5 bg-navy-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search modules..."
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
            
            {/* Tabs (Mobile Only) */}
            <div className="lg:hidden mb-6">
              <div className="flex space-x-1 overflow-x-auto pb-2">
                <button
                  onClick={() => handleTabChange('all')}
                  className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                    activeTab === 'all' ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-navy-800'
                  }`}
                >
                  All Modules
                </button>
                {isAuthenticated && (
                  <button
                    onClick={() => handleTabChange('myModules')}
                    className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                      activeTab === 'myModules' ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-navy-800'
                    }`}
                  >
                    My Modules
                  </button>
                )}
                <button
                  onClick={() => handleTabChange('featured')}
                  className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                    activeTab === 'featured' ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-navy-800'
                  }`}
                >
                  Featured
                </button>
                <button
                  onClick={() => handleTabChange('newReleases')}
                  className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                    activeTab === 'newReleases' ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-navy-800'
                  }`}
                >
                  New Releases
                </button>
              </div>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              {/* Difficulty Filter */}
              <div className="relative">
                <button
                  onClick={() => toggleFilter('difficulty')}
                  className="px-3 py-2 border border-navy-700 rounded-md text-sm font-medium bg-navy-800 text-gray-300 hover:bg-navy-700 focus:outline-none flex items-center"
                >
                  Difficulty
                  {filters.difficulty && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-900 text-xs rounded-full">
                      {filters.difficulty}
                    </span>
                  )}
                  <svg
                    className={`ml-2 h-5 w-5 text-gray-400 ${openFilter === 'difficulty' ? 'transform rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                
                {/* Difficulty Dropdown */}
                {openFilter === 'difficulty' && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-navy-800 ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {difficultyOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            applyFilters({ difficulty: option === 'All' ? '' : option });
                            setOpenFilter(null);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            filters.difficulty === option
                              ? 'bg-blue-900 text-white'
                              : 'text-gray-300 hover:bg-navy-700'
                          }`}
                          role="menuitem"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Category Filter */}
              <div className="relative">
                <button
                  onClick={() => toggleFilter('category')}
                  className="px-3 py-2 border border-navy-700 rounded-md text-sm font-medium bg-navy-800 text-gray-300 hover:bg-navy-700 focus:outline-none flex items-center"
                >
                  Category
                  {filters.category && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-900 text-xs rounded-full">
                      {filters.category}
                    </span>
                  )}
                  <svg
                    className={`ml-2 h-5 w-5 text-gray-400 ${openFilter === 'category' ? 'transform rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                
                {/* Category Dropdown */}
                {openFilter === 'category' && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-navy-800 ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {categoryOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            applyFilters({ category: option === 'All' ? '' : option });
                            setOpenFilter(null);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            filters.category === option
                              ? 'bg-blue-900 text-white'
                              : 'text-gray-300 hover:bg-navy-700'
                          }`}
                          role="menuitem"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Length Filter */}
              <div className="relative">
                <button
                  onClick={() => toggleFilter('length')}
                  className="px-3 py-2 border border-navy-700 rounded-md text-sm font-medium bg-navy-800 text-gray-300 hover:bg-navy-700 focus:outline-none flex items-center"
                >
                  Length
                  <svg
                    className={`ml-2 h-5 w-5 text-gray-400 ${openFilter === 'length' ? 'transform rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                
                {/* Length Dropdown */}
                {openFilter === 'length' && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-navy-800 ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {lengthOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            applyFilters({ length: option === 'All' ? '' : option });
                            setOpenFilter(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-navy-700"
                          role="menuitem"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Sort Filter */}
              <div className="relative ml-auto">
                <button
                  onClick={() => toggleFilter('sort')}
                  className="px-3 py-2 border border-navy-700 rounded-md text-sm font-medium bg-navy-800 text-gray-300 hover:bg-navy-700 focus:outline-none flex items-center"
                >
                  Sort by: {filters.sort || 'Newest'}
                  <svg
                    className={`ml-2 h-5 w-5 text-gray-400 ${openFilter === 'sort' ? 'transform rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                
                {/* Sort Dropdown */}
                {openFilter === 'sort' && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-navy-800 ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <button
                        onClick={() => {
                          applyFilters({ sort: 'newest' });
                          setOpenFilter(null);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          filters.sort === 'newest' ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-navy-700'
                        }`}
                        role="menuitem"
                      >
                        Newest
                      </button>
                      <button
                        onClick={() => {
                          applyFilters({ sort: 'oldest' });
                          setOpenFilter(null);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          filters.sort === 'oldest' ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-navy-700'
                        }`}
                        role="menuitem"
                      >
                        Oldest
                      </button>
                      <button
                        onClick={() => {
                          applyFilters({ sort: 'a-z' });
                          setOpenFilter(null);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          filters.sort === 'a-z' ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-navy-700'
                        }`}
                        role="menuitem"
                      >
                        A-Z
                      </button>
                      <button
                        onClick={() => {
                          applyFilters({ sort: 'z-a' });
                          setOpenFilter(null);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          filters.sort === 'z-a' ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-navy-700'
                        }`}
                        role="menuitem"
                      >
                        Z-A
                      </button>
                      <button
                        onClick={() => {
                          applyFilters({ sort: 'easiest' });
                          setOpenFilter(null);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          filters.sort === 'easiest' ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-navy-700'
                        }`}
                        role="menuitem"
                      >
                        Easiest
                      </button>
                      <button
                        onClick={() => {
                          applyFilters({ sort: 'hardest' });
                          setOpenFilter(null);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          filters.sort === 'hardest' ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-navy-700'
                        }`}
                        role="menuitem"
                      >
                        Hardest
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Page Content */}
            <div>
              {/* Error message */}
              {error && <ErrorAlert message={error} />}
              
              {/* Featured modules section (only on main page) */}
              {activeTab === 'all' && currentPage === 1 && !filters.search && !filters.difficulty && featuredModules.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6">Featured</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {featuredModules.map((module) => (
                      <ModuleCard 
                        key={`featured-${module.id}`}
                        module={module}
                        onClick={() => handleViewModule(module.id)}
                        featured={true}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Module Library section */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Module Library</h2>
                
                {/* Module grid */}
                <div className="mt-6">
                  {loading ? (
                    <div className="flex justify-center py-20">
                      <LoadingSpinner size="large" />
                    </div>
                  ) : modules.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {modules.map((module) => (
                          <ModuleCard 
                            key={module.id}
                            module={module}
                            onClick={() => handleViewModule(module.id)}
                          />
                        ))}
                      </div>
                      
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex justify-center mt-10">
                          <nav className="flex items-center space-x-1">
                            <button
                              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                              className={`p-2 rounded-md border border-navy-700 hover:bg-navy-800 ${
                                currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              aria-label="Previous page"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum = i + 1;
                              
                              // Adjust shown pages for many pages
                              if (totalPages > 5) {
                                if (currentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                  pageNum = totalPages - 4 + i;
                                } else {
                                  pageNum = currentPage - 2 + i;
                                }
                              }
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handlePageChange(pageNum)}
                                  className={`w-9 h-9 flex items-center justify-center rounded-md ${
                                    currentPage === pageNum
                                      ? 'bg-blue-600 text-white'
                                      : 'border border-navy-700 hover:bg-navy-800'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                            
                            <button
                              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                              disabled={currentPage === totalPages}
                              className={`p-2 rounded-md border border-navy-700 hover:bg-navy-800 ${
                                currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              aria-label="Next page"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </nav>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-navy-800 rounded-xl">
                      <div className="text-5xl mb-6">📚</div>
                      <h3 className="text-2xl font-semibold text-gray-200 mb-2">No modules found</h3>
                      <p className="text-gray-400 text-center max-w-md">
                        {filters.search || filters.difficulty || filters.category
                          ? 'Try adjusting your filters to find more learning modules.'
                          : 'No learning modules are available at the moment. Check back later!'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ModulesPage;
