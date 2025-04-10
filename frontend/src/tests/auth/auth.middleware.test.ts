/**
 * Authorization Middleware Tests
 * 
 * Tests the middleware that protects routes based on user roles
 * and authentication status.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { authReducer, setUser, setAuthenticated } from '../../store/slices/authSlice';
import { useRouter } from 'next/router';
import AuthWrapper from '../../components/AuthWrapper';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

const mockedUseRouter = useRouter as jest.Mock;
const pushMock = jest.fn();

// Sample user types for testing
const users = {
  basic: {
    id: 1,
    email: 'basic@cybersafe.com',
    username: 'basicuser',
    role: 'USER' as const,
    firstName: 'Basic',
    lastName: 'User'
  },
  instructor: {
    id: 2,
    email: 'instructor@cybersafe.com',
    username: 'instructoruser',
    role: 'INSTRUCTOR' as const,
    firstName: 'Instructor',
    lastName: 'User'
  },
  admin: {
    id: 3,
    email: 'admin@cybersafe.com',
    username: 'adminuser',
    role: 'ADMIN' as const,
    firstName: 'Admin',
    lastName: 'User'
  }
};

// Create test components to represent different protected routes
interface ProtectedComponentProps {
  requiredRole?: 'USER' | 'INSTRUCTOR' | 'ADMIN' | null;
  children: React.ReactNode;
}

const ProtectedComponent: React.FC<ProtectedComponentProps> = ({ requiredRole, children }) => {
  return (
    <div data-testid="protected-content" data-role={requiredRole}>
      {children}
    </div>
  );
};

describe('Auth Middleware and Access Control Tests', () => {
  let store: ReturnType<typeof configureStore>;

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
      push: pushMock,
      pathname: '/dashboard',
      query: {}
    }));
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
  });

  test('should redirect unauthenticated user from protected route', () => {
    // Set unauthenticated state
    jest.spyOn(window.localStorage, 'getItem').mockReturnValue(null);
    
    render(
      <Provider store={store}>
        <AuthWrapper>
          <ProtectedComponent>Protected Content</ProtectedComponent>
        </AuthWrapper>
      </Provider>
    );
    
    // Verify redirect to login
    expect(pushMock).toHaveBeenCalledWith('/login');
  });

  test('should allow authenticated basic user to access basic routes', () => {
    // Set authenticated state with basic user
    jest.spyOn(window.localStorage, 'getItem').mockReturnValue('valid-token');
    store.dispatch(setAuthenticated(true));
    store.dispatch(setUser(users.basic));
    
    render(
      <Provider store={store}>
        <AuthWrapper>
          <ProtectedComponent requiredRole="USER">User Protected Content</ProtectedComponent>
        </AuthWrapper>
      </Provider>
    );
    
    // Verify content is rendered
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('User Protected Content')).toBeInTheDocument();
  });

  test('should redirect basic user from instructor route', () => {
    // Set up route that requires instructor role
    mockedUseRouter.mockImplementation(() => ({
      push: pushMock,
      pathname: '/instructor-content',
      query: {}
    }));
    
    // Set authenticated state with basic user
    jest.spyOn(window.localStorage, 'getItem').mockReturnValue('valid-token');
    store.dispatch(setAuthenticated(true));
    store.dispatch(setUser(users.basic));
    
    render(
      <Provider store={store}>
        <AuthWrapper>
          <ProtectedComponent requiredRole="INSTRUCTOR">Instructor Content</ProtectedComponent>
        </AuthWrapper>
      </Provider>
    );
    
    // Verify redirect to login or access denied page
    expect(pushMock).toHaveBeenCalled();
  });

  test('should allow instructor user to access instructor routes', () => {
    // Set authenticated state with instructor user
    jest.spyOn(window.localStorage, 'getItem').mockReturnValue('valid-token');
    store.dispatch(setAuthenticated(true));
    store.dispatch(setUser(users.instructor));
    
    render(
      <Provider store={store}>
        <AuthWrapper>
          <ProtectedComponent requiredRole="INSTRUCTOR">Instructor Content</ProtectedComponent>
        </AuthWrapper>
      </Provider>
    );
    
    // Verify content is rendered
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Instructor Content')).toBeInTheDocument();
  });

  test('should allow admin user to access admin routes', () => {
    // Set authenticated state with admin user
    jest.spyOn(window.localStorage, 'getItem').mockReturnValue('valid-token');
    store.dispatch(setAuthenticated(true));
    store.dispatch(setUser(users.admin));
    
    render(
      <Provider store={store}>
        <AuthWrapper>
          <ProtectedComponent requiredRole="ADMIN">Admin Content</ProtectedComponent>
        </AuthWrapper>
      </Provider>
    );
    
    // Verify content is rendered
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  test('should allow admin to access all content types', () => {
    // Set authenticated state with admin user
    jest.spyOn(window.localStorage, 'getItem').mockReturnValue('valid-token');
    store.dispatch(setAuthenticated(true));
    store.dispatch(setUser(users.admin));
    
    render(
      <Provider store={store}>
        <AuthWrapper>
          <div>
            <ProtectedComponent requiredRole="USER">User Content</ProtectedComponent>
            <ProtectedComponent requiredRole="INSTRUCTOR">Instructor Content</ProtectedComponent>
            <ProtectedComponent requiredRole="ADMIN">Admin Content</ProtectedComponent>
          </div>
        </AuthWrapper>
      </Provider>
    );
    
    // Verify all content is rendered
    expect(screen.getByText('User Content')).toBeInTheDocument();
    expect(screen.getByText('Instructor Content')).toBeInTheDocument();
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  test('should handle token expiration and refresh', () => {
    // Mock axios to simulate 401 response due to token expiration
    jest.mock('axios', () => ({
      get: jest.fn().mockRejectedValue({
        response: {
          status: 401,
          data: { message: 'Token expired' }
        }
      }),
      interceptors: {
        response: {
          use: jest.fn(() => 999), // Return interceptor ID
          eject: jest.fn()
        }
      },
      defaults: {
        headers: {
          common: {}
        }
      }
    }));
    
    // Set authenticated state but with expired token
    jest.spyOn(window.localStorage, 'getItem').mockReturnValue('expired-token');
    store.dispatch(setAuthenticated(true));
    store.dispatch(setUser(users.basic));
    
    render(
      <Provider store={store}>
        <AuthWrapper>
          <ProtectedComponent>Protected Content</ProtectedComponent>
        </AuthWrapper>
      </Provider>
    );
    
    // Verify redirect to login after token expiration
    expect(pushMock).toHaveBeenCalledWith('/login');
    
    // Verify localStorage token was removed
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
  });

  test('should allow access to public routes for all users', () => {
    // Set up public route
    mockedUseRouter.mockImplementation(() => ({
      push: pushMock,
      pathname: '/',
      query: {}
    }));
    
    // Test with unauthenticated user
    const { rerender } = render(
      <Provider store={store}>
        <AuthWrapper>
          <div data-testid="public-content">Public Content</div>
        </AuthWrapper>
      </Provider>
    );
    
    // Verify content is rendered for unauthenticated user
    expect(screen.getByTestId('public-content')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
    
    // Test with basic user
    store.dispatch(setAuthenticated(true));
    store.dispatch(setUser(users.basic));
    
    rerender(
      <Provider store={store}>
        <AuthWrapper>
          <div data-testid="public-content">Public Content</div>
        </AuthWrapper>
      </Provider>
    );
    
    // Verify content is rendered for basic user
    expect(screen.getByTestId('public-content')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  test('should handle session timeout', () => {
    // Initial authenticated state
    jest.spyOn(window.localStorage, 'getItem').mockReturnValue('valid-token');
    store.dispatch(setAuthenticated(true));
    store.dispatch(setUser(users.basic));
    
    const { rerender } = render(
      <Provider store={store}>
        <AuthWrapper>
          <ProtectedComponent>Protected Content</ProtectedComponent>
        </AuthWrapper>
      </Provider>
    );
    
    // Verify content is initially rendered
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    
    // Simulate session timeout (token removed)
    jest.spyOn(window.localStorage, 'getItem').mockReturnValue(null);
    
    // Force re-render to trigger authentication check
    rerender(
      <Provider store={store}>
        <AuthWrapper>
          <ProtectedComponent>Protected Content</ProtectedComponent>
        </AuthWrapper>
      </Provider>
    );
    
    // Verify redirect to login
    expect(pushMock).toHaveBeenCalledWith('/login');
  });
});
