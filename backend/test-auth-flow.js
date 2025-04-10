const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3001';
const testUser = {
  username: 'testuser',
  email: 'test@cybersafe.com',
  password: 'SecurePass123'
};

// Store tokens and cookies
let accessToken;
let refreshToken;
let cookies;

// Test runner
async function runTests() {
  try {
    // 1. Register a new user
    console.log('\n1. TESTING USER REGISTRATION:');
    try {
      const registrationResponse = await axios.post(`${API_URL}/api/auth/register`, testUser);
      console.log('✅ Registration successful:', registrationResponse.data.message || 'User registered');
      console.log('User ID:', registrationResponse.data.user.id);
      console.log('Username:', registrationResponse.data.user.username);
      console.log('Email:', registrationResponse.data.user.email);
      
      accessToken = registrationResponse.data.accessToken;
      console.log('Access Token received:', accessToken ? '✅ Yes' : '❌ No');
      
      if (registrationResponse.headers['set-cookie']) {
        cookies = registrationResponse.headers['set-cookie'];
        console.log('Refresh Token Cookie received:', cookies ? '✅ Yes' : '❌ No');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message === 'Email already registered') {
        console.log('⚠️ User already exists, continuing to login test...');
      } else {
        console.error('❌ Registration failed:', error.response?.data || error.message);
      }
    }
    
    // 2. Login
    console.log('\n2. TESTING USER LOGIN:');
    try {
      const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      
      console.log('✅ Login successful:', loginResponse.data.message || 'User logged in');
      accessToken = loginResponse.data.accessToken;
      console.log('Access Token received:', accessToken ? '✅ Yes' : '❌ No');
      
      if (loginResponse.headers['set-cookie']) {
        cookies = loginResponse.headers['set-cookie'];
        console.log('Refresh Token Cookie received:', cookies ? '✅ Yes' : '❌ No');
      }
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
    }
    
    if (!accessToken) {
      console.error('❌ No access token available, skipping protected route test');
      return;
    }

    // 3. Test protected route
    console.log('\n3. TESTING PROTECTED ROUTE ACCESS:');
    try {
      const protectedRouteResponse = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      console.log('✅ Protected route access successful');
      console.log('User data:', protectedRouteResponse.data);
      
      // Try accessing protected route without token for comparison
      try {
        await axios.get(`${API_URL}/api/auth/profile`);
        console.error('❌ ERROR: Unauthenticated access succeeded when it should have failed');
      } catch (unauthError) {
        console.log('✅ Correctly denied access without token (status:', unauthError.response?.status || 'unknown', ')');
      }
    } catch (error) {
      console.error('❌ Protected route access failed:', error.response?.data || error.message);
    }
    
    // 4. Test refresh token
    console.log('\n4. TESTING TOKEN REFRESH:');
    try {
      if (!cookies || cookies.length === 0) {
        console.log('⚠️ No cookies found, skipping refresh token test');
      } else {
        const refreshResponse = await axios.post(`${API_URL}/api/auth/refresh-token`, {}, {
          headers: {
            Cookie: cookies.join('; ')
          }
        });
        
        console.log('✅ Token refresh successful');
        console.log('New access token received:', refreshResponse.data.accessToken ? '✅ Yes' : '❌ No');
        
        // Update access token for logout test
        accessToken = refreshResponse.data.accessToken;
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error.response?.data || error.message);
    }
    
    // 5. Test logout
    console.log('\n5. TESTING LOGOUT:');
    try {
      const logoutResponse = await axios.post(`${API_URL}/api/auth/logout`, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Cookie: cookies ? cookies.join('; ') : ''
        }
      });
      
      console.log('✅ Logout successful:', logoutResponse.data.message || 'User logged out');
      
      // Try accessing protected route with the same token (should fail)
      try {
        await axios.get(`${API_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        console.error('❌ ERROR: Protected route access succeeded after logout');
      } catch (error) {
        console.log('✅ Correctly denied access with blacklisted token (status:', error.response?.status || 'unknown', ')');
      }
    } catch (error) {
      console.error('❌ Logout failed:', error.response?.data || error.message);
    }
    
    console.log('\n✅ AUTH FLOW TESTING COMPLETED!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests();
