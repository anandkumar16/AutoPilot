(function () {
  const { waitForSelector, typeInto, safeClick, waitForClickable } = window.__dom;

  const selectors = {
    searchInput: 'input#gh-ac',
    searchButton: 'input#gh-btn',
    resultsContainer: 'ul.srp-results, div.srp-results',
    firstResultLink: 'ul.srp-results li.s-item a.s-item__link, div.srp-results div.s-item a.s-item__link'
  };

  async function runEbay(query) {
    const input = await waitForSelector(selectors.searchInput, { timeoutMs: 20000 });
    const button = await waitForSelector(selectors.searchButton, { timeoutMs: 20000 });
    typeInto(input, query);
    await safeClick(button);

    await waitForSelector(selectors.resultsContainer, { timeoutMs: 30000 });
    const a = document.querySelector(selectors.firstResultLink);
    if (!a) throw new Error('No eBay result link found');
    const ok = await waitForClickable(a, 10000);
    if (!ok) throw new Error('First result not clickable');
    a.click();
  }

  window.__adapters = window.__adapters || {};
  window.__adapters.ebay = { match: () => /(^|\.)ebay\./i.test(location.hostname), run: runEbay };
})();
