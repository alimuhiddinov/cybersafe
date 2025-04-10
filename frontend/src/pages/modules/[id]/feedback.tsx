import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

// Component imports
import ModuleNavigation from '../../../components/modules/ModuleNavigation';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const ModuleFeedback = () => {
  const router = useRouter();
  const { id } = router.query;
  const moduleId = typeof id === 'string' ? parseInt(id, 10) : undefined;
  
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // State
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [difficultyRating, setDifficultyRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle submission of feedback
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackRating) {
      setError('Please provide a rating before submitting.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      // If not authenticated, just skip the submission to backend
      if (!isAuthenticated || !token) {
        // Simulate submission success
        setTimeout(() => {
          setSuccess(true);
          setSubmitting(false);
          
          // Redirect to results page after a delay
          setTimeout(() => {
            router.push(`/modules/${moduleId}/results`);
          }, 2000);
        }, 1000);
        return;
      }
      
      // Submit feedback to server
      await axios.post(`${API_URL}/feedback`, {
        moduleId: moduleId,
        userId: user?.id,
        rating: feedbackRating,
        difficultyRating: difficultyRating,
        comments: feedbackText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(true);
      
      // Redirect to results page after a delay
      setTimeout(() => {
        router.push(`/modules/${moduleId}/results`);
      }, 2000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push(`/modules/${moduleId}/results`);
  };

  // Render stars for rating
  const renderRatingStars = (
    currentRating: number | null,
    setRating: (rating: number) => void,
    name: string
  ) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={`${name}-${star}`}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none p-1"
            aria-label={`Rate ${star} out of 5`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill={currentRating !== null && star <= currentRating ? 'currentColor' : 'none'} 
              stroke="currentColor"
              className={`w-8 h-8 transition ${
                currentRating !== null && star <= currentRating 
                  ? 'text-yellow-400' 
                  : 'text-gray-400'
              }`}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={currentRating !== null && star <= currentRating ? 0 : 1.5}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
              />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Module Feedback | CyberSafe</title>
        <meta name="description" content="Provide feedback on your learning experience" />
      </Head>

      <div className="min-h-screen bg-navy-900 text-white">
        {/* Module Navigation */}
        <div className="container mx-auto px-4 pt-8">
          <ModuleNavigation moduleId={moduleId} currentStep="feedback" />
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Feedback Card */}
            <div className="bg-navy-800 rounded-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-navy-700 to-navy-800 p-6 border-b border-navy-600">
                <h1 className="text-2xl font-bold">Share Your Feedback</h1>
                <p className="text-blue-300 mt-2">
                  Help us improve our content by providing your thoughts on this module
                </p>
              </div>
              
              {success ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900 bg-opacity-30 text-green-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
                  <p className="text-gray-300">
                    Your feedback has been submitted successfully. You will be redirected to the results page shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="p-6 space-y-6">
                  {/* Overall Rating */}
                  <div>
                    <label className="block text-lg font-medium mb-3">
                      How would you rate this module overall?
                    </label>
                    {renderRatingStars(feedbackRating, setFeedbackRating, 'overall')}
                  </div>
                  
                  {/* Difficulty Rating */}
                  <div>
                    <label className="block text-lg font-medium mb-3">
                      How difficult was the content?
                    </label>
                    {renderRatingStars(difficultyRating, setDifficultyRating, 'difficulty')}
                    <div className="flex justify-between text-sm text-gray-400 mt-1 px-2">
                      <span>Very Easy</span>
                      <span>Just Right</span>
                      <span>Too Difficult</span>
                    </div>
                  </div>
                  
                  {/* Comments */}
                  <div>
                    <label htmlFor="comments" className="block text-lg font-medium mb-3">
                      Any additional comments or suggestions?
                    </label>
                    <textarea
                      id="comments"
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg bg-navy-900 border border-navy-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Share your thoughts about the content, difficulty, or any improvements..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                    />
                  </div>
                  
                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg text-red-400">
                      {error}
                    </div>
                  )}
                  
                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="px-6 py-3 bg-navy-700 hover:bg-navy-600 rounded-md transition"
                    >
                      Skip
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 bg-blue-700 hover:bg-blue-600 rounded-md transition flex-1 flex items-center justify-center"
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        'Submit Feedback'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModuleFeedback;
