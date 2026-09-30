/**
 * Take You Forward (TUF) Platform Adapter
 * Supports general/free/public Take You Forward (takeuforward.org) website.
 */

import { BaseAdapter } from '../base-adapter.js';

export class TUFAdapter extends BaseAdapter {
  constructor() {
    super('takeuforward', 'Take You Forward');
  }

  /**
   * Checks if URL belongs to Take You Forward
   * @param {string} url 
   * @returns {boolean}
   */
  isPlatformPage(url = window.location.href) {
    return url.includes('takeuforward.org');
  }

  /**
   * Checks if URL/page represents a problem or course article page on TUF
   * @param {string} url 
   * @returns {boolean}
   */
  isProblemPage(url = window.location.href) {
    if (!this.isPlatformPage(url)) return false;

    // Matches problem articles, course sheets, and DSA topics
    const isProblemUrl = (
      url.includes('/data-structure/') ||
      url.includes('/arrays/') ||
      url.includes('/string/') ||
      url.includes('/linked-list/') ||
      url.includes('/binary-tree/') ||
      url.includes('/graph/') ||
      url.includes('/dynamic-programming/') ||
      url.includes('/strivers-') ||
      url.includes('/interviews/') ||
      url.includes('/dsa/') ||
      url.includes('/plus/dsa/')
    );

    if (isProblemUrl) return true;

    // Check DOM for article title / problem header presence
    const titleEl = document.querySelector('h1.entry-title, h1[class*="title"], h1');
    return Boolean(titleEl && titleEl.textContent.trim());
  }

  /**
   * Extracts problem title with fallbacks
   * @returns {string}
   */
  extractTitle() {
    const selectors = [
      'h1.entry-title',
      'h1[class*="title"]',
      'h1[class*="problem"]',
      'h1',
      'h2.entry-title'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        const text = el.textContent.trim();
        if (!['takeuforward', 'Take You Forward', 'Home', 'Courses', 'Sheets'].includes(text)) {
          return text
            .replace(/\s*[-|]\s*takeuforward.*/i, '')
            .replace(/\s*[-|]\s*Strivers.*$/i, '')
            .trim();
        }
      }
    }

    if (document.title) {
      return document.title
        .split('|')[0]
        .split('-')[0]
        .replace(/takeuforward/i, '')
        .trim() || 'Take You Forward Problem';
    }

