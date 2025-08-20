// popup.js — sends the NL request to the background for orchestration.

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

document.getElementById('run').addEventListener('click', async () => {
  const nl = document.getElementById('nl').value.trim();
  const preferredSite = document.getElementById('site').value || null;
  const confirmRisky = document.getElementById('confirm-risky').checked;

  if (!nl) {
    alert('Please enter what you want the automator to do.');
    return;
  }

  const tab = await getActiveTab();
  if (!tab?.id) {
    alert('No active tab found.');
    return;
  }

  try {
    await chrome.runtime.sendMessage({
      type: 'ORCHESTRATE',
      tabId: tab.id,
      nl,
      preferredSite,
      confirmRisky
    });
    window.close();
  } catch (e) {
    console.error(e);
    alert(`Failed to start: ${e.message}`);
  }
});
