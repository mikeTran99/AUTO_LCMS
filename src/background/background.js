/**
 * AUTO LCMS QUIZ SOLVER v2 — BACKGROUND SERVICE WORKER
 * Handles keyboard shortcut Alt+A to toggle the on-page stealth panel.
 * No content.css injection needed — Shadow DOM handles all UI styling.
 */

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-autofill-panel') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;

    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_PANEL' });
    } catch (e) {
      // Content script not loaded — inject dynamically
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['src/content/content.js']
        });
        // Wait for injection then toggle
        setTimeout(async () => {
          try {
            await chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_PANEL' });
          } catch (e2) { /* ignore */ }
        }, 600);
      } catch (injectErr) {
        // Cannot inject (restricted page) — silently ignore
      }
    }
  }
});
