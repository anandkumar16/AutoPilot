(function () {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  function waitForSelector(selector, { root = document, timeoutMs = 30000 } = {}) {
    return new Promise((resolve, reject) => {
      const found = root.querySelector(selector);
      if (found) return resolve(found);

      const obs = new MutationObserver(() => {
        const el = root.querySelector(selector);
        if (el) {
          obs.disconnect();
          clearTimeout(tid);
          resolve(el);
        }
      });
      obs.observe(root.documentElement || root, { childList: true, subtree: true });

      const tid = setTimeout(() => {
        obs.disconnect();
        reject(new Error(`Timeout waiting for selector: ${selector}`));
      }, timeoutMs);
    });
  }

  async function ensureVisible(el, timeoutMs = 12000) {
    const start = performance.now();
    while (performance.now() - start < timeoutMs) {
      const rect = el.getBoundingClientRect();
      const visible = rect.width > 0 && rect.height > 0;
      const style = getComputedStyle(el);
      const notCovered = style.visibility !== 'hidden' && style.pointerEvents !== 'none';
      if (visible && notCovered) return true;
      el.scrollIntoView({ block: 'center' });
      await sleep(80);
    }
    return false;
  }

  async function safeClick(el, tries = 5) {
    for (let i = 0; i < tries; i++) {
      el.scrollIntoView({ block: 'center' });
      const ok = await ensureVisible(el, 3000);
      if (ok) {
        el.click();
        return true;
      }
      await sleep(150 + i * 150);
    }

    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    return true;
  }


  async function dismissOverlays() {
    const candidates = [
      '#sp-cc-accept', 
      'input[name="accept"]',
      'button[aria-label*="accept" i]',
      'input[name="glowDoneButton"]', 
      'button[aria-label*="close" i]',
      '.a-button-close'
    ];
    for (const sel of candidates) {
      const btn = document.querySelector(sel);
      if (btn && btn.offsetParent) {
        try { btn.click(); } catch {}
        await sleep(200);
      }
    }
  }

  function textContains(el, regex) {
    return regex.test((el.textContent || '').trim());
  }

  window.__dom = { sleep, waitForSelector, safeClick, ensureVisible, dismissOverlays, textContains };
})();
