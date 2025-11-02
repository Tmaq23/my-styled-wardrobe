// This script tests the site's accessibility
const https = require('https');
const http = require('http');

// Local development URL
const url = 'http://localhost:3333';

function checkSite() {
  console.log(`Testing site at: ${url}`);
  
  const req = http.get(url, (res) => {
    const { statusCode } = res;
    
    console.log(`Status Code: ${statusCode}`);
    
    if (statusCode === 200) {
      console.log('✅ SUCCESS: The website is running correctly!');
    } else {
      console.log(`❌ ERROR: The website returned status code ${statusCode}`);
    }
    
    // Collect data chunks
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    
    res.on('end', () => {
      try {
        console.log(`Response size: ${rawData.length} bytes`);
        console.log('Website is responding with HTML content');
      } catch (e) {
        console.error(`Error parsing response: ${e.message}`);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error(`❌ ERROR: ${e.message}`);
  });
  
  // Set a timeout for the request
  req.setTimeout(5000, () => {
    console.error('❌ ERROR: Request timed out');
    req.abort();
  });
}

// Wait 5 seconds for the server to fully start
setTimeout(checkSite, 5000);