/**
 * GitHub Authentication & User API Module for DSA Sync
 */

import { validateGitHubToken, validateRepoPath } from '../utils/validators.js';

export class GitHubAuth {
  /**
   * Tests connection with GitHub using provided Personal Access Token
   * @param {string} token 
   * @returns {Promise<{ success: boolean, user?: Object, error?: string }>}
   */
  async testConnection(token) {
    const validation = validateGitHubToken(token);
    if (!validation.valid) {
      return { success: false, error: validation.message };
    }

    try {
      const response = await fetch('https://api.github.com/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'DSA-Sync-Chrome-Extension'
        }
      });

      if (response.status === 401) {
        return { success: false, error: 'Authentication failed: Token is invalid, expired, or revoked.' };
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return { success: false, error: errData.message || `GitHub API error (Status ${response.status})` };
      }

      const userData = await response.json();
      return {
        success: true,
        user: {
          login: userData.login,
          name: userData.name || userData.login,
          avatarUrl: userData.avatar_url,
          htmlUrl: userData.html_url,
          publicRepos: userData.public_repos
        }
      };
    } catch (err) {
      return {
        success: false,
        error: `Network error connecting to GitHub: ${err.message}`
      };
    }
  }

  /**
   * Fetches repositories accessible to the user
   * @param {string} token 
   * @returns {Promise<{ success: boolean, repos?: Array, error?: string }>}
   */
  async getUserRepos(token) {
    if (!token) {
      return { success: false, error: 'No GitHub token provided' };
    }

    try {
      const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'DSA-Sync-Chrome-Extension'
        }
      });

      if (!response.ok) {
        return { success: false, error: `Failed to fetch repos (Status ${response.status})` };
      }

      const repos = await response.json();
      const formatted = repos.map(repo => ({
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        defaultBranch: repo.default_branch || 'main',
        private: repo.private,
        permissions: repo.permissions
      }));

      return { success: true, repos: formatted };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Verifies if a specific repository is accessible and writable
   * @param {string} token 
   * @param {string} repoPath (owner/repo)
   * @returns {Promise<{ success: boolean, defaultBranch?: string, error?: string }>}
   */
  async verifyRepoAccess(token, repoPath) {
    const validRepo = validateRepoPath(repoPath);
    if (!validRepo.valid) {
      return { success: false, error: validRepo.message };
    }

    const { owner, name } = validRepo;

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'DSA-Sync-Chrome-Extension'
        }
      });

      if (response.status === 404) {
        return { success: false, error: `Repository "${owner}/${name}" not found or token lacks access permission.` };
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return { success: false, error: errData.message || `GitHub API Error (${response.status})` };
      }

      const repoInfo = await response.json();
      
      // Check write permissions if available
      if (repoInfo.permissions && !repoInfo.permissions.push && !repoInfo.permissions.admin) {
        return { success: false, error: `You do not have write (push) permissions for ${owner}/${name}.` };
      }

      return {
        success: true,
        defaultBranch: repoInfo.default_branch || 'main',
        owner: repoInfo.owner.login,
        name: repoInfo.name
      };
    } catch (err) {
      return { success: false, error: `Network error verifying repository: ${err.message}` };
    }
  }
}

export const githubAuth = new GitHubAuth();
export default githubAuth;
