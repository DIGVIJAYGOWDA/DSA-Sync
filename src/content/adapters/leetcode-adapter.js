/**
 * LeetCode Platform Adapter for DSA Sync
 */

import { BaseAdapter } from './base-adapter.js';

export class LeetCodeAdapter extends BaseAdapter {
  constructor() {
    super('leetcode');
  }

  isProblemPage() {
    const url = window.location.href;
    return url.includes('leetcode.com/problems/');
  }

  extractTitle() {
    // 1. Check title elements on page
    const selectors = [
      '[data-cy="question-title"]',
      '.text-title-large',
      'div[class*="title"]',
      'a[href*="/problems/"]'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        const text = el.textContent.trim();
        if (!['LeetCode', 'Problems', 'Submissions', 'Discuss'].includes(text)) {
          return text.replace(/^\d+\.\s*/, ''); // Strip problem number prefix if desired or keep clean
        }
      }
    }

    // 2. Document title fallback: "1. Two Sum - LeetCode" -> "Two Sum"
    if (document.title) {
      const parts = document.title.split('-')[0].trim();
      return parts.replace(/^\d+\.\s*/, '') || 'LeetCode Problem';
    }

    return 'LeetCode Problem';
  }

  extractDifficulty() {
    const selectors = [
      '[class*="text-difficulty-"]',
      '[class*="text-sd-easy"]',
      '[class*="text-sd-medium"]',
      '[class*="text-sd-hard"]',
      'div[class*="difficulty"]'
    ];

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
    const selectors = [
      'a[href*="/tag/"]',
      '[class*="topic-tag"]',
      '[class*="tag__"]'
    ];

    for (const selector of selectors) {
      const els = document.querySelectorAll(selector);
      els.forEach(el => {
        const txt = el.textContent.trim();
        if (txt && !tags.includes(txt)) {
          tags.push(txt);
        }
      });
    }

    return tags.length > 0 ? tags : ['Algorithms'];
  }

  extractLanguage() {
    const selectors = [
      'button[id*="headlessui-listbox-button"]',
      '[class*="ant-select-selection-selected-value"]',
      '[class*="lang-select"]',
      'div[class*="select"]'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        const txt = el.textContent.trim();
        if (['c++', 'cpp', 'java', 'python', 'python3', 'c', 'javascript', 'typescript', 'golang', 'rust'].some(l => txt.toLowerCase().includes(l))) {
          return txt;
        }
      }
    }

    return 'cpp';
  }

  extractCodeFromDOM() {
    const textareas = document.querySelectorAll('textarea');
    for (const ta of textareas) {
      if (ta.value && ta.value.trim().length > 10) {
        return ta.value.trim();
      }
    }

    const monacoLines = document.querySelectorAll('.monaco-editor .view-line');
    if (monacoLines.length > 0) {
      const codeLines = Array.from(monacoLines).map(line => line.textContent || '');
      const code = codeLines.join('\n').trim();
      if (code.length > 10) return code;
    }

    return '';
  }

  extractSubmissionData(pageCode = '') {
    const code = pageCode || this.extractCodeFromDOM();

    return this.createSubmissionModel({
      title: this.extractTitle(),
      problemUrl: window.location.href.split('/submissions/')[0].split('/description/')[0],
      language: this.extractLanguage(),
      code: code,
      difficulty: this.extractDifficulty(),
      tags: this.extractTags()
    });
  }

  isSubmissionAccepted() {
    const pageText = document.body ? document.body.innerText : '';
    const lowerText = pageText.toLowerCase();

    if (lowerText.includes('accepted') && (lowerText.includes('runtime') || lowerText.includes('memory') || lowerText.includes('details'))) {
      return true;
    }

    const statusSelectors = [
      '[data-e2e-locator="submission-result"]',
      '[class*="status-accepted"]',
      '[class*="result-state"]',
      'span[class*="text-green"]'
    ];

    for (const sel of statusSelectors) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        if (el.textContent.trim().toLowerCase() === 'accepted') {
          return true;
        }
      }
    }

    return false;
  }
}

if (typeof window !== 'undefined') {
  window.LeetCodeAdapter = LeetCodeAdapter;
}
