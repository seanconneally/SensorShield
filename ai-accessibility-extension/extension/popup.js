document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('shield-toggle');
  const badge = document.getElementById('status-badge');
  const button = document.getElementById('scan-btn');
  const status = document.getElementById('scan-status');
  const update = enabled => {
    toggle.checked = enabled; badge.textContent = enabled ? 'ON' : 'OFF';
    badge.className = 'badge ' + (enabled ? 'active' : 'inactive');
    button.disabled = !enabled;
  };
  const message = async action => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('Open a web page first.');
    return chrome.tabs.sendMessage(tab.id, { action });
  };
  update((await chrome.storage.local.get({ sensoryShieldEnabled: false })).sensoryShieldEnabled);
  try {
    const response = await message('GET_SENSORY_STATUS');
    update(response.data.enabled);
    status.textContent = `${response.data.protectedCount} video warnings. ${response.data.aiStatus}`;
  } catch { status.textContent = 'Open or reload a regular web page to use the shield.'; }
  toggle.addEventListener('change', async () => {
    await chrome.storage.local.set({ sensoryShieldEnabled: toggle.checked });
    update(toggle.checked);
    status.textContent = toggle.checked ? 'Automatic TikTok/Reel monitoring enabled.' : 'Protection disabled. Videos remain paused.';
  });
  button.addEventListener('click', async () => {
    button.disabled = true; status.textContent = 'Finding TikTok and Reel videos…';
    try {
      const response = await message('TRIGGER_SENSORY_SCAN');
      if (!response?.ok) throw new Error(response?.error || 'Analysis unavailable');
      status.textContent = `${response.data.protectedCount} video warnings. ${response.data.aiStatus}`;
    } catch (error) { status.textContent = `${error.message}. Local monitoring continues when enabled.`; }
    finally { button.disabled = !toggle.checked; }
  });
});
