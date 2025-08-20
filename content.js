(function () {
  const runPlan = async (plan) => {
    const adapters = window.__adapters || {};
    const order = [];

    if (plan.targetSite && adapters[plan.targetSite]) order.push(adapters[plan.targetSite]);
    if (/amazon/.test(location.hostname) && adapters.amazon && !order.includes(adapters.amazon)) order.push(adapters.amazon);
    if (/ebay/.test(location.hostname) && adapters.ebay && !order.includes(adapters.ebay)) order.push(adapters.ebay);
    order.push(adapters.generic);

    const query = plan.query || plan.raw || '';

    for (const adapter of order) {
      if (!adapter) continue;
      try {
        await adapter.run(query, plan);
        return;
      } catch (e) {
        console.warn('[Adapter failed, trying next]', e);
      }
    }
    alert('No adapter succeeded on this page. Try Amazon or eBay.');
  };


  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === 'RUN_PLAN') {
      const exec = () => runPlan(msg.plan).then(() => sendResponse({ ok: true })).catch(err => {
        console.error(err);
        sendResponse({ ok: false, error: String(err) });
      });
      if (document.visibilityState === 'hidden') {
        const onShow = () => { document.removeEventListener('visibilitychange', onShow, true); exec(); };
        document.addEventListener('visibilitychange', onShow, true);
      } else {
        exec();
      }
      return true;
    }
    return false;
  });

  window.addEventListener('message', (ev) => {
    const data = ev?.data;
    if (!data || data.__automator__ !== true) return;

    if (data.type === 'RE_RUN_CLICK') {
      const plan = { phase: 'click-only' };
      runPlan(plan).catch(err => console.error('Auto re-run failed:', err));
    }
  }, true);
})();
