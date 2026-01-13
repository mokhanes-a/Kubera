# Kubera - AI-Powered E-Commerce Pricing Strategy Tool

**Kubera** is an intelligent market analysis tool that helps e-commerce merchants make data-driven pricing decisions. It uses Google Vertex AI with web search grounding to analyze real-time market prices, customer feedback, and competitive positioning to generate actionable recommendations for increasing sales.

---

## 🎯 What Does This Tool Do?

Kubera performs a comprehensive 3-step analysis for any product:

1. **Price Discovery** - Searches the web for current prices across multiple retailers
2. **Customer Analysis** - Analyzes reviews, feedback, and market sentiment  
3. **Strategy Generation** - Provides actionable pricing recommendations with reasoning

**Output:** Clear, merchant-friendly recommendations based on industry-standard pricing metrics (not AI opinions).

---

## ✨ Key Features

✅ **Real-Time Price Comparison** - Searches 5+ retailers for current prices  
✅ **Customer Sentiment Analysis** - Identifies strengths, weaknesses, and deal-breakers  
✅ **Rule-Based Recommendations** - Uses deterministic formulas (not AI guesses)  
✅ **Festival Detection** - Adjusts strategy for Indian festivals/sale seasons  
✅ **Image Support** - Can analyze product images for exact variant matching  
✅ **Confidence Scoring** - Shows reliability of recommendations  

---

## 📊 Pricing Metrics & Formulas

Kubera uses **industry-standard retail pricing formulas** to make decisions:

### 1️⃣ Price Index (Primary Metric)
```
Price Index = (Your Price / Median Market Price) × 100
```

**Interpretation:**
- `< 95` → Aggressive pricing (underpriced)
- `95-105` → Market aligned (optimal)
- `105-108` → Moderately overpriced  
- `> 108` → Significantly overpriced

### 2️⃣ Price Spread (Market Volatility)
```
Price Spread % = ((Max - Min) / Median) × 100
```

**Interpretation:**
- `< 10%` → Stable market, high confidence
- `10-20%` → Moderate variation
- `> 20%` → Volatile market, low confidence

### 3️⃣ Competitive Rank
```
Rank = Your position when all prices sorted (1 = cheapest)
```

### 4️⃣ Position Percentile
```
Position Percentile = (Rank / Total Retailers) × 100
```

**Interpretation:**
- `0-25%` → Bottom quartile (cheapest)
- `25-75%` → Middle range (competitive)
- `75-100%` → Top quartile (premium)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Google Cloud Account** with Vertex AI enabled
- **Google Cloud Service Account** with credentials

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd Kubera

# Install dependencies
npm install
# or
pnpm install
```

---

## ⚙️ Setup & Configuration

### Step 1: Google Cloud Setup

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or use an existing one
   - Note your **Project ID**

2. **Enable Required APIs**
   ```bash
   gcloud services enable aiplatform.googleapis.com
   gcloud services enable generativelanguage.googleapis.com
   ```

3. **Create Service Account**
   ```bash
   # Create service account
   gcloud iam service-accounts create kubera-sa \
     --display-name="Kubera AI Service Account"

   # Grant Vertex AI User role
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:kubera-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```

4. **Download Credentials**
   ```bash
   gcloud iam service-accounts keys create ~/kubera-credentials.json \
     --iam-account=kubera-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

   **OR** Use Application Default Credentials:
   ```bash
   gcloud auth application-default login
   gcloud auth application-default set-quota-project YOUR_PROJECT_ID
   ```

### Step 2: Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.examples .env
```

Edit `.env` with your actual values:

```env
# Path to your service account credentials (if using service account)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/kubera-credentials.json

# OR use Application Default Credentials path (if using gcloud auth)
GOOGLE_APPLICATION_CREDENTIALS=/Users/YOUR_USERNAME/.config/gcloud/application_default_credentials.json

# Your Google Cloud Project ID
GOOGLE_VERTEX_PROJECT=your-project-id

# Google Cloud region (where Vertex AI models run)
GOOGLE_VERTEX_LOCATION=us-central1

# Project ID (can be same as GOOGLE_VERTEX_PROJECT)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

**⚠️ Important:** 
- Do NOT add spaces around `=` signs in `.env` file
- Use absolute paths for `GOOGLE_APPLICATION_CREDENTIALS`
- Ensure the credentials file has proper permissions

---

## 💰 Pricing & Costs

### Google Vertex AI Pricing (Gemini 2.5 Flash)

Kubera uses **Google Vertex AI** with the **Gemini 2.5 Flash** model. This is a **PAID service**.

**Current Pricing (as of Jan 2026):**

