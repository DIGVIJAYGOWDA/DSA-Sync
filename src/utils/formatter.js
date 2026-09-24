/**
 * Formatter utilities for DSA Sync Chrome Extension v2.0
 */

/**
 * Maps language strings to standard file extensions
 * @param {string} language 
 * @returns {string} File extension including dot (e.g. '.cpp')
 */
export function getFileExtension(language = '') {
  if (!language || typeof language !== 'string') return '.txt';
  
  const lang = language.trim().toLowerCase();

  if (lang.includes('c++') || lang.includes('cpp') || lang.includes('g++') || lang.includes('gnu c++')) {
    return '.cpp';
  }
  if (lang.includes('python') || lang === 'py' || lang === 'python3' || lang.includes('pyypy')) {
    return '.py';
  }
  if (lang.includes('java') && !lang.includes('javascript')) {
    return '.java';
  }
  if (lang === 'c' || lang.includes('gcc')) {
    return '.c';
  }
  if (lang.includes('c#') || lang.includes('csharp') || lang === 'cs') {
    return '.cs';
  }
  if (lang.includes('javascript') || lang.includes('js') || lang.includes('node')) {
    return '.js';
  }
  if (lang.includes('typescript') || lang.includes('ts')) {
    return '.ts';
  }
  if (lang.includes('golang') || lang === 'go') {
    return '.go';
  }
  if (lang.includes('rust') || lang === 'rs') {
    return '.rs';
  }
  if (lang.includes('ruby') || lang === 'rb') {
    return '.rb';
  }
  if (lang.includes('swift')) {
    return '.swift';
  }
  if (lang.includes('kotlin') || lang === 'kt') {
    return '.kt';
  }
  if (lang.includes('php')) {
    return '.php';
  }
  if (lang.includes('scala')) {
    return '.scala';
  }
  if (lang.includes('sql')) {
    return '.sql';
  }

  return '.txt';
}

/**
 * Normalizes programming language name for display
 * @param {string} language 
 * @returns {string} Clean language name
 */
export function normalizeLanguageName(language = '') {
  if (!language || typeof language !== 'string') return 'Unknown';
  
  const lang = language.trim().toLowerCase();
  if (lang.includes('c++') || lang.includes('cpp')) return 'C++';
  if (lang.includes('python3')) return 'Python3';
  if (lang.includes('python')) return 'Python';
  if (lang.includes('java') && !lang.includes('javascript')) return 'Java';
  if (lang === 'c') return 'C';
  if (lang.includes('c#') || lang.includes('csharp')) return 'C#';
  if (lang.includes('javascript') || lang === 'js') return 'JavaScript';
  if (lang.includes('typescript') || lang === 'ts') return 'TypeScript';
  if (lang.includes('golang') || lang === 'go') return 'Go';
  if (lang.includes('rust')) return 'Rust';
  if (lang.includes('ruby')) return 'Ruby';
  if (lang.includes('swift')) return 'Swift';
  if (lang.includes('kotlin')) return 'Kotlin';
  
  return language.charAt(0).toUpperCase() + language.slice(1);
}

/**
 * Capitalizes and formats platform name
 * @param {string} platform 
 * @returns {string}
 */
export function formatPlatformName(platform = '') {
  const p = (platform || '').toLowerCase().trim();
  if (p === 'geeksforgeeks' || p === 'gfg') return 'GeeksforGeeks';
  if (p === 'leetcode' || p === 'lc') return 'LeetCode';
  if (p === 'codechef' || p === 'cc') return 'CodeChef';
  if (p === 'codeforces' || p === 'cf') return 'Codeforces';
  return platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Unknown';
}

/**
 * Sanitizes strings for file system / directory path safety
 * @param {string} str 
 * @returns {string} Sanitized string
 */
