/**
 * Background Service Worker for DSA Sync Chrome Extension (Manifest V3)
 * Coordinates communication between content scripts, storage, popup UI, and GitHub API modules.
 */

import { githubApi } from '../github/github-api.js';
import { githubAuth } from '../github/github-auth.js';
import { storage } from '../storage/storage.js';
import logger from '../utils/logger.js';

logger.info('DSA Sync Background Service Worker initializing...');

// 1. Extension Installation / Update Handler
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    logger.info('DSA Sync Extension installed for the first time.');
    // Set default storage settings
    await storage.saveSettings({});
    await storage.updateStats({
      totalSynced: 0,
      lastSyncTime: null,
      lastSyncStatus: 'idle',
      lastSyncMessage: 'Extension installed. Please configure your GitHub token.'
    });
  } else if (details.reason === 'update') {
    logger.info(`DSA Sync Extension updated to version ${chrome.runtime.getManifest().version}`);
  }
});

// 2. Notification Helper
function triggerDesktopNotification(title, message, isError = false) {
  if (chrome.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title: `DSA Sync - ${title}`,
      message: message,
      priority: isError ? 2 : 1
    });
  }
}

// 3. Centralized Message Router Listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  logger.info(`Received background message action: ${request.action}`);

  // Handle asynchronous actions cleanly in MV3
  (async () => {
    try {
      switch (request.action) {
        case 'SUBMIT_SOLUTION': {
          logger.info(`Processing submission for problem: "${request.data?.title}"`);
          const result = await githubApi.syncSubmission(request.data);

          if (result.success) {
            if (result.status !== 'skipped') {
              triggerDesktopNotification('Solution Synced', `Successfully committed "${request.data?.title}" to GitHub.`);
            }
          } else {
            triggerDesktopNotification('Sync Failed', result.message || 'Error syncing solution to GitHub.', true);
          }

          sendResponse(result);
          break;
        }

        case 'TEST_GITHUB_CONNECTION': {
          const result = await githubAuth.testConnection(request.token);
          sendResponse(result);
          break;
        }

        case 'GET_USER_REPOS': {
          const result = await githubAuth.getUserRepos(request.token);
          sendResponse(result);
          break;
        }

        case 'VERIFY_REPO': {
          const result = await githubAuth.verifyRepoAccess(request.token, request.repo);
          sendResponse(result);
          break;
        }

        case 'GET_STATUS': {
          const settings = await storage.getSettings();
          const stats = await storage.getStats();
          const history = await storage.getHistory();
          
          let authStatus = { connected: false };
          if (settings.githubToken) {
            const authCheck = await githubAuth.testConnection(settings.githubToken);
            if (authCheck.success) {
              authStatus = { connected: true, user: authCheck.user };
            }
          }

          sendResponse({
            success: true,
            settings: {
              ...settings,
              githubToken: settings.githubToken ? '••••••••' + settings.githubToken.slice(-4) : ''
            },
            hasToken: Boolean(settings.githubToken),
            stats,
            history,
            authStatus
          });
          break;
        }

        case 'SAVE_SETTINGS': {
          const updated = await storage.saveSettings(request.settings);
          sendResponse({ success: true, settings: updated });
          break;
        }

        case 'CLEAR_HISTORY': {
          await storage.updateStats({ totalSynced: 0, lastSyncStatus: 'idle', lastSyncMessage: 'History cleared.' });
          if (chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ dsa_sync_history: [], dsa_sync_hashes: [] });
          }
          sendResponse({ success: true });
          break;
        }

        default:
          sendResponse({ success: false, error: `Unknown action: ${request.action}` });
          break;
      }
    } catch (error) {
      logger.error(`Error handling message action ${request.action}:`, error);
      sendResponse({ success: false, error: error.message });
    }
  })();

  return true; // Keep message channel open for async response
});
