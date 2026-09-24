# DSA Sync 🚀

> Automatically synchronize accepted coding problem solutions from competitive programming platforms directly to your GitHub repository.

---

## 📌 Project Overview

**DSA Sync** is a lightweight, universal Chrome Extension (Manifest V3) built to seamlessly backup your accepted Data Structures & Algorithms (DSA) solutions. Every time you solve a problem on a supported coding platform, DSA Sync automatically extracts your solution code, problem metadata, and topics, and commits them cleanly to your configured GitHub repository along with a beautifully formatted `README.md`.

Currently, **GeeksforGeeks** is fully supported as the initial platform, built on a modular platform adapter architecture designed to accommodate future platforms like **LeetCode**, **CodeChef**, and **Codeforces** without touching the core synchronization pipeline.

---

## ✨ Features

- ⚡ **Automated Background Synchronization:** Detects accepted submissions instantly without manual copying.
- 🎯 **GeeksforGeeks Integration:** Captures problem title, difficulty, submitted code, language, topic tags, and URL.
- 📁 **Structured Repository Organization:** Organizes solutions cleanly by Platform, Category, and Problem Name.
- 📝 **Automated README Generation:** Creates rich problem details markdown documentation per solution.
- 🔄 **Smart Duplicate Detection:** Prevents re-committing identical solutions via local storage hashes and remote file checks.
- 🔒 **Secure Credentials:** Stores GitHub Personal Access Tokens (PAT) locally inside `chrome.storage.local`. No external server or credentials sharing.
- 🎨 **Modern Popup Interface:** Track connection status, total synced solutions, active platforms, and recent activity log.
- 🛠️ **Universal Modular Architecture:** Decoupled platform adapters feeding a standardized Common Submission Model.

---

## 🌐 Supported Platforms

| Platform | Status | Adapter File |
| :--- | :---: | :--- |
| **GeeksforGeeks** | `[Active / Supported]` | `src/content/adapters/gfg-adapter.js` |
| **LeetCode** | `[Architecture Ready / Coming Soon]` | Planned |
| **CodeChef** | `[Architecture Ready / Coming Soon]` | Planned |
| **Codeforces** | `[Architecture Ready / Coming Soon]` | Planned |

---

## 📐 Core Architecture & Data Flow

```text
  GeeksforGeeks Webpage (DOM / Monaco / Ace Editor)
                         ↓
            Platform Adapter (gfg-adapter.js)
                         ↓
             Common Submission Model JSON
                         ↓
          Background Service Worker (service-worker.js)
                         ↓
             GitHub REST API Layer (github-api.js)
                         ↓
            User's Target GitHub Repository
```

### Common Submission Model Schema

All platform-specific adapters convert webpage submission data into this normalized format:

```json
{
  "platform": "geeksforgeeks",
  "title": "Two Sum",
  "problemUrl": "https://www.geeksforgeeks.org/problems/two-sum/1",
  "language": "python3",
  "code": "class Solution:\n    def twoSum(self, arr, target):\n        # Solution code...",
  "difficulty": "Easy",
  "tags": ["Arrays", "Hash"],
  "submittedAt": "2026-09-24T10:00:00.000Z",
  "status": "accepted"
}
```

---

## 📂 Repository Hierarchy Structure

Synchronized solutions are stored in your GitHub repository following this clean directory layout:

```text
DSA-Solutions/
├── GeeksforGeeks/
│   ├── Arrays/
│   │   └── Two-Sum/
│   │       ├── solution.py
│   │       └── README.md
│   ├── Strings/
│   └── Linked-List/
├── LeetCode/        (Future)
└── CodeChef/        (Future)
```

---

## 📁 Project Directory Structure

```text
dsa-sync/
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── scripts/
│   └── generate_icons.js
├── src/
│   ├── background/
│   │   └── service-worker.js
│   ├── content/
│   │   ├── adapters/
│   │   │   └── gfg-adapter.js
│   │   ├── inject/
│   │   │   └── gfg-page-script.js
│   │   └── gfg.js
│   ├── github/
│   │   ├── github-api.js
│   │   └── github-auth.js
│   ├── popup/
│   │   ├── popup.css
│   │   ├── popup.html
│   │   └── popup.js
│   ├── storage/
│   │   └── storage.js
│   └── utils/
│       ├── formatter.js
│       ├── logger.js
│       └── validators.js
├── tests/
│   ├── gfg-adapter.test.js
│   ├── utils.test.js
│   └── validators.test.js
├── .gitignore
├── LICENSE
├── manifest.json
├── package.json
└── README.md
```

---

## 🛠️ Installation & Chrome Setup

### Prerequisites

- Google Chrome (or Chromium-based browser supporting Manifest V3, e.g., Brave, Edge).
- A GitHub account and a repository to store your solutions.

### Step-by-Step Installation (Developer Mode)

1. **Clone or Download the Repository:**
   ```bash
   git clone https://github.com/your-username/dsa-sync.git
   cd dsa-sync
   ```

