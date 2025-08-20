importScripts('planning/nl_parser.js');

const SCRIPTS = [
  'dom.js',
  'adapters/amazon.js',
  'adapters/ebay.js',
  'adapters/generic.js',
  'content.js'
];

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    if (msg?.type === 'ORCHESTRATE') {
      const { tabId, nl, preferredSite, confirmRisky } = msg;

      const plan = parseNaturalLanguage(nl); 
      if (preferredSite) plan.targetSite = preferredSite;


      await chrome.storage.session.set({ lastPlan: plan });

      if (confirmRisky && plan.riskyAction) {
        const ok = await confirmInPopup(`This will perform: ${plan.riskyAction}. Proceed?`);
        if (!ok) return;
      }

      await chrome.scripting.executeScript({ target: { tabId }, files: SCRIPTS });
      await chrome.tabs.sendMessage(tabId, { type: 'RUN_PLAN', plan });
    }
    sendResponse({ ok: true });
  })().catch(err => {
    console.error('[SW] Orchestration error:', err);
    sendResponse({ ok: false, error: String(err) });
  });
  return true; 
});

async function confirmInPopup(text) {
  return new Promise(resolve => {
    resolve(true);
  });
}
