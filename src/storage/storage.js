/**
 * Storage module for DSA Sync Chrome Extension
 * Handles persistent state, settings, stats, daily streak activity, and duplicate tracking using chrome.storage APIs.
 */

const DEFAULT_SETTINGS = {
  githubToken: '',
  githubRepo: '',
  tufRepo: '', // Dedicated separate repository for Take You Forward / Strivers solutions
  githubBranch: 'main',
  rootFolder: 'DSA-Solutions',
  generateReadme: true,
  ignoreDuplicates: true,
  enabledPlatforms: {
    geeksforgeeks: true,
    leetcode: true,
    codechef: true,
    codeforces: true,
    hackerrank: true,
    takeuforward: true
  }
};

const DEFAULT_STATS = {
  totalSynced: 0,
  currentStreak: 0,
  platformStats: {
    geeksforgeeks: 0,
    leetcode: 0,
    codechef: 0,
    codeforces: 0,
    hackerrank: 0,
    takeuforward: 0
  },
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
   * Calculates current consecutive days streak from daily activity map
   * @param {Object} dailyActivity Map of 'YYYY-MM-DD' => count
   * @returns {number}
   */
  calculateStreak(dailyActivity = {}) {
    const dates = Object.keys(dailyActivity).sort();
    if (dates.length === 0) return 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (!dailyActivity[todayStr] && !dailyActivity[yesterdayStr]) {
      return 0;
    }

    let streak = 0;
    let checkDate = dailyActivity[todayStr] ? new Date() : new Date(Date.now() - 86400000);

    while (true) {
      const dateKey = checkDate.toISOString().split('T')[0];
      if (dailyActivity[dateKey] && dailyActivity[dateKey] > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
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
      chrome.storage.local.get(['dsa_sync_stats', 'dsa_sync_daily_activity'], (result) => {
        const stats = result.dsa_sync_stats || {};
        const dailyActivity = result.dsa_sync_daily_activity || {};
        const calculatedStreak = this.calculateStreak(dailyActivity);

        resolve({
          ...DEFAULT_STATS,
          ...stats,
          currentStreak: calculatedStreak,
          platformStats: {
            ...DEFAULT_STATS.platformStats,
            ...(stats.platformStats || {})
          }
        });
      });
    });
  }

  /**
   * Updates sync statistics and platform counts
   * @param {Object} update 
   */
  async updateStats(update) {
    const current = await this.getStats();
    const updated = {
      ...current,
      ...update,
      totalSynced: (update.totalSynced !== undefined) ? update.totalSynced : current.totalSynced,
      platformStats: {
        ...current.platformStats,
        ...(update.platformStats || {})
      }
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
   * Format: `platform:title:language:codeHash`
   * @param {Object} submission 
   * @returns {string}
   */
  generateSubmissionHash(submission) {
    const platform = (submission.platform || '').toLowerCase().trim();
    const title = (submission.problemTitle || submission.title || '').toLowerCase().trim();
    const lang = (submission.language || '').toLowerCase().trim();
    const code = (submission.code || '').trim();
    
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
   * Records a submission hash into storage, updates streak daily activity, and increments platform count
   * @param {Object} submission 
   */
  async recordSyncedSubmission(submission) {
    const hash = this.generateSubmissionHash(submission);
    const platformKey = (submission.platform || 'geeksforgeeks').toLowerCase().trim();
    const todayStr = new Date().toISOString().split('T')[0];

    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        resolve();
        return;
      }
      chrome.storage.local.get(['dsa_sync_hashes', 'dsa_sync_daily_activity', 'dsa_sync_stats'], async (result) => {
        const hashes = result.dsa_sync_hashes || [];
        const dailyActivity = result.dsa_sync_daily_activity || {};
        const stats = result.dsa_sync_stats || {};
        const platformStats = { ...DEFAULT_STATS.platformStats, ...(stats.platformStats || {}) };

        dailyActivity[todayStr] = (dailyActivity[todayStr] || 0) + 1;

        if (!hashes.includes(hash)) {
          hashes.push(hash);
          if (hashes.length > 500) hashes.shift();
          
          if (platformStats[platformKey] !== undefined) {
            platformStats[platformKey] += 1;
          } else {
            platformStats[platformKey] = 1;
          }
        }

        const newStreak = this.calculateStreak(dailyActivity);

        chrome.storage.local.set({
          dsa_sync_hashes: hashes,
          dsa_sync_daily_activity: dailyActivity,
          dsa_sync_stats: {
            ...DEFAULT_STATS,
            ...stats,
            currentStreak: newStreak,
            platformStats
          }
        }, () => resolve());
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
