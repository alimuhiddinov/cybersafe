import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { RootState } from '../store';
import Head from 'next/head';
import axios from 'axios';

// API base URL - should come from environment variables in production
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const ForgotPassword = () => {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      
      setSuccessMessage('Password reset instructions have been sent to your email');
      setEmailSent(true);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Forgot Password | CyberSafe</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-lg border border-gray-800">
          <div>
            <div className="flex justify-center">
              <span className="text-4xl">🛡️</span>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Reset your password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {successMessage && (
            <div className="bg-green-900/50 border border-green-800 text-green-200 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}
          
          {errorMessage && (
            <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}
          
          {!emailSent ? (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M2.94 6.06A2 2 0 0 1 4.34 5h11.32a2 2 0 0 1 1.4.06A2 2 0 0 1 19 7.4v5.2a2 2 0 0 1-1.94 1.97 2 2 0 0 1-1.4.43H4.34a2 2 0 0 1-1.4-.43A2 2 0 0 1 1 12.6V7.4a2 2 0 0 1 1.94-1.34z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                  Send Reset Link
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 text-center">
              <p className="text-gray-400 mb-4">
                Check your email for the password reset link. If you don't see it, check your spam folder.
              </p>
              <button
                onClick={() => setEmailSent(false)}
                className="text-blue-500 hover:text-blue-400 font-medium"
              >
                Try with a different email
              </button>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Link href="/login" className="font-medium text-blue-500 hover:text-blue-400 no-underline">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
