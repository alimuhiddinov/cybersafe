const fs = require('fs');
const path = require('path');

// Create a temporary .env file for testing if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('Creating temporary .env file for testing...');
  const envContent = `
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=test_secret_key_for_auth_flow_testing
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:3000
`;
  fs.writeFileSync(envPath, envContent);
  console.log('Temporary .env created for testing.');
}

console.log('Test environment setup complete!');
console.log('Instructions:');
console.log('1. Start the server with: npm run dev');
console.log('2. In a new terminal, run the test: node test-auth-flow.js');
