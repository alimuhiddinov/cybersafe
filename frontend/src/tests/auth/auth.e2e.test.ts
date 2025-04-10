/**
 * End-to-end Authentication Flow Tests
 * 
 * This test suite uses Cypress-like patterns but is adapted for Jest and Playwright
 * for comprehensive end-to-end testing of authentication flows.
 */

import { test, expect, Page } from '@playwright/test';

// Test user credentials
const USERS = {
  anonymous: {
    // No credentials needed
  },
  basic: {
    email: 'basic@cybersafe.com',
    password: 'Password123',
    username: 'basicuser'
  },
  premium: {
    email: 'premium@cybersafe.com',
    password: 'Password123',
    username: 'premiumuser'
  },
  admin: {
    email: 'admin@cybersafe.com',
    password: 'Password123',
    username: 'adminuser'
  }
};

// Page access permissions by user type
const PAGE_ACCESS = {
  '/': ['anonymous', 'basic', 'premium', 'admin'],
  '/login': ['anonymous', 'basic', 'premium', 'admin'],
  '/register': ['anonymous', 'basic', 'premium', 'admin'],
  '/dashboard': ['basic', 'premium', 'admin'],
  '/profile': ['basic', 'premium', 'admin'],
  '/modules': ['basic', 'premium', 'admin'],
  '/modules/1': ['basic', 'premium', 'admin'],
  '/modules/premium-only': ['premium', 'admin'],
  '/admin': ['admin']
};

// Utility function to login
async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');
  // Wait for navigation to complete
  await page.waitForURL('**/dashboard');
}

// Utility function to register
async function register(page: Page, username: string, email: string, password: string) {
  await page.goto('/register');
  await page.fill('[data-testid="username-input"]', username);
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.fill('[data-testid="confirm-password-input"]', password);
  await page.click('[data-testid="register-button"]');
  // Wait for navigation to complete
  await page.waitForURL('**/dashboard');
}

