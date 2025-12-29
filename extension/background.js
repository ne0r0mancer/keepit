// Service worker for KeepIt extension
// Currently minimal - popup.js handles the clip action directly
// This file is required by manifest v3 for future extensibility

chrome.runtime.onInstalled.addListener(() => {
  console.log('KeepIt extension installed');
});

