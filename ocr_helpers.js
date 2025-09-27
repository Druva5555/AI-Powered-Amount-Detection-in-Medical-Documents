// ocr_helpers.js
const Tesseract = require('tesseract.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.OPENAI_API_KEY;
let genAI = null;
if (apiKey) {    
  genAI = new GoogleGenerativeAI(apiKey);
}

async function ocrFromBuffer(buffer) {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([
        {
          inlineData: {
            data: buffer.toString("base64"),
            mimeType: "image/png"
          }
        },
        { text: "Extract only the visible text from this medical bill/receipt image." }
      ]);
      const text = result.response.text();
      return { text };
    } catch (e) {
      console.error("Gemini OCR failed, fallback to Tesseract:", e.message);
    }
  }

  // fallback OCR
  const { data } = await Tesseract.recognize(buffer, 'eng');
  return { text: data.text };
}

async function ocrFromImage(imagePath) {
  const { data } = await Tesseract.recognize(imagePath, 'eng');
  return { text: data.text };
}

function extractRawTokens(text) {
  if (!text) return [];
  const tokens = text.split(/\s|,/).map(t => t.trim()).filter(t => t.length > 0);
  const candidates = [];
  const amountRegex = /([0-9OIlSbB]+(?:[.,][0-9OIlSbB]+)*%?)/g;

  for (const token of tokens) {
    const matches = token.match(amountRegex);
    if (matches) {
      matches.forEach(m => candidates.push(m));
    }
  }

  return [...new Set(candidates)];
}

function detectCurrencyHint(text) {
  if (!text) return null;
  text = text.toLowerCase();
  if (text.includes('inr') || text.includes('rs') || text.includes('rupee') || text.includes('rs.')) return 'INR';
  if (text.includes('₹')) return 'INR';
  if (text.includes('$') || text.includes('usd')) return 'USD';
  if (text.includes('€') || text.includes('eur')) return 'EUR';
  return null;
}

module.exports = { ocrFromBuffer, ocrFromImage, extractRawTokens, detectCurrencyHint };