| Component | Cost per 1M Tokens |
|-----------|-------------------|
| Input Tokens | $0.075 |
| Output Tokens | $0.30 |

**Typical Cost Per Product Analysis:**

| Operation | Tokens Used | Estimated Cost |
|-----------|-------------|----------------|
| Price Search | ~1,000 input, ~500 output | $0.00023 |
| Customer Feedback | ~1,500 input, ~2,000 output | $0.00071 |
| Market Strategy | ~2,000 input, ~1,500 output | $0.00060 |
| **Total per product** | **~8,000 tokens** | **~$0.0015 (₹0.12)** |

**Monthly Estimates:**
- 100 products/month: ~$0.15 (~₹12)
- 1,000 products/month: ~$1.50 (~₹125)
- 10,000 products/month: ~$15 (~₹1,250)

**Web Search Grounding:**
- Included in Vertex AI pricing
- No additional charges for web search functionality

**Free Tier:**
- Google Cloud offers $300 free credits for new users
- Enough for ~200,000 product analyses

**Monitor Your Usage:**
```bash
# View billing
gcloud billing accounts list
gcloud billing projects describe YOUR_PROJECT_ID

# Set budget alerts in Google Cloud Console
# Billing → Budgets & Alerts
```

---

## 📖 Usage

### Run the Complete Analysis

```bash
npm start
# or
pnpm start
```

### What Happens:

1. **Enter Product Name** when prompted
   ```
   📦 Enter product name: iPhone 15 Pro 256GB
   ```

2. **Price Search** - Searches web for prices from retailers
   ```
   ⏳ Searching product prices across retailers...
   ✅ Found 6 retailers
   ```

3. **Customer Analysis** - Analyzes reviews and feedback
   ```
   ⏳ Analyzing customer feedback and expectations...
   ✅ Customer feedback analyzed
   ```

4. **Enter Your Price** when prompted
   ```
   💰 Enter your merchant price (in ₹): 89999
   ```

5. **Get Recommendations** - Detailed pricing strategy
   ```
   📊 PRICING & SALES RECOMMENDATION
   
   ✅ RECOMMENDED ACTIONS
   
   💰 Action 1: Reduce price by ₹1,500 - ₹2,000
      Why this works:
      • Your price is 8.7% higher than market median
      • Ranked 6 of 6 sellers
      • Customers choose cheaper alternatives
      📈 Expected Impact: Higher conversion rate
   ```

---

## 📁 Project Structure

```
Kubera/
├── main.ts                    # Main entry point
├── web-search.ts              # Price discovery module
├── customer-expectation.ts    # Customer feedback analysis
├── market-analysis.ts         # Pricing strategy engine
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── .env                       # Environment variables (create this)
├── .env.examples              # Environment template
└── README.md                  # This file
```

### Module Breakdown

**`web-search.ts`**
- Searches for product prices across retailers
- Supports image-based product matching
- Returns structured JSON with prices

**`customer-expectation.ts`**
- Analyzes customer reviews and feedback
- Identifies strengths, weaknesses, deal-breakers
- Determines purchase motivators

**`market-analysis.ts`**
- Calculates pricing metrics (Price Index, Spread, etc.)
- Applies rule-based recommendations
- Detects festivals and adjusts strategy

**`main.ts`**
- Orchestrates the complete analysis flow
- Handles CLI input/output
- Displays formatted results

---

## 🛠️ Advanced Usage

### With Product Images

```typescript
import { searchProductPrices } from "./web-search";

const result = await searchProductPrices({
  productName: "iPhone 15 Pro",
  images: [
    "https://example.com/product.jpg",
    "/path/to/local/image.jpg"
  ]
});
```

### Programmatic API

```typescript
import { analyzeMarketStrategy } from "./market-analysis";

const strategy = await analyzeMarketStrategy(
  priceData,
  feedbackData,
  29999 // Your merchant price
);

console.log(strategy.recommendations);
```

---

## 🎯 Decision-Making Logic

### How Recommendations Are Generated

Kubera uses **deterministic rules** (not AI opinions):

#### For OVERPRICED Products (Price Index > 108):
1. **Primary:** Reduce price by 3-5%
2. **Alternative:** Add value bundle (bank discounts, free delivery)
3. **Urgency:** Create flash sales or limited-time offers

#### For MARKET-ALIGNED Products (Price Index 95-108):
1. **Primary:** Hold price, focus on conversion
2. **Secondary:** Improve product listing quality
3. **Tertiary:** Highlight product strengths

#### For UNDERPRICED Products (Price Index < 95):
1. **Primary:** Increase price by 1-3%
2. **Alternative:** Maintain price, push volume
3. **Always:** Address customer deal-breakers

### LLM Role

