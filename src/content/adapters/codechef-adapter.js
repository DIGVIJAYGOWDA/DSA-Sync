/**
 * CodeChef Platform Adapter for DSA Sync
 */

import { BaseAdapter } from './base-adapter.js';

export class CodeChefAdapter extends BaseAdapter {
  constructor() {
    super('codechef');
  }

  isProblemPage() {
    const url = window.location.href;
    return url.includes('codechef.com/problems/') || url.includes('codechef.com/practice/');
  }

  extractTitle() {
    const selectors = [
      'h1[class*="problem"]',
      '.problem-code',
      'h1',
      'h2'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        const text = el.textContent.trim();
        if (!['CodeChef', 'Practice', 'Compete', 'Discuss'].includes(text)) {
          return text;
        }
      }
    }

    if (document.title) {
      return document.title.split('|')[0].split('-')[0].trim() || 'CodeChef Problem';
    }

    return 'CodeChef Problem';
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
    const els = document.querySelectorAll('a[href*="/tags/problems/"], [class*="tag"]');
    els.forEach(el => {
      const txt = el.textContent.trim();
      if (txt && !tags.includes(txt)) tags.push(txt);
    });
    return tags.length > 0 ? tags : ['Algorithms'];
  }

  extractLanguage() {
    const selectors = ['[class*="language"]', 'select[name="language"]', '.active-lang'];
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
    return '';
  }

  extractSubmissionData(pageCode = '') {
    const code = pageCode || this.extractCodeFromDOM();

    return this.createSubmissionModel({
      title: this.extractTitle(),
      problemUrl: window.location.href.split('?')[0],
      language: this.extractLanguage(),
      code: code,
      difficulty: this.extractDifficulty(),
      tags: this.extractTags()
    });
  }

  isSubmissionAccepted() {
    const pageText = document.body ? document.body.innerText.toLowerCase() : '';
    return pageText.includes('correct answer') || pageText.includes('100 pts') || pageText.includes('accepted');
  }
}

if (typeof window !== 'undefined') {
  window.CodeChefAdapter = CodeChefAdapter;
}
