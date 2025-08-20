

function parseNaturalLanguage(nl) {
  const s = nl.toLowerCase();


  let targetSite = null;
  if (/\bamazon\b/.test(s)) targetSite = 'amazon';
  else if (/\bebay\b/.test(s)) targetSite = 'ebay';


  const moneyMatch = s.match(/(?:under|below|less than)\s*([₹$€£]?\s?\d{3,})(?:\s*(inr|rs|usd|eur|gbp))?/i);
  const budget = moneyMatch ? moneyMatch[1].replace(/\s/g, '') : null;


  let query = s
    .replace(/\b(on|at)\s+(amazon|ebay)\b/g, '')
    .replace(/(?:under|below|less than)\s*[₹$€£]?\s?\d{3,}(?:\s*(inr|rs|usd|eur|gbp))?/gi, '')
    .trim();

  if (!query) {
    query = nl.trim();
  }


  let riskyAction = null;
  if (/\b(add to cart|buy|checkout|place order|submit)\b/.test(s)) {
    riskyAction = (s.match(/\b(add to cart|buy|checkout|place order|submit)\b/) || []);
  }

  return { query, budget, targetSite, riskyAction, raw: nl };
}

self.parseNaturalLanguage = parseNaturalLanguage;
