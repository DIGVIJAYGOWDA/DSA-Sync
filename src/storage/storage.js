/**
 * Storage module for DSA Sync Chrome Extension
 * Handles persistent state, settings, stats, and duplicate tracking using chrome.storage APIs.
 */

const DEFAULT_SETTINGS = {
  githubToken: '',
  githubRepo: '',
  githubBranch: 'main',
  rootFolder: 'DSA-Solutions',
  generateReadme: true,
  ignoreDuplicates: true,
  enabledPlatforms: {
    geeksforgeeks: true,
    leetcode: false,
    codechef: false,
    codeforces: false
  }
};

const DEFAULT_STATS = {
  totalSynced: 0,
  lastSyncTime: null,
  lastSyncStatus: 'idle', // 'idle' | 'success' | 'failed' | 'skipped'
  lastSyncMessage: 'No solutions synced yet.'
};

class StorageManager {
  /**
   * Retrieves user settings with default fallbacks
   * @returns {Promise<typeof DEFAULT_SETTINGS>}
   */
  async getSettings() {
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        resolve({ ...DEFAULT_SETTINGS });
        return;
      }
      chrome.storage.local.get(['dsa_sync_settings'], (result) => {
        const stored = result.dsa_sync_settings || {};
        resolve({
          ...DEFAULT_SETTINGS,
          ...stored,
          enabledPlatforms: {
            ...DEFAULT_SETTINGS.enabledPlatforms,
            ...(stored.enabledPlatforms || {})
          }
        });
      });
    });
  }

  /**
   * Saves updated settings
   * @param {Partial<typeof DEFAULT_SETTINGS>} newSettings 
   * @returns {Promise<typeof DEFAULT_SETTINGS>}
   */
  async saveSettings(newSettings) {
    const current = await this.getSettings();
    const updated = {
      ...current,
      ...newSettings,
      enabledPlatforms: {
        ...current.enabledPlatforms,
        ...(newSettings.enabledPlatforms || {})
      }
    };

    return new Promise((resolve, reject) => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        resolve(updated);
        return;
      }
      chrome.storage.local.set({ dsa_sync_settings: updated }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(updated);
        }
      });
    });
  }

  /**
   * Retrieves current sync stats
   * @returns {Promise<typeof DEFAULT_STATS>}
   */
  async getStats() {
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        resolve({ ...DEFAULT_STATS });
        return;
      }
      chrome.storage.local.get(['dsa_sync_stats'], (result) => {
        resolve({
          ...DEFAULT_STATS,
          ...(result.dsa_sync_stats || {})
        });
      });
    });
  }

  /**
   * Updates sync statistics
   * @param {Object} update 
   */
  async updateStats(update) {
    const current = await this.getStats();
    const updated = {
      ...current,
      ...update,
      totalSynced: (update.totalSynced !== undefined) ? update.totalSynced : current.totalSynced
    };

    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        resolve(updated);
        return;
      }
      chrome.storage.local.set({ dsa_sync_stats: updated }, () => {
        resolve(updated);
      });
    });
  }

  /**
   * Generates unique hash for duplicate detection
   * @param {Object} submission 
   * @returns {string}
   */
  generateSubmissionHash(submission) {
    const platform = (submission.platform || '').toLowerCase().trim();
    const title = (submission.title || '').toLowerCase().trim();
    const lang = (submission.language || '').toLowerCase().trim();
    const code = (submission.code || '').trim();
    
    // Simple hash calculation
    let codeHash = 0;
    for (let i = 0; i < code.length; i++) {
      codeHash = (codeHash << 5) - codeHash + code.charCodeAt(i);
      codeHash |= 0;
    }
    return `${platform}:${title}:${lang}:${codeHash}`;
  }

  /**
   * Checks if submission has already been synced
   * @param {Object} submission 
   * @returns {Promise<boolean>}
   */
  async isDuplicate(submission) {
    const hash = this.generateSubmissionHash(submission);
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        resolve(false);
        return;
      }
      chrome.storage.local.get(['dsa_sync_hashes'], (result) => {
        const hashes = result.dsa_sync_hashes || [];
        resolve(hashes.includes(hash));
      });
    });
  }

  /**
   * Records a submission hash into storage
   * @param {Object} submission 
   */
  async recordSyncedSubmission(submission) {
    const hash = this.generateSubmissionHash(submission);
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        resolve();
        return;
      }
      chrome.storage.local.get(['dsa_sync_hashes'], async (result) => {
        const hashes = result.dsa_sync_hashes || [];
        if (!hashes.includes(hash)) {
          hashes.push(hash);
          // Keep maximum 500 recent submission hashes to avoid bloat
          if (hashes.length > 500) hashes.shift();
          chrome.storage.local.set({ dsa_sync_hashes: hashes }, () => resolve());
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Adds entry to recent activity history
   * @param {Object} activityItem 
   */
  async addHistoryItem(activityItem) {
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        resolve();
        return;
      }
      chrome.storage.local.get(['dsa_sync_history'], (result) => {
        const history = result.dsa_sync_history || [];
        history.unshift({
          ...activityItem,
          timestamp: new Date().toISOString()
        });
        // Limit history to 50 items
        if (history.length > 50) history.pop();
        chrome.storage.local.set({ dsa_sync_history: history }, () => resolve(history));
      });
    });
  }

  /**
   * Retrieves recent activity history
   * @returns {Promise<Array>}
   */
  async getHistory() {
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        resolve([]);
        return;
      }
      chrome.storage.local.get(['dsa_sync_history'], (result) => {
        resolve(result.dsa_sync_history || []);
      });
    });
  }
}

export const storage = new StorageManager();
export default storage;
