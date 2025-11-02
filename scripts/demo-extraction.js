#!/usr/bin/env node

/**
 * Demo script for the Enhanced Image Extraction System
 * This script demonstrates the multi-layered approach for extracting product images
 */

const BASE_URL = 'http://localhost:3000';

// Sample product URLs for testing
const TEST_URLS = [
  {
    name: 'ASOS Example',
    url: 'https://www.asos.com/products/example',
    retailer: 'ASOS'
  },
  {
    name: 'Zara Example', 
    url: 'https://www.zara.com/products/example',
    retailer: 'Zara'
  },
  {
    name: 'H&M Example',
    url: 'https://www.hm.com/product/example',
    retailer: 'H&M'
  },
  {
    name: 'Next Example',
    url: 'https://www.next.co.uk/products/example',
    retailer: 'Next'
  }
];

/**
 * Test the image extraction API
 */
async function testImageExtraction(url, retailer) {
  try {
    console.log(`\n🔍 Testing: ${url}`);
    console.log(`🏪 Retailer: ${retailer || 'Auto-detected'}`);
    
    const response = await fetch(`${BASE_URL}/api/extract-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, retailer })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log(`✅ Success!`);
    console.log(`📸 Images found: ${result.totalImages}`);
    console.log(`🔗 Source: ${result.extractionSource}`);
    
    if (result.title) {
      console.log(`📝 Title: ${result.title}`);
    }
    
    if (result.description) {
      console.log(`📄 Description: ${result.description.substring(0, 100)}...`);
    }
    
    console.log(`🕒 Timestamp: ${new Date(result.timestamp).toLocaleString()}`);
    
    return result;
    
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    return null;
  }
}

/**
 * Test the API information endpoint
 */
async function testAPIInfo() {
  try {
    console.log('📋 Testing API Information...');
    
    const response = await fetch(`${BASE_URL}/api/extract-images`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const info = await response.json();
    console.log(`✅ API Info retrieved successfully`);
    console.log(`📊 Version: ${info.version}`);
    console.log(`🏪 Supported Retailers: ${info.supportedRetailers.join(', ')}`);
    console.log(`🔧 Features: ${info.features.length} features available`);
    
    return info;
    
  } catch (error) {
    console.error(`❌ API Info failed: ${error.message}`);
    return null;
  }
}

/**
 * Run performance test
 */
async function runPerformanceTest() {
  console.log('\n🚀 Running Performance Test...');
  
  const startTime = Date.now();
  const results = [];
  
  for (const testCase of TEST_URLS) {
    const start = Date.now();
    const result = await testImageExtraction(testCase.url, testCase.retailer);
    const duration = Date.now() - start;
    
    if (result) {
      results.push({
        name: testCase.name,
        duration,
        success: true,
        images: result.totalImages,
        source: result.extractionSource
      });
    } else {
      results.push({
        name: testCase.name,
        duration,
        success: false,
        images: 0,
        source: 'failed'
      });
    }
  }
  
  const totalTime = Date.now() - startTime;
  const successCount = results.filter(r => r.success).length;
  const totalImages = results.reduce((sum, r) => sum + r.images, 0);
  
  console.log('\n📊 Performance Results:');
  console.log(`⏱️  Total time: ${totalTime}ms`);
  console.log(`✅ Success rate: ${successCount}/${results.length} (${Math.round(successCount/results.length*100)}%)`);
  console.log(`📸 Total images extracted: ${totalImages}`);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const source = result.success ? result.source : 'failed';
    console.log(`${status} ${result.name}: ${result.duration}ms (${source})`);
  });
}

/**
 * Main demo function
 */
async function runDemo() {
  console.log('🚀 Enhanced Image Extraction System Demo');
  console.log('=' .repeat(50));
  
  try {
    // Test API info first
    await testAPIInfo();
    
    // Test individual extractions
    console.log('\n🧪 Testing Individual Extractions...');
    for (const testCase of TEST_URLS) {
      await testImageExtraction(testCase.url, testCase.retailer);
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Run performance test
    await runPerformanceTest();
    
    console.log('\n🎉 Demo completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Visit http://localhost:3000/test-extraction to test manually');
    console.log('   2. Check the browser console for detailed extraction logs');
    console.log('   3. Review ENHANCED_IMAGE_EXTRACTION.md for full documentation');
    
  } catch (error) {
    console.error('\n💥 Demo failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure the app is running on http://localhost:3000');
    console.log('   2. Check that all dependencies are installed');
    console.log('   3. Verify the API endpoints are accessible');
  }
}

// Run the demo if this script is executed directly
if (require.main === module) {
  runDemo().catch(console.error);
}

module.exports = { runDemo, testImageExtraction, testAPIInfo };

