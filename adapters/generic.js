(function () {
  const { waitForSelector, typeInto, safeClick } = window.__dom;

  async function runGeneric(query) {
    const input = await waitForSelector('input[type="search"], input[name="q"], input[aria-label*="search" i]', { timeoutMs: 15000 });
    typeInto(input, query);

    const button = document.querySelector('button[type="submit"], input[type="submit"], button[aria-label*="search" i]');
    if (button) await safeClick(button);
    else input.form ? input.form.submit() : input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    await waitForSelector('a', { timeoutMs: 20000 });
    const links = Array.from(document.querySelectorAll('a[href]')).filter(a => a.offsetParent && a.href && !a.href.startsWith('javascript:'));
    if (links.length) links[0].click();
  }

  window.__adapters = window.__adapters || {};
  window.__adapters.generic = { match: () => true, run: runGeneric };
})();
