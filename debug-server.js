// Simple diagnostic server to test local port binding and connection
const http = require('http');
const PORT = process.env.PORT ? parseInt(process.env.PORT,10) : 40123;

const server = http.createServer((req,res)=>{
  res.writeHead(200, {'Content-Type':'text/plain'});
  res.end('OK ' + new Date().toISOString());
});

server.on('error', (err)=>{
  console.error('[diagnostic] server error:', err.code, err.message);
  setTimeout(()=>process.exit(1), 2000);
});

server.listen(PORT, '127.0.0.1', ()=>{
  console.log(`[diagnostic] listening on http://127.0.0.1:${PORT}`);
});

setInterval(()=>{
  if (server.listening) {
    console.log('[diagnostic] heartbeat', new Date().toISOString());
  }
}, 3000);
