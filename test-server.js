const http = require('http');

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<!DOCTYPE html><html><head><title>Test Server</title></head><body><h1>Test Server Working</h1><p>If you can see this message, HTTP connections are working on port 3000.</p></body></html>');
});

// Listen on port 9090 using localhost
server.listen(9090, '127.0.0.1', () => {
  console.log('Test server running at http://127.0.0.1:9090/');
  console.log('Press Ctrl+C to stop');
});