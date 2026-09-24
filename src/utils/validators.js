/**
 * Validation utilities for DSA Sync
 */

/**
 * Validates Common Submission Model object
 * @param {Object} submission 
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateSubmission(submission) {
  const errors = [];

  if (!submission || typeof submission !== 'object') {
    return { valid: false, errors: ['Submission object is missing or invalid'] };
  }

  if (!submission.platform || typeof submission.platform !== 'string') {
    errors.push('Platform name is required');
  }

  if (!submission.title || typeof submission.title !== 'string' || !submission.title.trim()) {
    errors.push('Problem title is required');
  }

  if (!submission.code || typeof submission.code !== 'string' || !submission.code.trim()) {
    errors.push('Submitted code is required');
  }

  if (!submission.language || typeof submission.language !== 'string') {
    errors.push('Programming language is required');
  }

  if (submission.status && submission.status.toLowerCase() !== 'accepted' && submission.status.toLowerCase() !== 'success') {
    errors.push(`Only accepted submissions are synced. Current status: ${submission.status}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates GitHub Personal Access Token format
 * @param {string} token 
 * @returns {{ valid: boolean, message: string }}
 */
export function validateGitHubToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, message: 'GitHub token is required' };
  }

  const trimmed = token.trim();
  if (trimmed.length < 20) {
    return { valid: false, message: 'GitHub token is too short' };
  }

  // Common GitHub PAT patterns: ghp_ (classic), github_pat_ (fine-grained), OAuth tokens
  if (trimmed.startsWith('ghp_') || trimmed.startsWith('github_pat_') || trimmed.startsWith('gho_') || trimmed.length >= 35) {
    return { valid: true, message: 'Token format valid' };
  }

  return { valid: false, message: 'Token does not match expected GitHub PAT format (ghp_... or github_pat_...)' };
}

/**
 * Validates GitHub repository string (owner/repository)
 * @param {string} repo 
 * @returns {{ valid: boolean, message: string, owner?: string, name?: string }}
 */
export function validateRepoPath(repo) {
  if (!repo || typeof repo !== 'string') {
    return { valid: false, message: 'Repository path is required (e.g., owner/repo)' };
  }

  const trimmed = repo.trim().replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '');
  const parts = trimmed.split('/');

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { valid: false, message: 'Repository must be in "owner/repository" format' };
  }

  return {
    valid: true,
    message: 'Repository format valid',
    owner: parts[0].trim(),
    name: parts[1].trim()
  };
}

if (typeof window !== 'undefined') {
  window.DSAValidators = {
    validateSubmission,
    validateGitHubToken,
    validateRepoPath
  };
}
