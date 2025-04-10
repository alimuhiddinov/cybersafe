import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { RootState } from '../store';
import axios from 'axios';
import { setUser, setAuthenticated, clearAuth } from '../store/slices/authSlice';

// API base URL - should come from environment variables in production
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const verifyAuthStatus = async () => {
      const token = localStorage.getItem('token');
      
      // If we have a token but user is not authenticated in Redux store
      if (token && !isAuthenticated && !isLoading) {
        try {
          // Configure axios with the token
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token and get user data
          const response = await axios.get(`${API_URL}/auth/profile`);
          
          if (response.data && response.data.user) {
            // Update Redux store with user data
            dispatch(setUser(response.data.user));
            dispatch(setAuthenticated(true));
            console.log('User authenticated via token verification');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          dispatch(clearAuth());
          
          // Only redirect to login if not already on login or register page
          const publicPages = ['/login', '/register', '/'];
          if (!publicPages.includes(router.pathname)) {
            router.push('/login');
          }
        }
      }
    };

    verifyAuthStatus();
    
    // Set up axios interceptor to handle authentication errors
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Clear auth state on 401 errors
          localStorage.removeItem('token');
          dispatch(clearAuth());
          
          // Only redirect to login if not already on login or register page
          const publicPages = ['/login', '/register', '/'];
          if (!publicPages.includes(router.pathname)) {
            router.push('/login');
          }
        }
        return Promise.reject(error);
      }
    );

    // Clean up interceptor when component unmounts
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [dispatch, isAuthenticated, isLoading, router]);

  return <>{children}</>;
};

export default AuthWrapper;
