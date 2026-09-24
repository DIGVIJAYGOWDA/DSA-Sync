/**
 * Core Submission Normalizer
 * Converts raw platform adapter extraction payloads into a standardized, extensible Normalized Submission Model.
 */

import { sanitizeFileName, estimateComplexity, normalizeLanguageName } from '../utils/formatter.js';

export class SubmissionNormalizer {
  /**
   * Normalizes raw platform extraction data
   * @param {Object} rawData 
   * @returns {Object} Normalized Submission Object
   */
  normalize(rawData = {}) {
    const platform = (rawData.platform || 'unknown').toLowerCase().trim();
    const problemTitle = (rawData.title || rawData.problemTitle || 'Untitled Problem').trim();
    const problemUrl = (rawData.problemUrl || rawData.url || '').split('?')[0].split('#')[0];
    
    // Derive slug and ID
    const problemSlug = rawData.problemSlug || sanitizeFileName(problemTitle).toLowerCase();
    const problemId = rawData.problemId || rawData.problemCode || this._extractIdFromUrl(problemUrl) || problemSlug;
    
    const language = normalizeLanguageName(rawData.language || 'txt');
    const code = (rawData.code || '').trim();
    const difficulty = (rawData.difficulty || 'Medium').trim();
    
    let tags = [];
    if (Array.isArray(rawData.tags)) {
      tags = rawData.tags.map(t => String(t).trim()).filter(Boolean);
    } else if (typeof rawData.tags === 'string' && rawData.tags.trim()) {
      tags = rawData.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (tags.length === 0) tags = ['Algorithms'];

    const submissionStatus = (rawData.status || rawData.submissionStatus || 'accepted').toLowerCase();
    const timestamp = rawData.submittedAt || rawData.timestamp || new Date().toISOString();

    const complexity = estimateComplexity(code);

    return {
      platform,
      problemTitle,
      problemId,
      problemSlug,
      problemUrl,
      language,
      code,
      difficulty,
      tags,
      submissionStatus,
      timestamp,
      metadata: {
        runtime: rawData.runtime || rawData.metrics?.runtime || 'N/A',
        memory: rawData.memory || rawData.metrics?.memory || 'N/A',
        complexityTime: rawData.complexityTime || complexity.time,
        complexitySpace: rawData.complexitySpace || complexity.space,
        ...(rawData.metadata || {})
      }
    };
  }

  _extractIdFromUrl(url = '') {
    if (!url) return '';
    const match = url.match(/\/problems\/([^/]+)/);
    return match ? match[1] : '';
  }
}

export const submissionNormalizer = new SubmissionNormalizer();
if (typeof window !== 'undefined') {
  window.submissionNormalizer = submissionNormalizer;
}
