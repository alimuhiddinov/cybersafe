import { http, HttpResponse } from 'msw'

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Test user data
const testUsers = {
  valid: {
    id: 1,
    email: 'test@cybersafe.com',
    username: 'testuser',
    role: 'USER'
  },
  instructor: {
    id: 2,
    email: 'instructor@cybersafe.com',
    username: 'instructor',
    role: 'INSTRUCTOR'
  },
  admin: {
    id: 3,
    email: 'admin@cybersafe.com',
    username: 'admin',
    role: 'ADMIN'
  }
};

// Define handlers array
export const handlers = [
  // Auth endpoints
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json();
    const { email, password } = body as any;
    
    if (email === testUsers.valid.email && password === 'password') {
      return HttpResponse.json({
        user: testUsers.valid,
        token: 'mock-jwt-token'
      });
    } else if (email === testUsers.instructor.email && password === 'password') {
      return HttpResponse.json({
        user: testUsers.instructor,
        token: 'mock-instructor-token'
      });
    } else if (email === testUsers.admin.email && password === 'password') {
      return HttpResponse.json({
        user: testUsers.admin,
        token: 'mock-admin-token'
      });
    }
    
    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),
  
  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = await request.json();
    
    return HttpResponse.json({
      message: 'User registered successfully',
      user: { ...body, id: 999, role: 'USER' },
      token: 'new-user-token'
    }, { status: 201 });
  }),
  
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
      return HttpResponse.json({ user: testUsers.valid });
    } else if (token === 'mock-instructor-token') {
      return HttpResponse.json({ user: testUsers.instructor });
    } else if (token === 'mock-admin-token') {
      return HttpResponse.json({ user: testUsers.admin });
    }
    
    return HttpResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }),
  
  http.post(`${API_URL}/auth/logout`, () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),
  
  // Health check
  http.get(`${API_URL}/health`, () => {
    return HttpResponse.json({ status: 'ok' });
  }),
];

// Export the HTTP response type
export type { HttpResponse }
