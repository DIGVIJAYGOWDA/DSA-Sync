/**
 * Core Submission Handler
 * Unified content script engine that orchestrates platform detection, adapter extraction,
 * data normalization, and background synchronization.
 */

import { platformDetector } from './platform-detector.js';
import { submissionNormalizer } from './submission-normalizer.js';

export class SubmissionHandler {
  constructor() {
    this.activeAdapter = null;
    this.isSyncing = false;
    this.lastSyncedHash = '';
  }

  /**
   * Initializes content script handler for current page
   * @param {Array<Object>} registeredAdapters 
   */
  init(registeredAdapters = []) {
    registeredAdapters.forEach(adapter => platformDetector.registerAdapter(adapter));
    
    this.activeAdapter = platformDetector.detectPlatform(window.location.href);

    if (!this.activeAdapter) {
      console.log('[DSA Sync] No platform adapter matched for URL:', window.location.href);
      return;
    }

    if (!this.activeAdapter.isProblemPage(window.location.href)) {
      console.log(`[DSA Sync] ${this.activeAdapter.platformName} adapter active, but not a problem page.`);
      return;
    }

    console.log(`[DSA Sync] Initializing active adapter: ${this.activeAdapter.platformName}`);
    this.setupObservers();
  }

  showToast(message, type = 'info', duration = 4000) {
    let toast = document.getElementById('dsa-sync-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'dsa-sync-toast';
      toast.style.position = 'fixed';
      toast.style.bottom = '24px';
      toast.style.right = '24px';
      toast.style.zIndex = '999999';
      toast.style.padding = '12px 18px';
      toast.style.borderRadius = '8px';
      toast.style.fontSize = '14px';
      toast.style.fontWeight = '600';
      toast.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.3)';
      toast.style.transition = 'all 0.3s ease';
      toast.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      document.body.appendChild(toast);
    }

    const typeColors = {
      success: { bg: '#059669', text: '#FFFFFF' },
      error: { bg: '#DC2626', text: '#FFFFFF' },
      skipped: { bg: '#D97706', text: '#FFFFFF' },
      info: { bg: '#0F172A', text: '#38BDF8' }
    };

    const colors = typeColors[type] || typeColors.info;
    toast.style.backgroundColor = colors.bg;
    toast.style.color = colors.text;

    toast.innerHTML = `<strong>DSA Sync (${this.activeAdapter?.platformName || 'Sync'}):</strong> ${message}`;
    toast.style.display = 'block';
    toast.style.opacity = '1';

    if (duration > 0) {
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { toast.style.display = 'none'; }, 300);
      }, duration);
    }
  }

  requestPageCode() {
    return new Promise((resolve) => {
      const requestId = 'req_' + Math.random().toString(36).substring(2, 9);
      
      const handler = (event) => {
        if (event.source !== window) return;
        if (event.data && event.data.type === 'DSA_SYNC_RESPONSE_PAGE_CODE' && event.data.requestId === requestId) {
          window.removeEventListener('message', handler);
          resolve(event.data.code || '');
        }
      };

      window.addEventListener('message', handler);
      window.postMessage({ type: 'DSA_SYNC_REQUEST_PAGE_CODE', requestId }, '*');

      setTimeout(() => {
        window.removeEventListener('message', handler);
        resolve('');
      }, 500);
    });
  }

  async processSubmission() {
    if (this.isSyncing || !this.activeAdapter) return;
    this.isSyncing = true;

    this.showToast('Accepted submission detected! Extracting solution...', 'info', 0);

    const pageCode = await this.requestPageCode();
    const rawData = this.activeAdapter.extractRawSubmission(pageCode);
    const normalized = submissionNormalizer.normalize(rawData);

    if (!normalized.code || normalized.code.length < 5) {
      this.showToast('Could not extract submitted solution code.', 'error');
      this.isSyncing = false;
      return;
    }

    const codeHash = `${normalized.platform}:${normalized.problemTitle}:${normalized.code}`;
    if (codeHash === this.lastSyncedHash) {
      this.showToast('Solution already synchronized.', 'skipped');
      this.isSyncing = false;
      return;
    }

    this.showToast('Synchronizing solution to GitHub repository...', 'info', 0);

    try {
      chrome.runtime.sendMessage({
        action: 'SUBMIT_SOLUTION',
        data: normalized
      }, (response) => {
        this.isSyncing = false;
        if (chrome.runtime.lastError) {
          this.showToast(`Sync failed: ${chrome.runtime.lastError.message}`, 'error');
          return;
        }

        if (response && response.success) {
          if (response.status === 'skipped') {
            this.showToast(response.message || 'Already synchronized to GitHub', 'skipped');
          } else {
            this.lastSyncedHash = codeHash;
            this.showToast(response.message || 'Successfully synchronized to GitHub!', 'success');
          }
        } else {
          this.showToast(response?.message || 'Failed to sync with GitHub.', 'error');
        }
      });
    } catch (err) {
      this.isSyncing = false;
      this.showToast(`Extension error: ${err.message}`, 'error');
    }
  }

  setupObservers() {
    let timer = null;
    const observer = new MutationObserver(() => {
      if (this.isSyncing) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (this.activeAdapter.isSubmissionAccepted()) {
          console.log(`[DSA Sync] Accepted submission detected on ${this.activeAdapter.platformName}!`);
          this.processSubmission();
        }
      }, 800);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!target) return;
      const text = (target.textContent || target.innerText || '').toLowerCase();
      if (text.includes('submit') || target.closest('button[class*="submit"]') || target.closest('[id*="submit"]')) {
        let pollCount = 0;
        const pollInterval = setInterval(() => {
          pollCount++;
          if (this.activeAdapter.isSubmissionAccepted()) {
            clearInterval(pollInterval);
            this.processSubmission();
          } else if (pollCount > 30) {
            clearInterval(pollInterval);
          }
        }, 500);
      }
    }, true);
  }
}

export const submissionHandler = new SubmissionHandler();
if (typeof window !== 'undefined') {
  window.submissionHandler = submissionHandler;
}
