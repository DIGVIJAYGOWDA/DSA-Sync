/**
 * GitHub REST API Service Module for DSA Sync
 * Accepts Normalized Submission objects and commits code & README files without platform-specific logic.
 */

import { validateRepoPath } from '../utils/validators.js';
import { generateFilePath, generateReadmePath, generateReadmeContent, formatPlatformName } from '../utils/formatter.js';
import { storage } from '../storage/storage.js';
import logger from '../utils/logger.js';

export class GitHubApi {
  /**
   * Encodes Unicode text safely to Base64
   * @param {string} str 
   * @returns {string} Base64 string
   */
  encodeBase64(str) {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'utf-8').toString('base64');
    }
    return btoa(unescape(encodeURIComponent(str)));
  }

  /**
   * Decodes Base64 to UTF-8 text safely
   * @param {string} b64Str 
   * @returns {string} Decoded text
   */
  decodeBase64(b64Str) {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(b64Str, 'base64').toString('utf-8');
    }
    return decodeURIComponent(escape(atob(b64Str.replace(/\s/g, ''))));
  }

  /**
   * Fetches existing file info from GitHub repository
   * @param {string} token 
   * @param {string} owner 
   * @param {string} repo 
   * @param {string} path 
   * @param {string} branch 
   * @returns {Promise<{ exists: boolean, sha?: string, content?: string, error?: string }>}
   */
  async getFile(token, owner, repo, path, branch = 'main') {
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}?ref=${encodeURIComponent(branch)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'DSA-Sync-Chrome-Extension'
        }
      });

      if (response.status === 404) {
        return { exists: false };
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return { exists: false, error: err.message || `HTTP ${response.status}` };
      }

      const fileData = await response.json();
      let decodedContent = '';
      if (fileData.content && fileData.encoding === 'base64') {
        decodedContent = this.decodeBase64(fileData.content);
      }

      return {
        exists: true,
        sha: fileData.sha,
        content: decodedContent
      };
    } catch (err) {
      return { exists: false, error: err.message };
    }
  }

  /**
   * Creates or updates a file in GitHub repository
   */
  async createOrUpdateFile({ token, owner, repo, path, content, message, branch = 'main', existingSha }) {
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}`;
      const base64Content = this.encodeBase64(content);

      const payload = {
        message,
        content: base64Content,
        branch
      };

      if (existingSha) {
        payload.sha = existingSha;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'DSA-Sync-Chrome-Extension'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errData.message || `GitHub API returned ${response.status}`
        };
      }

      const result = await response.json();
      return {
        success: true,
        commitSha: result.commit ? result.commit.sha : '',
        commitUrl: result.commit ? result.commit.html_url : ''
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Core Sync Method: Accepts Normalized Submission Model and commits solution & README
   * Purely generic algorithm operating strictly on normalized submission fields.
   * @param {Object} submission Normalized Submission Model
   * @param {Object} [overrideSettings]
   * @returns {Promise<{ success: boolean, status: string, message: string, details?: Object }>}
   */
  async syncSubmission(submission, overrideSettings = null) {
    const title = submission.problemTitle || submission.title || 'Untitled';
    logger.info(`Starting synchronization for normalized submission: "${title}" (${submission.platform})`);

    // 1. Basic validation
    if (!submission || !submission.code) {
      const errMsg = 'Missing normalized submission code or payload.';
      logger.error(errMsg);
      return { success: false, status: 'error', message: errMsg };
    }

    // 2. Load settings
    const settings = overrideSettings || (await storage.getSettings());
    if (!settings.githubToken) {
      const errMsg = 'GitHub token is missing. Please configure authentication in the popup settings.';
      logger.error(errMsg);
      return { success: false, status: 'error', message: errMsg };
    }

    const repoValid = validateRepoPath(settings.githubRepo);
    if (!repoValid.valid) {
      const errMsg = `Invalid GitHub repository configured: ${repoValid.message}`;
      logger.error(errMsg);
      return { success: false, status: 'error', message: errMsg };
    }

    const { owner, name: repo } = repoValid;
    const branch = settings.githubBranch || 'main';
    const rootFolder = settings.rootFolder || 'DSA-Solutions';

    // 3. Duplicate Detection Check (Local Storage Hash Check)
    if (settings.ignoreDuplicates) {
      const isLocalDuplicate = await storage.isDuplicate(submission);
      if (isLocalDuplicate) {
        const msg = `Skipped: Solution for "${title}" has already been synchronized recently.`;
        logger.info(msg);
        await storage.updateStats({
          lastSyncTime: new Date().toISOString(),
          lastSyncStatus: 'skipped',
          lastSyncMessage: msg
        });
        return { success: true, status: 'skipped', message: msg };
      }
    }

    // 4. File Paths Generation (Generic for all platforms)
    const filePath = generateFilePath(submission, rootFolder);
    const readmePath = generateReadmePath(submission, rootFolder);

    // 5. Check Remote File Existence & Remote Duplicate Detection
    const existingFile = await this.getFile(settings.githubToken, owner, repo, filePath, branch);
    
    if (existingFile.exists && settings.ignoreDuplicates) {
      if (existingFile.content && existingFile.content.trim() === submission.code.trim()) {
        const msg = `Skipped: Exact solution code for "${title}" already exists on GitHub repo.`;
        logger.info(msg);
        await storage.recordSyncedSubmission(submission);
        await storage.updateStats({
          lastSyncTime: new Date().toISOString(),
          lastSyncStatus: 'skipped',
          lastSyncMessage: msg
        });
        return { success: true, status: 'skipped', message: msg };
      }
    }

    // 6. Commit Code Solution File
    const platformDisplay = formatPlatformName(submission.platform);
    const commitMsg = existingFile.exists
      ? `Update solution for ${title} (${platformDisplay})`
      : `Add solution for ${title} (${platformDisplay})`;

    const codeResult = await this.createOrUpdateFile({
      token: settings.githubToken,
      owner,
      repo,
      path: filePath,
      content: submission.code,
      message: commitMsg,
      branch,
      existingSha: existingFile.sha
    });

    if (!codeResult.success) {
      const errMsg = `Failed to commit solution file: ${codeResult.error}`;
      logger.error(errMsg);
      await storage.updateStats({
        lastSyncTime: new Date().toISOString(),
        lastSyncStatus: 'failed',
        lastSyncMessage: errMsg
      });
      await storage.addHistoryItem({
        title,
        platform: submission.platform,
        status: 'failed',
        message: errMsg
      });
      return { success: false, status: 'error', message: errMsg };
    }

    // 7. Commit README.md if enabled
    let readmeResult = { success: true };
    if (settings.generateReadme !== false) {
      const readmeContent = generateReadmeContent(submission);
      const existingReadme = await this.getFile(settings.githubToken, owner, repo, readmePath, branch);
      const readmeCommitMsg = existingReadme.exists
        ? `Update README for ${title}`
        : `Add README for ${title}`;

      readmeResult = await this.createOrUpdateFile({
        token: settings.githubToken,
        owner,
        repo,
        path: readmePath,
        content: readmeContent,
        message: readmeCommitMsg,
        branch,
        existingSha: existingReadme.sha
      });
    }

    // 8. Record Record & Update Stats
    await storage.recordSyncedSubmission(submission);
    const currentStats = await storage.getStats();
    const newTotal = (currentStats.totalSynced || 0) + 1;
    const successMsg = `Successfully synced "${title}" (${platformDisplay}) to ${owner}/${repo}`;
    
    await storage.updateStats({
      totalSynced: newTotal,
      lastSyncTime: new Date().toISOString(),
      lastSyncStatus: 'success',
      lastSyncMessage: successMsg
    });

    await storage.addHistoryItem({
      title,
      platform: submission.platform,
      language: submission.language,
      difficulty: submission.difficulty,
      filePath,
      status: 'success',
      commitUrl: codeResult.commitUrl,
      message: successMsg
    });

    logger.info(successMsg);

    return {
      success: true,
      status: 'success',
      message: successMsg,
      details: {
        filePath,
        readmePath,
        commitUrl: codeResult.commitUrl
      }
    };
  }
}

export const githubApi = new GitHubApi();
export default githubApi;