    return 'Take You Forward Problem';
  }

  /**
   * Extracts difficulty (Easy, Medium, Hard) if available
   * @returns {string}
   */
  extractDifficulty() {
    const selectors = [
      '[class*="difficulty"]',
      '[class*="badge-easy"]',
      '[class*="badge-medium"]',
      '[class*="badge-hard"]',
      'span.difficulty',
      '.badge'
    ];

    for (const selector of selectors) {
      const els = document.querySelectorAll(selector);
      for (const el of els) {
        const text = el.textContent.trim();
        const matched = ['Easy', 'Medium', 'Hard', 'Basic'].find(d => text.toLowerCase().includes(d.toLowerCase()));
        if (matched) return matched;
      }
    }

    const pageText = document.body ? document.body.innerText.toLowerCase() : '';
    if (pageText.includes('difficulty: hard') || pageText.includes('hard level')) return 'Hard';
    if (pageText.includes('difficulty: medium') || pageText.includes('medium level')) return 'Medium';
    if (pageText.includes('difficulty: easy') || pageText.includes('easy level')) return 'Easy';

    return 'Medium';
  }

  /**
   * Extracts topic tags / categories
   * @returns {string[]}
   */
  extractTags() {
    const tags = [];
    const selectors = [
      'a[href*="/category/"]',
      'a[href*="/tag/"]',
      '.breadcrumb-item',
      '[class*="topic"]',
      '[class*="category"]'
    ];

    for (const selector of selectors) {
      const els = document.querySelectorAll(selector);
      els.forEach(el => {
        const txt = el.textContent.trim();
        if (txt && txt.length < 30 && !tags.includes(txt) && !['home', 'dsa', 'takeuforward'].includes(txt.toLowerCase())) {
          tags.push(txt);
        }
      });
    }

    // Secondary fallback: inspect URL path
    if (tags.length === 0) {
      const url = window.location.href.toLowerCase();
      if (url.includes('array')) tags.push('Arrays');
      else if (url.includes('string')) tags.push('Strings');
      else if (url.includes('linked-list')) tags.push('Linked List');
      else if (url.includes('tree')) tags.push('Binary Trees');
      else if (url.includes('graph')) tags.push('Graphs');
      else if (url.includes('dynamic-programming') || url.includes('dp')) tags.push('Dynamic Programming');
      else if (url.includes('recursion')) tags.push('Recursion');
      else if (url.includes('binary-search')) tags.push('Binary Search');
    }

    return tags.length > 0 ? tags : ['Algorithms'];
  }

  /**
   * Extracts selected programming language
   * @returns {string}
   */
  extractLanguage() {
    const activeTab = document.querySelector('.tab-button.active, button.active, .code-tab.active, [class*="active-tab"]');
    if (activeTab && activeTab.textContent.trim()) {
      const txt = activeTab.textContent.trim();
      if (['c++', 'cpp', 'java', 'python', 'javascript', 'c#', 'go'].some(l => txt.toLowerCase().includes(l))) {
        return txt;
      }
    }

    const codeBlocks = document.querySelectorAll('code[class*="language-"]');
    for (const cb of codeBlocks) {
      const cls = cb.className;
      if (cls.includes('language-cpp') || cls.includes('language-c++')) return 'cpp';
      if (cls.includes('language-java')) return 'java';
      if (cls.includes('language-python') || cls.includes('language-py')) return 'python3';
      if (cls.includes('language-javascript') || cls.includes('language-js')) return 'javascript';
    }

    return 'cpp';
  }

  /**
   * Extracts solution code from DOM elements
   * @returns {string}
   */
  extractCodeFromDOM() {
    // 1. Textarea elements
    const textareas = document.querySelectorAll('textarea');
    for (const ta of textareas) {
      if (ta.value && ta.value.trim().length > 10) return ta.value.trim();
    }

    // 2. Monaco / Ace editor containers
    const monacoLines = document.querySelectorAll('.monaco-editor .view-line');
    if (monacoLines.length > 0) {
      return Array.from(monacoLines).map(line => line.textContent || '').join('\n').trim();
    }

    // 3. Code blocks (pre code or code container)
    const codeElements = document.querySelectorAll('pre code, .code-block, [class*="code-container"], [class*="solution_code"]');
    for (const el of codeElements) {
      if (el.textContent && el.textContent.trim().length > 15) {
        return el.textContent.trim();
      }
    }

    return '';
  }

  /**
   * Assembles raw extraction payload
   * @param {string} [pageCode] 
   * @returns {Object}
   */
  extractRawSubmission(pageCode = '') {
    const code = pageCode || this.extractCodeFromDOM();
    const title = this.extractTitle();
    const problemUrl = window.location.href.split('?')[0].split('#')[0];

    return {
      platform: this.platformId,
      title,
      problemTitle: title,
      problemUrl,
      language: this.extractLanguage(),
      code,
      difficulty: this.extractDifficulty(),
      tags: this.extractTags(),
      status: 'accepted'
    };
  }

  /**
   * Checks if current DOM indicates solved/completed state on TUF
   * @returns {boolean}
   */
  isSubmissionAccepted() {
    const pageText = document.body ? document.body.innerText.toLowerCase() : '';
    
    // Key indicator text for TUF public course sheets / articles
    const successKeywords = [
      'mark as completed',
      'completed',
      'marked as done',
      'problem solved',
      'solved',
      'practice solved'
    ];

    // Check checked checkboxes or active complete buttons
    const completedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked, [aria-checked="true"], [data-status="completed"]');
    if (completedCheckboxes.length > 0) {
      return true;
    }

    const completeBtns = document.querySelectorAll('button[class*="completed"], button[class*="solved"], .marked-complete');
    if (completeBtns.length > 0) {
      return true;
    }

    return successKeywords.some(kw => pageText.includes(kw));
  }
}

if (typeof window !== 'undefined') {
  window.TUFAdapter = TUFAdapter;
}
