require("dotenv").config();
console.log("Loaded GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "✅ Present" : "❌ Missing");

const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');   
const fs = require('fs');
// Import pipeline modules
const { ocrFromBuffer } = require('./ocr');
const { extractRawTokens, detectCurrencyHint } = require('./tokens');
const { normalizeAmounts } = require('./normalize');
const { classifyAmounts } = require('./classify');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Step 1 - Extract (OCR/Text)
app.post('/api/v1/extract', upload.single('image'), async (req, res) => {
  try {
    let text = req.body.text || '';

    // OCR if an image is uploaded
    if (req.file) {
      const buffer = fs.readFileSync(req.file.path);
      const result = await ocrFromBuffer(buffer);
      text = result.text;
      fs.unlinkSync(req.file.path);
    }

    if (!text || text.trim() === '') {
      return res.json({ status: 'no_amounts_found', reason: 'document too noisy' });
    }

    // Step 1: OCR / Raw Tokens
    const rawTokens = extractRawTokens(text);
    const currencyHint = detectCurrencyHint(text) || 'UNKNOWN';

    if (rawTokens.length === 0) {
      return res.json({ status: 'no_amounts_found', reason: 'no numeric tokens found' });
    }

    const step1 = {
      raw_tokens: rawTokens,
      currency_hint: currencyHint,
      confidence: Math.min(0.99, 0.5 + rawTokens.length * 0.06)
    };

    // Step 2: Normalization
    const { normalizedAmounts, normalizationConfidence, provenanceMap } = normalizeAmounts(rawTokens);
    const step2 = {
      normalized_amounts: normalizedAmounts.map(x => x.value),
      normalization_confidence: normalizationConfidence
    };

    // Step 3: Classification
    const { amounts, classificationConfidence } = classifyAmounts(
      normalizedAmounts, text, rawTokens, provenanceMap
    );
    const step3 = {
      amounts,
      confidence: classificationConfidence
    };

    // Step 4: Final Output
    const finalAmounts = amounts.map(a => ({
      ...a,
      value: a.value
    }));

    const finalCurrency = currencyHint && currencyHint !== 'UNKNOWN' ? currencyHint : 'INR';

    res.json({
      pipeline: { step1, step2, step3 },
      final: { currency: finalCurrency, amounts: finalAmounts, status: 'ok' }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});
