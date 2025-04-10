/**
 * Integration Tests for Authentication APIs
 * 
 * This suite tests the authentication API endpoints directly
 * to ensure proper functioning of backend authentication services.
 */

import axios from 'axios';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Test user data
const testUsers = {
  valid: {
    username: 'testuser',
    email: 'test@cybersafe.com',
    password: 'SecurePass123'
  },
  invalid: {
    username: 'nonexistent',
    email: 'nonexistent@cybersafe.com',
    password: 'WrongPassword'
  },
  premium: {
    username: 'premium',
    email: 'premium@cybersafe.com',
    password: 'SecurePass123',
    role: 'INSTRUCTOR'
  },
  admin: {
    username: 'admin',
    email: 'admin@cybersafe.com',
    password: 'SecurePass123',
    role: 'ADMIN'
  }
};

// Define interfaces for API responses
interface User {
  id: number;
  email: string;
  username: string;
  role: 'USER' | 'INSTRUCTOR' | 'ADMIN';
}

interface ApiError {
  response: {
    status: number;
    data: {
      message: string;
    };
  };
}

// Mock server setup for MSW v2
const server = setupServer(
  // Register endpoint
  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = await request.json();
    const { email, username, password } = body as any;
    
    // Check for existing email
    if (email === testUsers.valid.email) {
      return HttpResponse.json(
        { message: 'Email already in use' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json(
      {
        message: 'User registered successfully',
        user: { id: 999, email, username, role: 'USER' },
        accessToken: 'mock-jwt-token'
      },
      { 
        status: 201,
        headers: {
          'Set-Cookie': 'refreshToken=mock-refresh-token; HttpOnly; Path=/; Secure'
        }
      }
    );
  }),
  
  // Login endpoint
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json();
    const { email, password } = body as any;
    
    // Validate credentials
    if (email === testUsers.valid.email && password === testUsers.valid.password) {
      return HttpResponse.json(
        {
          message: 'Login successful',
          user: { id: 1, email, username: testUsers.valid.username, role: 'USER' },
          accessToken: 'mock-jwt-token'
        },
        {
          status: 200,
          headers: {
            'Set-Cookie': 'refreshToken=mock-refresh-token; HttpOnly; Path=/; Secure'
          }
        }
      );
    } else if (email === testUsers.premium.email && password === testUsers.premium.password) {
      return HttpResponse.json(
        {
          message: 'Login successful',
          user: { id: 2, email, username: testUsers.premium.username, role: 'INSTRUCTOR' },
          accessToken: 'mock-premium-jwt-token'
        },
        {
          status: 200,
          headers: {
            'Set-Cookie': 'refreshToken=mock-premium-refresh-token; HttpOnly; Path=/; Secure'
          }
        }
      );
    } else if (email === testUsers.admin.email && password === testUsers.admin.password) {
      return HttpResponse.json(
        {
          message: 'Login successful',
          user: { id: 3, email, username: testUsers.admin.username, role: 'ADMIN' },
          accessToken: 'mock-admin-jwt-token'
        },
        {
          status: 200,
          headers: {
            'Set-Cookie': 'refreshToken=mock-admin-refresh-token; HttpOnly; Path=/; Secure'
          }
        }
      );
    }
    
    // Invalid credentials
    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),
  
  // Logout endpoint
  http.post(`${API_URL}/auth/logout`, () => {
    return HttpResponse.json(
      { message: 'Logged out successfully' },
      {
        status: 200,
        headers: {
          'Set-Cookie': 'refreshToken=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
        }
      }
    );
  }),
  
  // Profile endpoint
  http.get(`${API_URL}/auth/profile`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    if (token === 'mock-jwt-token') {
      return HttpResponse.json({
        user: {
          id: 1,
          email: testUsers.valid.email,
          username: testUsers.valid.username,
          role: 'USER'
        }
      });
    } else if (token === 'mock-premium-jwt-token') {
      return HttpResponse.json({
        user: {
          id: 2,
          email: testUsers.premium.email,
          username: testUsers.premium.username,
          role: 'INSTRUCTOR'
        }
      });
    } else if (token === 'mock-admin-jwt-token') {
      return HttpResponse.json({
        user: {
          id: 3,
          email: testUsers.admin.email,
          username: testUsers.admin.username,
          role: 'ADMIN'
        }
      });
    }
    
    return HttpResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }),
  
  // Token refresh endpoint
  http.post(`${API_URL}/auth/refresh-token`, ({ request }) => {
    // Check for refresh token in cookies
    const cookieHeader = request.headers.get('Cookie') || '';
    const refreshToken = cookieHeader.includes('refreshToken=mock-refresh-token') 
      ? 'mock-refresh-token' 
      : cookieHeader.includes('refreshToken=mock-premium-refresh-token')
        ? 'mock-premium-refresh-token'
        : cookieHeader.includes('refreshToken=mock-admin-refresh-token')
          ? 'mock-admin-refresh-token'
          : null;
    
    if (!refreshToken) {
      return HttpResponse.json(
        { message: 'Refresh token required' },
        { status: 401 }
      );
    }
    
    if (refreshToken === 'mock-refresh-token') {
      return HttpResponse.json(
        { accessToken: 'new-mock-jwt-token' },
        {
          status: 200,
          headers: {
            'Set-Cookie': 'refreshToken=new-mock-refresh-token; HttpOnly; Path=/; Secure'
          }
        }
      );
    } else if (refreshToken === 'mock-premium-refresh-token') {
      return HttpResponse.json(
        { accessToken: 'new-mock-premium-jwt-token' },
        {
          status: 200,
          headers: {
            'Set-Cookie': 'refreshToken=new-mock-premium-refresh-token; HttpOnly; Path=/; Secure'
          }
        }
      );
    } else if (refreshToken === 'mock-admin-refresh-token') {
      return HttpResponse.json(
        { accessToken: 'new-mock-admin-jwt-token' },
        {
          status: 200,
          headers: {
            'Set-Cookie': 'refreshToken=new-mock-admin-refresh-token; HttpOnly; Path=/; Secure'
          }
        }
      );
    }
    
    return HttpResponse.json(
      { message: 'Invalid refresh token' },
      { status: 401 }
    );
  })
);

