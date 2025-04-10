import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

// Component imports
import ModuleNavigation from '../../../components/modules/ModuleNavigation';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorAlert from '../../../components/common/ErrorAlert';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Types
import { Module } from '../index';

const ModuleContent = () => {
  const router = useRouter();
  const { id } = router.query;
  const moduleId = typeof id === 'string' ? parseInt(id, 10) : undefined;
  
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // State
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  // Fetch module details
  useEffect(() => {
    if (!moduleId) return;

    const fetchModuleDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        };
        
        const response = await axios.get(`${API_URL}/modules/${moduleId}`, config);
        setModule(response.data);
        
        // If user is logged in, fetch their progress for this module
        if (isAuthenticated && user) {
          try {
            const progressResponse = await axios.get(
              `${API_URL}/userProgress/module/${moduleId}`,
              config
            );
            setProgress(progressResponse.data.progressPercentage || 0);
          } catch (err) {
            console.error('Error fetching progress:', err);
            // Don't set error state, as this is a non-critical feature
          }
        }
        
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load module details');
      } finally {
        setLoading(false);
      }
    };

    fetchModuleDetails();
  }, [moduleId, isAuthenticated, user]);

  // Mock content sections for demonstration
  const contentSections = [
    {
      id: 1,
      title: 'Introduction',
      content: 'This module introduces the fundamental concepts of cybersecurity and their importance in today\'s digital landscape.'
    },
    {
      id: 2,
      title: 'Key Concepts',
      content: 'Learn about threat vectors, vulnerabilities, and protection mechanisms that form the backbone of cybersecurity practices.'
    },
    {
      id: 3,
      title: 'Case Studies',
      content: 'Examine real-world cybersecurity incidents and the lessons learned from these events.'
    },
    {
      id: 4,
      title: 'Best Practices',
      content: 'Discover actionable strategies to enhance your personal and organizational cybersecurity posture.'
    }
  ];

  // Handle navigation to assessment
  const handleStartAssessment = () => {
    router.push(`/modules/${moduleId}/assessment`);
  };

  // Handle navigation to practice activity
  const handleStartPractice = () => {
    router.push(`/modules/${moduleId}/practice`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="min-h-screen bg-navy-900 p-8">
        <ErrorAlert message={error || 'Module not found'} />
        <div className="mt-4">
          <button
            onClick={() => router.push('/modules')}
            className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition"
          >
            Back to Modules
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{module.title} | CyberSafe</title>
        <meta name="description" content={module.description} />
      </Head>

      <div className="min-h-screen bg-navy-900 text-white">
        {/* Module Navigation */}
        <div className="container mx-auto px-4 pt-8">
          <ModuleNavigation moduleId={moduleId} currentStep="content" />
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Module Header */}
          <div className="bg-gradient-to-r from-navy-800 to-navy-700 rounded-xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-4">{module.title}</h1>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-sm">
                    {module.difficultyLevel}
                  </span>
                  <span className="text-gray-300">
                    <span className="mr-1">⏱️</span>
                    {module.estimatedTimeMinutes} min
                  </span>
                </div>
                <p className="text-gray-300 max-w-2xl">{module.description}</p>
              </div>

              {isAuthenticated && (
                <div className="mt-6 md:mt-0 bg-navy-900 p-4 rounded-lg">
                  <div className="text-center mb-2">Progress</div>
                  <div className="w-32 h-32 relative">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        className="stroke-current text-navy-700"
                        fill="none"
                        strokeWidth="3"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="stroke-current text-green-500"
                        fill="none"
                        strokeWidth="3"
                        strokeDasharray={`${progress}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <text x="18" y="20.35" className="text-5xl text-center fill-current text-white font-medium" textAnchor="middle">
                        {progress}%
                      </text>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Module Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-navy-800 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 border-b border-navy-700 pb-3">Content</h2>
                
                <div className="space-y-8">
                  {contentSections.map((section) => (
                    <div key={section.id} className="border-b border-navy-700 pb-6">
                      <h3 className="text-lg font-medium mb-3 text-blue-300">{section.title}</h3>
                      <p className="text-gray-300">{section.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
                <button
                  onClick={handleStartPractice}
                  className="px-6 py-3 bg-green-700 hover:bg-green-600 rounded-md transition flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Practice Activity
                </button>
                <button
                  onClick={handleStartAssessment}
                  className="px-6 py-3 bg-blue-700 hover:bg-blue-600 rounded-md transition flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Take Assessment
                </button>
              </div>
            </div>

            <div>
              <div className="bg-navy-800 rounded-xl p-6 sticky top-8">
                <h2 className="text-xl font-semibold mb-4 border-b border-navy-700 pb-3">Contents</h2>
                
                <nav className="space-y-2">
                  {contentSections.map((section) => (
                    <a
                      key={section.id}
                      href={`#section-${section.id}`}
                      className="block p-2 hover:bg-navy-700 rounded-md text-gray-300 hover:text-white transition"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>

                <div className="mt-6 pt-4 border-t border-navy-700">
                  <h3 className="text-lg font-medium mb-3">Continue Learning</h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleStartAssessment}
                      className="w-full text-left p-2 hover:bg-navy-700 rounded-md text-gray-300 hover:text-white transition flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Assessment
                    </button>
                    <button
                      onClick={handleStartPractice}
                      className="w-full text-left p-2 hover:bg-navy-700 rounded-md text-gray-300 hover:text-white transition flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Practice Activity
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModuleContent;
