/**
 * Codeforces Platform Adapter
 */

import { BaseAdapter } from '../base-adapter.js';

export class CodeforcesAdapter extends BaseAdapter {
  constructor() {
    super('codeforces', 'Codeforces');
  }

  isPlatformPage(url = window.location.href) {
    return url.includes('codeforces.com');
  }

  isProblemPage(url = window.location.href) {
    return url.includes('codeforces.com/problemset/problem/') || (url.includes('codeforces.com/contest/') && url.includes('/problem/'));
  }

  extractTitle() {
    const titleEl = document.querySelector('.problem-statement .header .title');
    if (titleEl && titleEl.textContent.trim()) {
      return titleEl.textContent.trim();
    }
    if (document.title) {
      return document.title.split('-')[0].trim() || 'Codeforces Problem';
    }
    return 'Codeforces Problem';
  }

  extractDifficulty() {
    const ratingEl = document.querySelector('.tag-box[title*="Difficulty"], span[title*="Difficulty"]');
    if (ratingEl && ratingEl.textContent.trim()) {
      return ratingEl.textContent.trim();
    }
    return '1200';
  }

  extractTags() {
    const tags = [];
    const els = document.querySelectorAll('.tag-box');
    els.forEach(el => {
      const txt = el.textContent.trim();
      if (txt && !txt.startsWith('*') && !tags.includes(txt)) {
        tags.push(txt);
      }
    });
    return tags.length > 0 ? tags : ['Algorithms'];
  }

  extractLanguage() {
    const select = document.querySelector('select[name="programTypeId"]');
    if (select && select.options && select.selectedIndex >= 0) {
      return select.options[select.selectedIndex].text;
    }
    return 'GNU C++17';
  }

  extractCodeFromDOM() {
    const textareas = document.querySelectorAll('textarea[name="source"]');
    for (const ta of textareas) {
      if (ta.value && ta.value.trim().length > 10) return ta.value.trim();
    }
    return '';
  }

  extractRawSubmission(pageCode = '') {
    const code = pageCode || this.extractCodeFromDOM();

    return {
      platform: this.platformId,
      title: this.extractTitle(),
      problemUrl: window.location.href,
      language: this.extractLanguage(),
      code,
      difficulty: this.extractDifficulty(),
      tags: this.extractTags(),
      status: 'accepted'
    };
  }

  isSubmissionAccepted() {
    const pageText = document.body ? document.body.innerText.toLowerCase() : '';
    return pageText.includes('accepted') || pageText.includes('verdict: accepted');
  }
}

if (typeof window !== 'undefined') {
  window.CodeforcesAdapter = CodeforcesAdapter;
}
