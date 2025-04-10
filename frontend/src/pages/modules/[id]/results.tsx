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
type ResultsData = {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
  assessmentId: number;
  moduleId: number;
  completionBadge?: {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
  };
  moduleProgress?: {
    percentComplete: number;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  };
};

const ModuleResults = () => {
  const router = useRouter();
  const { id } = router.query;
  const moduleId = typeof id === 'string' ? parseInt(id, 10) : undefined;
  
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // State
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch or load results
  useEffect(() => {
    if (!moduleId) return;

    const getResults = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First try to get results from session storage (from assessment completion)
        const storedResults = sessionStorage.getItem('assessmentResults');
        
        if (storedResults) {
          const parsedResults = JSON.parse(storedResults);
          
          // If stored results match current module, use them
          if (parsedResults.moduleId === moduleId) {
            setResults(parsedResults);
            
            // Clear from session storage to prevent stale data
            sessionStorage.removeItem('assessmentResults');
            
            // If authenticated, also fetch badge and progress information
            if (isAuthenticated) {
              try {
                const token = localStorage.getItem('token');
                const config = {
                  headers: token ? { Authorization: `Bearer ${token}` } : {}
                };
                
                const progressResponse = await axios.get(
                  `${API_URL}/userProgress/module/${moduleId}`,
                  config
                );
                
                if (progressResponse.data) {
                  setResults(prev => ({
                    ...prev,
                    moduleProgress: {
                      percentComplete: progressResponse.data.progressPercentage || 0,
                      status: progressResponse.data.status || 'IN_PROGRESS'
                    },
                    completionBadge: progressResponse.data.badge || null
                  }));
                }
              } catch (err) {
                console.error('Error fetching additional results data:', err);
                // Non-critical, so don't set error state
              }
            }
            
            setLoading(false);
            return;
          }
        }
        
        // If no stored results or they don't match, fetch from API
        if (isAuthenticated) {
          const token = localStorage.getItem('token');
          const config = {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          };
          
          const response = await axios.get(`${API_URL}/assessments/results/${moduleId}`, config);
          setResults(response.data);
        } else {
          // For non-authenticated users or if API call fails, show mock results
          setTimeout(() => {
            setResults({
              totalQuestions: 5,
              correctAnswers: 4,
              score: 80,
              passed: true,
              assessmentId: 1,
              moduleId: moduleId
            });
          }, 1000);
        }
        
      } catch (err: any) {
        console.error('Error fetching results:', err);
        // Use mock data as fallback
        setResults({
          totalQuestions: 5,
          correctAnswers: 4,
          score: 80,
          passed: true,
          assessmentId: 1,
          moduleId: moduleId
        });
      } finally {
        setLoading(false);
      }
    };

    getResults();
  }, [moduleId, isAuthenticated]);

  // Handle module completion
  const handleCompleteModule = () => {
    // Navigate back to modules list
    router.push('/modules');
  };

  // Handle retaking assessment
  const handleRetakeAssessment = () => {
    router.push(`/modules/${moduleId}/assessment`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-navy-900 p-8">
        <ErrorAlert message={error || 'Results not found'} />
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
        <title>Module Results | CyberSafe</title>
        <meta name="description" content="Your learning module results" />
      </Head>

      <div className="min-h-screen bg-navy-900 text-white">
        {/* Module Navigation */}
        <div className="container mx-auto px-4 pt-8">
          <ModuleNavigation moduleId={moduleId} currentStep="results" />
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Results Card */}
            <div className="bg-navy-800 rounded-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-navy-700 to-navy-800 p-6 border-b border-navy-600">
                <h1 className="text-2xl font-bold mb-2">Module Results</h1>
                <p className="text-blue-300">
                  Here's how you performed on this module's assessment
                </p>
              </div>
              
              <div className="p-8">
                {/* Results Summary */}
                <div className="mb-10 text-center">
                  <div className="inline-block mx-auto mb-6">
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          className="stroke-current text-navy-600"
                          fill="none"
                          strokeWidth="3"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={`stroke-current ${results.passed ? 'text-green-500' : 'text-red-500'}`}
                          fill="none"
                          strokeWidth="3"
                          strokeDasharray={`${results.score}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col">
                        <span className="text-4xl font-bold">{results.score}%</span>
                        <span className={`text-sm font-medium ${results.passed ? 'text-green-400' : 'text-red-400'}`}>
                          {results.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-2">
                    {results.passed 
                      ? 'Congratulations!' 
                      : 'Keep Going!'}
                  </h2>
                  <p className="text-gray-300 max-w-md mx-auto">
                    {results.passed 
                      ? 'You have successfully completed this module\'s assessment.' 
                      : 'You didn\'t pass this time, but don\'t worry! Review the material and try again.'}
                  </p>
                </div>
                
                {/* Detailed Results */}
                <div className="bg-navy-900 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-medium mb-4 border-b border-navy-700 pb-2">Assessment Details</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Questions:</span>
                      <span className="font-medium">{results.totalQuestions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Correct Answers:</span>
                      <span className="font-medium">{results.correctAnswers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Accuracy:</span>
                      <span className="font-medium">{results.score}%</span>
                    </div>
                    {results.moduleProgress && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Module Completion:</span>
                        <span className="font-medium">{results.moduleProgress.percentComplete}%</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Badge (if awarded) */}
                {results.passed && results.completionBadge && (
                  <div className="bg-gradient-to-r from-navy-700 to-navy-800 rounded-xl p-6 mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-900 bg-opacity-30 rounded-full mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-1">Badge Awarded!</h3>
                    <p className="text-blue-300 mb-2">{results.completionBadge.name}</p>
                    <p className="text-gray-300 text-sm mb-4">{results.completionBadge.description}</p>
                    <div className="bg-navy-900 inline-block px-3 py-1 rounded-full text-sm text-yellow-400">
                      + Added to your profile
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                  {!results.passed && (
                    <button
                      onClick={handleRetakeAssessment}
                      className="px-6 py-3 bg-blue-700 hover:bg-blue-600 rounded-md transition flex-1 flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Retake Assessment
                    </button>
                  )}
                  <button
                    onClick={handleCompleteModule}
                    className={`px-6 py-3 rounded-md transition flex-1 flex items-center justify-center ${
                      results.passed ? 'bg-green-700 hover:bg-green-600' : 'bg-navy-700 hover:bg-navy-600'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Back to Modules
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModuleResults;
