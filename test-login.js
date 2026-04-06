const http = require('http');

const baseURL = 'http://localhost:5000/api';

const registerData = JSON.stringify({
  name: 'Test Administrator',
  email: 'admin' + Date.now() + '@phishshield.com', // Unique email
  password: 'superpassword123'
});

const makeRequest = (path, method, data) => {
  return new Promise((resolve, reject) => {
    const req = http.request(baseURL + path, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data ? Buffer.byteLength(data) : 0
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(responseBody) });
        } catch(e) {
          resolve({ status: res.statusCode, body: responseBody });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
};

async function testApi() {
  console.log('🔄 Checking if server is running...');
  try {
    const health = await makeRequest('/health', 'GET');
    if (health.status !== 200) throw new Error('Server not ready');
    console.log('✅ Server is up and responding.\n');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
       console.log('❌ FATAL ERROR: The backend API server is NOT running. This usually means MongoDB is offline, so the server crashed continuously. Please start MongoDB locally first.');
       process.exit(1);
    }
    console.log('❌ Server health check failed', error);
    process.exit(1);
  }

  console.log('👉 [1/2] Testing REGISTER API (/api/auth/register)');
  const regResponse = await makeRequest('/auth/register', 'POST', registerData);
  console.log(`Status: ${regResponse.status}`);
  console.log(`Response:`, regResponse.body);

  if (regResponse.status !== 201) {
    console.log('\n❌ Registration failed. Aborting login test.');
    process.exit(1);
  }

  console.log('\n👉 [2/2] Testing LOGIN API (/api/auth/login)');
  const loginData = JSON.stringify({
    email: regResponse.body.user.email,
    password: 'superpassword123'
  });
  const loginResponse = await makeRequest('/auth/login', 'POST', loginData);
  console.log(`Status: ${loginResponse.status}`);
  console.log(`Response:`, loginResponse.body);

  if (loginResponse.status === 200 && loginResponse.body.token) {
    console.log(`\n🎉 LOGIN SUCCESSFUL!`);
    console.log(`Stored JWT Token: ${loginResponse.body.token}`);
  } else {
    console.log(`\n❌ LOGIN FAILED!`);
  }
}

testApi();
