import axios from 'axios';
import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import express from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware';

// Load environment variables
dotenv.config();

// Define test user
const testUser = {
  username: 'testuser',
  email: 'test@cybersafe.com',
  password: 'SecurePass123'
};

// Define API URL - default to localhost:3000 if not set
const API_URL = process.env.API_URL || 'http://localhost:3000';

// Store tokens for tests
let accessToken: string;
let refreshToken: string;
let cookies: string[];

describe('Authentication Flow Tests', () => {
  // Setup test server with protected route
  let server: any;
  
  beforeAll(async () => {
    // Create a small test server to verify middleware
    const app = express();
    app.use(express.json());
    
    // Create protected route for testing
    app.get('/api/protected', authenticate, (req, res) => {
      res.json({ message: 'Protected route accessed successfully', user: req.user });
    });
    
    // Start server for middleware testing
    server = createServer(app);
    server.listen(3001);

    // Clean up test user if exists
    const prisma = new PrismaClient();
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });
    await prisma.$disconnect();
  });

  afterAll(() => {
    // Close test server
    if (server) server.close();
  });

  it('Should register a new user successfully', async () => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, testUser);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('message');
      expect(response.data).toHaveProperty('user');
      expect(response.data).toHaveProperty('accessToken');
      expect(response.data.user.email).toBe(testUser.email);
      expect(response.data.user.username).toBe(testUser.username);
      
      // Store the access token for later tests
      accessToken = response.data.accessToken;
      
      // Store cookies for later tests
      if (response.headers['set-cookie']) {
        cookies = response.headers['set-cookie'];
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  });

  it('Should login successfully and return tokens', async () => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message');
      expect(response.data).toHaveProperty('user');
      expect(response.data).toHaveProperty('accessToken');
      
      // Update access token for later tests
      accessToken = response.data.accessToken;
      
      // Update cookies for later tests
      if (response.headers['set-cookie']) {
        cookies = response.headers['set-cookie'];
      }

      // Verify user data
      expect(response.data.user.email).toBe(testUser.email);
      expect(response.data.user.username).toBe(testUser.username);
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  });

  it('Should access protected routes with valid access token', async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/protected', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message');
      expect(response.data).toHaveProperty('user');
      expect(response.data.message).toBe('Protected route accessed successfully');
    } catch (error) {
      console.error('Protected route access error:', error.response?.data || error.message);
      throw error;
    }
  });

  it('Should be denied access to protected routes without token', async () => {
    try {
      await axios.get('http://localhost:3001/api/protected');
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(401);
      expect(error.response.data).toHaveProperty('message');
      expect(error.response.data.message).toMatch(/unauthorized|authentication required/i);
    }
  });

  it('Should refresh access token with refresh token', async () => {
    try {
      // Make sure we have cookies from previous tests
      if (!cookies || cookies.length === 0) {
        throw new Error('No cookies found from previous tests');
      }
      
      const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {}, {
        headers: {
          Cookie: cookies.join('; ')
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('accessToken');
      
      // Update access token for logout test
      accessToken = response.data.accessToken;
      
      // Access protected route with new token
      const protectedResponse = await axios.get('http://localhost:3001/api/protected', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      expect(protectedResponse.status).toBe(200);
    } catch (error) {
      console.error('Token refresh error:', error.response?.data || error.message);
      throw error;
    }
  });

  it('Should logout successfully and invalidate tokens', async () => {
    try {
      // Make sure we have cookies and access token from previous tests
      if (!cookies || cookies.length === 0 || !accessToken) {
        throw new Error('No cookies or access token found from previous tests');
      }
      
      // Logout
      const response = await axios.post(`${API_URL}/api/auth/logout`, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Cookie: cookies.join('; ')
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message');
      expect(response.data.message).toMatch(/logged out|logout successful/i);
      
      // Try accessing protected route with the same token (should fail)
      try {
        await axios.get('http://localhost:3001/api/protected', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message);
      throw error;
    }
  });
});
