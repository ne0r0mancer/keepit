const POPUP_WIDTH = 320;
const POPUP_HEIGHT = 280;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'keepit-settings',
    title: 'KeepIt Settings',
    contexts: ['action']
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'keepit-settings') {
    openSettingsCentered();
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  const { server, token } = await chrome.storage.local.get(['server', 'token']);

  if (!server || !token) {
    openSettingsCentered();
    return;
  }

  await clipPage(tab, server, token);
});

async function openSettingsCentered() {
  const currentWindow = await chrome.windows.getCurrent();
  
  const left = Math.round(currentWindow.left + (currentWindow.width - POPUP_WIDTH) / 2);
  const top = Math.round(currentWindow.top + (currentWindow.height - POPUP_HEIGHT) / 2);

  chrome.windows.create({
    url: 'popup.html',
    type: 'popup',
    width: POPUP_WIDTH,
    height: POPUP_HEIGHT,
    left,
    top
  });
}

async function clipPage(tab, server, token) {
  try {
    await chrome.action.setBadgeText({ text: '...' });
    await chrome.action.setBadgeBackgroundColor({ color: '#666' });

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.innerText
    });

    const response = await fetch(`${server}/clip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        url: tab.url,
        title: tab.title,
        content: result,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    await chrome.action.setBadgeText({ text: '✓' });
    await chrome.action.setBadgeBackgroundColor({ color: '#2a2' });
  } catch (err) {
    await chrome.action.setBadgeText({ text: '✗' });
    await chrome.action.setBadgeBackgroundColor({ color: '#a22' });
    console.error('KeepIt clip failed:', err);
  }

  setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
}
