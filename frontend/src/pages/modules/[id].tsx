import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Module } from './index';
import { ModuleStructuredContent } from '../../components/modules/ModuleDetailContent';

// Import the components we need
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import ModuleContentRenderer from '../../components/modules/ModuleContentRenderer';
import ModuleNavigation from '../../components/modules/ModuleNavigation';
import ModuleContextNav from '../../components/modules/ModuleContextNav';
import ProgressIndicator from '../../components/modules/ProgressIndicator';
import ModuleDetailContent from '../../components/modules/ModuleDetailContent';
import { getModuleContent, getModuleContentByTitle } from '../../data/modules';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Extended module type with content
interface ModuleDetail extends Omit<Module, 'imageUrl'> {
  content: string;
  prerequisites?: string;
  createdAt: string;
  updatedAt: string;
  imageUrl: string | null | undefined; // Match Module interface but allow undefined
}

const ModuleDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // State
  const [module, setModule] = useState<ModuleDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'content'>('overview');
  const [userProgress, setUserProgress] = useState<{
    completionStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    progressPercentage: number;
    completedAt?: string;
  }>({
    completionStatus: 'NOT_STARTED',
    progressPercentage: 0
  });
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [structuredContent, setStructuredContent] = useState<ModuleStructuredContent | null>(null);

  // Fetch module details
  useEffect(() => {
    if (!id) return;
    
    const moduleId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
    fetchModuleDetails(moduleId);
  }, [id, isAuthenticated]);

  const fetchModuleDetails = async (moduleId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const config = token 
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      
      // Fetch module data
      let moduleData;
      try {
        const response = await axios.get(`${API_URL}/modules/${moduleId}`, config);
        if (response.data) {
          moduleData = response.data;
        }
      } catch (apiError) {
        console.warn('API fetch failed, using fallback data:', apiError);
        // If API fails, create fallback module data based on the ID
        const moduleNumId = parseInt(moduleId, 10);
        if (!isNaN(moduleNumId) && moduleNumId >= 1 && moduleNumId <= 7) {
          // Create sample module data based on structured content
          const content = getModuleContent(moduleNumId);
          if (content) {
            moduleData = {
              id: moduleNumId,
              title: content.title,
              description: content.overview.substring(0, 150) + '...',
              difficultyLevel: 'INTERMEDIATE',
              estimatedTimeMinutes: 60,
              points: 100,
              content: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              imageUrl: null
            };
          }
        }
      }
      
      // If we have module data (either from API or fallback), proceed
      if (moduleData) {
        setModule(moduleData);
        
        // Get structured content by ID or title
        const moduleNumId = parseInt(moduleId, 10);
        console.log('Module ID (string):', moduleId);
        console.log('Module ID (number):', moduleNumId);
        
        // Try by ID first
        let content = getModuleContent(moduleNumId);
        
        // If not found by ID, try by title
        if (!content && moduleData.title) {
          console.log('Trying to find content by title:', moduleData.title);
          content = getModuleContentByTitle(moduleData.title);
        }
        
        console.log('Structured content found:', content ? 'Yes' : 'No');
        if (content) {
          console.log('Content title:', content.title);
        }
        
        setStructuredContent(content);
        
        // If user is authenticated, fetch progress
        if (isAuthenticated && token) {
          try {
            const progressResponse = await axios.get(
              `${API_URL}/progress/module/${moduleId}`,
              config
            );
            
            if (progressResponse.data) {
              setUserProgress({
                completionStatus: progressResponse.data.completionStatus || 'NOT_STARTED',
                progressPercentage: progressResponse.data.progressPercentage || 0,
                completedAt: progressResponse.data.completedAt
              });
            }
          } catch (err) {
            console.error('Error fetching module progress:', err);
          }
        }
      } else {
        throw new Error('Module not found');
      }
    } catch (err: any) {
      console.error('Error fetching module details:', err);
      setError(err.response?.data?.message || 'Failed to load module details');
    } finally {
      setLoading(false);
    }
  };

  // API endpoint to record module activity
  const recordModuleActivity = async (moduleId: string | number | undefined, activityType: string) => {
    try {
      if (!moduleId) return; // Skip if moduleId is undefined
      
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Convert moduleId to string if it's a number
      const moduleIdStr = typeof moduleId === 'number' ? moduleId.toString() : moduleId;
      
      await axios.post(
        `${API_URL}/progress/activity`,
        { moduleId: moduleIdStr, activityType },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      console.log(`Activity recorded: ${activityType}`);
    } catch (err) {
      console.error('Error recording module activity:', err);
    }
  };

  // Handle module completion
  const handleCompleteModule = async () => {
    try {
      setUpdatingProgress(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login?redirect=' + encodeURIComponent(`/modules/${id}`));
        return;
      }
      
      const moduleId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
      const response = await axios.post(
        `${API_URL}/progress/module/${moduleId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.progress) {
        // Update local progress state
        setUserProgress({
          ...userProgress,
          completionStatus: 'COMPLETED',
          progressPercentage: 100,
          completedAt: new Date().toISOString()
        });
        
        // Show success message
        setSuccessMessage('Module completed! You\'ve earned points and a badge for completing this module.');
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error completing module:', error);
      setErrorMessage('Failed to complete module. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setUpdatingProgress(false);
    }
  };

  // Start or continue module
  const handleStartModule = async () => {
    if (!isAuthenticated) {
      // Redirect to login
      router.push('/login?redirect=' + encodeURIComponent(`/modules/${id}`));
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Update user progress to IN_PROGRESS if not already started
      if (userProgress.completionStatus === 'NOT_STARTED') {
        const moduleId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
        await axios.post(
          `${API_URL}/progress/module/${moduleId}/start`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      // Switch to content tab
      setActiveTab('content');
      
      // Record activity
      const moduleId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
      await recordModuleActivity(moduleId, 'MODULE_STARTED');
    } catch (err) {
      console.error('Error starting module:', err);
    }
  };

  // Render difficulty badge
  const renderDifficultyBadge = (level: string) => {
    let bgColor = 'bg-green-100 text-green-800';
    
    switch (level) {
      case 'BEGINNER':
        bgColor = 'bg-green-100 text-green-800';
        break;
      case 'INTERMEDIATE':
        bgColor = 'bg-blue-100 text-blue-800';
        break;
      case 'ADVANCED':
        bgColor = 'bg-purple-100 text-purple-800';
        break;
      case 'EXPERT':
        bgColor = 'bg-red-100 text-red-800';
        break;
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
        {level.charAt(0) + level.slice(1).toLowerCase()}
      </span>
    );
  };

  // Format time
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours} hr ${remainingMinutes} min` 
      : `${hours} hr`;
  };

  return (
    <Layout title={module ? `${module.title} | CyberSafe` : 'Module | CyberSafe'} description="Learn about cybersecurity">
      <div className="min-h-screen">
        {/* Module Navigation */}
        <div className="container mx-auto px-4 pt-8">
          <ModuleNavigation currentStep="content" />
        </div>
        
        {loading ? (
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col items-center justify-center py-16">
              <LoadingSpinner size="large" />
              <p className="mt-4 text-gray-400">Loading module content...</p>
            </div>
          </div>
        ) : error ? (
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded mb-6">
              <div className="flex">
                <div className="py-1">
                  <svg className="h-6 w-6 text-red-300 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold">{error}</p>
                  <p className="text-sm">Please try again later or select a different module.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => router.push('/modules')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Back to Modules
              </button>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8">
            {/* Module header */}
            {module && (
              <div className="bg-navy-900 border border-navy-800 rounded-lg overflow-hidden shadow-lg">
                {/* Module header */}
                <div className="bg-navy-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold">{module.title}</h1>
                    
                    {/* Module metadata */}
                    <div className="flex flex-wrap gap-3 mt-2">
                      {/* Difficulty */}
                      {renderDifficultyBadge(module.difficultyLevel)}
                      
                      {/* Duration */}
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTime(module.estimatedTimeMinutes)}
                      </span>
                      
                      {/* Points */}
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {module.points} XP
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress indicator (only visible for authenticated users) */}
                  {isAuthenticated && (
                    <div className="w-full md:w-auto">
                      <ProgressIndicator 
                        status={userProgress.completionStatus}
                        percentage={userProgress.progressPercentage}
                      />
                    </div>
                  )}
                </div>
                
                {/* Module navigation tabs */}
                <div className="border-b border-navy-800">
                  <nav className="-mb-px flex" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                        activeTab === 'overview'
                          ? 'border-blue-500 text-blue-400'
                          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('content')}
                      className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                        activeTab === 'content'
                          ? 'border-blue-500 text-blue-400'
                          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      Content
                    </button>
                  </nav>
                </div>
                
                {/* Module content area */}
                <div className="p-6 md:p-8">
                  {activeTab === 'overview' ? (
                    <div className="prose prose-blue max-w-none">
                      {structuredContent ? (
                        <ModuleDetailContent moduleContent={structuredContent} />
                      ) : (
                        <>
                          <h1 className="text-2xl font-bold mb-4">{module.title}</h1>
                          <div className="mb-6">
                            <p>{module.description}</p>
                          </div>
                          
                          {module.prerequisites && (
                            <div className="mb-6">
                              <h2 className="text-xl font-semibold mb-2">Prerequisites</h2>
                              <p>{module.prerequisites}</p>
                            </div>
                          )}
                        </>
                      )}
                    
                      {/* Module action buttons */}
                      <div className="mt-6">
                        {!isAuthenticated ? (
                          <button
                            onClick={() => router.push('/login?redirect=' + encodeURIComponent(`/modules/${id}`))}
                            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Sign in to Start Learning
                          </button>
                        ) : userProgress.completionStatus === 'COMPLETED' ? (
                          <button
                            onClick={() => setActiveTab('content')}
                            className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          >
                            Review Module Again
                          </button>
                        ) : userProgress.completionStatus === 'IN_PROGRESS' ? (
                          <button
                            onClick={handleStartModule}
                            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Continue Learning
                          </button>
                        ) : (
                          <button
                            onClick={handleStartModule}
                            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Start Learning
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {isAuthenticated ? (
                        <>
                          <ModuleContentRenderer 
                            moduleId={module.id} 
                            content={module.content}
                            onSectionComplete={() => {
                              // Trigger progress update when all sections are complete
                              if (userProgress.completionStatus !== 'COMPLETED') {
                                // Update local progress state to 80% if it's less than that
                                if (userProgress.progressPercentage < 80) {
                                  setUserProgress(prev => ({
                                    ...prev,
                                    progressPercentage: 80
                                  }));
                                }
                              }
                            }}
                          />
                          
                          {/* Display success message */}
                          {successMessage && (
                            <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm text-green-700">{successMessage}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Display error message */}
                          {errorMessage && (
                            <div className="mt-6">
                              <ErrorAlert message={errorMessage} />
                            </div>
                          )}
                          
                          {/* Complete module button */}
                          {userProgress.completionStatus !== 'COMPLETED' && (
                            <div className="mt-10 border-t pt-6">
                              <button
                                onClick={handleCompleteModule}
                                disabled={updatingProgress}
                                className={`w-full md:w-auto px-6 py-3 ${
                                  updatingProgress 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-green-600 hover:bg-green-700'
                                } text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                              >
                                {updatingProgress ? (
                                  <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                  </span>
                                ) : (
                                  'Mark as Completed'
                                )}
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-10">
                          <div className="text-5xl mb-4">🔒</div>
                          <h3 className="text-2xl font-semibold mb-2">Sign in to access content</h3>
                          <p className="text-gray-600 mb-6">You need to be signed in to view this module's content.</p>
                          <button
                            onClick={() => router.push('/login?redirect=' + encodeURIComponent(`/modules/${id}`))}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Sign in to Start Learning
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ModuleDetailPage;
