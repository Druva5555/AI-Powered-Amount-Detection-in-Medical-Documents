// ocr.js
const Tesseract = require('tesseract.js');

async function ocrFromBuffer(buffer) {
  const { data } = await Tesseract.recognize(buffer, 'eng');
  return { text: data.text };
}    

async function ocrFromImage(imagePath) {
  const { data } = await Tesseract.recognize(imagePath, 'eng');
  return { text: data.text };
}

module.exports = { ocrFromBuffer, ocrFromImage };
