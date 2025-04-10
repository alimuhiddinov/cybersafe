import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface ModuleSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ModuleSidebar: React.FC<ModuleSidebarProps> = ({ activeTab, onTabChange }) => {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // Helper function to check if a tab is active
  const isTabActive = (tab: string) => activeTab === tab;
  
  // Categories (for filtering)
  const categories = [
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'privacy', name: 'Privacy', icon: '🛡️' },
    { id: 'safety', name: 'Safety', icon: '⚠️' },
    { id: 'awareness', name: 'Awareness', icon: '👁️' },
    { id: 'compliance', name: 'Compliance', icon: '📋' }
  ];
  
  // Difficulty levels
  const difficultyLevels = [
    { id: 'BEGINNER', name: 'Beginner', color: 'bg-green-700' },
    { id: 'INTERMEDIATE', name: 'Intermediate', color: 'bg-blue-700' },
    { id: 'ADVANCED', name: 'Advanced', color: 'bg-purple-700' },
    { id: 'EXPERT', name: 'Expert', color: 'bg-red-700' }
  ];
  
  // Mock data for current/recent modules
  const recentModules = [
    { 
      id: 1, 
      title: 'Password Security Basics', 
      progress: 75,
      lastAccessed: new Date(Date.now() - 86400000).toLocaleDateString() // 1 day ago
    },
    { 
      id: 2, 
      title: 'Phishing Awareness', 
      progress: 30,
      lastAccessed: new Date(Date.now() - 172800000).toLocaleDateString() // 2 days ago
    }
  ];
  
  // Main navigation tabs for modules
  const navigationTabs = [
    { id: 'all', name: 'All Modules', icon: '📚' },
    { id: 'myModules', name: 'My Modules', icon: '📖', requiresAuth: true },
    { id: 'featured', name: 'Featured', icon: '⭐' },
    { id: 'newReleases', name: 'New Releases', icon: '🆕' }
  ];
  
  // Handle module category filter
  const handleCategoryFilter = (categoryId: string) => {
    router.push({
      pathname: '/modules',
      query: { ...router.query, category: categoryId }
    });
  };
  
  // Handle difficulty filter
  const handleDifficultyFilter = (difficultyId: string) => {
    router.push({
      pathname: '/modules',
      query: { ...router.query, difficulty: difficultyId }
    });
  };

  return (
    <div className="bg-navy-800 rounded-xl p-4 sticky top-4">
      {/* Main Tabs Navigation */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3">Modules</h3>
        <nav className="space-y-1">
          {navigationTabs.map((tab) => {
            // Skip auth-required tabs for non-authenticated users
            if (tab.requiresAuth && !isAuthenticated) return null;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition ${
                  isTabActive(tab.id)
                    ? 'bg-blue-900 text-white'
                    : 'text-gray-300 hover:bg-navy-700 hover:text-white'
                }`}
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Continue Learning (for authenticated users) */}
      {isAuthenticated && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3 flex items-center">
            <span className="mr-2">🔄</span>Continue Learning
          </h3>
          <div className="space-y-3">
            {recentModules.length > 0 ? (
              recentModules.map((module) => (
                <Link
                  key={module.id}
                  href={`/modules/${module.id}`}
                  className="block p-3 rounded-lg bg-navy-700 hover:bg-navy-600 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-medium text-blue-300 mb-1">{module.title}</div>
                    <span className="text-xs text-gray-400">{module.lastAccessed}</span>
                  </div>
                  <div className="w-full bg-navy-900 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{module.progress}% complete</div>
                </Link>
              ))
            ) : (
              <div className="text-sm text-gray-400 italic">
                No modules in progress. Start learning today!
              </div>
            )}
            
            {recentModules.length > 0 && (
              <Link
                href="/progress"
                className="block text-center text-sm text-blue-400 hover:text-blue-300 mt-2"
              >
                View all progress
              </Link>
            )}
          </div>
        </div>
      )}
      
      {/* Categories */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3">Categories</h3>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryFilter(category.id)}
              className={`flex items-center p-2 rounded-md text-sm font-medium transition ${
                router.query.category === category.id
                  ? 'bg-blue-900 text-white'
                  : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Difficulty Levels */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3">Difficulty</h3>
        <div className="space-y-2">
          {difficultyLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => handleDifficultyFilter(level.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition ${
                router.query.difficulty === level.id
                  ? 'bg-blue-900 text-white'
                  : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
              }`}
            >
              {level.name}
              <span className={`inline-block w-3 h-3 rounded-full ${level.color}`}></span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Recommended */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Recommended</h3>
        <div className="p-3 rounded-lg bg-gradient-to-r from-navy-700 to-navy-800 border border-navy-600">
          <div className="text-yellow-400 mb-1 flex items-center">
            <span className="mr-2">🌟</span>
            <span className="font-medium">Top Pick</span>
          </div>
          <h4 className="text-sm font-medium text-white">Cybersecurity Fundamentals</h4>
          <p className="text-xs text-gray-400 mt-1">
            Perfect for beginners to establish a strong foundation in cybersecurity concepts.
          </p>
          <Link
            href="/modules/3"
            className="mt-3 inline-block px-3 py-1 text-xs bg-blue-700 hover:bg-blue-600 rounded-md transition"
          >
            Start Learning
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ModuleSidebar;
