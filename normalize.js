// normalize.js

const commonMap = {
  'O': '0', 'o': '0',
  'l': '1', 'I': '1', 'i': '1',
  'S': '5', 's': '5',
  'B': '8', '|': '1',
   'g': '9' // add common OCR misreads
};


function fixToken(token) {
  if (!token) return null;

  let t = token.trim();

  const isPercent = t.endsWith('%');
  if (isPercent) t = t.slice(0, -1);

  t = t.replace(/,/g, ''); // remove commas

  t = t.split('').map(ch => commonMap[ch] || ch).join('');

  if (!/^\d+(\.\d+)?$/.test(t)) return null;

  return { value: parseFloat(t), isPercent, raw: token };
}

function normalizeAmounts(rawTokens) {
  const results = [];
  const provenanceMap = {};

  for (const token of rawTokens) {
    const fixed = fixToken(token);
    if (fixed) {
      results.push(fixed);
      provenanceMap[token] = fixed;
      console.log(`Raw token: '${token}' -> Normalized:`, fixed);
    }
  }

  const normalizationConfidence = Math.min(0.99, 0.5 + results.length * 0.15);
  return { normalizedAmounts: results, normalizationConfidence, provenanceMap };
}

module.exports = { normalizeAmounts, fixToken };
