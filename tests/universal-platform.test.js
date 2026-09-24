import { test } from 'node:test';
import assert from 'node:assert';
import { BaseAdapter } from '../src/platforms/base-adapter.js';
import { PlatformDetector } from '../src/core/platform-detector.js';
import { SubmissionNormalizer } from '../src/core/submission-normalizer.js';
import { GFGAdapter } from '../src/platforms/gfg/gfg-adapter.js';
import { LeetCodeAdapter } from '../src/platforms/leetcode/leetcode-adapter.js';
import { CodeChefAdapter } from '../src/platforms/codechef/codechef-adapter.js';
import { CodeforcesAdapter } from '../src/platforms/codeforces/codeforces-adapter.js';
import { HackerRankAdapter } from '../src/platforms/hackerrank/hackerrank-adapter.js';

test('PlatformDetector registers and detects adapters by URL', () => {
  const detector = new PlatformDetector();
  const gfg = new GFGAdapter();
  const leetcode = new LeetCodeAdapter();
  const codechef = new CodeChefAdapter();
  const codeforces = new CodeforcesAdapter();
  const hackerrank = new HackerRankAdapter();

  detector.registerAdapter(gfg);
  detector.registerAdapter(leetcode);
  detector.registerAdapter(codechef);
  detector.registerAdapter(codeforces);
  detector.registerAdapter(hackerrank);

  assert.strictEqual(detector.detectPlatform('https://www.geeksforgeeks.org/problems/two-sum/1').platformId, 'geeksforgeeks');
  assert.strictEqual(detector.detectPlatform('https://leetcode.com/problems/two-sum/').platformId, 'leetcode');
  assert.strictEqual(detector.detectPlatform('https://www.codechef.com/problems/FLOW001').platformId, 'codechef');
  assert.strictEqual(detector.detectPlatform('https://codeforces.com/problemset/problem/1/A').platformId, 'codeforces');
  assert.strictEqual(detector.detectPlatform('https://www.hackerrank.com/challenges/solve-me-first/problem').platformId, 'hackerrank');
  assert.strictEqual(detector.detectPlatform('https://google.com'), null);
});

test('SubmissionNormalizer standardizes extraction payload into normalized schema', () => {
  const normalizer = new SubmissionNormalizer();

  const rawPayload = {
    platform: 'leetcode',
    title: '1. Two Sum',
    problemUrl: 'https://leetcode.com/problems/two-sum/description/',
    language: 'python3',
    code: 'class Solution:\n    def twoSum(self, nums, target):\n        mp = {}\n        for i, n in enumerate(nums):\n            if target - n in mp: return [mp[target-n], i]\n            mp[n] = i',
    difficulty: 'Easy',
    tags: ['Arrays', 'Hash Table'],
    status: 'accepted'
  };

  const normalized = normalizer.normalize(rawPayload);

  assert.strictEqual(normalized.platform, 'leetcode');
  assert.strictEqual(normalized.problemTitle, '1. Two Sum');
  assert.strictEqual(normalized.problemSlug, '1-two-sum');
  assert.strictEqual(normalized.problemUrl, 'https://leetcode.com/problems/two-sum/description/');
  assert.strictEqual(normalized.language, 'Python3');
  assert.strictEqual(normalized.difficulty, 'Easy');
  assert.strictEqual(normalized.submissionStatus, 'accepted');
  assert.ok(normalized.metadata.complexityTime);
  assert.ok(normalized.timestamp);
});