The AI (Gemini 2.5 Flash) is used **ONLY** for:
- ✅ Gathering real-time data via web search
- ✅ Explaining recommendations in natural language
- ✅ Adding context from customer feedback

The AI does **NOT**:
- ❌ Decide actions (rules decide)
- ❌ Change numbers (formulas decide)
- ❌ Invent recommendations (templates decide)

**This ensures trustable, reproducible results.**

---

## 🔧 Troubleshooting

### Common Issues

**1. Authentication Error**
```
Error: GOOGLE_AI_API_KEY environment variable is not set
```
**Fix:** Check your `.env` file has correct `GOOGLE_APPLICATION_CREDENTIALS` path

**2. No Web Search Results**
```
⚠️ No results found for the product
```
**Fix:** 
- Check product name spelling
- Try more generic search terms
- Verify internet connection

**3. JSON Parsing Error**
```
Failed to parse JSON response: Unterminated string
```
**Fix:**
- Response was truncated
- Already handled with automatic retry
- Increase `maxTokens` if needed

**4. Rate Limiting**
```
429 Too Many Requests
```
**Fix:**
- Wait a few seconds between requests
- Check your Google Cloud quota limits

---

## 📊 Sample Output

```
======================================================================
📊 PRICING & SALES RECOMMENDATION
======================================================================

📦 Product: iQOO Neo 10R (8GB / 128GB)

🔍 MARKET OVERVIEW

   Retailers Tracked: 5
   Price Range: ₹26,999 – ₹27,286
   Market Median: ₹26,999
   Your Price: ₹30,999

📈 CORE METRICS

   Price Spread: 1.1% - Excellent (< 10% = Stable Market)
   Price Index: 114.8 - High (> 108 = Overpriced)

⚠️ CURRENT SITUATION

   📈 Priced HIGHER than market
   14.8% above median
   Rank: MOST EXPENSIVE

✅ RECOMMENDED ACTIONS

💰 Action 1: Reduce price by ₹3,200 - ₹4,160 (High Confidence)
   Category: Pricing
   Why this works:
   • Price is 14.8% above market median
   • Ranked 6 of 6 sellers
   • Customers choose cheaper alternatives
   📈 Expected Impact: Higher conversion and better visibility

🎁 Action 2: Add value bundle instead of price cut (Medium Confidence)
   Category: Value-Add
   Why this works:
   • Protects margin while improving perceived value
   • Bank discounts or free delivery reduce effective cost
   📈 Expected Impact: Maintains margin while improving attractiveness

======================================================================
💡 SUMMARY
======================================================================

   Price 14.8% above market → Reduce price by ₹3,200 - ₹4,160
   Position: Overpriced

======================================================================
```

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Support for more countries/currencies
- Additional pricing models
- Enhanced festival detection
- Multi-language support

---

## 📄 License

ISC License

---

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Google Cloud documentation for Vertex AI
3. Open an issue in the repository

---

## 🔗 Related Resources

