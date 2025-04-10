import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { UIState } from '../../store/slices/uiSlice';
import { NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { setUser, setAuthenticated } from '../../store/slices/authSlice';
import axios from 'axios';

// API base URL - should come from environment variables in production
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const Dashboard: NextPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);
  const ui = useSelector((state: RootState) => state.ui) as UIState;
  const progress = useSelector((state: RootState) => state.progress);
  const modules = useSelector((state: RootState) => state.modules);

  // Safe access to nested properties
  const user = auth?.user || null;
  const isAuthenticated = auth?.isAuthenticated || false;
  const darkMode = ui?.theme?.darkMode || false;
  
  // Calculate user level based on points
  const userPoints = (progress?.stats as any)?.points ?? 0;
  const userLevel = Math.floor(userPoints / 100) + 1;
  const levelTitle = userLevel <= 2 ? "Novice Defender" : 
                    userLevel <= 5 ? "Cyber Apprentice" : 
                    userLevel <= 8 ? "Security Specialist" : "Cyber Guardian";
  
  // Calculate progress percentage for level bar
  const progressPercentage = (userPoints % 100);

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    // Clear local storage token
    localStorage.removeItem('token');
    // Redirect to login page
    router.push('/login');
  };

  const renderModuleActionButton = (module: any) => {
    // Determine the next step in the learning journey for this module
    if (module.progress === 0) {
      return (
        <Link href={`/modules/${module.id}`} className="block w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-center no-underline">
          Start Module
        </Link>
      );
    } else if (module.progress === 100) {
      return (
        <Link href={`/modules/${module.id}/review`} className="block w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-center no-underline">
          Review Module
        </Link>
      );
    } else if (!module.contentCompleted) {
      return (
        <Link href={`/modules/${module.id}/content`} className="block w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-center no-underline">
          Continue Content
        </Link>
      );
    } else if (!module.practiceCompleted) {
      return (
        <Link href={`/modules/${module.id}/practice`} className="block w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-center no-underline">
          Practice Activity
        </Link>
      );
    } else if (!module.assessmentCompleted) {
      return (
        <Link href={`/modules/${module.id}/assessment`} className="block w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-center no-underline">
          Take Assessment
        </Link>
      );
    } else {
      return (
        <Link href={`/modules/${module.id}/results`} className="block w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-center no-underline">
          View Results
        </Link>
      );
    }
  };

  // Verify authentication status when dashboard mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // If we have a token but not authenticated in Redux
    if (token && !isAuthenticated) {
      const verifyAuth = async () => {
        try {
          // Configure axios with the token
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user profile
          const response = await axios.get(`${API_URL}/auth/profile`);
          
          if (response.data && response.data.user) {
            // Update Redux store with user data
            dispatch(setUser(response.data.user));
            dispatch(setAuthenticated(true));
            console.log('User authenticated from dashboard');
          }
        } catch (error) {
          console.error('Authentication failed in dashboard:', error);
          // Handle error - don't redirect yet, let AuthWrapper handle that
        }
      };
      
      verifyAuth();
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-200">
      {/* Navigation Header */}
      <header className="bg-[#0d1117] border-b border-gray-800 py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-xl font-bold mr-2">🛡️</span>
            <h1 className="text-xl font-bold text-white">CyberSafe</h1>
          </div>
          
          {/* Main Navigation Bar */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/training" className="text-gray-300 hover:text-white no-underline font-medium">
              Learn/Training
            </Link>
            <Link href="/modules" className="text-gray-300 hover:text-white no-underline font-medium">
              Modules
            </Link>
            <Link href="/progress" className="text-gray-300 hover:text-white no-underline font-medium">
              Progress
            </Link>
            <Link href="/community" className="text-gray-300 hover:text-white no-underline font-medium">
              Community
            </Link>
            <Link href="/resources" className="text-gray-300 hover:text-white no-underline font-medium">
              Resources
            </Link>
          </nav>
          
          {/* User Profile Area */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button className="text-gray-300 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">3</span>
              </button>
            </div>
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                className="flex items-center space-x-2 text-gray-300 hover:text-white"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                  {user?.profileImage ? (
                    <Image 
                      src={user.profileImage} 
                      alt="Profile" 
                      width={32} 
                      height={32} 
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold">
                      {(user as any)?.name?.charAt(0) || (user as any)?.email?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <span className="hidden md:inline">{(user as any)?.name || (user as any)?.username || 'User'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {/* Profile dropdown menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg border border-gray-800 py-1 z-10">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">
                    Profile Management
                  </Link>
                  <Link href="/settings" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">
                    Settings
                  </Link>
                  <hr className="border-gray-800 my-1" />
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area - 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            {/* User Level Section */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-medium">Level {userLevel}: {levelTitle}</h2>
                <span className="text-gray-400">{progressPercentage}%</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-800 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              
              <div className="text-sm text-gray-400">
                Experience Points: {userPoints}/500
              </div>
            </div>

            {/* My Learning Path Section */}
            <section className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">My Learning Path</h2>
                <Link href="/modules" className="text-blue-400 hover:text-blue-300 text-sm font-medium no-underline">
                  View All →
                </Link>
              </div>
              
              {/* Journey Steps Visualization */}
              <div className="relative mb-8 hidden md:block">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-700 -translate-y-1/2"></div>
                <div className="flex justify-between relative">
                  <div className="journey-step flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center relative z-10 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-300">Module Selection</span>
                  </div>
                  
                  <div className="journey-step flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center relative z-10 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-300">Module Content</span>
                  </div>
                  
                  <div className="journey-step flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center relative z-10 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-300">Practice Activity</span>
                  </div>
                  
                  <div className="journey-step flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center relative z-10 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-300">Assessment</span>
                  </div>
                  
                  <div className="journey-step flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center relative z-10 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-300">Results</span>
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-6 text-white">Continue Your Journey</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {modules?.modules && modules.modules.length > 0 ? (
                  modules.modules.slice(0, 2).map((module: any, index: number) => (
                    <div key={index} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                      <div className="h-40 bg-gray-800 relative">
                        {module.coverImage ? (
                          <Image
                            src={module.coverImage}
                            alt={module.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-900 to-purple-900">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Journey status badge */}
                        <div className="absolute top-3 right-3 px-2 py-1 rounded bg-gray-900 bg-opacity-75 text-xs font-medium">
                          {module.progress === 0 ? 'Start Here' : 
                           module.progress === 100 ? 'Completed' : 
                           `${module.progress}% Complete`}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-white mb-2">{module.title || "Module Title"}</h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{module.description || "Module description goes here"}</p>
                        
                        <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                          <span>{module.estimatedTime || '30m'}</span>
                          <span>{module.difficulty || 'Beginner'}</span>
                        </div>
                        
                        {/* Learning journey indicators */}
                        <div className="flex space-x-1 mb-4">
                          <div className={`h-1 flex-grow rounded-full ${module.progress > 0 ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
                          <div className={`h-1 flex-grow rounded-full ${module.contentCompleted ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
                          <div className={`h-1 flex-grow rounded-full ${module.practiceCompleted ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
                          <div className={`h-1 flex-grow rounded-full ${module.assessmentCompleted ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
                          <div className={`h-1 flex-grow rounded-full ${module.progress === 100 ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
                        </div>
                      </div>
                      
                      <div className="px-4 pb-4">
                        {renderModuleActionButton(module)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-400">No modules available.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Practice Activities Section */}
            <section className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Practice Activities</h2>
                <Link href="/activities" className="text-blue-400 hover:text-blue-300 text-sm font-medium no-underline">
                  View All →
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 p-4">
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-blue-900 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Password Strength Analyzer</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">Practice creating strong passwords and test their strength against common attacks.</p>
                  <div className="text-xs bg-blue-900 bg-opacity-50 text-blue-300 py-1 px-2 rounded inline-block mb-4">
                    From: Secure Authentication Module
                  </div>
                  <Link href="/activities/password-strength" className="block w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-center no-underline">
                    Start Practice
                  </Link>
                </div>
                
                <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 p-4">
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-green-900 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Phishing Email Simulator</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">Identify the warning signs of phishing emails through interactive examples.</p>
                  <div className="text-xs bg-green-900 bg-opacity-50 text-green-300 py-1 px-2 rounded inline-block mb-4">
                    From: Email Security Module
                  </div>
                  <Link href="/activities/phishing-simulator" className="block w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-center no-underline">
                    Start Practice
                  </Link>
                </div>
              </div>
            </section>

            {/* Upcoming Assessments Section */}
            <section className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Upcoming Assessments</h2>
                <Link href="/assessments" className="text-blue-400 hover:text-blue-300 text-sm font-medium no-underline">
                  View All →
                </Link>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Secure Authentication Quiz</h3>
                      <p className="text-sm text-gray-400 mb-3">Test your knowledge of password security and multi-factor authentication.</p>
                      <div className="flex space-x-4 text-sm">
                        <span className="text-gray-400">15 Questions</span>
                        <span className="text-gray-400">30 Minutes</span>
                      </div>
                    </div>
                    <div className="bg-yellow-900 bg-opacity-25 text-yellow-400 text-xs px-2 py-1 rounded">
                      Due in 3 days
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Phishing Awareness Assessment</h3>
                      <p className="text-sm text-gray-400 mb-3">Identify phishing attempts and learn how to avoid social engineering attacks.</p>
                      <div className="flex space-x-4 text-sm">
                        <span className="text-gray-400">10 Questions</span>
                        <span className="text-gray-400">20 Minutes</span>
                      </div>
                    </div>
                    <div className="bg-green-900 bg-opacity-25 text-green-400 text-xs px-2 py-1 rounded">
                      Available Now
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Activity Feed */}
            <section className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <h2 className="text-lg font-bold mb-4 text-white">Activity Feed</h2>
              
              <div className="space-y-4">
                {progress?.activities && progress.activities.length > 0 ? (
                  progress.activities.slice(0, 4).map((activity, index) => (
                    <div key={index} className="activity-item p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <div className="activity-icon mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{activity.type}</p>
                          <p className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No recent activity to display.</p>
                )}
              </div>
              
              <div className="mt-4 text-center">
                <Link href="/activity" className="text-blue-400 hover:text-blue-300 text-sm no-underline">
                  View All Activity
                </Link>
              </div>
            </section>
            
            {/* Achievements */}
            <section className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <h2 className="text-lg font-bold mb-4 text-white">Achievements</h2>
              
              <div className="space-y-3">
                {progress?.achievements && progress.achievements.length > 0 ? (
                  progress.achievements.slice(0, 3).map((achievement, index) => (
                    <div key={index} className="achievement-item p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <div className="achievement-icon mr-3 bg-yellow-900 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{achievement.name}</p>
                          <p className="text-xs text-gray-400">{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No achievements earned yet.</p>
                )}
              </div>
              
              <div className="mt-4 text-center">
                <Link href="/achievements" className="text-blue-400 hover:text-blue-300 text-sm no-underline">
                  View All Achievements
                </Link>
              </div>
            </section>
            
            {/* Community Highlights */}
            <section className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <h2 className="text-lg font-bold mb-4 text-white">Community Highlights</h2>
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-white mb-1">Weekly Top Performers</p>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-purple-700 flex items-center justify-center text-xs text-white font-bold">J</div>
                    <span className="text-xs text-gray-400">Jane D. completed all modules</span>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-white mb-1">Active Discussions</p>
                  <div className="text-xs text-gray-400">
                    <p className="mb-1">• Best practices for secure passwords</p>
                    <p>• How to identify phishing attempts</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <Link href="/community" className="text-blue-400 hover:text-blue-300 text-sm no-underline">
                  Join Community
                </Link>
              </div>
            </section>
            
            {/* Feedback */}
            <section className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <h2 className="text-lg font-bold mb-4 text-white">Feedback</h2>
              <p className="text-sm text-gray-400 mb-4">Help us improve the platform by sharing your experience.</p>
              <Link href="/feedback" className="block w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors text-center text-sm no-underline">
                Provide Feedback
              </Link>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
