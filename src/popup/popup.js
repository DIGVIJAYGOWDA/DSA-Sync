/**
 * Popup Script for DSA Sync Chrome Extension
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const alertBanner = document.getElementById('alert-banner');
  const statusPill = document.getElementById('status-pill');
  const statusText = document.getElementById('status-text');

  // Dashboard Stats
  const statTotalSynced = document.getElementById('stat-total-synced');
  const lastSyncMessage = document.getElementById('last-sync-message');
  const lastSyncTime = document.getElementById('last-sync-time');
  const historyList = document.getElementById('history-list');
  const btnSyncNow = document.getElementById('btn-sync-now');
  const btnClearHistory = document.getElementById('btn-clear-history');

  // GitHub Auth Elements
  const inputPatToken = document.getElementById('input-pat-token');
  const btnToggleToken = document.getElementById('btn-toggle-token');
  const btnTestToken = document.getElementById('btn-test-token');
  const inputRepoName = document.getElementById('input-repo-name');
  const inputRepoBranch = document.getElementById('input-repo-branch');
  const btnSaveGithub = document.getElementById('btn-save-github');

  // Platform Elements
  const toggleGfg = document.getElementById('toggle-gfg');

  // Settings Elements
  const inputRootFolder = document.getElementById('input-root-folder');
  const checkboxGenerateReadme = document.getElementById('checkbox-generate-readme');
  const checkboxIgnoreDuplicates = document.getElementById('checkbox-ignore-duplicates');
  const btnSaveSettings = document.getElementById('btn-save-settings');

  let realToken = '';

  // 1. Tab Switching Handler
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });

  // 2. Alert Banner Helper
  function showAlert(message, type = 'info', timeout = 4000) {
    alertBanner.className = `alert-banner ${type}`;
    alertBanner.textContent = message;
    alertBanner.classList.remove('hidden');

    if (timeout > 0) {
      setTimeout(() => {
        alertBanner.classList.add('hidden');
      }, timeout);
    }
  }

  // 3. Load Extension State from Background
  function loadStatus() {
    chrome.runtime.sendMessage({ action: 'GET_STATUS' }, (response) => {
      if (chrome.runtime.lastError || !response || !response.success) {
        statusPill.className = 'status-pill status-disconnected';
        statusText.textContent = 'Disconnected';
        showAlert('Could not load extension status', 'error');
        return;
      }

      const { settings, stats, history, authStatus, hasToken } = response;

      // Update Connection Pill
      if (authStatus && authStatus.connected) {
        statusPill.className = 'status-pill status-connected';
        statusText.textContent = `@${authStatus.user.login}`;
      } else {
        statusPill.className = 'status-pill status-disconnected';
        statusText.textContent = hasToken ? 'Invalid Token' : 'Disconnected';
      }

      // Update Dashboard Stats
      statTotalSynced.textContent = stats.totalSynced || 0;
      lastSyncMessage.textContent = stats.lastSyncMessage || 'No solutions synced yet.';
      lastSyncTime.textContent = stats.lastSyncTime ? new Date(stats.lastSyncTime).toLocaleString() : '--';

      // Update History List
      renderHistory(history);

      // Populate Form Fields
      if (settings) {
        if (!realToken && settings.githubToken) {
          inputPatToken.value = settings.githubToken;
        }
        inputRepoName.value = settings.githubRepo || '';
        inputRepoBranch.value = settings.githubBranch || 'main';
        inputRootFolder.value = settings.rootFolder || 'DSA-Solutions';
        checkboxGenerateReadme.checked = settings.generateReadme !== false;
        checkboxIgnoreDuplicates.checked = settings.ignoreDuplicates !== false;
        
        if (settings.enabledPlatforms) {
          toggleGfg.checked = settings.enabledPlatforms.geeksforgeeks !== false;
        }
      }
    });
  }

  // 4. Render Sync History List
  function renderHistory(historyItems = []) {
    if (!historyItems || historyItems.length === 0) {
      historyList.innerHTML = '<li class="history-empty">No sync activity recorded.</li>';
      return;
    }

    historyList.innerHTML = historyItems.map(item => {
      const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      const isSuccess = item.status === 'success';
      const statusClass = isSuccess ? 'history-status-success' : 'history-status-failed';
      const statusIcon = isSuccess ? '✓' : '✗';

      return `
        <li class="history-item">
          <div>
            <span class="history-title">${escapeHtml(item.title || 'Untitled')}</span>
            <span class="history-meta">${escapeHtml(item.platform || 'gfg')} • ${escapeHtml(item.language || 'code')}</span>
          </div>
          <div style="text-align: right;">
            <span class="${statusClass}">${statusIcon} ${isSuccess ? 'Synced' : 'Failed'}</span>
            <span class="history-meta" style="display: block;">${timeStr}</span>
          </div>
        </li>
      `;
    }).join('');
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // 5. Toggle Token Password Visibility
  btnToggleToken.addEventListener('click', () => {
    if (inputPatToken.type === 'password') {
      inputPatToken.type = 'text';
      btnToggleToken.textContent = '🔒';
    } else {
      inputPatToken.type = 'password';
      btnToggleToken.textContent = '👁';
    }
  });

  inputPatToken.addEventListener('input', () => {
    realToken = inputPatToken.value.trim();
  });

  // 6. Test GitHub Connection
  btnTestToken.addEventListener('click', () => {
    const token = realToken || inputPatToken.value.trim();
    if (!token || token.includes('••••')) {
      showAlert('Please enter a valid GitHub token', 'error');
      return;
    }

    showAlert('Testing GitHub connection...', 'info', 0);

    chrome.runtime.sendMessage({ action: 'TEST_GITHUB_CONNECTION', token }, (response) => {
      if (chrome.runtime.lastError || !response) {
        showAlert('Failed to connect to GitHub service worker', 'error');
        return;
      }

      if (response.success) {
        showAlert(`Connected successfully as @${response.user.login}!`, 'success');
        statusPill.className = 'status-pill status-connected';
        statusText.textContent = `@${response.user.login}`;
      } else {
        showAlert(response.error || 'Token test failed', 'error');
      }
    });
  });

  // 7. Save GitHub Auth Settings
  btnSaveGithub.addEventListener('click', () => {
    const tokenToSave = realToken || inputPatToken.value.trim();
    const repo = inputRepoName.value.trim();
    const branch = inputRepoBranch.value.trim() || 'main';

    if (!repo || !repo.includes('/')) {
      showAlert('Please enter repository in "owner/repository" format', 'error');
      return;
    }

    const settingsToUpdate = {
      githubRepo: repo,
      githubBranch: branch
    };

    if (tokenToSave && !tokenToSave.includes('••••')) {
      settingsToUpdate.githubToken = tokenToSave;
    }

    chrome.runtime.sendMessage({ action: 'SAVE_SETTINGS', settings: settingsToUpdate }, (res) => {
      if (res && res.success) {
        showAlert('GitHub settings saved successfully!', 'success');
        loadStatus();
      } else {
        showAlert('Failed to save GitHub settings', 'error');
      }
    });
  });

  // 8. Save Extension Settings
  btnSaveSettings.addEventListener('click', () => {
    const rootFolder = inputRootFolder.value.trim() || 'DSA-Solutions';
    const generateReadme = checkboxGenerateReadme.checked;
    const ignoreDuplicates = checkboxIgnoreDuplicates.checked;
    const gfgEnabled = toggleGfg.checked;

    const settingsToUpdate = {
      rootFolder,
      generateReadme,
      ignoreDuplicates,
      enabledPlatforms: {
        geeksforgeeks: gfgEnabled
      }
    };

    chrome.runtime.sendMessage({ action: 'SAVE_SETTINGS', settings: settingsToUpdate }, (res) => {
      if (res && res.success) {
        showAlert('Settings saved successfully!', 'success');
        loadStatus();
      } else {
        showAlert('Failed to save settings', 'error');
      }
    });
  });

  // 9. Manual Sync Trigger
  btnSyncNow.addEventListener('click', () => {
    showAlert('Refreshing status and checking connection...', 'info');
    loadStatus();
  });

  // 10. Clear History
  btnClearHistory.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'CLEAR_HISTORY' }, (res) => {
      if (res && res.success) {
        showAlert('Sync history cleared', 'info');
        loadStatus();
      }
    });
  });

  // Initial load
  loadStatus();
});
