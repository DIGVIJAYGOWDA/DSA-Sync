import { test } from 'node:test';
import assert from 'node:assert';
import { TUFAdapter } from '../src/platforms/tuf/tuf-adapter.js';
import { SubmissionNormalizer } from '../src/core/submission-normalizer.js';
import { PlatformDetector } from '../src/core/platform-detector.js';

test('TUFAdapter instantiates with correct platform ID and name', () => {
  const adapter = new TUFAdapter();
  assert.strictEqual(adapter.platformId, 'takeuforward');
  assert.strictEqual(adapter.platformName, 'Take You Forward');
});

test('PlatformDetector registers and detects Take You Forward URLs', () => {
  const detector = new PlatformDetector();
  const tufAdapter = new TUFAdapter();

  detector.registerAdapter(tufAdapter);

  assert.strictEqual(detector.detectPlatform('https://takeuforward.org/data-structure/two-sum-check-if-a-pair-with-given-sum-exists-in-array/').platformId, 'takeuforward');
  assert.strictEqual(detector.detectPlatform('https://takeuforward.org/strivers-a2z-dsa-course-sheet-2-0/').platformId, 'takeuforward');
  assert.strictEqual(detector.detectPlatform('https://www.takeuforward.org/interviews/must-do-questions-for-gfg-leetcode-etc/').platformId, 'takeuforward');
});

test('TUFAdapter extracts raw submission and Normalizer standardizes payload', () => {
  global.window = {
    location: { href: 'https://takeuforward.org/data-structure/two-sum-check-if-a-pair-with-given-sum-exists-in-array/' }
  };
  global.document = {
    title: 'Two Sum : Check if a pair with given sum exists in Array - takeuforward',
    querySelector: () => null,
    querySelectorAll: () => []
  };

  const adapter = new TUFAdapter();
  const normalizer = new SubmissionNormalizer();

  const sampleCode = 'class Solution {\npublic:\n    vector<int> twoSum(int n, vector<int> &arr, int target) {\n        unordered_map<int, int> mpp;\n        return {};\n    }\n};';
  const rawData = adapter.extractRawSubmission(sampleCode);
  const normalized = normalizer.normalize(rawData);

  assert.strictEqual(normalized.platform, 'takeuforward');
  assert.strictEqual(normalized.problemTitle, 'Two Sum : Check if a pair with given sum exists in Array');
  assert.strictEqual(normalized.language, 'C++');
  assert.strictEqual(normalized.code, sampleCode);
  assert.strictEqual(normalized.submissionStatus, 'accepted');
  assert.ok(normalized.timestamp);
});
