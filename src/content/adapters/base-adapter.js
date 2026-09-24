/**
 * Base Abstract Adapter Class for Universal Platform Support
 */
export class BaseAdapter {
  constructor(platformName) {
    this.platform = platformName;
  }

  /**
   * Must be implemented by child platform adapters
   * @returns {boolean}
   */
  isProblemPage() {
    throw new Error('isProblemPage() must be implemented');
  }

  /**
   * Must be implemented by child platform adapters
   * @param {string} [pageCode]
   * @returns {Object} Common Submission Model
   */
  extractSubmissionData(pageCode = '') {
    throw new Error('extractSubmissionData() must be implemented');
  }

  /**
   * Must be implemented by child platform adapters
   * @returns {boolean}
   */
  isSubmissionAccepted() {
    throw new Error('isSubmissionAccepted() must be implemented');
  }

  /**
   * Helper to normalize Common Submission Model
   */
  createSubmissionModel({
    title,
    problemUrl,
    language,
    code,
    difficulty = 'Medium',
    tags = [],
    runtime = 'N/A',
    memory = 'N/A',
    runtimePercentile = null,
    memoryPercentile = null,
    notes = ''
  }) {
    return {
      platform: this.platform,
      title: title || 'Untitled Problem',
      problemUrl: problemUrl || window.location.href,
      language: language || 'Unknown',
      code: code || '',
      difficulty: difficulty || 'Medium',
      tags: Array.isArray(tags) ? tags : [tags],
      submittedAt: new Date().toISOString(),
      status: 'accepted',
      metrics: {
        runtime,
        memory,
        runtimePercentile,
        memoryPercentile
      },
      notes
    };
  }
}

if (typeof window !== 'undefined') {
  window.BaseAdapter = BaseAdapter;
}
