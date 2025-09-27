// tokens.js

function extractRawTokens(text) {
  if (!text) return [];
  const tokens = text
    .split(/\s|,/)
    .map(t => t.trim())
    .filter(t => t.length > 0);

  const candidates = [];
  const amountRegex = /([0-9OIlSbB]+(?:[.,][0-9OIlSbB]+)*%?)/g;

  for (const token of tokens) {
    const matches = token.match(amountRegex);
    if (matches) {
      matches.forEach(m => {
        if (m.length > 1 || m.includes('%')) candidates.push(m);
      });
    }
  }

  return [...new Set(candidates)];
}

function detectCurrencyHint(text) {
  if (!text) return null;
  const lower = text.toLowerCase();

  if (lower.includes('inr') || lower.includes('rs') || lower.includes('rupee') || lower.includes('rs.')) return 'INR';
  if (lower.includes('₹')) return 'INR';
  if (lower.includes('$') || lower.includes('usd')) return 'USD';
  if (lower.includes('€') || lower.includes('eur')) return 'EUR';

  return null;
}

module.exports = { extractRawTokens, detectCurrencyHint };
