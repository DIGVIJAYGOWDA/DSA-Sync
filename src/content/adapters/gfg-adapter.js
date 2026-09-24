/**
 * GeeksforGeeks Platform Adapter
 * Encapsulates GFG-specific DOM interaction and data extraction into Common Submission Model.
 */

export class GFGAdapter {
  constructor() {
    this.platform = 'geeksforgeeks';
  }

  /**
   * Checks if current URL is a valid GFG problem page
   * @returns {boolean}
   */
  isProblemPage() {
    const url = window.location.href;
    return url.includes('geeksforgeeks.org/problems/') || url.includes('practice.geeksforgeeks.org/problems/');
  }

  /**
   * Robust multi-selector title extraction with fallbacks
   * @returns {string}
   */
  extractTitle() {
    const selectors = [
      '[class*="problem_title"]',
      '[class*="problemTitle"]',
      '[class*="problem-title"]',
      '.problems_header_content__title',
      '.problem-tab_problem_title__1zK3_',
      '.header_title',
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
      if (title && title.toLowerCase() !== 'geeksforgeeks') {
        return title;
      }
    }

    return 'GFG Problem';
  }

  /**
   * Robust difficulty extraction
   * @returns {string}
   */
  extractDifficulty() {
    const selectors = [
      '[class*="difficulty"]',
      '[class*="problem_difficulty"]',
      '[class*="difficulty_level"]',
      '.problems_header_content__difficulty',
      'span.difficulty'
    ];

    for (const selector of selectors) {
      const els = document.querySelectorAll(selector);
      for (const el of els) {
        const text = el.textContent.trim();
        const matched = ['School', 'Basic', 'Easy', 'Medium', 'Hard'].find(d => text.toLowerCase().includes(d.toLowerCase()));
        if (matched) {
          return matched;
        }
      }
    }

    return 'Easy';
  }

  /**
   * Robust category / topic tags extraction
   * @returns {string[]}
   */
  extractTags() {
    const tags = [];
    const selectors = [
      '[class*="topic_tag"]',
      '[class*="topicTag"]',
      '[class*="tag"]',
      '.problem-tag',
      'a[href*="/topics/"]',
      'a[href*="/category/"]'
    ];

    for (const selector of selectors) {
      const els = document.querySelectorAll(selector);
      els.forEach(el => {
        const txt = el.textContent.trim();
        if (txt && txt.length < 30 && !tags.includes(txt) && !['easy', 'medium', 'hard', 'school', 'basic'].includes(txt.toLowerCase())) {
          tags.push(txt);
        }
      });
    }

    return tags.length > 0 ? tags : ['Algorithms'];
  }

  /**
   * Extracts selected programming language
   * @returns {string}
   */
  extractLanguage() {
    const selectors = [
      '[class*="language"]',
      '[class*="lang_dropdown"]',
      '.select-language',
      '.active-lang',
      '.divider.text',
      'button[id*="language"]',
      'div[class*="select"]'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        const txt = el.textContent.trim();
        if (['c++', 'cpp', 'java', 'python', 'python3', 'c', 'javascript', 'c#'].some(l => txt.toLowerCase().includes(l))) {
          return txt;
        }
      }
    }

    const allSpans = document.querySelectorAll('span, div');
    for (const el of allSpans) {
      const txt = el.textContent.trim();
      if (['C++ (g++', 'Python3', 'Java (1.8)', 'C++14', 'C++17', 'Python 3', 'Java'].includes(txt)) {
        return txt;
      }
    }

    return 'cpp';
  }

  /**
   * Extracts code content from DOM elements
   * @returns {string}
   */
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

    const aceLines = document.querySelectorAll('.ace_line');
    if (aceLines.length > 0) {
      const codeLines = Array.from(aceLines).map(line => line.textContent || '');
      const code = codeLines.join('\n').trim();
      if (code.length > 10) return code;
    }

    const codeContainers = document.querySelectorAll('.code-container, #code_container, pre code, [class*="code_editor"]');
    for (const container of codeContainers) {
      if (container.textContent && container.textContent.trim().length > 10) {
        return container.textContent.trim();
      }
    }

    return '';
  }

  /**
   * Main method: Assembles Common Submission Model
   * @param {string} [pageCode] Code provided via main-world page script fallback
   * @returns {Object} Common Submission Model
   */
  extractSubmissionData(pageCode = '') {
    const code = pageCode || this.extractCodeFromDOM();

    return {
      platform: this.platform,
      title: this.extractTitle(),
      problemUrl: window.location.href.split('?')[0].split('#')[0],
      language: this.extractLanguage(),
      code: code,
      difficulty: this.extractDifficulty(),
      tags: this.extractTags(),
      submittedAt: new Date().toISOString(),
      status: 'accepted'
    };
  }

  /**
   * Checks if current DOM state indicates successful/accepted submission
   * @returns {boolean}
   */
  isSubmissionAccepted() {
    const pageText = document.body ? document.body.innerText : '';
    
    const successKeywords = [
      'problem solved successfully',
      'correct answer',
      'test cases passed: 100%',
      'all test cases passed',
      'points solved'
    ];

    const lowerText = pageText.toLowerCase();
    for (const kw of successKeywords) {
      if (lowerText.includes(kw)) {
        return true;
      }
    }

    const statusSelectors = [
      '[class*="status"]',
      '[class*="result"]',
      '[class*="modal"]',
      '[class*="success"]',
      '.ui.positive.message'
    ];

    for (const sel of statusSelectors) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        const txt = el.textContent.toLowerCase();
        if (successKeywords.some(kw => txt.includes(kw))) {
          return true;
        }
      }
    }

    return false;
  }
}

if (typeof window !== 'undefined') {
  window.GFGAdapter = GFGAdapter;
}
