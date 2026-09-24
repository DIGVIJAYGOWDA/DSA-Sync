/**
 * GeeksforGeeks Platform Adapter
 */

import { BaseAdapter } from '../base-adapter.js';

export class GFGAdapter extends BaseAdapter {
  constructor() {
    super('geeksforgeeks', 'GeeksforGeeks');
  }

  isPlatformPage(url = window.location.href) {
    return url.includes('geeksforgeeks.org');
  }

  isProblemPage(url = window.location.href) {
    return url.includes('geeksforgeeks.org/problems/') || url.includes('practice.geeksforgeeks.org/problems/');
  }

  extractTitle() {
    const selectors = [
      '[class*="problem_title"]',
      '[class*="problemTitle"]',
      '[class*="problem-title"]',
      '.problems_header_content__title',
      'h3.problem-name',
      'h3',
      'h4'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        const text = el.textContent.trim();
        if (!['GeeksforGeeks', 'Practice', 'Problems', 'Explore', 'Submissions'].includes(text)) {
          return text;
        }
      }
    }

    if (document.title) {
      let title = document.title.split('|')[0].split('-')[0].trim();
      if (title && title.toLowerCase() !== 'geeksforgeeks') return title;
    }

    return 'GFG Problem';
  }

  extractDifficulty() {
    const selectors = ['[class*="difficulty"]', '[class*="problem_difficulty"]', '.problems_header_content__difficulty'];
    for (const selector of selectors) {
      const els = document.querySelectorAll(selector);
      for (const el of els) {
        const text = el.textContent.trim();
        const matched = ['School', 'Basic', 'Easy', 'Medium', 'Hard'].find(d => text.toLowerCase().includes(d.toLowerCase()));
        if (matched) return matched;
      }
    }
    return 'Easy';
  }

  extractTags() {
    const tags = [];
    const els = document.querySelectorAll('[class*="topic_tag"], [class*="tag"], .problem-tag, a[href*="/topics/"]');
    els.forEach(el => {
      const txt = el.textContent.trim();
      if (txt && txt.length < 30 && !tags.includes(txt) && !['easy', 'medium', 'hard', 'school', 'basic'].includes(txt.toLowerCase())) {
        tags.push(txt);
      }
    });
    return tags.length > 0 ? tags : ['Algorithms'];
  }

  extractLanguage() {
    const selectors = ['[class*="language"]', '.select-language', '.active-lang', 'button[id*="language"]'];
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        const txt = el.textContent.trim();
        if (['c++', 'cpp', 'java', 'python', 'python3', 'c', 'javascript', 'c#'].some(l => txt.toLowerCase().includes(l))) {
          return txt;
        }
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

    const aceLines = document.querySelectorAll('.ace_line');
    if (aceLines.length > 0) {
      return Array.from(aceLines).map(line => line.textContent || '').join('\n').trim();
    }

    return '';
  }

  extractRawSubmission(pageCode = '') {
    const code = pageCode || this.extractCodeFromDOM();

    return {
      platform: this.platformId,
      title: this.extractTitle(),
      problemUrl: window.location.href.split('?')[0].split('#')[0],
      language: this.extractLanguage(),
      code,
      difficulty: this.extractDifficulty(),
      tags: this.extractTags(),
      status: 'accepted'
    };
  }

  isSubmissionAccepted() {
    const pageText = document.body ? document.body.innerText.toLowerCase() : '';
    const successKeywords = ['problem solved successfully', 'correct answer', 'test cases passed: 100%', 'all test cases passed'];
    return successKeywords.some(kw => pageText.includes(kw));
  }
}

if (typeof window !== 'undefined') {
  window.GFGAdapter = GFGAdapter;
}
