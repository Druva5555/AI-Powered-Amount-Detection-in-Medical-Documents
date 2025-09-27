# AI-Powered Amount Detection in Medical Documents


A Node.js service to extract, normalize, and classify financial amounts from receipts or medical bills (typed or scanned). It supports both OCR from images and direct text input.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Usage](#api-usage)
- [Normalization & Classification](#normalization--classification)
- [Fallbacks](#fallbacks)
- [License](#license)

---

## Features

- Extract numeric tokens from receipts/bills.
- Normalize OCR errors (common misreads like `O` → `0`, `l` → `1`, etc.).
- Detect currency from text hints (`INR`, `USD`, `EUR`).
- Classify amounts as `subtotal`, `tax`, `total_bill`, `paid`, `due`, `discount`.
- Supports image upload and text input.
- Fallback OCR using Tesseract if Google Gemini OCR fails.

---

## Architecture

1. **OCR / Text Extraction** (`ocr.js` / `ocr_helpers.js`)  
   - Uses Google Gemini API for OCR if `GEMINI_API_KEY` is set.  
   - Falls back to Tesseract.js for OCR.

2. **Token Extraction** (`tokens.js`)  
   - Extracts numeric tokens from text.  
   - Detects currency hints.

3. **Normalization** (`normalize.js`)  
   - Fixes OCR misreads.  
   - Converts percentages, removes commas, and ensures numeric format.

4. **Classification** (`classify.js`)  
   - Assigns normalized amounts to categories based on keywords.  
   - Uses fuzzy string matching for keyword detection.

5. **Server** (`index.js`)  
   - Express API for handling `/api/v1/extract` POST requests.  
   - Supports both file uploads and raw text input.

---

## Setup

1. Clone the repository:

```bash
git clone <your-repo-url>
cd <repo-folder>
