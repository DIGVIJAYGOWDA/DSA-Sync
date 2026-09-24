/**
 * Main-world injected script for GeeksforGeeks.
 * Runs in the webpage context to access Monaco/Ace editor objects directly.
 */

(function () {
  if (window.__dsaSyncInjected) return;
  window.__dsaSyncInjected = true;

  function extractEditorCode() {
    let code = '';
    let language = '';

    // 1. Monaco Editor direct API check
    if (window.monaco && window.monaco.editor) {
      try {
        const models = window.monaco.editor.getModels();
        if (models && models.length > 0) {
          code = models[0].getValue();
          language = models[0].getLanguageId() || '';
        }
      } catch (e) {
        console.debug('[DSA Sync Page Script] Monaco extraction fallback:', e);
      }
    }

    // 2. Ace Editor direct API check
    if (!code && window.ace) {
      try {
        const editors = document.querySelectorAll('.ace_editor');
        if (editors.length > 0) {
          const aceInst = window.ace.edit(editors[0]);
          if (aceInst) {
            code = aceInst.getValue();
          }
        }
      } catch (e) {
        console.debug('[DSA Sync Page Script] Ace extraction fallback:', e);
      }
    }

    return { code, language };
  }

  // Listen for extraction requests from content script
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data && event.data.type === 'DSA_SYNC_REQUEST_PAGE_CODE') {
      const editorData = extractEditorCode();
      window.postMessage({
        type: 'DSA_SYNC_RESPONSE_PAGE_CODE',
        code: editorData.code,
        language: editorData.language,
        requestId: event.data.requestId
      }, '*');
    }
  });
})();
