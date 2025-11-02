const http = require('http');

console.log('Testing website at http://localhost:3333');

http.get('http://localhost:3333', (res) => {
  console.log(`Status code: ${res.statusCode}`);
  console.log('Website is accessible!');
}).on('error', (err) => {
  console.error(`Error: ${err.message}`);
});