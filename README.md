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

## Environment variables

GEMINI_API_KEY: Your Google Gemini API key for OCR. If not set, the application will use Tesseract.js for OCR.

OPENAI_API_KEY: Your OpenAI API key for AI functionalities.

PORT: The port on which the server will run (default is 3000).

## Running the Server

Start the server using Node.js:
```bash
node index.js
```
The server will start on the port specified in the .env file (default is http://localhost:3000).


## API Usage
Endpoint: /api/v1/extract

Method: POST
Content-Type: multipart/form-data (for images) or application/json (for raw text)

1. Upload an Image (Postman)
In Postman:
Select POST
URL: http://localhost:3000/api/v1/extract

Body → form-data
Key: image → Type: File → Select your receipt image

http://localhost:3000/api/v1/extract?step=4

Example Response:
```bash
{
    "pipeline": {
        "step1": {
            "raw_tokens": [
                "12345",
                "2025",
                "09",
                "27",
                "500",
                "18%",
                "270",
                "770",
                "5%"
            ],
            "currency_hint": "UNKNOWN",
            "confidence": 0.99
        },
        "step2": {
            "normalized_amounts": [
                12345,
                2025,
                9,
                27,
                500,
                18,
                270,
                770,
                5
            ],
            "normalization_confidence": 0.99
        },
        "step3": {
            "amounts": [
                {
                    "type": "subtotal",
                    "value": 1500,
                    "isPercent": false,
                    "source": "text: 'Subtotal: 1,500'"
                },
                {
                    "type": "tax",
                    "value": 270,
                    "isPercent": false,
                    "source": "text: 'GST (18%): 270'"
                },
                {
                    "type": "total_bill",
                    "value": 1770,
                    "isPercent": false,
                    "source": "text: 'Total: 1,770'"
                },
                {
                    "type": "paid",
                    "value": 1500,
                    "isPercent": false,
                    "source": "text: 'Amount Paid: 1,500'"
                },
                {
                    "type": "due",
                    "value": 270,
                    "isPercent": false,
                    "source": "text: 'Balance Due: 270'"
                },
                {
                    "type": "discount",
                    "value": 5,
                    "isPercent": true,
                    "source": "text: 'Discount Applied: 5%'"
                }
            ],
            "confidence": 0.95
        }
    },
    "final": {
        "currency": "INR",
        "amounts": [
            {
                "type": "subtotal",
                "value": 1500,
                "isPercent": false,
                "source": "text: 'Subtotal: 1,500'"
            },
            {
                "type": "tax",
                "value": 270,
                "isPercent": false,
                "source": "text: 'GST (18%): 270'"
            },
            {
                "type": "total_bill",
                "value": 1770,
                "isPercent": false,
                "source": "text: 'Total: 1,770'"
            },
            {
                "type": "paid",
                "value": 1500,
                "isPercent": false,
                "source": "text: 'Amount Paid: 1,500'"
            },
            {
                "type": "due",
                "value": 270,
                "isPercent": false,
                "source": "text: 'Balance Due: 270'"
            },
            {
                "type": "discount",
                "value": 5,
                "isPercent": true,
                "source": "text: 'Discount Applied: 5%'"
            }
        ],
        "status": "ok"
    }
}
```

##Normalization & Classification

Normalization: Corrects OCR misreads, converts percentages, and ensures numeric format.

Classification: Uses keyword matching and fuzzy string matching (string-similarity) to assign amounts to categories.

##Fallbacks

If GEMINI_API_KEY is missing or Gemini OCR fails, the system uses Tesseract.js for OCR.

Default currency is INR if no hints are found.

##License
MIT License

