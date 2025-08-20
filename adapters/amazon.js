(function () {
  const { waitForSelector, safeClick, dismissOverlays } = window.__dom;

  const selectors = {
    searchInput: 'input#twotabsearchtextbox',
    searchButton: 'input#nav-search-submit-button, input.nav-input[type="submit"]',
    resultsContainer: 'div.s-main-slot',
    resultLinksAll: [
      'div.s-main-slot [data-component-type="s-search-result"] h2 a',
      'div.s-main-slot [data-component-type="s-search-result"] a.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal',
      'div.s-main-slot [data-component-type="s-search-result"] a[href*="/dp/"]',
      'div.s-main-slot [data-component-type="s-search-result"] a.a-link-normal[href]'
    ],
    resultTile: '[data-component-type="s-search-result"]',
    sponsoredBadges: [
      '.s-sponsored-label-text',
      '[aria-label="Sponsored"]',
      '[data-component-type="sp-sponsored-result"]',
      '[data-cel-widget^="MAIN-SPONSOR-"]',
      '[data-cel-widget^="MAIN-SLOTS_PROMOTED"]'
    ]
  };

  function isSponsored(tile) {
    if (!tile) return false;
    for (const sel of selectors.sponsoredBadges) {
      const n = tile.querySelector(sel);
      if (n && n.offsetParent) return true;
    }
    const head = (tile.textContent || '').slice(0, 200);
    return /\bSponsored\b/i.test(head);
  }

  function getFirstOrganicLink() {
    for (const sel of selectors.resultLinksAll) {
      const links = Array.from(document.querySelectorAll(sel));
      if (!links.length) continue;
      const mapped = links
        .map(a => ({ a, tile: a.closest(selectors.resultTile) }))
        .filter(x => x.tile && x.a && x.a.href);
      const organic = mapped.filter(x => !isSponsored(x.tile));
      if (organic.length) return organic[0].a;
      if (mapped.length) return mapped.a;
    }
    return null;
  }


  async function phaseSearch(query) {
    await dismissOverlays();
    const input = await window.__dom.waitForSelector(selectors.searchInput, { timeoutMs: 30000 });
    const button = await window.__dom.waitForSelector(selectors.searchButton, { timeoutMs: 30000 });


    input.focus();
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.value = query;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await safeClick(button);

    try {
      await window.__dom.waitForSelector(selectors.resultsContainer, { timeoutMs: 45000 });
      setTimeout(() => {

        window.postMessage({ __automator__: true, type: 'RE_RUN_CLICK' }, '*');
      }, 350);
    } catch (e) {
      console.warn('Results container not found in time:', e);
    }
  }


  async function phaseClickFirst() {
    await dismissOverlays();
    await window.__dom.waitForSelector(selectors.resultsContainer, { timeoutMs: 45000 });

    let link = null;
    const start = performance.now();
    while (!link && performance.now() - start < 15000) {
      link = getFirstOrganicLink();
      if (!link) await window.__dom.sleep(200);
    }
    if (!link) throw new Error('No result link found.');

    await dismissOverlays();
    await safeClick(link);
  }


  async function runAmazon(query, plan) {

    if (plan && plan.phase === 'click-only') {
      return phaseClickFirst();
    }
    return phaseSearch(query);
  }

  window.__adapters = window.__adapters || {};
  window.__adapters.amazon = {
    match: () => /(^|\.)amazon\./i.test(location.hostname),
    run: runAmazon
  };
})();