export function sanitizeFileName(str = '') {
  if (!str || typeof str !== 'string') return 'Untitled';
  
  return str
    .trim()
    .replace(/[\\/:*?"<>|#%]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Formats a category / topic name into a path folder
 * @param {string|string[]} tags 
 * @returns {string}
 */
export function formatCategoryPath(tags) {
  if (Array.isArray(tags) && tags.length > 0) {
    return sanitizeFileName(tags[0]);
  }
  if (typeof tags === 'string' && tags.trim()) {
    return sanitizeFileName(tags.split(',')[0]);
  }
  return 'Algorithms';
}

/**
 * Heuristic estimation of Time and Space complexity from code
 * @param {string} code 
 * @returns {{ time: string, space: string }}
 */
export function estimateComplexity(code = '') {
  const c = code.toLowerCase();
  
  let time = 'O(N)';
  let space = 'O(1)';

  // Nested loop checks
  const loopMatches = (c.match(/for\s*\(|while\s*\(/g) || []).length;
  if (loopMatches >= 2) {
    time = 'O(N²)';
  } else if (c.includes('sort') || c.includes('priority_queue') || c.includes('heapq')) {
    time = 'O(N log N)';
  } else if (c.includes('binary') || c.includes('mid') || (c.includes('left') && c.includes('right') && c.includes('/ 2'))) {
    time = 'O(log N)';
  }

  // Space complexity heuristics
  if (c.includes('vector<vector') || c.includes('new int[') || c.includes('[[0') || c.includes('dp[')) {
    space = 'O(N²)';
  } else if (c.includes('vector<int>') || c.includes('map') || c.includes('unordered_map') || c.includes('dict') || c.includes('set') || c.includes('hash') || c.includes('stack') || c.includes('queue') || c.includes('list')) {
    space = 'O(N)';
  }

  return { time, space };
}

/**
 * Generates structured filepath for solution file in repo
 * Example: DSA-Solutions/GeeksforGeeks/Arrays/Two-Sum/solution.py
 */
export function generateFilePath(submission, rootFolder = 'DSA-Solutions') {
  const platform = formatPlatformName(submission.platform);
  const category = formatCategoryPath(submission.tags);
  const problemFolder = sanitizeFileName(submission.title);
  const ext = getFileExtension(submission.language);
  
  const root = sanitizeFileName(rootFolder) || 'DSA-Solutions';
  return `${root}/${platform}/${category}/${problemFolder}/solution${ext}`;
}

/**
 * Generates structured filepath for README.md in repo
 * Example: DSA-Solutions/GeeksforGeeks/Arrays/Two-Sum/README.md
 */
export function generateReadmePath(submission, rootFolder = 'DSA-Solutions') {
  const platform = formatPlatformName(submission.platform);
  const category = formatCategoryPath(submission.tags);
  const problemFolder = sanitizeFileName(submission.title);
  
  const root = sanitizeFileName(rootFolder) || 'DSA-Solutions';
  return `${root}/${platform}/${category}/${problemFolder}/README.md`;
}

/**
 * Generates rich v2.0 README.md content for a problem solution
 * @param {Object} submission - Common Submission Model
 * @returns {string} Markdown content
 */
export function generateReadmeContent(submission) {
  const title = submission.title || 'Untitled Problem';
  const platform = formatPlatformName(submission.platform);
  const url = submission.problemUrl || '#';
  const difficulty = submission.difficulty || 'Unspecified';
  const language = normalizeLanguageName(submission.language);
  const status = (submission.status || 'Accepted').toUpperCase();
  const date = submission.submittedAt ? new Date(submission.submittedAt).toUTCString() : new Date().toUTCString();
  
  const complexity = estimateComplexity(submission.code || '');

  let tagsFormatted = 'N/A';
  if (Array.isArray(submission.tags) && submission.tags.length > 0) {
    tagsFormatted = submission.tags.map(t => `\`${t}\``).join(', ');
  } else if (typeof submission.tags === 'string' && submission.tags.trim()) {
    tagsFormatted = submission.tags.split(',').map(t => `\`${t.trim()}\``).join(', ');
  }

  const difficultyColor = difficulty.toLowerCase() === 'easy' ? 'brightgreen' : difficulty.toLowerCase() === 'medium' ? 'orange' : 'red';

  return `# ${title}

![Difficulty: ${difficulty}](https://img.shields.io/badge/Difficulty-${difficulty}-${difficultyColor}?style=for-the-badge)
![Platform: ${platform}](https://img.shields.io/badge/Platform-${platform}-blue?style=for-the-badge)
![Status: ${status}](https://img.shields.io/badge/Status-${status}-success?style=for-the-badge)

## 📌 Problem Details

| Metric | Detail |
| :--- | :--- |
| **Platform** | [${platform}](${url}) |
| **Problem Link** | [View Problem on ${platform}](${url}) |
| **Language** | \`${language}\` |
| **Estimated Time Complexity** | \`${complexity.time}\` |
| **Estimated Space Complexity** | \`${complexity.space}\` |
| **Topics / Tags** | ${tagsFormatted} |
| **Synchronized At** | \`${date}\` |

---

### 💡 Solution Note
Automatically synchronized by **[DSA Sync v2.0](https://github.com/DSA-Sync)** — Universal Multi-Platform Solution Sync Engine.
`;
}

if (typeof window !== 'undefined') {
  window.DSAFormatter = {
    getFileExtension,
    normalizeLanguageName,
    formatPlatformName,
    sanitizeFileName,
    formatCategoryPath,
    estimateComplexity,
    generateFilePath,
    generateReadmePath,
    generateReadmeContent
  };
}
