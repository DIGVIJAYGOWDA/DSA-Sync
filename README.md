# DSA Sync 🚀

> Universal Chrome Extension to automatically synchronize accepted coding problem solutions from GeeksforGeeks, LeetCode, CodeChef, Codeforces, and HackerRank directly to your GitHub repository.

---

## 📌 Project Overview

**DSA Sync** is a modular, scalable Chrome Extension (Manifest V3) built to automatically capture your accepted Data Structures & Algorithms (DSA) solutions across competitive programming platforms. Every time you solve a problem on a supported coding website, DSA Sync extracts your solution code, problem metadata, topic tags, and estimated time & space complexity badges, committing them cleanly to your GitHub repository.

---

## 🌐 Supported Platforms Matrix

| Platform | Support Status | Adapter Location | Status Details |
| :--- | :---: | :--- | :--- |
| **GeeksforGeeks** | `[Implemented + Tested]` | `src/platforms/gfg/gfg-adapter.js` | Fully active & tested on GFG practice problem pages. |
| **LeetCode** | `[Implemented + Tested]` | `src/platforms/leetcode/leetcode-adapter.js` | Supports Monaco editor model extraction & problem tags. |
| **CodeChef** | `[Implemented + Tested]` | `src/platforms/codechef/codechef-adapter.js` | Supports CodeChef practice & contest problem pages. |
| **Codeforces** | `[Implemented + Tested]` | `src/platforms/codeforces/codeforces-adapter.js` | Supports problemset & contest problem pages. |
| **HackerRank** | `[Implemented + Tested]` | `src/platforms/hackerrank/hackerrank-adapter.js` | Supports challenge pages and Monaco editor models. |

---

## 🏗️ Universal Architecture & Pipeline

DSA Sync uses a fully decoupled **Platform-Adapter Architecture**. The core synchronization pipeline and GitHub REST API layer operate exclusively on a normalized submission format, meaning adding support for new coding platforms requires adding a single adapter file without changing core code.

```text
Coding Platform Page (GFG / LeetCode / CodeChef / Codeforces / HackerRank)
                                  ↓
                  Platform Detector (platform-detector.js)
                                  ↓
                   Platform Adapter (BaseAdapter interface)
                                  ↓
               Submission Normalizer (submission-normalizer.js)
                                  ↓
                Normalized Submission Object (Standard JSON)
                                  ↓
               Submission Handler Engine (submission-handler.js)
                                  ↓
                 GitHub REST API Service (github-api.js)
                                  ↓
                 Target GitHub Repository (DSA-Solutions/)
```

---

## 📄 Normalized Submission Model Schema

All platform-specific adapters convert webpage extraction data into this standardized schema:

```json
{
  "platform": "leetcode",
  "problemTitle": "Two Sum",
  "problemId": "1",
  "problemSlug": "1-two-sum",
  "problemUrl": "https://leetcode.com/problems/two-sum/",
  "language": "Python3",
  "code": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Solution...",
  "difficulty": "Easy",
  "tags": ["Arrays", "Hash Table"],
  "submissionStatus": "accepted",
  "timestamp": "2026-09-24T22:00:00.000Z",
  "metadata": {
    "runtime": "45 ms",
    "memory": "16.4 MB",
    "complexityTime": "O(N)",
    "complexitySpace": "O(N)"
  }
}
```

---

## 📂 Repository Directory Layout

Solutions are committed to your GitHub repository following this clean structure:

```text
DSA-Solutions/
├── GeeksforGeeks/
│   ├── Arrays/
│   │   └── Two-Sum/
│   │       ├── solution.py
│   │       └── README.md
│   └── Strings/
├── LeetCode/
│   └── Hash-Table/
│       └── 1-Two-Sum/
│           ├── solution.py
│           └── README.md
├── CodeChef/
├── Codeforces/
└── HackerRank/
```

---

## 🛠️ How to Add a New Platform Adapter

Adding a new platform adapter is straightforward:

1. Create a new adapter file extending `BaseAdapter` in `src/platforms/{platform-id}/{platform-id}-adapter.js`:
   ```javascript
   import { BaseAdapter } from '../base-adapter.js';

   export class MyPlatformAdapter extends BaseAdapter {
     constructor() {
       super('myplatform', 'MyPlatform');
     }

     isPlatformPage(url) { return url.includes('myplatform.com'); }
     isProblemPage(url) { return url.includes('myplatform.com/problems/'); }
     extractRawSubmission(pageCode) {
       return {
         platform: this.platformId,
         title: this.extractTitle(),
         problemUrl: window.location.href,
         language: this.extractLanguage(),
         code: pageCode || this.extractCodeFromDOM(),
         difficulty: 'Medium',
         tags: ['Algorithms'],
         status: 'accepted'
       };
     }
     isSubmissionAccepted() { return document.body.innerText.includes('Accepted'); }
   }
   ```
2. Register the adapter in `src/core/submission-handler.js`.
3. Add page match patterns to `manifest.json`.

---

## 📜 Version History

### `v1.0.0`
- Initial stable release with GeeksforGeeks (GFG) solution synchronization.
- Initial GitHub REST API integration, PAT authentication, and Chrome extension popup UI.

### `v2.0.0`
- Refactored into Universal Platform-Adapter Architecture.
- Created `PlatformDetector`, `SubmissionNormalizer`, and `BaseAdapter` contract.
- Added platform adapters for **LeetCode**, **CodeChef**, **Codeforces**, and **HackerRank**.
- Added automated Time & Space Complexity analysis badges ($O(N)$, $O(N^2)$, $O(N \log N)$).
- Enhanced duplicate detection across local storage and remote repository SHA checks.

---

## ⚖️ License

Licensed under the [MIT License](LICENSE).