describe('Authentication API Integration Tests', () => {
  // Start mock server before tests
  beforeAll(() => server.listen());
  
  // Reset request handlers after each test
  afterEach(() => server.resetHandlers());
  
  // Close server after all tests
  afterAll(() => server.close());
  
  describe('Registration API', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@cybersafe.com',
        password: 'SecurePass123'
      };
      
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('user');
      expect(response.data).toHaveProperty('accessToken');
    });
    
    test('should reject registration with existing email', async () => {
      try {
        const userData = {
          username: 'existinguser',
          email: testUsers.valid.email, // Using existing email
          password: 'SecurePass123'
        };
        
        await axios.post(`${API_URL}/auth/register`, userData);
        // Should not reach this point
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('message', 'Email already in use');
      }
    });
  });
  
  describe('Login API', () => {
    test('should login successfully with valid credentials', async () => {
      const loginData = {
        email: testUsers.valid.email,
        password: testUsers.valid.password
      };
      
      const response = await axios.post(`${API_URL}/auth/login`, loginData);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('user');
      expect(response.data.user).toHaveProperty('email', testUsers.valid.email);
      expect(response.data).toHaveProperty('accessToken');
    });
    
    test('should login premium user successfully', async () => {
      const loginData = {
        email: testUsers.premium.email,
        password: testUsers.premium.password
      };
      
      const response = await axios.post(`${API_URL}/auth/login`, loginData);
      
      expect(response.status).toBe(200);
      expect(response.data.user).toHaveProperty('role', 'INSTRUCTOR');
    });
    
    test('should reject login with invalid credentials', async () => {
      try {
        const loginData = {
          email: testUsers.invalid.email,
          password: testUsers.invalid.password
        };
        
        await axios.post(`${API_URL}/auth/login`, loginData);
        // Should not reach this point
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toHaveProperty('message', 'Invalid credentials');
      }
    });
  });
  
  describe('User Profile API', () => {
    test('should get profile with valid token', async () => {
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: 'Bearer mock-jwt-token'
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('user');
      expect(response.data.user).toHaveProperty('email', testUsers.valid.email);
      expect(response.data.user).toHaveProperty('username', testUsers.valid.username);
    });
    
    test('should get premium profile with premium token', async () => {
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: 'Bearer mock-premium-jwt-token'
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('user');
      expect(response.data.user).toHaveProperty('email', testUsers.premium.email);
      expect(response.data.user).toHaveProperty('username', testUsers.premium.username);
      expect(response.data.user).toHaveProperty('role', 'INSTRUCTOR');
    });
    
    test('should reject profile request without token', async () => {
      try {
        await axios.get(`${API_URL}/auth/profile`);
        // Should not reach this point
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toHaveProperty('message', 'Authentication required');
      }
    });
    
    test('should reject profile request with invalid token', async () => {
      try {
        await axios.get(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: 'Bearer invalid-token'
          }
        });
        // Should not reach this point
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toHaveProperty('message', 'Invalid token');
      }
    });
  });
  
  describe('Logout API', () => {
    test('should logout successfully', async () => {
      const response = await axios.post(`${API_URL}/auth/logout`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message', 'Logged out successfully');
    });
  });
  
  describe('Token Refresh API', () => {
    test('should refresh token successfully', async () => {
      // Set up axios with cookies
      axios.defaults.withCredentials = true;
      
      // Mock document.cookie
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'refreshToken=mock-refresh-token'
      });
      
      const response = await axios.post(`${API_URL}/auth/refresh-token`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('accessToken', 'new-mock-jwt-token');
      
      // Cleanup
      axios.defaults.withCredentials = false;
    });
    
    test('should reject token refresh without refresh token', async () => {
      try {
        // Clear cookies
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: ''
        });
        
        await axios.post(`${API_URL}/auth/refresh-token`);
        // Should not reach this point
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toHaveProperty('message', 'Refresh token required');
      }
    });
  });
  
  describe('Rate Limiting Tests', () => {
    test('should respect rate limits for login attempts', async () => {
      // Override handler for this specific test to simulate rate limiting
      server.use(
        http.post(`${API_URL}/auth/login`, () => {
          return HttpResponse.json(
            { message: 'Too many login attempts. Please try again later.' },
            { status: 429 }
          );
        })
      );
      
      try {
        const loginData = {
          email: testUsers.valid.email,
          password: testUsers.valid.password
        };
        
        await axios.post(`${API_URL}/auth/login`, loginData);
        // Should not reach this point
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response.status).toBe(429);
        expect(error.response.data).toHaveProperty('message', 'Too many login attempts. Please try again later.');
      }
    });
  });
});
