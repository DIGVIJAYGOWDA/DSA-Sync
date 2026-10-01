# DSA Sync 🚀

> Universal Chrome Extension to automatically synchronize accepted coding problem solutions from GeeksforGeeks, LeetCode, CodeChef, Codeforces, HackerRank, and Take You Forward directly to your GitHub repository.

---

## 📌 Project Overview

**DSA Sync** is a modular, scalable Chrome Extension (Manifest V3) built to automatically capture your accepted Data Structures & Algorithms (DSA) solutions across competitive programming and learning platforms. Every time you solve a problem on a supported website, DSA Sync extracts your solution code, problem metadata, topic tags, and estimated time & space complexity badges, committing them cleanly to your GitHub repository while updating your daily coding streak.

---

## ✨ Features

- ⚡ **Automated Background Sync:** Synchronizes accepted solutions automatically without manual copy-pasting.
- 🌐 **6 Supported Platforms:** GeeksforGeeks, LeetCode, CodeChef, Codeforces, HackerRank, and Take You Forward.
- 📐 **Universal Platform-Adapter Architecture:** Decoupled platform adapters feeding a single normalized submission pipeline.
- 📊 **Complexity Analysis:** Automatically estimates Time & Space Complexity ($O(N)$, $O(N^2)$, $O(N \log N)$, $O(1)$).
- 🔥 **Daily Coding Streak Calculator:** Tracks daily active streak and total solved counts across all platforms.
- 📝 **Rich README Generation:** Creates structured Markdown documentation with difficulty badges, topics, and problem URLs.
- 🔄 **Smart Deduplication:** Prevents duplicate commits using local storage hashes & remote GitHub SHA checks.
- 🔒 **Privacy & Security:** 100% client-side execution. GitHub Personal Access Tokens (PAT) remain local in Chrome storage.

---

## 🌐 Supported Platforms Matrix

| Platform | Support Status | Adapter Location | Status Details |
| :--- | :---: | :--- | :--- |
| **GeeksforGeeks** | `[Implemented + Tested]` | `src/platforms/gfg/gfg-adapter.js` | Fully active & tested on GFG practice problem pages. |
| **LeetCode** | `[Implemented + Tested]` | `src/platforms/leetcode/leetcode-adapter.js` | Supports Monaco editor model extraction & problem tags. |
| **CodeChef** | `[Implemented + Tested]` | `src/platforms/codechef/codechef-adapter.js` | Supports CodeChef practice & contest problem pages. |
| **Codeforces** | `[Implemented + Tested]` | `src/platforms/codeforces/codeforces-adapter.js` | Supports problemset & contest problem pages. |
| **HackerRank** | `[Implemented + Tested]` | `src/platforms/hackerrank/hackerrank-adapter.js` | Supports challenge pages and Monaco editor models. |
| **Take You Forward** | `[Implemented + Tested]` | `src/platforms/tuf/tuf-adapter.js` | Supports public Take You Forward course sheets, articles & practice. |

---

## 🏗️ Universal Architecture & Pipeline

DSA Sync uses a fully decoupled **Platform-Adapter Architecture**. The core synchronization pipeline and GitHub REST API layer operate exclusively on a normalized submission format, meaning adding support for new coding platforms requires adding a single adapter file without changing core code.

```text
Coding Platform Page (GFG / LeetCode / CodeChef / Codeforces / HackerRank / TUF)
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
  "platform": "takeuforward",
  "problemTitle": "Two Sum : Check if a pair with given sum exists in Array",
  "problemId": "tuf-two-sum-check-if-a-pair-with-given-sum-exists-in-array",
  "problemSlug": "two-sum-check-if-a-pair-with-given-sum-exists-in-array",
  "problemUrl": "https://takeuforward.org/data-structure/two-sum-check-if-a-pair-with-given-sum-exists-in-array/",
  "language": "C++",
  "code": "class Solution {\npublic:\n    vector<int> twoSum(int n, vector<int> &arr, int target) {\n        // Solution...",
  "difficulty": "Easy",
  "tags": ["Arrays", "Hash Table"],
  "submissionStatus": "accepted",
  "timestamp": "2026-09-29T21:00:00.000Z",
  "metadata": {
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
├── LeetCode/
├── TakeYouForward/
│   └── Arrays/
│       └── Two-Sum-Check-if-a-pair-with-given-sum-exists-in-Array/
│           ├── solution.cpp
│           └── README.md
├── CodeChef/
├── Codeforces/
└── HackerRank/
```

---

## 🔑 Installation & GitHub Configuration

### Step 1: Install Extension in Chrome
1. Navigate to `chrome://extensions/` in Google Chrome.
2. Enable **Developer mode** toggle in the top-right corner.
3. Click **Load unpacked** in the top-left corner and select this project directory.

### Step 2: Configure GitHub Personal Access Token (PAT)
1. Go to GitHub -> **Settings** -> **Developer Settings** -> **Personal Access Tokens**.
2. Generate a Fine-grained PAT (with `Contents: Read & Write` permission) or Classic Token (with `repo` scope).
3. Open the **DSA Sync** popup toolbar icon -> **GitHub Auth** tab.
4. Paste your token, enter `DIGVIJAYGOWDA/DSA-Sync` (or your repository path), and click **Save Connection**.

---

## 🧪 Running Unit Tests

Run the automated test suite locally:

```bash
npm test
```

*Executes 17 unit tests verifying URL detection, adapters, complexity estimation, submission normalization, and validators.*

---

## 📜 Version History

### `v1.0.0`
- Initial stable release with GeeksforGeeks (GFG) solution synchronization.
- GitHub REST API integration, PAT authentication, and Chrome extension popup UI.

### `v2.0.0`
- Refactored into Universal Platform-Adapter Architecture.
- Created `PlatformDetector`, `SubmissionNormalizer`, and `BaseAdapter` contract.
- Added platform adapters for **LeetCode**, **CodeChef**, **Codeforces**, and **HackerRank**.
- Added automated Time & Space Complexity analysis badges ($O(N)$, $O(N^2)$, $O(N \log N)$).

### `v2.1.0`
- Added **Take You Forward (TUF)** general/free/public platform integration (`takeuforward.org`).
- Added daily coding streak calculator & platform-specific problem solved counter.
- Added TUF toggle switch and custom Rose icon theme in extension popup UI.

---

## ⚖️ License

Licensed under the [MIT License](LICENSE).
