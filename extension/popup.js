const serverInput = document.getElementById('server');
const tokenInput = document.getElementById('token');
const saveBtn = document.getElementById('save-settings');
const clipBtn = document.getElementById('clip-page');
const status = document.getElementById('status');

chrome.storage.local.get(['server', 'token'], (data) => {
  serverInput.value = data.server || '';
  tokenInput.value = data.token || '';
});

saveBtn.addEventListener('click', () => {
  chrome.storage.local.set({
    server: serverInput.value.replace(/\/$/, ''),
    token: tokenInput.value
  }, () => {
    showStatus('Settings saved', 'success');
  });
});

clipBtn.addEventListener('click', async () => {
  const server = serverInput.value.replace(/\/$/, '');
  const token = tokenInput.value;

  if (!server || !token) {
    showStatus('Configure server and token first', 'error');
    return;
  }

  clipBtn.disabled = true;
  clipBtn.textContent = 'Clipping...';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
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
      const err = await response.text();
      throw new Error(err || `HTTP ${response.status}`);
    }

    showStatus('Page saved!', 'success');
  } catch (err) {
    showStatus(err.message, 'error');
  } finally {
    clipBtn.disabled = false;
    clipBtn.textContent = 'Clip Page';
  }
});

function showStatus(msg, type) {
  status.textContent = msg;
  status.className = type;
  setTimeout(() => { status.className = ''; }, 3000);
}

