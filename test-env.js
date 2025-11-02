// Test script to check environment variables
// Run this with: node test-env.js

require('dotenv').config({ path: '.env.local' });

console.log('=== Environment Variable Test ===');
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);
console.log('OPENAI_API_KEY starts with sk-proj:', process.env.OPENAI_API_KEY?.startsWith('sk-proj-') || false);

if (!process.env.OPENAI_API_KEY) {
  console.log('\n❌ OPENAI_API_KEY is missing!');
  console.log('Please create a .env.local file with:');
  console.log('OPENAI_API_KEY=your_actual_api_key_here');
} else {
  console.log('\n✅ OPENAI_API_KEY is configured!');
}
