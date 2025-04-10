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

// Practice activity scenarios
type ActivityScenario = {
  id: number;
  title: string;
  description: string;
  instructions: string;
  activityType: 'simulation' | 'interactive' | 'roleplay' | 'challenge';
  steps: ActivityStep[];
  moduleId: number;
};

type ActivityStep = {
  id: number;
  title: string;
  description: string;
  options?: {
    id: number;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  content?: string;
};

const ModulePractice = () => {
  const router = useRouter();
  const { id } = router.query;
  const moduleId = typeof id === 'string' ? parseInt(id, 10) : undefined;
  
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // State
  const [module, setModule] = useState<Module | null>(null);
  const [activity, setActivity] = useState<ActivityScenario | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [stepFeedback, setStepFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);
  const [activityCompleted, setActivityCompleted] = useState<boolean>(false);

  // Fetch module and activity details
  useEffect(() => {
    if (!moduleId) return;

    const fetchModuleAndActivity = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        };
        
        // Fetch module details first
        const moduleResponse = await axios.get(`${API_URL}/modules/${moduleId}`, config);
        setModule(moduleResponse.data);
        
        // Then fetch practice activity for this module
        try {
          const activityResponse = await axios.get(`${API_URL}/activities/module/${moduleId}`, config);
          setActivity(activityResponse.data);
        } catch (activityErr) {
          console.error('Error fetching activity:', activityErr);
          // If no activity exists, we'll use mock data below
        }
        
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load module and activity');
      } finally {
        setLoading(false);
      }
    };

    fetchModuleAndActivity();
  }, [moduleId]);

  // Mock activity data for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !activity && !loading && !error) {
      // Mock data for development
      const mockActivity: ActivityScenario = {
        id: 1,
        title: 'Phishing Email Identification Practice',
        description: 'Practice identifying phishing emails by analyzing examples and making decisions.',
        instructions: 'Review each email scenario and identify whether it is legitimate or a phishing attempt. Select the best action to take.',
        activityType: 'simulation',
        moduleId: moduleId || 1,
        steps: [
          {
            id: 1,
            title: 'Email from Bank',
            description: 'You receive the following email:',
            content: `From: secure@bankofamerica-secure.net
Subject: Urgent: Your Account Has Been Compromised

Dear Valued Customer,

Our security system has detected unusual activity on your account. Your account has been temporarily limited. Please verify your information immediately to avoid account suspension.

Click here to verify: http://secure-bankofamerica.com/verify

Best regards,
Bank of America Security Team`,
            options: [
              { 
                id: 1, 
                text: 'Click the link and enter your account details', 
                isCorrect: false,
                feedback: 'This is a phishing attempt. The email domain "bankofamerica-secure.net" is suspicious and doesn\'t match the official Bank of America domain. The link also points to a different domain that looks similar but isn\'t legitimate.'
              },
              { 
                id: 2, 
                text: 'Ignore the email completely', 
                isCorrect: false,
                feedback: 'While ignoring the email prevents you from being scammed, it\'s better to report phishing attempts to help protect others.'
              },
              { 
                id: 3, 
                text: 'Forward the email to your bank\'s official fraud department and delete it', 
                isCorrect: true,
                feedback: 'Correct! This is a phishing email. The suspicious domain and urgent tone are red flags. Reporting to the bank helps them track phishing attempts.'
              },
              { 
                id: 4, 
                text: 'Reply to the sender asking for verification', 
                isCorrect: false,
                feedback: 'Never engage with potential phishers. They may take this as confirmation that your email is active, leading to more phishing attempts.'
              }
            ]
          },
          {
            id: 2,
            title: 'Software Update Notification',
            description: 'You receive this pop-up on your computer:',
            content: `[ALERT] Adobe Flash Player Update Required

Your Adobe Flash Player is outdated and needs to be updated immediately for security reasons.

Click "Update Now" to install the latest version and continue using Flash content.

[Update Now]`,
            options: [
              { 
                id: 1, 
                text: 'Click "Update Now" to update Adobe Flash', 
                isCorrect: false,
                feedback: 'This is likely a malicious pop-up. Adobe Flash has been discontinued, and legitimate updates would come through official channels, not random pop-ups.'
              },
              { 
                id: 2, 
                text: 'Close the pop-up and scan your computer for malware', 
                isCorrect: true,
                feedback: 'Correct! This is a suspicious pop-up. Adobe Flash has been discontinued, so this is almost certainly malware. Closing it and scanning your system is the right approach.'
              },
              { 
                id: 3, 
                text: 'Check if your Flash Player needs updating by going to the Adobe website directly', 
                isCorrect: false,
                feedback: 'While checking directly with the source is generally good practice, Adobe Flash has been discontinued and is no longer supported, making this pop-up suspicious.'
              },
              { 
                id: 4, 
                text: 'Allow the update but monitor for unusual activity', 
                isCorrect: false,
                feedback: 'Never allow suspicious updates. Once malware is installed, it can be difficult to detect and remove, even if you\'re monitoring for unusual activity.'
              }
            ]
          },
          {
            id: 3,
            title: 'Wi-Fi Network Selection',
            description: 'You\'re at a coffee shop and see these Wi-Fi networks available:',
            content: `Available Networks:
1. CoffeeShop_Free
2. CoffeeShop_Guest
3. CoffeeShop_Secure
4. FREE_Public_WiFi`,
            options: [
              { 
                id: 1, 
                text: 'Connect to FREE_Public_WiFi because it\'s free', 
                isCorrect: false,
                feedback: 'Generic "free" networks with no clear owner are often set up by attackers to intercept data. These are called "evil twin" attacks.'
              },
              { 
                id: 2, 
                text: 'Ask the staff which network is their official one, and connect using a VPN', 
                isCorrect: true,
                feedback: 'Correct! Always verify the official network and use a VPN on public Wi-Fi to encrypt your connection and protect your data.'
              },
              { 
                id: 3, 
                text: 'Connect to CoffeeShop_Secure as it sounds most secure', 
                isCorrect: false,
                feedback: 'Even though it has "Secure" in the name, this might still be a fake network set up by an attacker. Always verify with staff.'
              },
              { 
                id: 4, 
                text: 'Try each network until you find one that works', 
                isCorrect: false,
                feedback: 'Connecting to unknown networks can expose your device to attacks. It\'s important to verify the legitimate network before connecting.'
              }
            ]
          }
        ]
      };
      
      setActivity(mockActivity);
    }
  }, [activity, loading, error, moduleId]);

  // Handle option selection
  const handleSelectOption = (stepId: number, optionId: number) => {
    setSelectedOptions({
      ...selectedOptions,
      [stepId]: optionId
    });
    
    // If this step has options with feedback
    if (activity && currentStepIndex < activity.steps.length) {
      const currentStep = activity.steps[currentStepIndex];
      if (currentStep.options) {
        const selectedOption = currentStep.options.find(option => option.id === optionId);
        if (selectedOption) {
          setStepFeedback(selectedOption.feedback);
          setFeedbackType(selectedOption.isCorrect ? 'success' : 'error');
        }
      }
    }
  };

  // Go to next step
  const handleNextStep = () => {
    if (activity && currentStepIndex < activity.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setStepFeedback(null);
      setFeedbackType(null);
    } else {
      // Complete the activity
      completeActivity();
    }
  };

  // Go to previous step
  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setStepFeedback(null);
      setFeedbackType(null);
    }
  };

  // Complete activity and submit progress
  const completeActivity = async () => {
    if (!activity) return;
    
    setActivityCompleted(true);
    
    // Calculate score
    const totalSteps = activity.steps.length;
    let correctSteps = 0;
    
    activity.steps.forEach(step => {
      if (step.options) {
        const selectedOptionId = selectedOptions[step.id];
        const correctOption = step.options.find(option => option.isCorrect);
        
        if (selectedOptionId === correctOption?.id) {
          correctSteps++;
        }
      }
    });
    
    const score = Math.round((correctSteps / totalSteps) * 100);
    
    // Submit the activity results to the server if authenticated
    if (isAuthenticated) {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        };
        
        await axios.post(`${API_URL}/activities/submit`, {
          activityId: activity.id,
          moduleId: moduleId,
          score: score,
          completed: true,
          stepResponses: Object.entries(selectedOptions).map(([stepId, optionId]) => ({
            stepId: parseInt(stepId),
            optionId: optionId
          }))
        }, config);
      } catch (err) {
        console.error('Error submitting activity results:', err);
        // Continue anyway
      }
    }
    
    // Navigate to feedback page
    router.push(`/modules/${moduleId}/feedback`);
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!activity) return 0;
    return Math.round(((currentStepIndex + 1) / activity.steps.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-navy-900 p-8">
        <ErrorAlert message={error || 'Practice activity not found'} />
        <div className="mt-4">
          <button
            onClick={() => router.push(`/modules/${moduleId}`)}
            className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition"
          >
            Back to Module
          </button>
        </div>
      </div>
    );
  }

  const currentStep = activity.steps[currentStepIndex];

  return (
    <>
      <Head>
        <title>Practice Activity | CyberSafe</title>
        <meta name="description" content={`Practice activity for ${activity.title}`} />
      </Head>

      <div className="min-h-screen bg-navy-900 text-white">
        {/* Module Navigation */}
        <div className="container mx-auto px-4 pt-8">
          <ModuleNavigation moduleId={moduleId} currentStep="practice" />
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Activity Header */}
          <div className="bg-gradient-to-r from-navy-800 to-navy-700 rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{activity.title}</h1>
                <p className="text-blue-300 mb-2">{activity.description}</p>
                <p className="text-gray-300">{activity.instructions}</p>
              </div>
              
              <div className="mt-4 md:mt-0 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg p-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-400 font-medium">{activity.activityType.toUpperCase()} ACTIVITY</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-gray-300">Step {currentStepIndex + 1} of {activity.steps.length}</span>
              <span className="text-gray-300">{calculateProgress()}% Complete</span>
            </div>
            <div className="w-full bg-navy-700 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Step Card */}
          <div className="bg-navy-800 rounded-xl overflow-hidden mb-8">
            {/* Step Header */}
            <div className="bg-navy-700 p-4 border-b border-navy-600">
              <h2 className="text-xl font-semibold">{currentStep.title}</h2>
            </div>
            
            {/* Step Content */}
            <div className="p-6">
              <p className="text-gray-300 mb-6">{currentStep.description}</p>
              
              {currentStep.content && (
                <div className="bg-navy-900 p-4 rounded-lg mb-6 font-mono text-sm whitespace-pre-wrap">
                  {currentStep.content}
                </div>
              )}
              
              {currentStep.options && (
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-medium text-blue-300 mb-4">Choose the best action:</h3>
                  
                  {currentStep.options.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => handleSelectOption(currentStep.id, option.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        selectedOptions[currentStep.id] === option.id
                          ? 'border-green-500 bg-green-900 bg-opacity-20'
                          : 'border-navy-700 hover:border-green-500 hover:bg-navy-700'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                          selectedOptions[currentStep.id] === option.id
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-400'
                        }`}>
                          {selectedOptions[currentStep.id] === option.id && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span>{option.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Feedback after selection */}
              {stepFeedback && (
                <div className={`mt-6 p-4 rounded-lg ${
                  feedbackType === 'success' ? 'bg-green-900 bg-opacity-20 border border-green-700' : 'bg-red-900 bg-opacity-20 border border-red-700'
                }`}>
                  <div className="flex items-start">
                    {feedbackType === 'success' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <div>
                      <p className={`font-medium ${feedbackType === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {feedbackType === 'success' ? 'Correct!' : 'Incorrect'}
                      </p>
                      <p className="text-gray-300 mt-1">{stepFeedback}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className={`px-6 py-3 rounded-md transition flex items-center ${
                currentStepIndex === 0
                  ? 'bg-navy-700 text-gray-500 cursor-not-allowed'
                  : 'bg-navy-700 hover:bg-navy-600'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            <button
              onClick={handleNextStep}
              disabled={!selectedOptions[currentStep.id]}
              className={`px-6 py-3 rounded-md transition flex items-center ${
                !selectedOptions[currentStep.id]
                  ? 'bg-navy-700 text-gray-500 cursor-not-allowed'
                  : currentStepIndex < activity.steps.length - 1
                    ? 'bg-blue-700 hover:bg-blue-600'
                    : 'bg-green-700 hover:bg-green-600'
              }`}
            >
              {currentStepIndex < activity.steps.length - 1 ? 'Next' : 'Complete Activity'}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModulePractice;
