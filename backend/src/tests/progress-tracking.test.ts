import axios from 'axios';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import express from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware';

// Load environment variables
dotenv.config();

// Define API URL - default to localhost:3000 if not set
const API_URL = process.env.API_URL || 'http://localhost:3000';

// Define test users
const testUser = {
  username: 'progresstester',
  email: 'progresstest@cybersafe.com',
  password: 'SecurePass123'
};

const adminUser = {
  username: 'progressadmin',
  email: 'progressadmin@cybersafe.com',
  password: 'AdminPass123',
  role: 'ADMIN'
};

// Store tokens and IDs for tests
let userAccessToken: string;
let adminAccessToken: string;
let userId: number;
let adminId: number;
let testModuleId: number;

describe('Progress Tracking Tests', () => {
  let server: any;
  let prisma: PrismaClient;
  
  beforeAll(async () => {
    // Create a test server for middleware testing
    const app = express();
    app.use(express.json());
    
    app.get('/api/protected', authenticate, (req, res) => {
      res.json({ message: 'Protected route accessed successfully', user: req.user });
    });
    
    // Start server for middleware testing
    server = createServer(app);
    server.listen(3001);
    
    // Initialize Prisma client
    prisma = new PrismaClient();
    
    try {
      // Clean up test users if they exist
      await prisma.user.deleteMany({
        where: { 
          OR: [
            { email: testUser.email },
            { email: adminUser.email }
          ]
        }
      });
      
      // Create test users
      const user = await prisma.user.create({
        data: {
          username: testUser.username,
          email: testUser.email,
          passwordHash: '$2a$10$LrYA/mTRmDfZh3LKalWPiOys4JrFhxGjnKgZ3O321S5JYUhL6j3fK', // Hash of 'SecurePass123'
          role: 'USER'
        }
      });
      userId = user.id;
      
      const admin = await prisma.user.create({
        data: {
          username: adminUser.username,
          email: adminUser.email,
          passwordHash: '$2a$10$LrYA/mTRmDfZh3LKalWPiOys4JrFhxGjnKgZ3O321S5JYUhL6j3fK', // Hash of 'AdminPass123'
          role: 'ADMIN'
        }
      });
      adminId = admin.id;
      
      // Create a test module
      const module = await prisma.learningModule.create({
        data: {
          title: 'Test Module',
          description: 'A test module for progress tracking',
          content: 'This is test content for the module',
          difficultyLevel: 'BEGINNER',
          estimatedTimeMinutes: 30,
          imageUrl: 'https://example.com/test.jpg',
          createdById: adminId
        }
      });
      testModuleId = module.id;
      
      // Log in to get tokens
      const userLoginResponse = await axios.post(`${API_URL}/api/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      userAccessToken = userLoginResponse.data.accessToken;
      
      const adminLoginResponse = await axios.post(`${API_URL}/api/auth/login`, {
        email: adminUser.email,
        password: adminUser.password
      });
      adminAccessToken = adminLoginResponse.data.accessToken;
    } catch (error) {
      console.error('Setup error:', error);
      throw error;
    }
  });
  
  afterAll(async () => {
    // Clean up test data
    await prisma.activityLog.deleteMany({
      where: {
        userProgress: {
          userId: {
            in: [userId, adminId]
          }
        }
      }
    });
    
    await prisma.userProgress.deleteMany({
      where: {
        userId: {
          in: [userId, adminId]
        }
      }
    });
    
    await prisma.learningModule.delete({
      where: {
        id: testModuleId
      }
    });
    
    await prisma.user.deleteMany({
      where: {
        id: {
          in: [userId, adminId]
        }
      }
    });
    
    // Close connections
    await prisma.$disconnect();
    if (server) server.close();
  });
  
  // Progress Recording Tests
  describe('Basic Progress Recording', () => {
    beforeEach(async () => {
      // Reset progress before each test
      await prisma.userProgress.deleteMany({
        where: {
          userId,
          moduleId: testModuleId
        }
      });
    });
    
    it('Should start a module session', async () => {
      try {
        const response = await axios.post(
          `${API_URL}/api/progress/module/${testModuleId}/start`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('message', 'Module started successfully');
        expect(response.data).toHaveProperty('progress');
        expect(response.data.progress).toHaveProperty('userId', userId);
        expect(response.data.progress).toHaveProperty('moduleId', testModuleId);
        expect(response.data.progress).toHaveProperty('completionStatus', 'IN_PROGRESS');
        expect(response.data.progress).toHaveProperty('progressPercentage', 0);
      } catch (error) {
        console.error('Start module error:', error.response?.data || error.message);
        throw error;
      }
    });
    
    it('Should update module progress', async () => {
      try {
        // First start the module
        await axios.post(
          `${API_URL}/api/progress/module/${testModuleId}/start`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        // Then update progress
        const response = await axios.post(
          `${API_URL}/api/modules/${testModuleId}/progress`,
          {
            progressPercentage: 50,
            pointsEarned: 25,
            timeSpentSeconds: 300
          },
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('message', 'Progress updated successfully');
        expect(response.data).toHaveProperty('progress');
        expect(response.data.progress).toHaveProperty('progressPercentage', 50);
        expect(response.data.progress).toHaveProperty('pointsEarned', 25);
        expect(Number(response.data.progress.timeSpentSeconds)).toBeGreaterThanOrEqual(300);
      } catch (error) {
        console.error('Update progress error:', error.response?.data || error.message);
        throw error;
      }
    });
    
    it('Should complete a module', async () => {
      try {
        // First start the module
        await axios.post(
          `${API_URL}/api/progress/module/${testModuleId}/start`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        // Then complete the module
        const response = await axios.post(
          `${API_URL}/api/progress/module/${testModuleId}/complete`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('message', 'Module completed successfully');
        expect(response.data).toHaveProperty('progress');
        expect(response.data.progress).toHaveProperty('completionStatus', 'COMPLETED');
        expect(response.data.progress).toHaveProperty('progressPercentage', 100);
        expect(response.data.progress).toHaveProperty('completedAt');
      } catch (error) {
        console.error('Complete module error:', error.response?.data || error.message);
        throw error;
      }
    });
    
    it('Should save notes for a module', async () => {
      try {
        // First start the module
        await axios.post(
          `${API_URL}/api/progress/module/${testModuleId}/start`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        // Then save notes
        const notes = 'These are test notes for the module';
        const response = await axios.post(
          `${API_URL}/api/progress/module/${testModuleId}/notes`,
          { notes },
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('message', 'Notes saved successfully');
        expect(response.data).toHaveProperty('progress');
        expect(response.data.progress).toHaveProperty('notes', notes);
      } catch (error) {
        console.error('Save notes error:', error.response?.data || error.message);
        throw error;
      }
    });
    
    it('Should save bookmarks for a module', async () => {
      try {
        // First start the module
        await axios.post(
          `${API_URL}/api/progress/module/${testModuleId}/start`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        // Then save bookmarks
        const bookmarks = ['page-1', 'section-3'];
        const response = await axios.post(
          `${API_URL}/api/progress/module/${testModuleId}/bookmarks`,
          { bookmarks },
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('message', 'Bookmarks saved successfully');
        expect(response.data).toHaveProperty('progress');
        expect(response.data.progress).toHaveProperty('bookmarks');
        expect(JSON.parse(response.data.progress.bookmarks)).toEqual(bookmarks);
      } catch (error) {
        console.error('Save bookmarks error:', error.response?.data || error.message);
        throw error;
      }
    });
    
    it('Should get module progress', async () => {
      try {
        // First start and update the module
        await axios.post(
          `${API_URL}/api/progress/module/${testModuleId}/start`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        await axios.post(
          `${API_URL}/api/modules/${testModuleId}/progress`,
          {
            progressPercentage: 75,
            pointsEarned: 30
          },
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        // Then get the progress
        const response = await axios.get(
          `${API_URL}/api/modules/${testModuleId}/progress`,
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('userId', userId);
        expect(response.data).toHaveProperty('moduleId', testModuleId);
        expect(response.data).toHaveProperty('progressPercentage', 75);
        expect(response.data).toHaveProperty('pointsEarned', 30);
      } catch (error) {
        console.error('Get module progress error:', error.response?.data || error.message);
        throw error;
      }
    });
    
    it('Should get user progress for all modules', async () => {
      try {
        // First create progress for the test module
        await axios.post(
          `${API_URL}/api/progress/module/${testModuleId}/start`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        // Then get all progress
        const response = await axios.get(
          `${API_URL}/api/progress/progress`,
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
        
        const moduleProgress = response.data.find((p: any) => p.moduleId === testModuleId);
        expect(moduleProgress).toBeDefined();
        expect(moduleProgress).toHaveProperty('userId', userId);
        expect(moduleProgress).toHaveProperty('completionStatus');
      } catch (error) {
        console.error('Get all progress error:', error.response?.data || error.message);
        throw error;
      }
    });
  });
  
  // Activity Logging Tests
  describe('Activity Logging', () => {
    beforeEach(async () => {
      // Reset progress before each test
      await prisma.activityLog.deleteMany({
        where: {
          userProgress: {
            userId
          }
        }
      });
      
      await prisma.userProgress.deleteMany({
        where: {
          userId,
          moduleId: testModuleId
        }
      });
    });
    
    it('Should log activities when interacting with modules', async () => {
      try {
        // Start a module (this should create an activity log)
        await axios.post(
          `${API_URL}/api/progress/module/${testModuleId}/start`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        // Complete a module (this should create another activity log)
        await axios.post(
          `${API_URL}/api/progress/module/${testModuleId}/complete`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        // Add notes (this should create another activity log)
        await axios.post(
          `${API_URL}/api/progress/module/${testModuleId}/notes`,
          { notes: 'Test notes' },
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        // Get user activity
        const response = await axios.get(
          `${API_URL}/api/progress/activity`,
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('activities');
        expect(Array.isArray(response.data.activities)).toBe(true);
        expect(response.data.activities.length).toBeGreaterThanOrEqual(3);
        
        // Check for specific activity types
        const activityTypes = response.data.activities.map((a: any) => a.activityType);
        expect(activityTypes).toContain('MODULE_STARTED');
        expect(activityTypes).toContain('MODULE_COMPLETED');
        expect(activityTypes).toContain('NOTE_ADDED');
      } catch (error) {
        console.error('Activity logging error:', error.response?.data || error.message);
        throw error;
      }
    });
    
    it('Should filter activities by type', async () => {
      try {
        // Start a module
        await axios.post(
          `${API_URL}/api/progress/module/${testModuleId}/start`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        // Complete a module
        await axios.post(
          `${API_URL}/api/progress/module/${testModuleId}/complete`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        // Get only MODULE_STARTED activities
        const response = await axios.get(
          `${API_URL}/api/progress/activity?type=MODULE_STARTED`,
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('activities');
        expect(Array.isArray(response.data.activities)).toBe(true);
        expect(response.data.activities.length).toBeGreaterThan(0);
        
        // All activities should be MODULE_STARTED
        const allStarted = response.data.activities.every(
          (a: any) => a.activityType === 'MODULE_STARTED'
        );
        expect(allStarted).toBe(true);
      } catch (error) {
        console.error('Activity filtering error:', error.response?.data || error.message);
        throw error;
      }
    });
  });
  
  // User Stats and Achievements Tests
  describe('User Stats and Achievements', () => {
    beforeEach(async () => {
      // Reset achievements and progress
      await prisma.userAchievement.deleteMany({
        where: {
          userId
        }
      });
      
      await prisma.activityLog.deleteMany({
        where: {
          userProgress: {
            userId
          }
        }
      });
      
      await prisma.userProgress.deleteMany({
        where: {
          userId
        }
      });
      
      await prisma.learningStreak.deleteMany({
        where: {
          userId
        }
      });
      
      // Create achievement if not exists
      const achievementExists = await prisma.achievement.findFirst({
        where: {
          name: 'Module Master'
        }
      });
      
      if (!achievementExists) {
        await prisma.achievement.create({
          data: {
            name: 'Module Master',
            description: 'Complete your first module',
            imageUrl: 'https://example.com/badge.png',
            criteria: 'MODULES_COMPLETED',
            threshold: 1
          }
        });
      }
    });
    
    it('Should get user learning statistics', async () => {
      try {
        // Create some progress data first
        await axios.post(
          `${API_URL}/api/progress/module/${testModuleId}/start`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        await axios.post(
          `${API_URL}/api/progress/module/${testModuleId}/complete`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        // Get user stats
        const response = await axios.get(
          `${API_URL}/api/progress/stats`,
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('completedModules', 1);
        expect(response.data).toHaveProperty('streak');
        expect(response.data.streak).toHaveProperty('current');
        expect(response.data.streak).toHaveProperty('longest');
        expect(response.data).toHaveProperty('totalTimeSpent');
        expect(response.data).toHaveProperty('averageCompletionTime');
      } catch (error) {
        console.error('Get user stats error:', error.response?.data || error.message);
        throw error;
      }
    });
    
    it('Should earn and get achievements', async () => {
      try {
        // Complete a module to earn an achievement
        await axios.post(
          `${API_URL}/api/progress/module/${testModuleId}/start`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        await axios.post(
          `${API_URL}/api/progress/module/${testModuleId}/complete`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        // Wait a moment for achievements to process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get user achievements
        const response = await axios.get(
          `${API_URL}/api/progress/achievements`,
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        
        // Should have at least one achievement
        expect(response.data.length).toBeGreaterThan(0);
        
        // One of the achievements should be 'Module Master'
        const hasModuleMaster = response.data.some((a: any) => 
          a.achievement && a.achievement.name === 'Module Master'
        );
        expect(hasModuleMaster).toBe(true);
      } catch (error) {
        console.error('Achievements error:', error.response?.data || error.message);
        throw error;
      }
    });
  });
  
  // Admin Analytics Tests
  describe('Admin Analytics', () => {
    it('Should get platform analytics as admin', async () => {
      try {
        // Ensure there's some data first
        await axios.post(
          `${API_URL}/api/progress/module/${testModuleId}/start`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        await axios.post(
          `${API_URL}/api/progress/module/${testModuleId}/complete`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        // Get platform analytics as admin
        const response = await axios.get(
          `${API_URL}/api/progress/analytics`,
          {
            headers: {
              Authorization: `Bearer ${adminAccessToken}`
            }
          }
        );
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('totalUsers');
        expect(response.data).toHaveProperty('totalActiveUsers');
        expect(response.data).toHaveProperty('totalCompletedModules');
        expect(response.data).toHaveProperty('averageCompletionRate');
        expect(response.data).toHaveProperty('popularModules');
        expect(Array.isArray(response.data.popularModules)).toBe(true);
      } catch (error) {
        console.error('Admin analytics error:', error.response?.data || error.message);
        throw error;
      }
    });
    
    it('Should deny access to analytics for non-admin users', async () => {
      try {
        // Try to get platform analytics as regular user
        await axios.get(
          `${API_URL}/api/progress/analytics`,
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`
            }
          }
        );
        
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error.response.status).toBe(403);
        expect(error.response.data).toHaveProperty('message');
        expect(error.response.data.message).toMatch(/admin|access|permission/i);
      }
    });
  });
});
