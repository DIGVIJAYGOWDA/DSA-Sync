/**
 * Core Platform Detector
 * Identifies which coding platform the user is currently visiting and returns the corresponding adapter.
 */

export class PlatformDetector {
  constructor() {
    this.adapters = new Map();
  }

  /**
   * Registers a platform adapter instance
   * @param {Object} adapter 
   */
  registerAdapter(adapter) {
    if (adapter && adapter.platformId) {
      this.adapters.set(adapter.platformId, adapter);
    }
  }

  /**
   * Detects which registered platform matches the given URL or current window location
   * @param {string} [url=window.location.href] 
   * @returns {Object|null} Matching platform adapter instance or null
   */
  detectPlatform(url = typeof window !== 'undefined' ? window.location.href : '') {
    if (!url) return null;

    for (const adapter of this.adapters.values()) {
      if (typeof adapter.isPlatformPage === 'function' && adapter.isPlatformPage(url)) {
        return adapter;
      }
    }

    return null;
  }

  /**
   * Returns list of all registered platform IDs
   * @returns {string[]}
   */
  getRegisteredPlatforms() {
    return Array.from(this.adapters.keys());
  }
}

export const platformDetector = new PlatformDetector();
if (typeof window !== 'undefined') {
  window.platformDetector = platformDetector;
}
