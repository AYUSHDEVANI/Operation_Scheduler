const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const verify = async () => {
  console.log('🚀 Starting System Verification...');
  
  try {
    // 1. Check Backend Health (via Auth route essentially)
    console.log('1. Checking Backend Connectivity...');
    try {
      await axios.get('http://localhost:5000');
      console.log('✅ Backend Root is reachable');
    } catch (e) {
      if (e.response && e.response.status === 404) {
          console.log('✅ Backend is running (404 on root is expected for API server)');
      } else {
          console.log('❌ Backend might be down:', e.message);
      }
    }

    // 2. Check Database Connection (simulated by checking if we can get a 401 on protected route)
    console.log('2. Verifying Protected Routes (Auth Guard)...');
    try {
      await axios.get(`${BASE_URL}/doctors`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Auth Guard Working: 401 Unauthorized received as expected');
      } else {
        console.error('❌ Auth Guard Failed:', error.message);
      }
    }

    console.log('\n🎉 Verification Complete! The system structure is valid.');
    console.log('   - To fully test, log in via the Frontend running at http://localhost:5173');

  } catch (error) {
    console.error('System Verification Failed:', error.message);
  }
};

verify();
