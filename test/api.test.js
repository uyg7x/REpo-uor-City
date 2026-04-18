// Basic tests for repo-city API module
import { extractUsername } from '../src/api.js';

// Test cases
const tests = [
  {
    name: 'Valid GitHub URL',
    input: 'https://github.com/uyg7x',
    expected: 'uyg7x'
  },
  {
    name: 'GitHub URL with trailing slash',
    input: 'https://github.com/uyg7x/',
    expected: 'uyg7x'
  },
  {
    name: 'GitHub URL with additional path',
    input: 'https://github.com/uyg7x/repo-city',
    expected: 'uyg7x'
  },
  {
    name: 'Invalid URL',
    input: 'https://gitlab.com/uyg7x',
    expected: null
  },
  {
    name: 'Malformed URL',
    input: 'not-a-url',
    expected: null
  }
];

// Run tests
let passed = 0;
let failed = 0;

console.log('🧪 Running tests...\n');

tests.forEach(test => {
  const result = extractUsername(test.input);
  const success = result === test.expected;
  
  if (success) {
    console.log(`✅ ${test.name}`);
    passed++;
  } else {
    console.log(`❌ ${test.name}`);
    console.log(`   Expected: ${test.expected}`);
    console.log(`   Got: ${result}`);
    failed++;
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('✨ All tests passed!');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed');
  process.exit(1);
}
