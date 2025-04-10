# CyberSafe Authentication Flow Testing Guide

This comprehensive test suite validates the complete authentication flow and access permissions for the CyberSafe cybersecurity education platform. The tests ensure proper functioning of user registration, login, logout, and access control across different user types.

## Test Scope

The test suite covers the following areas:

### 1. Authentication Flows
- **Registration Flow**: Form validation, account creation, duplicate email handling
- **Login Flow**: Successful/failed login, token generation and storage
- **Logout Flow**: Token invalidation, session termination

### 2. Access Control
- **Page Access Permissions**: Route protection based on user role
- **Feature Access Permissions**: Content access restrictions based on user tier

### 3. Token Management
- **Token Generation**: JWT creation during login/registration
- **Token Refresh**: Auto-refresh of expired tokens
- **Token Invalidation**: Proper cleanup during logout

## Test User Types

The test suite validates behavior across three user types:

1. **Anonymous Users**: Unauthenticated visitors
2. **Basic Users**: Regular authenticated users with free tier access
3. **Premium Users**: Paid users with access to all content
4. **Admin Users**: Administrative users with full platform access

## Test Structure

The test suite is organized into four main categories:

1. **Unit Tests** (`auth.test.tsx`): Tests individual components and functions
2. **Middleware Tests** (`auth.middleware.test.ts`): Tests route protection middleware
3. **API Integration Tests** (`auth.api.test.ts`): Tests authentication API endpoints
4. **End-to-End Tests** (`auth.e2e.test.ts`): Tests complete user flows

## Prerequisites

Before running the tests, ensure you have:

1. Node.js v14+ installed
2. A local or test instance of the CyberSafe backend running
3. SQLite database as set up in the Prisma schema with the following models:
   - User
   - Badge
   - LearningModule
   - UserProgress
   - Assessment
   - Question
   - Answer
   - UserAssessmentAttempt
   - UserFeedback

## Running the Tests

### Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env.test` file in the project root with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   USE_TEST_DATABASE=true
   JWT_SECRET=test-secret-key
   ```

### Running All Tests

To run the complete test suite:

```
npm test
```

### Running Specific Test Categories

To run only unit tests:
```
npm test -- src/tests/auth/auth.test.tsx
```

To run only API integration tests:
```
npm test -- src/tests/auth/auth.api.test.ts
```

To run only middleware tests:
```
npm test -- src/tests/auth/auth.middleware.test.ts
```

To run end-to-end tests (requires additional setup):
```
npm run test:e2e
```

## Test Environment

The test suite uses the following tools:

- **Jest**: JavaScript testing framework
- **React Testing Library**: For component testing
- **MSW (Mock Service Worker)**: For API mocking
- **Playwright**: For end-to-end tests

## Test Accounts

The test suite uses these pre-configured test accounts:

1. **Basic User**:
   - Email: `basic@cybersafe.com`
   - Password: `SecurePass123`
   - Role: `USER`

2. **Premium User**:
   - Email: `premium@cybersafe.com`
   - Password: `SecurePass123`
   - Role: `PREMIUM`

3. **Admin User**:
   - Email: `admin@cybersafe.com`
   - Password: `SecurePass123`
   - Role: `ADMIN`

## Coverage Reports

After running tests, coverage reports are generated in the `coverage` directory:

- `coverage/lcov-report/index.html`: HTML coverage report
- `coverage/coverage-final.json`: JSON coverage data
- `coverage/text-summary.txt`: Text summary of coverage

## Test Guidelines

When adding new authentication-related features:

1. Write unit tests for individual components
2. Add API tests for new endpoints
3. Update middleware tests for new route protections
4. Extend E2E tests for complete user flows

## Common Testing Scenarios

### Testing Form Validation

Use the unit tests to verify form validation for:
- Required fields
- Email format validation
- Password strength requirements
- Username length and format

### Testing Route Protection

Use the middleware tests to verify that:
- Unauthenticated users are redirected to login
- Basic users can't access premium content
- Premium users can access premium content
- Admin users can access admin sections

### Testing API Security

Use the API tests to verify that:
- Authentication endpoints validate credentials
- Protected endpoints reject unauthorized requests
- Token refresh works correctly
- Rate limiting prevents brute force attacks

## Troubleshooting

### Common Issues

1. **Test Database Connection Failures**:
   - Check that your SQLite database is correctly set up
   - Verify that the Prisma schema matches the expected models

2. **Authentication Token Errors**:
   - Ensure the JWT_SECRET is set in your .env.test file
   - Check token expiration logic

3. **Route Protection Failures**:
   - Verify that the AuthWrapper component is used in _app.tsx
   - Check role-based route mapping

## Maintenance

The test suite should be updated when:
- New user roles are added
- Authentication flow changes
- New protected routes are created
- Permission structure changes

## Future Improvements

Consider these enhancements to the test suite:
- Add visual regression testing for auth-related UI components
- Implement performance testing for authentication operations
- Add accessibility testing for login/register forms
- Expand cross-browser E2E testing
