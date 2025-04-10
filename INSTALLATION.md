# CyberSafe Platform Installation Guide

This guide will help you set up your development environment for the CyberSafe cybersecurity education platform.

## Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MySQL](https://www.mysql.com/) (v8.0 or higher)
- [Git](https://git-scm.com/)

## Initial Setup

1. Clone the repository (if you haven't already):

```bash
git clone <repository-url>
cd cybersafe
```

2. Install root dependencies:

```bash
npm install
```

## Backend Setup

1. Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

2. Set up your environment variables:

```bash
# Create environment file from example
cp .env.example .env
```

3. Open the `.env` file and update the following:
   - `DATABASE_URL`: Set your MySQL connection string
   - `JWT_SECRET`: Set a strong secret key
   - `CORS_ORIGINS`: Configure allowed origins (if needed)
   - `EMAIL_*`: Configure email settings if you'll be using email functionality

4. Generate Prisma client:

```bash
npm run prisma:generate
```

5. Set up the database and run migrations:

```bash
# Create the database and run migrations
npm run db:migrate

# Seed the database with initial data
npm run db:seed

# (Optional) Open Prisma Studio to view/edit data
npm run db:studio
```

## Frontend Setup

1. Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

2. Set up your environment variables:

```bash
# Create environment file from example
cp .env.example .env.local
```

3. Update the `.env.local` file with your backend API URL:
   - `NEXT_PUBLIC_API_URL`: Set to the URL of your backend API (default: http://localhost:3001)

## Running the Application

1. Start the backend server:

```bash
# From the backend directory
npm run dev
```

2. In a separate terminal, start the frontend development server:

```bash
# From the frontend directory
npm run dev
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Health check: http://localhost:3001/health
   - Prisma Studio (optional): http://localhost:5555 (after running `npm run db:studio`)

## Development Workflow

### Git Branching Strategy

We follow a branching strategy with three main branches:

- `main`: Production-ready code
- `development`: Integration branch for feature development
- `feature/*`: Individual feature branches

Workflow:

1. Create a feature branch from `development`:
   ```bash
   git checkout development
   git pull
   git checkout -b feature/my-new-feature
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. Push your branch and create a pull request to the `development` branch.

### Pre-commit Hooks

The project uses Husky for pre-commit hooks that run linting. To skip hooks temporarily (not recommended):

```bash
git commit -m "your message" --no-verify
```

## Testing

To run tests:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Verify your MySQL server is running
2. Check your DATABASE_URL in the .env file
3. Make sure the database exists (create it manually if needed)

### Prisma Issues

If you encounter Prisma-related errors:

```bash
# Regenerate Prisma client after schema changes
cd backend
npm run prisma:generate
```

### Package Dependency Issues

If you encounter dependency conflicts:

```bash
# Clean install dependencies
npm ci
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
