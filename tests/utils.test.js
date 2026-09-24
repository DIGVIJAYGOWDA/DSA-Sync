import { test } from 'node:test';
import assert from 'node:assert';
import {
  getFileExtension,
  normalizeLanguageName,
  formatPlatformName,
  sanitizeFileName,
  formatCategoryPath,
  estimateComplexity,
  generateFilePath,
  generateReadmePath,
  generateReadmeContent
} from '../src/utils/formatter.js';

test('getFileExtension maps language names to correct file extensions', () => {
  assert.strictEqual(getFileExtension('C++'), '.cpp');
  assert.strictEqual(getFileExtension('cpp'), '.cpp');
  assert.strictEqual(getFileExtension('Python 3'), '.py');
  assert.strictEqual(getFileExtension('java'), '.java');
  assert.strictEqual(getFileExtension('javascript'), '.js');
  assert.strictEqual(getFileExtension('golang'), '.go');
  assert.strictEqual(getFileExtension('rust'), '.rs');
  assert.strictEqual(getFileExtension('unknown_lang'), '.txt');
});

test('normalizeLanguageName cleans language titles', () => {
  assert.strictEqual(normalizeLanguageName('cpp'), 'C++');
  assert.strictEqual(normalizeLanguageName('python3'), 'Python3');
  assert.strictEqual(normalizeLanguageName('java'), 'Java');
  assert.strictEqual(normalizeLanguageName('js'), 'JavaScript');
});

test('formatPlatformName normalizes all supported platform names', () => {
  assert.strictEqual(formatPlatformName('geeksforgeeks'), 'GeeksforGeeks');
  assert.strictEqual(formatPlatformName('leetcode'), 'LeetCode');
  assert.strictEqual(formatPlatformName('codechef'), 'CodeChef');
  assert.strictEqual(formatPlatformName('codeforces'), 'Codeforces');
});

test('sanitizeFileName removes illegal chars and formats spaces', () => {
  assert.strictEqual(sanitizeFileName('Two Sum / Problem #1: Special?'), 'Two-Sum-Problem-1-Special');
  assert.strictEqual(sanitizeFileName('  Arrays & Strings  '), 'Arrays-&-Strings');
});

test('estimateComplexity calculates time and space complexity heuristics', () => {
  const nestedLoopCode = 'for(int i=0; i<n; i++) { for(int j=0; j<n; j++) { vector<vector<int>> matrix; } }';
  const res = estimateComplexity(nestedLoopCode);
  assert.strictEqual(res.time, 'O(N²)');
  assert.strictEqual(res.space, 'O(N²)');

  const linearCode = 'for(int i=0; i<n; i++) { unordered_map<int,int> mp; }';
  const linearRes = estimateComplexity(linearCode);
  assert.strictEqual(linearRes.time, 'O(N)');
  assert.strictEqual(linearRes.space, 'O(N)');
});

test('generateFilePath generates clean directory hierarchy', () => {
  const submission = {
    platform: 'leetcode',
    title: 'Two Sum',
    language: 'python3',
    tags: ['Arrays']
  };

  const filePath = generateFilePath(submission, 'DSA-Solutions');
  assert.strictEqual(filePath, 'DSA-Solutions/LeetCode/Arrays/Two-Sum/solution.py');
});

test('generateReadmeContent creates rich markdown with complexity badges', () => {
  const submission = {
    platform: 'leetcode',
    title: 'Two Sum',
    problemUrl: 'https://leetcode.com/problems/two-sum/',
    language: 'python3',
    difficulty: 'Easy',
    status: 'accepted',
    code: 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        mp = {}\n        for i, num in enumerate(nums):\n            if target - num in mp:\n                return [mp[target - num], i]\n            mp[num] = i\n        return []',
    tags: ['Arrays', 'Hash Table']
  };

  const readme = generateReadmeContent(submission);
  assert.ok(readme.includes('# Two Sum'));
  assert.ok(readme.includes('LeetCode'));
  assert.ok(readme.includes('`O(N)`'));
  assert.ok(readme.includes('Difficulty-Easy'));
});
