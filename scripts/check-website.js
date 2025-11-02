// Test script to verify the website is working
const http = require('http');

console.log('Testing website at http://localhost:3333');

const options = {
  hostname: 'localhost',
  port: 3333,
  path: '/',
  method: 'GET',
  timeout: 5000, // 5 seconds timeout
};

const req = http.request(options, (res) => {
  console.log(`Status code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ SUCCESS: Website is running correctly!');
      console.log(`Response length: ${data.length} bytes`);
    } else {
      console.log(`❌ ERROR: Website returned status ${res.statusCode}`);
    }
  });
});

req.on('error', (err) => {
  console.error(`❌ ERROR: ${err.message}`);
});

req.on('timeout', () => {
  console.error('❌ ERROR: Request timed out');
  req.abort();
});

req.end();