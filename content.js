// Resumate – Content Script
// Injected into every page. Listens for extraction requests from the side panel.

(() => {
  /**
   * Extract the primary textual content from the current page.
   * Uses a heuristic approach: prefer common job-description containers,
   * then fall back to <main>, <article>, or document.body.
   */
  function extractJobDescription() {
    // Common selectors on major job boards
    const selectors = [
      '[class*="job-description"]',
      '[class*="jobDescription"]',
      '[class*="job_description"]',
      '[id*="job-description"]',
      '[id*="jobDescription"]',
      '[id*="job_description"]',
      '[class*="posting-description"]',
      '[class*="description__text"]',
      '[data-testid="jobDescription"]',
      'article',
      'main',
      '[role="main"]',
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        const text = el.innerText.trim();
        if (text.length > 100) return text;
      }
    }

    // Fallback: body text (trimmed to a reasonable length)
    const body = document.body.innerText.trim();
    return body.substring(0, 15000);
  }

  // Listen for messages from the side panel / background
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === "extractJobDescription") {
      const text = extractJobDescription();
      sendResponse({ success: true, text });
    }
    return true; // keep the message channel open for async response
  });
})();