2. **Open Chrome Extensions Page:**
   - In Chrome, navigate to `chrome://extensions/` in the URL bar.
   - Enable **Developer mode** using the toggle switch in the top-right corner.

3. **Load Unpacked Extension:**
   - Click the **Load unpacked** button in the top-left.
   - Select the `dsa-sync` project root directory.

4. **Verify Loading:**
   - You should see the **DSA Sync** extension card with logo and version `1.0.0`.
   - Pin the extension icon to your Chrome toolbar for easy access.

---

## 🔑 GitHub Configuration

To allow DSA Sync to create and update files in your repository:

1. **Generate a Personal Access Token (PAT):**
   - Go to GitHub -> **Settings** -> **Developer Settings** -> **Personal Access Tokens**.
   - Choose **Fine-grained tokens** or **Tokens (classic)**.
   - **For Fine-grained Tokens:**
     - Repository access: Select **Only select repositories** and pick your target repository (e.g., `dsa-solutions`).
     - Permissions: Set **Repository permissions -> Contents** to **Read and write**.
   - **For Classic Tokens:**
     - Select scope: `repo` (Full control of private repositories) or `public_repo` (for public repositories).

2. **Configure Extension Popup:**
   - Click the **DSA Sync** icon in your browser toolbar.
   - Navigate to the **GitHub Auth** tab.
   - Paste your PAT token and click **Test Connection**.
   - Enter your repository in `owner/repository` format (e.g., `octocat/dsa-solutions`).
   - Specify target branch (default `main`).
   - Click **Save Connection**.

---

## 📖 Usage Instructions

1. **Solve a Problem:**
   - Open any problem page on [GeeksforGeeks Practice](https://practice.geeksforgeeks.org/problems).
   - Write your code in the online editor.
   - Click **Submit**.

2. **Automatic Synchronization:**
   - When the submission is accepted ("Problem Solved Successfully"), DSA Sync automatically extracts the solution code.
   - A non-intrusive toast banner appears on the page: `"DSA Sync: Synchronizing solution to GitHub..."`.
   - Upon completion, a confirmation toast and system notification confirm the commit.

3. **Check GitHub:**
   - Visit your GitHub repository to view your solution code and generated `README.md` metadata!

---

## 🔒 Permissions & Security Explanation

DSA Sync requests the absolute minimum Chrome Extension Manifest V3 permissions:

| Permission | Purpose |
| :--- | :--- |
| `storage` | To safely store non-sensitive configuration settings, stats, and local hash history inside `chrome.storage.local`. |
| `activeTab` | To interact safely with the active tab when inspecting problem details. |
| `scripting` | To inject main-world scripts for Monaco/Ace editor code extraction. |
| `notifications` | To show native desktop status notifications when a solution is committed. |
| `https://api.github.com/*` | Host permission to send solution commits directly to GitHub REST API. |
| `https://*.geeksforgeeks.org/*` | Host permission for content script detection on GeeksforGeeks problem pages. |

> **Security Note:**
> - DSA Sync runs **100% client-side** inside your browser.
> - Your GitHub PAT token is stored securely in Chrome's local storage and is **never** transmitted to any third-party server.
> - Direct communication occurs strictly between your browser and `https://api.github.com`.

---

## 🧪 Local Development & Testing

Run unit tests locally using Node.js built-in test runner:

```bash
# Run unit tests
npm test

# Generate icons (if modifying icon artwork)
node scripts/generate_icons.js
```

---

## ⚠️ Troubleshooting & Known Limitations

### Common Issues & Solutions

1. **"Token is invalid, expired, or revoked":**
   - Verify that your PAT token has not expired.
   - Ensure the token has `repo` or Fine-grained `Contents: Read and write` permission.

2. **"Repository not found":**
   - Ensure the repository format is `username/repository`.
   - Verify that the target repository exists on GitHub and that your token has access to it.

3. **GFG Page Layout Changes:**
   - DSA Sync uses multi-selector fallbacks and main-world Monaco/Ace API inspection.
   - If GFG updates its DOM layout, solution extraction will fall back to page script readers.

### Known Limitations

- **Complex Multi-File Solutions:** GFG single-file solution submissions are supported.
- **Network Interruptions:** If internet drops during submission, retry via manual popup sync or re-submit on GFG.

---

## 🗺️ Roadmap & Adding New Platform Adapters

DSA Sync is designed for easy extension! To implement support for a new platform (e.g., LeetCode):

1. Create a new adapter file: `src/content/adapters/leetcode-adapter.js`.
2. Implement the standard interface:
   ```javascript
   export class LeetCodeAdapter {
     isProblemPage() { ... }
     extractSubmissionData() {
       return {
         platform: 'leetcode',
         title: '...',
         problemUrl: '...',
         language: '...',
         code: '...',
         difficulty: '...',
         tags: [...],
         submittedAt: new Date().toISOString(),
         status: 'accepted'
       };
     }
   }
   ```
3. Add content script entry in `manifest.json`.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
