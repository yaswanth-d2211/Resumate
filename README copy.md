# Resumate – Chrome Extension

Resumate is a Chrome extension that extracts job descriptions from any webpage and rewrites your resume to match them. All data stays in local storage — nothing is sent anywhere except directly to the AI provider you choose.

## Features

- **Side Panel UI** — opens alongside any tab via the Chrome toolbar icon.
- **Job Description Extraction** — content script scrapes the main job posting text from the active tab (supports major job boards with intelligent selector fallback).
- **Email & Resume Management** — save multiple emails and resume files to `chrome.storage.local` so you never re-enter them.
- **Multi-Provider AI** — choose between OpenAI, Google Gemini, or Anthropic. API keys are stored locally and configured in the Settings view.
- **Output Options** — select PDF or Word format and target page count.
- **Prompt Configuration** — all AI prompts live in `prompts.js`, isolated from application logic for easy tuning.

> **Current Status (Milestone 1):** UI, content extraction, and local data management are complete. AI calls and document generation are stubbed out and will be wired in the next milestone.

## Project Structure

```
Resumate/
├── manifest.json      # Manifest V3 configuration
├── background.js      # Service worker — opens side panel on icon click
├── content.js         # Content script — extracts job description text
├── sidepanel.html     # Side panel markup (main + settings views)
├── sidepanel.css      # Side panel styles
├── sidepanel.js       # Side panel logic (forms, storage, extraction)
└── prompts.js         # Centralized AI prompts & provider config
```

## Prerequisites

- **Google Chrome** (or any Chromium-based browser) version 114+  
  (Side Panel API requires Chrome 114 or later)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yaswanthdhiguvamagam/Resumate.git
cd Resumate
```

### 2. Load the extension in Chrome

1. Open **chrome://extensions** in your browser.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** and select the `Resumate/` project folder.
4. The Resumate icon will appear in the Chrome toolbar.

### 3. Open the side panel

Click the **Resumate** toolbar icon on any tab. The side panel will open to the right of the page.

## Usage

### Extract a Job Description

1. Navigate to a job posting (LinkedIn, Indeed, Greenhouse, etc.).
2. Click **Extract from Page** in the side panel.
3. The extracted text appears in the Job Description textarea.

### Add an Email

Type an email address and click **Add**. It is saved to local storage and will appear in the dropdown on future sessions.

### Upload a Resume

1. Click the file input and select a `.txt`, `.pdf`, `.doc`, or `.docx` file.
2. Click **Save** to store the file's text content in local storage.
3. Select it from the dropdown whenever you need it.

> **Note:** The current file reader uses `readAsText`, so binary formats (PDF/DOCX) may not extract cleanly yet. Plain `.txt` files work best at this stage.

### Configure an AI Provider

1. Click the **⚙️** icon to open Settings.
2. Enter an API key for one or more providers (OpenAI, Gemini, Anthropic).
3. Click **Save Keys**. Keys are stored only in `chrome.storage.local`.
4. Return to the main view and select the provider from the dropdown.

### Generate a Tailored Resume

Select a resume, a provider, and ensure a job description is present, then click **Generate Tailored Resume**.  
*(AI integration is not yet active — the button currently shows a placeholder message.)*

## Development Notes

### No build step required

The extension is plain HTML / CSS / JavaScript with no bundler or transpiler. Edit any file and reload the extension to see changes.

### Reloading after changes

1. Go to **chrome://extensions**.
2. Click the **refresh ↻** icon on the Resumate card.
3. Close and reopen the side panel to pick up HTML/CSS changes.

### Prompt editing

All AI system prompts, user message templates, and provider endpoint configs are in [prompts.js](prompts.js). Modify them without touching any other file.

### Storage schema

`chrome.storage.local` holds three keys:

| Key | Type | Description |
|---|---|---|
| `emails` | `string[]` | Saved email addresses |
| `resumes` | `{ [filename]: string }` | Resume text keyed by original filename |
| `apiKeys` | `{ openai?, gemini?, anthropic? }` | Provider API keys |

### Clear all data

Open **Settings → Clear All Saved Data** or run in the Chrome DevTools console:

```js
chrome.storage.local.clear();
```

## Upcoming (Milestone 2)

- Wire AI provider calls using the keys and prompts already configured.
- Client-side PDF generation (e.g., jsPDF) and Word generation (e.g., docx.js).
- Improved resume file parsing for binary formats.

## License

This project is provided as-is for personal and educational use.
