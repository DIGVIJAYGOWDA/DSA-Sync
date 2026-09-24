/**
 * HackerRank Platform Adapter
 */

import { BaseAdapter } from '../base-adapter.js';

export class HackerRankAdapter extends BaseAdapter {
  constructor() {
    super('hackerrank', 'HackerRank');
  }

  isPlatformPage(url = window.location.href) {
    return url.includes('hackerrank.com');
  }

  isProblemPage(url = window.location.href) {
    return url.includes('hackerrank.com/challenges/');
  }

  extractTitle() {
    const selectors = ['h1.header-title', '.ui-icon-label', '.challenge-title', 'h1', 'h2'];
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        const text = el.textContent.trim();
        if (!['HackerRank', 'Prepare', 'Certify', 'Compete'].includes(text)) return text;
      }
    }
    if (document.title) return document.title.split('|')[0].trim() || 'HackerRank Challenge';
    return 'HackerRank Challenge';
  }

  extractDifficulty() {
    const pageText = document.body ? document.body.innerText.toLowerCase() : '';
    if (pageText.includes('difficulty: hard') || pageText.includes('hard')) return 'Hard';
    if (pageText.includes('difficulty: medium') || pageText.includes('medium')) return 'Medium';
    if (pageText.includes('difficulty: easy') || pageText.includes('easy')) return 'Easy';
    return 'Medium';
  }

  extractTags() {
    const tags = [];
    const els = document.querySelectorAll('a[href*="/domains/"], .breadcrumb-item');
    els.forEach(el => {
      const txt = el.textContent.trim();
      if (txt && !tags.includes(txt)) tags.push(txt);
    });
    return tags.length > 0 ? tags : ['Algorithms'];
  }

  extractLanguage() {
    const selectors = ['.select-language', '[class*="language"]', 'div[class*="select"]'];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim()) return el.textContent.trim();
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
      problemUrl: window.location.href.split('/problem')[0],
      language: this.extractLanguage(),
      code,
      difficulty: this.extractDifficulty(),
      tags: this.extractTags(),
      status: 'accepted'
    };
  }

  isSubmissionAccepted() {
    const pageText = document.body ? document.body.innerText.toLowerCase() : '';
    return pageText.includes('congratulations') || pageText.includes('accepted') || pageText.includes('all test cases passed');
  }
}

if (typeof window !== 'undefined') {
  window.HackerRankAdapter = HackerRankAdapter;
}
