import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { RootState } from '../../store';
import { fetchCurrentUser, setUser, setAuthenticated } from '../../store/slices/authSlice';
import Head from 'next/head';
import axios from 'axios';

// API base URL - should come from environment variables in production
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const Profile = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);
  
  // Get token directly from localStorage for API requests
  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('Authentication token not found. Please log in again.');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      return null;
    }
    return token;
  };

  const [activeTab, setActiveTab] = useState('general');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    bio: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Improved useEffect to load user data when the component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Configure axios with the token
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // If user data is available in Redux, use it to initialize the form
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        username: user.username,
        bio: user.bio || '',
      });
    } else {
      // Otherwise fetch it from the server
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`${API_URL}/auth/profile`);
          if (response.data && response.data.user) {
            dispatch(setUser(response.data.user));
            dispatch(setAuthenticated(true));

            setFormData({
              firstName: response.data.user.firstName || '',
              lastName: response.data.user.lastName || '',
              email: response.data.user.email,
              username: response.data.user.username,
              bio: response.data.user.bio || '',
            });
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          setErrorMessage('Failed to load user data. Please log in again.');
          localStorage.removeItem('token');
          setTimeout(() => {
            router.push('/login');
          }, 1500);
        }
      };

      fetchUserData();
    }
  }, [dispatch, router, user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch current user data if needed
  useEffect(() => {
    if (isAuthenticated && !user) {
      // @ts-ignore
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated, user]);

  // Populate form with user data when available
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        username: user.username,
        bio: user.bio || '',
      });
      
      if (user.profileImage) {
        setProfileImagePreview(user.profileImage);
      }
    }
  }, [user]);

  useEffect(() => {
    // Reset error message when activeTab changes
    setErrorMessage('');
    setSuccessMessage('');
  }, [activeTab]);

  // Whenever authentication status changes, check if we need to redirect
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !localStorage.getItem('token')) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateProfileForm = () => {
    if (!formData.username) {
      setErrorMessage('Username is required');
      return false;
    }
    if (!formData.email) {
      setErrorMessage('Email is required');
      return false;
    }
    return true;
  };

  const validatePasswordForm = () => {
    if (!passwordData.currentPassword) {
      setErrorMessage('Current password is required');
      return false;
    }
    if (!passwordData.newPassword) {
      setErrorMessage('New password is required');
      return false;
    }
    if (passwordData.newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      setErrorMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }

    const token = getToken();
    if (!token) return; // Token check added by getToken will handle redirect

    setIsUpdating(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // First update profile data
      const response = await axios.put(
        `${API_URL}/auth/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // If there's a new profile image, upload it
      if (profileImage) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          if (event.target && event.target.result) {
            try {
              // Send the image data as a base64 string
              const imageData = {
                profileImage: event.target.result
              };
              
              const imageResponse = await axios.post(
                `${API_URL}/auth/profile/image`,
                imageData,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );
              
              // Update Redux with the new user data including profile image
              if (imageResponse.data && imageResponse.data.user) {
                dispatch(setUser(imageResponse.data.user));
                dispatch(setAuthenticated(true));
                
                // Store the new token if it's provided
                if (imageResponse.data.token) {
                  localStorage.setItem('token', imageResponse.data.token);
                }
              }
            } catch (imageError: any) {
              console.error('Profile image upload error:', imageError);
              setErrorMessage(imageError.response?.data?.message || 'Error uploading profile image');
            }
          }
        };
        reader.readAsDataURL(profileImage);
      }

      setSuccessMessage('Profile updated successfully');
      
      // Update the Redux store to maintain authentication state
      if (response.data && response.data.user) {
        // Update the Redux store with the new user data
        dispatch(setUser(response.data.user));
        dispatch(setAuthenticated(true));
        
        // Manually update the form data with the response
        setFormData({
          firstName: response.data.user.firstName || '',
          lastName: response.data.user.lastName || '',
          email: response.data.user.email,
          username: response.data.user.username,
          bio: response.data.user.bio || '',
        });
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      if (error.response?.status === 401) {
        setErrorMessage('Authentication error. Please login again.');
        // We'll keep the token for now and let the AuthWrapper handle redirects if needed
        // localStorage.removeItem('token');
        // setTimeout(() => {
        //   router.push('/login');
        // }, 2000);
      } else {
        setErrorMessage(error.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    const token = getToken();
    if (!token) return; // Token check added by getToken will handle redirect

    setIsUpdating(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await axios.put(
        `${API_URL}/auth/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSuccessMessage('Password updated successfully');
      
      // Ensure we maintain authentication state in Redux
      if (response.data && response.data.user) {
        dispatch(setUser(response.data.user));
        dispatch(setAuthenticated(true));
      }
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Password update error:', error);
      
      if (error.response?.status === 401) {
        setErrorMessage('Authentication error. Please login again.');
        // We'll keep the token for now and let the AuthWrapper handle redirects if needed
        // localStorage.removeItem('token');
        // setTimeout(() => {
        //   router.push('/login');
        // }, 2000);
      } else {
        setErrorMessage(error.response?.data?.message || 'Failed to update password');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-gray-200 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Profile | CyberSafe</title>
      </Head>
      <div className="min-h-screen bg-[#0d1117] text-gray-200">
        {/* Navigation Header - simplified version */}
        <header className="bg-[#0d1117] border-b border-gray-800 py-4 sticky top-0 z-50">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold mr-2">🛡️</span>
              <h1 className="text-xl font-bold text-white">CyberSafe</h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="/dashboard" className="text-gray-300 hover:text-white no-underline">Dashboard</a>
              <a href="/modules" className="text-gray-300 hover:text-white no-underline">Modules</a>
              <a href="/progress" className="text-gray-300 hover:text-white no-underline">Progress</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                >
                  <span className="sr-only">Open user menu</span>
                  {user.profileImage ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.profileImage}
                      alt=""
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                      <span className="text-white">{user.username.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="pt-10 pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-2xl font-bold mb-8 text-white">Profile Settings</h1>
              
              <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                {/* Profile Tabs */}
                <div className="bg-gray-800 border-b border-gray-700">
                  <nav className="flex" aria-label="Tabs">
                    <button
                      onClick={() => handleTabChange('general')}
                      className={`px-6 py-4 text-sm font-medium ${
                        activeTab === 'general'
                          ? 'border-b-2 border-blue-500 text-white'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      General
                    </button>
                    <button
                      onClick={() => handleTabChange('security')}
                      className={`px-6 py-4 text-sm font-medium ${
                        activeTab === 'security'
                          ? 'border-b-2 border-blue-500 text-white'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      Security
                    </button>
                    <button
                      onClick={() => handleTabChange('notifications')}
                      className={`px-6 py-4 text-sm font-medium ${
                        activeTab === 'notifications'
                          ? 'border-b-2 border-blue-500 text-white'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      Notifications
                    </button>
                  </nav>
                </div>
                
                {/* Tab Content */}
                <div className="p-6">
                  {successMessage && (
                    <div className="mb-6 bg-green-900/50 border border-green-800 text-green-200 px-4 py-3 rounded relative" role="alert">
                      <span className="block sm:inline">{successMessage}</span>
                    </div>
                  )}
                  
                  {errorMessage && (
                    <div className="mb-6 bg-red-900/50 border border-red-800 text-red-200 px-4 py-3 rounded relative" role="alert">
                      <span className="block sm:inline">{errorMessage}</span>
                    </div>
                  )}
                  
                  {/* General Settings */}
                  {activeTab === 'general' && (
                    <form onSubmit={handleProfileUpdate}>
                      <div className="space-y-6">
                        {/* Profile Image */}
                        <div className="flex flex-col items-center space-y-4">
                          <div className="relative rounded-full overflow-hidden h-24 w-24 bg-gray-700">
                            {profileImagePreview ? (
                              <img
                                className="h-full w-full object-cover"
                                src={profileImagePreview}
                                alt="Profile"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <span className="text-2xl text-white">{user.username.charAt(0).toUpperCase()}</span>
                              </div>
                            )}
                          </div>
                          <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-blue-500 font-medium rounded-md px-3 py-1.5 text-sm transition-colors">
                            Change Photo
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleProfileImageChange}
                            />
                          </label>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                              First Name
                            </label>
                            <input
                              type="text"
                              name="firstName"
                              id="firstName"
                              value={formData.firstName}
                              onChange={handleProfileChange}
                              className="w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                              Last Name
                            </label>
                            <input
                              type="text"
                              name="lastName"
                              id="lastName"
                              value={formData.lastName}
                              onChange={handleProfileChange}
                              className="w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                              Username
                            </label>
                            <input
                              type="text"
                              name="username"
                              id="username"
                              value={formData.username}
                              onChange={handleProfileChange}
                              className="w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={formData.email}
                              onChange={handleProfileChange}
                              className="w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
                            Bio
                          </label>
                          <textarea
                            name="bio"
                            id="bio"
                            rows={4}
                            value={formData.bio}
                            onChange={handleProfileChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-70 text-white font-medium rounded-md flex items-center transition-colors"
                          >
                            {isUpdating && (
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            )}
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                  
                  {/* Security Settings */}
                  {activeTab === 'security' && (
                    <form onSubmit={handlePasswordUpdate}>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
                          
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">
                                Current Password
                              </label>
                              <input
                                type="password"
                                name="currentPassword"
                                id="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                className="w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                                New Password
                              </label>
                              <input
                                type="password"
                                name="newPassword"
                                id="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                                Confirm New Password
                              </label>
                              <input
                                type="password"
                                name="confirmPassword"
                                id="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className="w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-70 text-white font-medium rounded-md flex items-center transition-colors"
                          >
                            {isUpdating && (
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            )}
                            Update Password
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                  
                  {/* Notification Settings */}
                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-white mb-4">Notification Preferences</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="email-notifications"
                              name="email-notifications"
                              type="checkbox"
                              defaultChecked
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 bg-gray-800 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="email-notifications" className="font-medium text-gray-300">
                              Email Notifications
                            </label>
                            <p className="text-gray-400">Receive emails about your account activity and security.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="achievement-notifications"
                              name="achievement-notifications"
                              type="checkbox"
                              defaultChecked
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 bg-gray-800 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="achievement-notifications" className="font-medium text-gray-300">
                              Achievement Notifications
                            </label>
                            <p className="text-gray-400">Receive notifications when you earn new achievements or badges.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="assessment-notifications"
                              name="assessment-notifications"
                              type="checkbox"
                              defaultChecked
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 bg-gray-800 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="assessment-notifications" className="font-medium text-gray-300">
                              Assessment Reminders
                            </label>
                            <p className="text-gray-400">Receive reminders about upcoming assessments.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="marketing-emails"
                              name="marketing-emails"
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 bg-gray-800 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="marketing-emails" className="font-medium text-gray-300">
                              Marketing Emails
                            </label>
                            <p className="text-gray-400">Receive emails about new features, offers, and updates.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                        >
                          Save Preferences
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Profile;
