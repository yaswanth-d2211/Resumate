// Resumate - Centralized Prompt Configuration
// Single source of truth for all AI system instructions and user templates.
// Modify prompts here without touching application logic.

const PROMPTS = {

  // System-level instruction sent to the AI model before every request
  system: `You are Resumate, an expert career consultant and professional resume writer.
Your sole task is to rewrite the provided resume so it is perfectly tailored to the given job description.

Rules you MUST follow:
1. Preserve all factual information — never fabricate experience, degrees, or certifications.
2. Mirror the keywords, phrases, and terminology found in the job description.
3. Reorder and emphasize bullet points so the most relevant experience appears first.
4. Quantify achievements wherever the original resume provides data.
5. Keep the tone professional, concise, and active-voice.
6. Respect the requested page count — trim or expand content accordingly.
7. Output ONLY the rewritten resume text. Do not include commentary or explanations.`,

  // Template for the user message sent alongside the system prompt
  // Placeholders: {{jobDescription}}, {{resumeText}}, {{pageCount}}
  userTemplate: `### Job Description
{{jobDescription}}

### Original Resume
{{resumeText}}

### Instructions
Rewrite the resume above so it is perfectly tailored to the job description.
Target length: {{pageCount}} page(s).
Return only the final resume text.`,

  // AI provider configurations — only the prompt/model defaults live here.
  // Actual API keys are stored securely in chrome.storage.local via the settings UI.
  providers: {
    openai: {
      displayName: "OpenAI (ChatGPT)",
      defaultModel: "gpt-4o",
      endpoint: "https://api.openai.com/v1/chat/completions",
    },
    gemini: {
      displayName: "Google Gemini",
      defaultModel: "gemini-2.0-flash",
      endpoint: "https://generativelanguage.googleapis.com/v1beta/models/{{model}}:generateContent",
    },
    anthropic: {
      displayName: "Anthropic (Claude)",
      defaultModel: "claude-sonnet-4-20250514",
      endpoint: "https://api.anthropic.com/v1/messages",
    },
  },
};
