// Resumate - Background Service Worker

// Open the side panel when the extension action (toolbar icon) is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// Set side panel behavior: open on action click only (not automatically)
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