- [Google Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Gemini API Pricing](https://cloud.google.com/vertex-ai/pricing)
- [NeuroLink Library](https://github.com/juspay/neurolink)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## 📝 Notes

- **Data Privacy:** All data is processed via Google Cloud. No data is stored by Kubera.
- **API Costs:** Monitor your Google Cloud billing to avoid unexpected charges.
- **Rate Limits:** Vertex AI has rate limits. Add delays between bulk requests.
- **Accuracy:** Web search results may vary. Always verify critical business decisions.

---

**Built with ❤️ for E-Commerce Merchants** - AI-Powered Pricing & Market Analysis Engine

An intelligent pricing recommendation system that helps e-commerce merchants optimize their product pricing using real-time market data and customer feedback analysis.

## Overview

Kubera leverages AI (Google Vertex AI via NeuroLink) to:
- **Search real-time product prices** across multiple retailers
- **Analyze customer feedback** from reviews and market sentiment
- **Generate actionable pricing recommendations** based on market position

## Features

| Feature | Description |
|---------|-------------|
| 🔍 **Price Discovery** | Real-time web search for competitor prices across 5+ retailers |
| 📊 **Market Analysis** | Calculate price index, competitive rank, and market position |
| 💬 **Customer Insights** | Product-specific feedback analysis (excludes delivery/service issues) |
| 📈 **Smart Recommendations** | 2-5 actionable suggestions with concise reasoning |
| 🎉 **Festival Awareness** | Automatic detection of Indian festival seasons for strategy |
| 🔄 **Auto-Retry** | Automatic retry on API failures with proper error handling |
| ⏳ **Progress Indicators** | Real-time CLI status updates during processing |

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd Kubera

# Install dependencies
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
# Google Cloud credentials (for Vertex AI)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

## Usage

```bash
npm start
```

The system will:
1. Search for product prices across multiple retailers
2. Analyze customer feedback and expectations
3. Prompt you to enter your merchant price
4. Generate a comprehensive pricing recommendation report

📊 PRICING & SALES RECOMMENDATION

📦 Product: Transformer Series Gaming Chair

🔍 Market Overview
   Retailers tracked: 5
   Market price range: ₹9,999 – ₹15,999
   Market median price: ₹10,999
   Your current price: ₹10,999

⚠️ Current Situation
   ✅ Your product is priced COMPETITIVELY with the market
   Your price is ~0.0% below the market median
   You are ranked 2 of 6

✅ Recommendations
   📢 1. Hold current price - focus on conversion optimization
   📢 2. Improve product listing quality and visibility
   ⭐ 3. Address critical customer concerns
   📢 4. Highlight product strengths in marketing
```
## Sample Output

```
🚀 KUBERA - AI-Powered Pricing & Market Analysis

⏳ Searching product prices across retailers...
✅ Found 5 retailers

⏳ Analyzing customer feedback and expectations...
✅ Customer feedback analyzed

💰 Enter your merchant price (in ₹): 10999

⏳ Generating pricing recommendations...
✅ Recommendations ready

📊 PRICING & SALES RECOMMENDATION

� Product: Transformer Series Gaming Chair

� Market Overview
   Retailers: 5
   Price range: ₹9,999 – ₹15,999
   Market median: ₹10,999
   Your price: ₹10,999

⚠️ Current Situation
   ✅ Priced COMPETITIVELY
   0.0% below median
   Rank: 2 of 6

✅ Recommended Actions

📢 1. Hold current price - focus on conversion optimization
   • Price index 100.0 is in optimal range (95-108)
   • Focus on non-price factors to drive sales
   → Maintain margin while improving visibility

📢 2. Improve product listing quality and visibility
   • Better images and descriptions improve conversion
   • Address concerns: build quality, armrest adjustment
   → Higher conversion without margin loss

� SUMMARY

   Price aligned → Focus on marketing optimization
   Position: Market-Aligned | Index: 100

```
======================================================================
📊 PRICING & SALES RECOMMENDATION
======================================================================

📦 Product: Transformer Series Gaming Chair

🔍 Market Overview
   Retailers tracked: 5
   Market price range: ₹9,999 – ₹15,999
   Market median price: ₹10,999
   Your current price: ₹10,999

⚠️ Current Situation
   ✅ Your product is priced COMPETITIVELY with the market
   Your price is ~0.0% below the market median
   You are ranked 2 of 6

✅ Recommendations
   📢 1. Hold current price - focus on conversion optimization
   📢 2. Improve product listing quality and visibility
   ⭐ 3. Address critical customer concerns
   📢 4. Highlight product strengths in marketing
```

## Core Metrics

| Metric | Formula | Interpretation |
|--------|---------|----------------|
| **Price Index** | `(Your Price / Median) × 100` | < 95 = Underpriced, 95-108 = Optimal, > 108 = Overpriced |
| **Price Spread** | `((Max - Min) / Median) × 100` | < 10% = Stable, > 20% = Volatile |
| **Competitive Rank** | Position in sorted prices | 1 = Cheapest, N = Most Expensive |

## Pricing Zones

| Zone | Condition | Recommended Action |
|------|-----------|-------------------|
| � Overpriced | Price Index > 108 | Reduce price or add value |
| � Market-Aligned | Price Index 95-108 | Maintain price, optimize marketing |
| � Underpriced | Price Index < 95 | Increase price or focus on volume |

## Project Structure

```
Kubera/
├── main.ts                  # Entry point - orchestrates the analysis
├── web-search.ts            # Price discovery across retailers
├── customer-expectation.ts  # Customer feedback analysis
├── market-analysis.ts       # Pricing strategy engine
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
└── test/                    # Test images for product analysis
```

## Dependencies

- **@juspay/neurolink** - AI/LLM integration with Google Vertex AI
- **dotenv** - Environment variable management
- **typescript** - Type safety and better developer experience

## How It Works

1. **Price Discovery** (`web-search.ts`)
   - Uses AI with web search grounding to find real-time prices
   - Supports image-based product identification
   - Returns structured JSON with price, retailer, and URL

2. **Customer Analysis** (`customer-expectation.ts`)
   - Gathers customer reviews from multiple sources
   - Identifies strengths, weaknesses, and deal-breakers
   - Provides actionable insights for improvement

3. **Market Strategy** (`market-analysis.ts`)
   - Calculates pricing metrics using industry-standard formulas
   - Applies rule-based logic for recommendations
   - Enhances explanations with AI for clarity

## License

ISC