describe('Authentication E2E Tests', () => {
  test.describe('Registration Flow', () => {
    test('should allow new user registration with valid credentials', async ({ page }) => {
      const randomNum = Math.floor(Math.random() * 10000);
      const newUser = {
        username: `testuser${randomNum}`,
        email: `test${randomNum}@example.com`,
        password: 'Password123'
      };
      
      await page.goto('/register');
      
      // Check form elements
      expect(await page.isVisible('[data-testid="username-input"]')).toBeTruthy();
      expect(await page.isVisible('[data-testid="email-input"]')).toBeTruthy();
      expect(await page.isVisible('[data-testid="password-input"]')).toBeTruthy();
      expect(await page.isVisible('[data-testid="confirm-password-input"]')).toBeTruthy();
      
      // Fill the form
      await page.fill('[data-testid="username-input"]', newUser.username);
      await page.fill('[data-testid="email-input"]', newUser.email);
      await page.fill('[data-testid="password-input"]', newUser.password);
      await page.fill('[data-testid="confirm-password-input"]', newUser.password);
      
      // Submit form
      await page.click('[data-testid="register-button"]');
      
      // Verify successful registration (redirected to dashboard)
      await page.waitForURL('**/dashboard');
      
      // Verify user is logged in by checking for profile link
      expect(await page.isVisible('text=Profile')).toBeTruthy();
      
      // Verify localStorage token
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).not.toBeNull();
    });
    
    test('should prevent registration with duplicate email', async ({ page }) => {
      // Use an existing user's email
      const existingUser = USERS.basic;
      
      await page.goto('/register');
      
      // Fill the form with duplicate email
      await page.fill('[data-testid="username-input"]', 'newusername');
      await page.fill('[data-testid="email-input"]', existingUser.email);
      await page.fill('[data-testid="password-input"]', 'Password123');
      await page.fill('[data-testid="confirm-password-input"]', 'Password123');
      
      // Submit form
      await page.click('[data-testid="register-button"]');
      
      // Verify error message
      await page.waitForSelector('text=Email already in use');
      
      // Verify we are still on the register page
      expect(page.url()).toContain('/register');
    });
    
    test('should validate form fields on registration', async ({ page }) => {
      await page.goto('/register');
      
      // Submit empty form
      await page.click('[data-testid="register-button"]');
      
      // Verify validation errors
      await page.waitForSelector('text=Username is required');
      await page.waitForSelector('text=Email is required');
      await page.waitForSelector('text=Password is required');
      
      // Test invalid email format
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      
      // Test password mismatch
      await page.fill('[data-testid="password-input"]', 'Password123');
      await page.fill('[data-testid="confirm-password-input"]', 'DifferentPassword');
      
      // Submit form with invalid data
      await page.click('[data-testid="register-button"]');
      
      // Verify validation errors
      await page.waitForSelector('text=Invalid email format');
      await page.waitForSelector('text=Passwords do not match');
    });
  });
  
  test.describe('Login Flow', () => {
    test('should allow login with valid credentials', async ({ page }) => {
      const user = USERS.basic;
      
      await page.goto('/login');
      
      // Check form elements
      expect(await page.isVisible('[data-testid="email-input"]')).toBeTruthy();
      expect(await page.isVisible('[data-testid="password-input"]')).toBeTruthy();
      
      // Fill the form
      await page.fill('[data-testid="email-input"]', user.email);
      await page.fill('[data-testid="password-input"]', user.password);
      
      // Submit form
      await page.click('[data-testid="login-button"]');
      
      // Verify successful login (redirected to dashboard)
      await page.waitForURL('**/dashboard');
      
      // Verify user is logged in by checking for profile link
      expect(await page.isVisible('text=Profile')).toBeTruthy();
      
      // Verify localStorage token
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).not.toBeNull();
    });
    
    test('should prevent login with invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      // Fill the form with invalid credentials
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'WrongPassword');
      
      // Submit form
      await page.click('[data-testid="login-button"]');
      
      // Verify error message
      await page.waitForSelector('text=Invalid credentials');
      
      // Verify we are still on the login page
      expect(page.url()).toContain('/login');
      
      // Verify no token in localStorage
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeNull();
    });
    
    test('should validate form fields on login', async ({ page }) => {
      await page.goto('/login');
      
      // Submit empty form
      await page.click('[data-testid="login-button"]');
      
      // Verify validation errors
      await page.waitForSelector('text=Email is required');
      await page.waitForSelector('text=Password is required');
      
      // Test invalid email format
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      
      // Submit form with invalid data
      await page.click('[data-testid="login-button"]');
      
      // Verify validation errors
      await page.waitForSelector('text=Invalid email format');
    });
    
    test('should remember user on page refresh', async ({ page }) => {
      const user = USERS.basic;
      
      // Login
      await login(page, user.email, user.password);
      
      // Verify we're on the dashboard
      expect(page.url()).toContain('/dashboard');
      
      // Refresh the page
      await page.reload();
      
      // Wait for page to load
      await page.waitForSelector('text=Dashboard');
      
      // Verify user is still logged in
      expect(await page.isVisible('text=Profile')).toBeTruthy();
    });
  });
  
  test.describe('Logout Flow', () => {
    test('should allow user to log out', async ({ page }) => {
      const user = USERS.basic;
      
      // Login
      await login(page, user.email, user.password);
      
      // Click logout button
      await page.click('[data-testid="logout-button"]');
      
      // Verify redirect to home page
      await page.waitForURL('**/');
      
      // Verify user is logged out by checking for login/register links
      expect(await page.isVisible('text=Login')).toBeTruthy();
      expect(await page.isVisible('text=Register')).toBeTruthy();
      
      // Verify token removed from localStorage
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeNull();
    });
    
    test('should prevent access to protected routes after logout', async ({ page }) => {
      const user = USERS.basic;
      
      // Login
      await login(page, user.email, user.password);
      
      // Verify we're on the dashboard
      expect(page.url()).toContain('/dashboard');
      
      // Logout
      await page.click('[data-testid="logout-button"]');
      
      // Try to access dashboard
      await page.goto('/dashboard');
      
      // Verify redirect to login page
      await page.waitForURL('**/login');
    });
  });
  
  test.describe('Access Control', () => {
    for (const [path, allowedUsers] of Object.entries(PAGE_ACCESS)) {
      for (const userType of ['anonymous', 'basic', 'premium', 'admin']) {
        const shouldAllow = allowedUsers.includes(userType);
        const testTitle = `should ${shouldAllow ? 'allow' : 'deny'} ${userType} user access to ${path}`;
        
        test(testTitle, async ({ page }) => {
          // Login as user type if not anonymous
          if (userType !== 'anonymous') {
            const user = USERS[userType];
            await login(page, user.email, user.password);
          }
          
          // Try to access the path
          await page.goto(path);
          
          if (shouldAllow) {
            // Check that we're on the expected page
            if (path === '/') {
              expect(page.url()).toMatch(/\/(home)?$/);
            } else {
              expect(page.url()).toContain(path);
            }
            
            // Additional check for different page types
            if (path === '/dashboard') {
              expect(await page.isVisible('text=Your Progress')).toBeTruthy();
            } else if (path === '/profile') {
              expect(await page.isVisible('text=Profile Settings')).toBeTruthy();
            } else if (path === '/modules') {
              expect(await page.isVisible('text=Learning Modules')).toBeTruthy();
            }
          } else {
            // Should be redirected to login or access denied
            const currentUrl = page.url();
            expect(currentUrl).toMatch(/\/login|\/access-denied/);
          }
        });
      }
    }
  });
  
  test.describe('Token Management', () => {
    test('should refresh token when expired', async ({ page }) => {
      const user = USERS.basic;
      
      // Login
      await login(page, user.email, user.password);
      
      // Mock an expired token
      await page.evaluate(() => {
        // Create an expired token (this is a simplified simulation)
        localStorage.setItem('token-expiry', (Date.now() - 1000).toString());
      });
      
      // Try to access a protected page that would trigger token refresh
      await page.goto('/dashboard');
      
      // Wait for page to load
      await page.waitForSelector('text=Dashboard');
      
      // Verify still on dashboard (meaning token refresh worked)
      expect(page.url()).toContain('/dashboard');
      
      // Verify token was refreshed
      const tokenExpiry = await page.evaluate(() => localStorage.getItem('token-expiry'));
      const tokenExpiryTime = parseInt(tokenExpiry || '0');
      expect(tokenExpiryTime).toBeGreaterThan(Date.now());
    });
    
    test('should correctly handle concurrent login on multiple tabs', async ({ browser }) => {
      const user = USERS.basic;
      
      // Open first tab and login
      const firstTab = await browser.newPage();
      await login(firstTab, user.email, user.password);
      
      // Open second tab
      const secondTab = await browser.newPage();
      await secondTab.goto('/dashboard');
      
      // Check if we're redirected to login
      expect(secondTab.url()).toContain('/login');
      
      // Login in second tab
      await secondTab.fill('[data-testid="email-input"]', user.email);
      await secondTab.fill('[data-testid="password-input"]', user.password);
      await secondTab.click('[data-testid="login-button"]');
      
      // Verify successful login in second tab
      await secondTab.waitForURL('**/dashboard');
      
      // Logout in first tab
      await firstTab.click('[data-testid="logout-button"]');
      
      // Refresh second tab
      await secondTab.reload();
      
      // Should be logged out and redirected to login
      await secondTab.waitForURL('**/login');
    });
  });
});
