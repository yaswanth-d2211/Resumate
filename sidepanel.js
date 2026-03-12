// Resumate – Side Panel Logic

document.addEventListener("DOMContentLoaded", () => {
  // ─── DOM references ───────────────────────────────────────
  const mainView = document.getElementById("main-view");
  const settingsView = document.getElementById("settings-view");

  const btnSettings = document.getElementById("btn-settings");
  const btnBack = document.getElementById("btn-back");

  const jobDescriptionEl = document.getElementById("job-description");
  const btnExtract = document.getElementById("btn-extract");

  const emailSelect = document.getElementById("email-select");
  const emailInput = document.getElementById("email-input");
  const btnAddEmail = document.getElementById("btn-add-email");

  const resumeSelect = document.getElementById("resume-select");
  const resumeFile = document.getElementById("resume-file");
  const btnUploadResume = document.getElementById("btn-upload-resume");
  const resumePreview = document.getElementById("resume-preview");
  const resumePreviewText = document.getElementById("resume-preview-text");

  const providerSelect = document.getElementById("provider-select");
  const providerKeyStatus = document.getElementById("provider-key-status");

  const formatSelect = document.getElementById("format-select");
  const pageCount = document.getElementById("page-count");

  const btnGenerate = document.getElementById("btn-generate");
  const statusMsg = document.getElementById("status-msg");

  // Settings view
  const keyOpenai = document.getElementById("key-openai");
  const keyGemini = document.getElementById("key-gemini");
  const keyAnthropic = document.getElementById("key-anthropic");
  const btnSaveKeys = document.getElementById("btn-save-keys");
  const btnClearData = document.getElementById("btn-clear-data");

  // ─── State ────────────────────────────────────────────────
  let pendingResumeText = null; // text read from the file input before saving

  // ─── View Toggling ────────────────────────────────────────
  btnSettings.addEventListener("click", () => {
    mainView.hidden = true;
    settingsView.hidden = false;
    loadApiKeys();
  });

  btnBack.addEventListener("click", () => {
    settingsView.hidden = true;
    mainView.hidden = false;
  });

  // ─── Job Description Extraction ───────────────────────────
  btnExtract.addEventListener("click", async () => {
    btnExtract.disabled = true;
    btnExtract.textContent = "Extracting…";
    showStatus("", false);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error("No active tab found.");

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "extractJobDescription",
      });

      if (response?.success && response.text) {
        jobDescriptionEl.value = response.text;
        showStatus("Job description extracted!", false);
      } else {
        throw new Error("No text returned from page.");
      }
    } catch (err) {
      showStatus("Extraction failed – make sure you're on a job posting page and try refreshing it.", true);
      console.error("Extract error:", err);
    } finally {
      btnExtract.disabled = false;
      btnExtract.textContent = "Extract from Page";
      updateGenerateButton();
    }
  });

  // ─── Email Management ─────────────────────────────────────
  btnAddEmail.addEventListener("click", () => {
    const email = emailInput.value.trim();
    if (!email) return;
    // Basic format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showStatus("Please enter a valid email address.", true);
      return;
    }

    chrome.storage.local.get({ emails: [] }, (data) => {
      const emails = data.emails;
      if (emails.includes(email)) {
        showStatus("Email already saved.", true);
        return;
      }
      emails.push(email);
      chrome.storage.local.set({ emails }, () => {
        emailInput.value = "";
        loadEmails(email);
        showStatus("Email saved.", false);
      });
    });
  });

  function loadEmails(selectValue) {
    chrome.storage.local.get({ emails: [] }, (data) => {
      emailSelect.innerHTML = '<option value="">— select saved email —</option>';
      data.emails.forEach((e) => {
        const opt = document.createElement("option");
        opt.value = e;
        opt.textContent = e;
        emailSelect.appendChild(opt);
      });
      if (selectValue) emailSelect.value = selectValue;
    });
  }

  // ─── Resume Management ────────────────────────────────────
  resumeFile.addEventListener("change", () => {
    const file = resumeFile.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      pendingResumeText = e.target.result;
      resumePreviewText.textContent =
        pendingResumeText.substring(0, 500) + (pendingResumeText.length > 500 ? "…" : "");
      resumePreview.hidden = false;
    };
    reader.readAsText(file);
  });

  btnUploadResume.addEventListener("click", () => {
    const file = resumeFile.files[0];
    if (!file || !pendingResumeText) {
      showStatus("Please select a resume file first.", true);
      return;
    }

    const name = file.name;
    chrome.storage.local.get({ resumes: {} }, (data) => {
      data.resumes[name] = pendingResumeText;
      chrome.storage.local.set({ resumes: data.resumes }, () => {
        pendingResumeText = null;
        resumeFile.value = "";
        resumePreview.hidden = true;
        loadResumes(name);
        showStatus(`Resume "${name}" saved.`, false);
      });
    });
  });

  resumeSelect.addEventListener("change", () => {
    const name = resumeSelect.value;
    if (!name) {
      resumePreview.hidden = true;
      return;
    }
    chrome.storage.local.get({ resumes: {} }, (data) => {
      const text = data.resumes[name] || "";
      resumePreviewText.textContent = text.substring(0, 500) + (text.length > 500 ? "…" : "");
      resumePreview.hidden = false;
    });
    updateGenerateButton();
  });

  function loadResumes(selectValue) {
    chrome.storage.local.get({ resumes: {} }, (data) => {
      resumeSelect.innerHTML = '<option value="">— select saved resume —</option>';
      Object.keys(data.resumes).forEach((name) => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        resumeSelect.appendChild(opt);
      });
      if (selectValue) resumeSelect.value = selectValue;
      updateGenerateButton();
    });
  }

  // ─── AI Provider Dropdown ─────────────────────────────────
  function loadProviders() {
    providerSelect.innerHTML = '<option value="">— select provider —</option>';
    Object.entries(PROMPTS.providers).forEach(([key, cfg]) => {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = cfg.displayName;
      providerSelect.appendChild(opt);
    });
  }

  providerSelect.addEventListener("change", () => {
    const key = providerSelect.value;
    if (!key) {
      providerKeyStatus.textContent = "";
      return;
    }
    chrome.storage.local.get({ apiKeys: {} }, (data) => {
      const hasKey = !!data.apiKeys[key];
      providerKeyStatus.textContent = hasKey
        ? "✓ API key configured"
        : "⚠ No API key — add one in Settings";
      providerKeyStatus.style.color = hasKey ? "#16a34a" : "#f59e0b";
    });
    updateGenerateButton();
  });

  // ─── Generate Button State ────────────────────────────────
  function updateGenerateButton() {
    const hasJd = jobDescriptionEl.value.trim().length > 0;
    const hasResume = resumeSelect.value !== "";
    const hasProvider = providerSelect.value !== "";
    btnGenerate.disabled = !(hasJd && hasResume && hasProvider);
  }

  jobDescriptionEl.addEventListener("input", updateGenerateButton);

  // Placeholder: generate button handler will be wired in a future milestone
  btnGenerate.addEventListener("click", () => {
    showStatus("AI integration coming soon — UI and extraction are ready!", false);
  });

  // ─── Settings: API Keys ───────────────────────────────────
  function loadApiKeys() {
    chrome.storage.local.get({ apiKeys: {} }, (data) => {
      keyOpenai.value = data.apiKeys.openai || "";
      keyGemini.value = data.apiKeys.gemini || "";
      keyAnthropic.value = data.apiKeys.anthropic || "";
    });
  }

  btnSaveKeys.addEventListener("click", () => {
    const apiKeys = {
      openai: keyOpenai.value.trim(),
      gemini: keyGemini.value.trim(),
      anthropic: keyAnthropic.value.trim(),
    };
    chrome.storage.local.set({ apiKeys }, () => {
      showStatus("API keys saved.", false);
    });
  });

  // ─── Settings: Clear Data ─────────────────────────────────
  btnClearData.addEventListener("click", () => {
    if (!confirm("This will remove all saved emails, resumes, and API keys. Continue?")) return;
    chrome.storage.local.clear(() => {
      loadEmails();
      loadResumes();
      loadApiKeys();
      showStatus("All data cleared.", false);
    });
  });

  // ─── Status Messages ─────────────────────────────────────
  function showStatus(msg, isError) {
    if (!msg) {
      statusMsg.hidden = true;
      return;
    }
    statusMsg.textContent = msg;
    statusMsg.className = "status " + (isError ? "error" : "success");
    statusMsg.hidden = false;
  }

  // ─── Init ─────────────────────────────────────────────────
  loadEmails();
  loadResumes();
  loadProviders();
  updateGenerateButton();
});
