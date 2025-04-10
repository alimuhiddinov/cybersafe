# CyberSafe Platform

A gamified cybersecurity education platform designed to teach cybersecurity concepts through interactive learning modules, assessments, and hands-on exercises.

## Project Overview

CyberSafe is a full-stack educational platform focused on cybersecurity awareness and training. It provides structured learning paths for users of various knowledge levels, from beginners to advanced practitioners. The platform incorporates role-based access control, interactive learning modules, assessments, and gamification elements like badges to motivate learners.

### Key Features Implemented

- **User Authentication & Authorization**
  - Secure JWT-based authentication system
  - Role-based access control (USER, INSTRUCTOR, ADMIN)
  - Protected routes and middleware for access management

- **Learning Module System**
  - Structured content presentation with navigation
  - Module filtering and search functionality
  - Progressive content unlocking based on user progress

- **Assessment Engine**
  - Multi-question assessments with various question types
  - Real-time scoring and feedback
  - Attempts tracking and performance analytics

- **User Progress Tracking**
  - Completion status for modules and sections
  - Achievement badges for completing milestones
  - Progress visualization in user dashboard

- **Responsive UI/UX**
  - Modern, accessible interface
  - Mobile-friendly design
  - Consistent design language across components

### Technology Stack

- **Frontend**:
  - React.js with Next.js framework
  - Redux Toolkit for state management
  - TypeScript for type safety
  - Tailwind CSS for styling
  - Jest and React Testing Library for testing

- **Backend**:
  - Node.js with Express
  - Prisma ORM for database operations
  - SQLite database (development)
  - JWT for authentication

- **Development Tools**:
  - ESLint for code quality
  - Mock Service Worker (MSW) for API mocking in tests
  - Git for version control

## Project Structure

```
/cybersafe
  /frontend            # React.js with Next.js frontend application
    /src
      /components      # Reusable UI components
      /pages           # Next.js page components
      /store           # Redux store configuration and slices
      /styles          # Global styles and Tailwind configuration
      /tests           # Test suites for components and functionality
      /hooks           # Custom React hooks
      /utils           # Utility functions and helpers
      /types           # TypeScript type definitions
      /mocks           # Mock data and service worker handlers
  /backend             # Node.js with Express backend
    /src
      /controllers     # Request handlers
      /routes          # API route definitions
      /middleware      # Custom middleware functions
      /services        # Business logic
      /utils           # Utility functions
    /prisma            # Prisma schema and migrations
```

## Database Schema

The application uses Prisma with SQLite for data persistence with the following models:

- **User**: Stores user account information and roles
- **Badge**: Represents achievements users can earn
- **LearningModule**: Contains educational content structure
- **UserProgress**: Tracks user advancement through modules
- **Assessment**: Defines evaluations for learning modules
- **Question**: Stores assessment questions
- **Answer**: Contains possible answers for questions
- **UserAssessmentAttempt**: Records user assessment attempts
- **UserFeedback**: Stores user feedback on platform content

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/cybersafe.git
cd cybersafe
```

2. Install dependencies:

```bash
# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

3. Set up environment variables:

```bash
# Backend
cp backend/.env.example backend/.env
# Frontend
cp frontend/.env.example frontend/.env.local
```

4. Initialize the database:

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
cd ..
```

5. Start the development servers:

```bash
# Start backend server
cd backend
npm run dev

# In a separate terminal, start frontend server
cd frontend
npm run dev
```

6. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

## Testing

The project includes comprehensive test suites for both frontend and backend:

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test
```

## Future Development Roadmap

- Enhanced gamification elements (points, leaderboards)
- Interactive coding challenges and sandboxed environments
- Social learning features (discussion forums, peer reviews)
- Internationalization support for multiple languages
- Advanced analytics dashboard for instructors
- Mobile application version

## Contributors

- [Alikhon] - Project Lead

## License

This project is licensed under the MIT License - see the LICENSE file for details.
