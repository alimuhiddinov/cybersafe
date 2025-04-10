import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import { useRouter } from 'next/router';
import authReducer, { setAuthenticated, setUser, clearAuth } from '../../store/slices/authSlice';
import Login from '../../pages/login';
import Register from '../../pages/register';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

const mockedUseRouter = useRouter as jest.Mock;
const mockPush = jest.fn();

describe('Authentication Flow', () => {
  let store;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a fresh store for each test
    store = configureStore({
      reducer: {
        auth: authReducer
      }
    });
    
    // Setup router mock
    mockedUseRouter.mockImplementation(() => ({
      push: mockPush,
      query: {},
      pathname: '/'
    }));
    
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
  });

  describe('Login Component', () => {
    test('should render login form correctly', () => {
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      );
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    });

    test('should validate form inputs', async () => {
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      );
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Submit empty form
      fireEvent.click(submitButton);
      
      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
      
      // Enter invalid email
      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      
      // Submit with invalid email
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
      });
    });

    test('should handle successful login', async () => {
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        username: 'testuser',
        role: 'USER'
      };
      
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          message: 'Login successful',
          user: mockUser,
          accessToken: 'mock-token'
        }
      });
      
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      );
      
      // Fill form
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: 'user@example.com' } 
      });
      
      fireEvent.change(screen.getByLabelText(/password/i), { 
        target: { value: 'Password123' } 
      });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        // Verify axios was called
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/auth/login'),
          {
            email: 'user@example.com',
            password: 'Password123'
          }
        );
        
        // Verify token was stored
        expect(window.localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token');
        
        // Verify redirect
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
      
      // Verify store state
      expect(store.getState().auth.isAuthenticated).toBe(true);
      expect(store.getState().auth.user).toEqual(mockUser);
    });

    test('should handle failed login', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Invalid credentials'
          },
          status: 401
        }
      });
      
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      );
      
      // Fill form
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: 'user@example.com' } 
      });
      
      fireEvent.change(screen.getByLabelText(/password/i), { 
        target: { value: 'WrongPassword' } 
      });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        // Verify error message is displayed
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
        
        // Verify store state
        expect(store.getState().auth.isAuthenticated).toBe(false);
        expect(store.getState().auth.user).toBe(null);
      });
    });
  });
  
  describe('Registration Component', () => {
    test('should render registration form correctly', () => {
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      );
      
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
      expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    });

    test('should validate registration form inputs', async () => {
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      );
      
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      
      // Submit empty form
      fireEvent.click(submitButton);
      
      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
      
      // Enter invalid data
      fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'u' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'short' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'different' } });
      
      // Submit with invalid data
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/username must be at least/i)).toBeInTheDocument();
        expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
        expect(screen.getByText(/password must be at least/i)).toBeInTheDocument();
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    test('should handle successful registration', async () => {
      const mockUser = {
        id: 1,
        email: 'newuser@example.com',
        username: 'newuser',
        role: 'USER'
      };
      
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          message: 'Registration successful',
          user: mockUser,
          accessToken: 'mock-token'
        }
      });
      
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      );
      
      // Fill form
      fireEvent.change(screen.getByLabelText(/username/i), { 
        target: { value: 'newuser' } 
      });
      
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: 'newuser@example.com' } 
      });
      
      fireEvent.change(screen.getByLabelText(/password/i), { 
        target: { value: 'Password123' } 
      });
      
      fireEvent.change(screen.getByLabelText(/confirm password/i), { 
        target: { value: 'Password123' } 
      });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
      
      await waitFor(() => {
        // Verify axios was called
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/auth/register'),
          {
            username: 'newuser',
            email: 'newuser@example.com',
            password: 'Password123'
          }
        );
        
        // Verify token was stored
        expect(window.localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token');
        
        // Verify redirect
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
      
      // Verify store state
      expect(store.getState().auth.isAuthenticated).toBe(true);
      expect(store.getState().auth.user).toEqual(mockUser);
    });

    test('should handle duplicate email error', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Email already in use'
          },
          status: 400
        }
      });
      
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      );
      
      // Fill form
      fireEvent.change(screen.getByLabelText(/username/i), { 
        target: { value: 'existinguser' } 
      });
      
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: 'existing@example.com' } 
      });
      
      fireEvent.change(screen.getByLabelText(/password/i), { 
        target: { value: 'Password123' } 
      });
      
      fireEvent.change(screen.getByLabelText(/confirm password/i), { 
        target: { value: 'Password123' } 
      });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
      
      await waitFor(() => {
        // Verify error message is displayed
        expect(screen.getByText(/email already in use/i)).toBeInTheDocument();
        
        // Verify store state
        expect(store.getState().auth.isAuthenticated).toBe(false);
        expect(store.getState().auth.user).toBe(null);
      });
    });
  });
});
