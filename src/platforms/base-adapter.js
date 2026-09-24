/**
 * Base Abstract Adapter Contract for Universal Platform Adapters
 * All platform adapters MUST implement this contract.
 */
export class BaseAdapter {
  constructor(platformId, platformName) {
    this.platformId = platformId;
    this.platformName = platformName;
  }

  /**
   * Checks if current URL/DOM belongs to this platform
   * @param {string} url 
   * @returns {boolean}
   */
  isPlatformPage(url = window.location.href) {
    throw new Error('isPlatformPage() must be implemented by child adapter');
  }

  /**
   * Checks if current page is a supported problem/submission page
   * @param {string} url 
   * @returns {boolean}
   */
  isProblemPage(url = window.location.href) {
    throw new Error('isProblemPage() must be implemented by child adapter');
  }

  /**
   * Extracts raw problem and submission data from page/DOM/page-script
   * @param {string} [pageCode] Optional code extracted from main-world page script
   * @returns {Object} Raw platform extraction payload
   */
  extractRawSubmission(pageCode = '') {
    throw new Error('extractRawSubmission() must be implemented by child adapter');
  }

  /**
   * Checks if current DOM / page state represents a successful/accepted submission
   * @returns {boolean}
   */
  isSubmissionAccepted() {
    throw new Error('isSubmissionAccepted() must be implemented by child adapter');
  }
}

if (typeof window !== 'undefined') {
  window.BaseAdapter = BaseAdapter;
}
