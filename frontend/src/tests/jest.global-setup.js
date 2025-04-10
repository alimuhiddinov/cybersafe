// Global setup for Jest tests
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const dotenv = require('dotenv');

module.exports = async function() {
  // Load environment variables
  dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });
  
  console.log('Setting up test environment...');
  
  // Set up database state for authentication tests
  if (process.env.USE_TEST_DATABASE === 'true') {
    try {
      console.log('Setting up test database...');
      
      // Connect to the SQLite test database
      const prisma = new PrismaClient();
      
      // Clean up existing test users from previous runs
      await prisma.userProgress.deleteMany({
        where: {
          user: {
            email: {
              in: [
                'test@cybersafe.com',
                'premium@cybersafe.com',
                'admin@cybersafe.com',
                'newuser@cybersafe.com'
              ]
            }
          }
        }
      });
      
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [
              'test@cybersafe.com',
              'premium@cybersafe.com',
              'admin@cybersafe.com',
              'newuser@cybersafe.com'
            ]
          }
        }
      });
      
      // Create test users
      await prisma.user.createMany({
        data: [
          {
            username: 'testuser',
            email: 'test@cybersafe.com',
            password: '$2a$10$5bLm8nqUkUcLy1aE8gW/5uYqpz5BUzn4k2Anmx/c/U.IVlDzMRXWi', // 'SecurePass123'
            role: 'USER'
          },
          {
            username: 'premiumuser',
            email: 'premium@cybersafe.com',
            password: '$2a$10$5bLm8nqUkUcLy1aE8gW/5uYqpz5BUzn4k2Anmx/c/U.IVlDzMRXWi', // 'SecurePass123'
            role: 'PREMIUM'
          },
          {
            username: 'adminuser',
            email: 'admin@cybersafe.com',
            password: '$2a$10$5bLm8nqUkUcLy1aE8gW/5uYqpz5BUzn4k2Anmx/c/U.IVlDzMRXWi', // 'SecurePass123'
            role: 'ADMIN'
          }
        ]
      });
      
      // Close database connection
      await prisma.$disconnect();
      console.log('Test database setup complete');
    } catch (error) {
      console.error('Error setting up test database:', error);
      throw error;
    }
  } else {
    console.log('Skipping test database setup (USE_TEST_DATABASE is not true)');
  }
  
  // Setup mock server configuration
  global.__TEST_SERVER_RUNNING__ = false;
  
  console.log('Test environment setup complete');
};
