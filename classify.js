const stringSimilarity = require('string-similarity');

function extractNumberFromLine(line) {
  const matches = line.replace(/,/g, '').match(/(\d+(\.\d+)?%?)/g);
  if (!matches) return null;

  // Take the last number (could be %)    
  const last = matches[matches.length - 1];
  const isPercent = last.endsWith('%');
  const value = parseFloat(last.replace('%', ''));
  return { value, isPercent };
}

function classifyAmounts(normalizedAmounts, fullText, rawTokens, provenanceMap) {
  const lines = fullText.split(/\n|\r/).map(l => l.trim()).filter(Boolean);

  const keywords = {
    subtotal: ['subtotal'],
    tax: ['tax', 'gst', 'cgst', 'sgst', 'vat'],
    total_bill: ['grand total', 'total', 'amount payable', 'total amount'],
    paid: ['paid', 'received', 'paid amount', 'amount paid'],
    due: ['due', 'balance', 'balance due', 'amount due', 'remaining'],
    discount: ['discount', 'disc', 'less']
  };

  const assignments = [];
  const seenTokens = new Set();

  for (const [type, kws] of Object.entries(keywords)) {
    for (const line of lines) {
      if (assignments.some(a => a.source.includes(line))) continue;

      const low = line.toLowerCase();

      // Check exact or fuzzy match for keyword
      let matched = kws.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(low));
      if (!matched) {
        const words = low.split(/\s+/);
        for (const word of words) {
          const bestMatch = stringSimilarity.findBestMatch(word, kws);
          if (bestMatch.bestMatch.rating >= 0.7) {
            matched = true;
            break;
          }
        }
      }

      if (matched) {
        const numInfo = extractNumberFromLine(line);
        if (numInfo && !isNaN(numInfo.value)) {
          assignments.push({
            type,
            value: numInfo.value,
            isPercent: numInfo.isPercent,
            source: `text: '${line.replace(/'/g, "\\'")}'`
          });
        }
      }
    }
  }

  const classificationConfidence = Math.min(0.95, 0.45 + assignments.length * 0.15);
  return { amounts: assignments, classificationConfidence };
}

module.exports = { classifyAmounts };
