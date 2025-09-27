# AI-Powered Amount Detection in Medical Documents

An AI-driven Node.js service designed to extract, normalize, and classify financial amounts from medical receipts and bills. This application supports both Optical Character Recognition (OCR) from images and direct text input.

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

- **OCR & Text Extraction**: Extracts text from medical receipts and bills using OCR.
- **Token Extraction**: Identifies numeric tokens from the extracted text.
- **Amount Normalization**: Corrects common OCR errors and standardizes amounts.
- **Currency Detection**: Detects currency symbols and abbreviations (e.g., ₹, INR, USD).
- **Amount Classification**: Categorizes amounts into predefined types such as subtotal, tax, total bill, paid, due, and discount.
- **Fallback Mechanism**: Utilizes Tesseract.js for OCR if Google Gemini API fails or is unavailable.

---

## Architecture

The application follows a modular architecture:

1. **OCR / Text Extraction** (`ocr.js`, `ocr_helpers.js`)  
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
git clone https://github.com/Druva5555/AI-Powered-Amount-Detection-in-Medical-Documents.git
cd AI-Powered-Amount-Detection-in-Medical-Documents
```
2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory with the following content:
```bash
GEMINI_API_KEY=<your_gemini_api_key>
OPENAI_API_KEY=<your_openai_api_key>
PORT=3000
```
Replace <your_gemini_api_key> and <your_openai_api_key> with your actual API keys.

