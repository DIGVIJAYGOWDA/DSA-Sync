/**
 * Universal Content Script for DSA Sync
 * Works with any platform adapter (GFG, LeetCode, CodeChef, Codeforces, HackerRank, Take You Forward)
 */

(function () {
  // Dynamically resolve whichever platform adapter is loaded on the page
  const AdapterClass =
    (typeof TUFAdapter !== 'undefined' ? TUFAdapter : null) ||
    (typeof LeetCodeAdapter !== 'undefined' ? LeetCodeAdapter : null) ||
    (typeof CodeChefAdapter !== 'undefined' ? CodeChefAdapter : null) ||
    (typeof CodeforcesAdapter !== 'undefined' ? CodeforcesAdapter : null) ||
    (typeof HackerRankAdapter !== 'undefined' ? HackerRankAdapter : null) ||
    (typeof GFGAdapter !== 'undefined' ? GFGAdapter : null) ||
    window.TUFAdapter ||
    window.LeetCodeAdapter ||
    window.CodeChefAdapter ||
    window.CodeforcesAdapter ||
    window.HackerRankAdapter ||
    window.GFGAdapter;

  if (!AdapterClass) {
    console.log('[DSA Sync] No platform adapter found on current page.');
    return;
  }

  const adapter = new AdapterClass();

  if (!adapter.isProblemPage(window.location.href)) {
    return;
  }

  const platformName = adapter.platformName || adapter.platformId || 'Platform';
  console.log(`[DSA Sync] Active on ${platformName} problem page.`);

  let isSyncing = false;
  let lastSyncedCodeHash = '';

  // 1. Inject main-world page script to access Monaco/Ace editor objects
  function injectPageScript() {
    try {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('src/content/inject/gfg-page-script.js');
      script.onload = () => script.remove();
      (document.head || document.documentElement).appendChild(script);
    } catch (e) {
      console.warn('[DSA Sync] Page script injection note:', e);
    }
  }

  injectPageScript();

  // 2. Toast UI Notification Helper
  function showToast(message, type = 'info', duration = 4000) {
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

    if (type === 'success') {
      toast.style.backgroundColor = '#059669';
      toast.style.color = '#FFFFFF';
    } else if (type === 'error') {
      toast.style.backgroundColor = '#DC2626';
      toast.style.color = '#FFFFFF';
    } else if (type === 'skipped') {
      toast.style.backgroundColor = '#D97706';
      toast.style.color = '#FFFFFF';
    } else {
      toast.style.backgroundColor = '#0F172A';
      toast.style.color = '#38BDF8';
    }

    toast.innerHTML = `<strong>DSA Sync (${platformName}):</strong> ${message}`;
    toast.style.display = 'block';
    toast.style.opacity = '1';

    if (duration > 0) {
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { toast.style.display = 'none'; }, 300);
      }, duration);
    }
  }

  // 3. Main-world page code requester
  function requestPageCode() {
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

  // 4. Trigger Submission Sync
  async function processSubmission() {
    if (isSyncing) return;
    isSyncing = true;

    showToast('Accepted submission detected! Extracting solution code...', 'info', 0);

    const pageCode = await requestPageCode();
    let submissionData = null;

    if (typeof adapter.extractRawSubmission === 'function') {
      submissionData = adapter.extractRawSubmission(pageCode);
    } else if (typeof adapter.extractSubmissionData === 'function') {
      submissionData = adapter.extractSubmissionData(pageCode);
    }

    if (!submissionData || !submissionData.code || submissionData.code.length < 5) {
      showToast('Could not extract submitted code. Please make sure code is visible or marked.', 'error');
      isSyncing = false;
      return;
    }

    const currentCodeHash = `${submissionData.platform}:${submissionData.title}:${submissionData.code}`;
    if (currentCodeHash === lastSyncedCodeHash) {
      showToast('Solution already synchronized.', 'skipped');
      isSyncing = false;
      return;
    }

    showToast('Synchronizing solution to GitHub repository...', 'info', 0);

    try {
      chrome.runtime.sendMessage({
        action: 'SUBMIT_SOLUTION',
        data: submissionData
      }, (response) => {
        isSyncing = false;
        if (chrome.runtime.lastError) {
          showToast(`Sync failed: ${chrome.runtime.lastError.message}`, 'error');
          return;
        }

        if (response && response.success) {
          if (response.status === 'skipped') {
            showToast(response.message || 'Already synchronized to GitHub', 'skipped');
          } else {
            lastSyncedCodeHash = currentCodeHash;
            showToast(response.message || 'Successfully synchronized to GitHub!', 'success');
          }
        } else {
          showToast(response?.message || 'Failed to sync with GitHub.', 'error');
        }
      });
    } catch (err) {
      isSyncing = false;
      showToast(`Extension error: ${err.message}`, 'error');
    }
  }

  // 5. DOM Mutation Observer
  function setupMutationObserver() {
    let checkTimer = null;

    const observer = new MutationObserver(() => {
      if (isSyncing) return;

      if (checkTimer) clearTimeout(checkTimer);

      checkTimer = setTimeout(() => {
        if (adapter.isSubmissionAccepted()) {
          console.log(`[DSA Sync] Detected accepted submission on ${platformName}!`);
          processSubmission();
        }
      }, 800);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  // 6. Click Listeners for Submit / Complete Buttons
  function setupClickListener() {
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!target) return;

      const text = (target.textContent || target.innerText || '').toLowerCase();
      const isActionBtn = (
        text.includes('submit') ||
        text.includes('completed') ||
        text.includes('mark as') ||
        text.includes('solved') ||
        target.closest('button[class*="submit"]') ||
        target.closest('button[class*="completed"]') ||
        target.closest('input[type="checkbox"]') ||
        target.closest('[id*="submit"]')
      );

      if (isActionBtn) {
        console.log(`[DSA Sync] Action button/checkbox clicked on ${platformName}. Watching for result...`);
        let pollCount = 0;
        const pollInterval = setInterval(() => {
          pollCount++;
          if (adapter.isSubmissionAccepted()) {
            clearInterval(pollInterval);
            processSubmission();
          } else if (pollCount > 30) {
            clearInterval(pollInterval);
          }
        }, 500);
      }
    }, true);
  }

  setupMutationObserver();
  setupClickListener();

  console.log(`[DSA Sync] Observer active on ${platformName}!`);
})();
