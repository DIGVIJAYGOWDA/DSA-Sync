import { test } from 'node:test';
import assert from 'node:assert';
import { GFGAdapter } from '../src/content/adapters/gfg-adapter.js';

test('GFGAdapter instantiates with correct platform', () => {
  const adapter = new GFGAdapter();
  assert.strictEqual(adapter.platform, 'geeksforgeeks');
});

test('GFGAdapter extracts submission data into Common Submission Model', () => {
  // Mock window & DOM environment minimal structures
  global.window = {
    location: { href: 'https://www.geeksforgeeks.org/problems/two-sum/1?page=1' }
  };
  global.document = {
    title: 'Two Sum | Practice | GeeksforGeeks',
    querySelector: () => null,
    querySelectorAll: () => []
  };

  const adapter = new GFGAdapter();
  const sampleCode = 'class Solution:\n    def twoSum(self, arr, target):\n        return []';
  const data = adapter.extractSubmissionData(sampleCode);

  assert.strictEqual(data.platform, 'geeksforgeeks');
  assert.strictEqual(data.title, 'Two Sum');
  assert.strictEqual(data.problemUrl, 'https://www.geeksforgeeks.org/problems/two-sum/1');
  assert.strictEqual(data.code, sampleCode);
  assert.strictEqual(data.status, 'accepted');
  assert.ok(data.submittedAt);
});
