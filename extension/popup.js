const serverInput = document.getElementById('server');
const tokenInput = document.getElementById('token');
const saveBtn = document.getElementById('save');
const status = document.getElementById('status');

chrome.storage.local.get(['server', 'token'], (data) => {
  serverInput.value = data.server || '';
  tokenInput.value = data.token || '';
});

saveBtn.addEventListener('click', () => {
  const server = serverInput.value.trim().replace(/\/$/, '');
  const token = tokenInput.value.trim();

  if (!server || !token) {
    status.textContent = 'Both fields are required';
    status.className = 'error';
    return;
  }

  chrome.storage.local.set({ server, token }, () => {
    window.close();
  });
});
