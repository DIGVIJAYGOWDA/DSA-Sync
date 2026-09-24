/**
 * LeetCode Platform Adapter
 */

import { BaseAdapter } from '../base-adapter.js';

export class LeetCodeAdapter extends BaseAdapter {
  constructor() {
    super('leetcode', 'LeetCode');
  }

  isPlatformPage(url = window.location.href) {
    return url.includes('leetcode.com');
  }

  isProblemPage(url = window.location.href) {
    return url.includes('leetcode.com/problems/');
  }

  extractTitle() {
    const selectors = ['[data-cy="question-title"]', '.text-title-large', 'a[href*="/problems/"]'];
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        const text = el.textContent.trim();
        if (!['LeetCode', 'Problems', 'Submissions', 'Discuss'].includes(text)) {
          return text.replace(/^\d+\.\s*/, '');
        }
      }
    }

    if (document.title) {
      return document.title.split('-')[0].trim().replace(/^\d+\.\s*/, '') || 'LeetCode Problem';
    }

    return 'LeetCode Problem';
  }

  extractDifficulty() {
    const selectors = ['[class*="text-difficulty-"]', '[class*="text-sd-easy"]', '[class*="text-sd-medium"]', '[class*="text-sd-hard"]'];
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        const txt = el.textContent.trim();
        if (['Easy', 'Medium', 'Hard'].some(d => txt.toLowerCase().includes(d.toLowerCase()))) {
          return txt;
        }
      }
    }
    return 'Medium';
  }

  extractTags() {
    const tags = [];
    const els = document.querySelectorAll('a[href*="/tag/"], [class*="topic-tag"]');
    els.forEach(el => {
      const txt = el.textContent.trim();
      if (txt && !tags.includes(txt)) tags.push(txt);
    });
    return tags.length > 0 ? tags : ['Algorithms'];
  }

  extractLanguage() {
    const selectors = ['button[id*="headlessui-listbox-button"]', '[class*="lang-select"]'];
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        return el.textContent.trim();
      }
    }
    return 'cpp';
  }

  extractCodeFromDOM() {
    const textareas = document.querySelectorAll('textarea');
    for (const ta of textareas) {
      if (ta.value && ta.value.trim().length > 10) return ta.value.trim();
    }

    const monacoLines = document.querySelectorAll('.monaco-editor .view-line');
    if (monacoLines.length > 0) {
      return Array.from(monacoLines).map(line => line.textContent || '').join('\n').trim();
    }

    return '';
  }

  extractRawSubmission(pageCode = '') {
    const code = pageCode || this.extractCodeFromDOM();

    return {
      platform: this.platformId,
      title: this.extractTitle(),
      problemUrl: window.location.href.split('/submissions/')[0],
      language: this.extractLanguage(),
      code,
      difficulty: this.extractDifficulty(),
      tags: this.extractTags(),
      status: 'accepted'
    };
  }

  isSubmissionAccepted() {
    const pageText = document.body ? document.body.innerText.toLowerCase() : '';
    if (pageText.includes('accepted') && (pageText.includes('runtime') || pageText.includes('memory') || pageText.includes('details'))) {
      return true;
    }
    const els = document.querySelectorAll('[data-e2e-locator="submission-result"], [class*="status-accepted"], span[class*="text-green"]');
    for (const el of els) {
      if (el.textContent.trim().toLowerCase() === 'accepted') return true;
    }
    return false;
  }
}

if (typeof window !== 'undefined') {
  window.LeetCodeAdapter = LeetCodeAdapter;
}
