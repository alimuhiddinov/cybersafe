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

// Types for assessment questions
type Answer = {
  id: number;
  text: string;
  isCorrect: boolean;
};

type Question = {
  id: number;
  text: string;
  answers: Answer[];
  explanation: string;
};

type Assessment = {
  id: number;
  title: string;
  description: string;
  timeLimit: number;
  questions: Question[];
  moduleId: number;
  passingScore: number;
};

const ModuleAssessment = () => {
  const router = useRouter();
  const { id } = router.query;
  const moduleId = typeof id === 'string' ? parseInt(id, 10) : undefined;
  
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // State
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [assessmentCompleted, setAssessmentCompleted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fetch assessment details
  useEffect(() => {
    if (!moduleId) return;

    const fetchAssessment = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        };
        
        const response = await axios.get(`${API_URL}/assessments/module/${moduleId}`, config);
        setAssessment(response.data);
        setTimeLeft(response.data.timeLimit * 60); // Convert minutes to seconds
        
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [moduleId]);

  // Timer countdown
  useEffect(() => {
    if (!timeLeft || timeLeft <= 0 || assessmentCompleted) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime && prevTime > 0) {
          return prevTime - 1;
        }
        return 0;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, assessmentCompleted]);

  // When time reaches 0, auto-submit assessment
  useEffect(() => {
    if (timeLeft === 0 && !assessmentCompleted) {
      handleSubmitAssessment();
    }
  }, [timeLeft]);

  // Mock assessment data for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !assessment && !loading && !error) {
      // Mock data for development
      const mockAssessment: Assessment = {
        id: 1,
        title: 'Cybersecurity Fundamentals Quiz',
        description: 'Test your knowledge of basic cybersecurity concepts',
        timeLimit: 15, // minutes
        passingScore: 70,
        moduleId: moduleId || 1,
        questions: [
          {
            id: 1,
            text: 'What is the term for a malicious software designed to block access to a computer system until money is paid?',
            answers: [
              { id: 1, text: 'Virus', isCorrect: false },
              { id: 2, text: 'Ransomware', isCorrect: true },
              { id: 3, text: 'Trojan Horse', isCorrect: false },
              { id: 4, text: 'Spyware', isCorrect: false }
            ],
            explanation: 'Ransomware is a type of malicious software that encrypts files on a device, rendering any files and the systems that rely on them unusable. Malicious actors then demand ransom in exchange for decryption.'
          },
          {
            id: 2,
            text: 'Which of the following is NOT a recommended password practice?',
            answers: [
              { id: 1, text: 'Using a different password for each account', isCorrect: false },
              { id: 2, text: 'Including special characters and numbers', isCorrect: false },
              { id: 3, text: 'Writing down passwords and keeping them near your computer', isCorrect: true },
              { id: 4, text: 'Using a password manager', isCorrect: false }
            ],
            explanation: 'Writing down passwords and keeping them in a visible or easily accessible place is a major security risk. If someone gains physical access to your workspace, they can easily find your passwords.'
          },
          {
            id: 3,
            text: 'What is a phishing attack?',
            answers: [
              { id: 1, text: 'A type of denial-of-service attack', isCorrect: false },
              { id: 2, text: 'An attempt to trick users into revealing sensitive information by pretending to be a trustworthy entity', isCorrect: true },
              { id: 3, text: 'Intercepting data between a client and server', isCorrect: false },
              { id: 4, text: 'A hardware-based attack on network infrastructure', isCorrect: false }
            ],
            explanation: 'Phishing is a type of social engineering attack where attackers send fraudulent messages designed to trick people into revealing sensitive information or installing malware.'
          },
          {
            id: 4,
            text: 'Which measure helps protect against man-in-the-middle attacks?',
            answers: [
              { id: 1, text: 'Using public WiFi without precautions', isCorrect: false },
              { id: 2, text: 'Disabling HTTPS', isCorrect: false },
              { id: 3, text: 'Using a VPN on public networks', isCorrect: true },
              { id: 4, text: 'Sharing your location on social media', isCorrect: false }
            ],
            explanation: 'A VPN (Virtual Private Network) encrypts your internet connection and masks your IP address, making it harder for attackers to intercept your data on public networks.'
          },
          {
            id: 5,
            text: 'What is two-factor authentication (2FA)?',
            answers: [
              { id: 1, text: 'Using two different passwords for the same account', isCorrect: false },
              { id: 2, text: 'A security process requiring two different types of identification before granting access', isCorrect: true },
              { id: 3, text: 'Having two administrators approve access requests', isCorrect: false },
              { id: 4, text: 'Encrypting data twice for extra security', isCorrect: false }
            ],
            explanation: '2FA adds an extra layer of security by requiring two different types of verification: something you know (like a password) and something you have (like a mobile device) or something you are (like a fingerprint).'
          }
        ]
      };
      
      setAssessment(mockAssessment);
      setTimeLeft(mockAssessment.timeLimit * 60);
    }
  }, [assessment, loading, error, moduleId]);

  // Handle answer selection
  const handleSelectAnswer = (questionId: number, answerId: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId
    });
  };

  // Go to next question
  const handleNextQuestion = () => {
    if (assessment && currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Go to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Submit assessment
  const handleSubmitAssessment = async () => {
    if (!assessment) return;
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };
      
      // Calculate score
      const totalQuestions = assessment.questions.length;
      let correctAnswers = 0;
      
      assessment.questions.forEach(question => {
        const selectedAnswerId = selectedAnswers[question.id];
        const correctAnswerId = question.answers.find(answer => answer.isCorrect)?.id;
        
        if (selectedAnswerId === correctAnswerId) {
          correctAnswers++;
        }
      });
      
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = score >= assessment.passingScore;
      
      // Submit the assessment results to the server
      if (isAuthenticated) {
        try {
          await axios.post(`${API_URL}/assessments/submit`, {
            assessmentId: assessment.id,
            moduleId: moduleId,
            score: score,
            passed: passed,
            answers: Object.entries(selectedAnswers).map(([qId, aId]) => ({
              questionId: parseInt(qId),
              answerId: aId
            }))
          }, config);
        } catch (err) {
          console.error('Error submitting assessment results:', err);
          // Continue anyway so the user can see their results
        }
      }
      
      // Store results in session storage to pass to the results page
      sessionStorage.setItem('assessmentResults', JSON.stringify({
        totalQuestions,
        correctAnswers,
        score,
        passed,
        assessmentId: assessment.id,
        moduleId: moduleId
      }));
      
      setAssessmentCompleted(true);
      
      // Navigate to results page
      router.push(`/modules/${moduleId}/results`);
      
    } catch (err) {
      console.error('Error during assessment submission:', err);
      setError('Failed to submit assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Format time left
  const formatTimeLeft = () => {
    if (timeLeft === null) return '--:--';
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!assessment) return 0;
    
    const answeredQuestions = Object.keys(selectedAnswers).length;
    return Math.round((answeredQuestions / assessment.questions.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-navy-900 p-8">
        <ErrorAlert message={error || 'Assessment not found'} />
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

  const currentQuestion = assessment.questions[currentQuestionIndex];

  return (
    <>
      <Head>
        <title>Assessment | CyberSafe</title>
        <meta name="description" content={`Assessment for ${assessment.title}`} />
      </Head>

      <div className="min-h-screen bg-navy-900 text-white">
        {/* Module Navigation */}
        <div className="container mx-auto px-4 pt-8">
          <ModuleNavigation moduleId={moduleId} currentStep="assessment" />
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Assessment Header */}
          <div className="bg-gradient-to-r from-navy-800 to-navy-700 rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{assessment.title}</h1>
                <p className="text-blue-300 mb-2">{assessment.description}</p>
                <p className="text-gray-300">
                  Complete all questions within the time limit. You need {assessment.passingScore}% to pass.
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 bg-navy-900 rounded-lg p-4 flex flex-col items-center">
                <div className="text-xl font-semibold text-red-400">Time Left</div>
                <div className="text-2xl font-mono">{formatTimeLeft()}</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-gray-300">Progress</span>
              <span className="text-gray-300">{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-navy-700 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-navy-800 rounded-xl p-6 mb-8">
            <div className="flex justify-between mb-4">
              <span className="text-gray-300">Question {currentQuestionIndex + 1} of {assessment.questions.length}</span>
            </div>
            
            <h2 className="text-xl font-semibold mb-6">{currentQuestion.text}</h2>
            
            <div className="space-y-4">
              {currentQuestion.answers.map((answer) => (
                <div
                  key={answer.id}
                  onClick={() => handleSelectAnswer(currentQuestion.id, answer.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition ${
                    selectedAnswers[currentQuestion.id] === answer.id
                      ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                      : 'border-navy-700 hover:border-blue-500 hover:bg-navy-700'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                      selectedAnswers[currentQuestion.id] === answer.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-400'
                    }`}>
                      {selectedAnswers[currentQuestion.id] === answer.id && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span>{answer.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-3 rounded-md transition flex items-center ${
                currentQuestionIndex === 0
                  ? 'bg-navy-700 text-gray-500 cursor-not-allowed'
                  : 'bg-navy-700 hover:bg-navy-600'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            {currentQuestionIndex < assessment.questions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 bg-blue-700 hover:bg-blue-600 rounded-md transition flex items-center"
              >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmitAssessment}
                disabled={submitting}
                className="px-6 py-3 bg-green-700 hover:bg-green-600 rounded-md transition flex items-center"
              >
                {submitting ? 'Submitting...' : 'Submit Assessment'}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ModuleAssessment;
