import { test } from 'node:test';
import assert from 'node:assert';
import {
  validateSubmission,
  validateGitHubToken,
  validateRepoPath
} from '../src/utils/validators.js';

test('validateSubmission validates Common Submission Model objects', () => {
  const validSubmission = {
    platform: 'geeksforgeeks',
    title: 'Two Sum',
    problemUrl: 'https://geeksforgeeks.org/problems/two-sum',
    language: 'python3',
    code: 'def twoSum(): pass',
    difficulty: 'Easy',
    status: 'accepted'
  };

  const res = validateSubmission(validSubmission);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.errors.length, 0);

  const invalidSubmission = {
    platform: 'geeksforgeeks',
    title: '', // Missing title
    code: ' '  // Empty code
  };

  const invalidRes = validateSubmission(invalidSubmission);
  assert.strictEqual(invalidRes.valid, false);
  assert.ok(invalidRes.errors.length >= 2);
});

test('validateGitHubToken checks token format', () => {
  assert.strictEqual(validateGitHubToken('ghp_1234567890abcdefghijklmnopqrstuvwxyz').valid, true);
  assert.strictEqual(validateGitHubToken('github_pat_11AAAAAAA_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb').valid, true);
  assert.strictEqual(validateGitHubToken('short_token').valid, false);
  assert.strictEqual(validateGitHubToken('').valid, false);
});

test('validateRepoPath validates owner/repo format', () => {
  const validRes = validateRepoPath('octocat/dsa-solutions');
  assert.strictEqual(validRes.valid, true);
  assert.strictEqual(validRes.owner, 'octocat');
  assert.strictEqual(validRes.name, 'dsa-solutions');

  const urlRes = validateRepoPath('https://github.com/octocat/dsa-solutions.git');
  assert.strictEqual(urlRes.valid, true);
  assert.strictEqual(urlRes.owner, 'octocat');
  assert.strictEqual(urlRes.name, 'dsa-solutions');

  const invalidRes = validateRepoPath('just-a-repo-name');
  assert.strictEqual(invalidRes.valid, false);
});
