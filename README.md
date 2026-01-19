# Kubera - AI-Powered Competitive Analysis Tool

## Overview

Kubera is an intelligent market analysis tool that helps e-commerce merchants make data-driven pricing decisions. It uses Google Vertex AI with web search grounding to analyze real-time market prices, customer feedback, and competitive positioning to generate actionable recommendations for increasing sales.

The system automatically performs a comprehensive 3-step analysis for any product:

- **Price Discovery** - Searches the web for current prices across multiple retailers
- **Customer Analysis** - Analyzes reviews, feedback, and market sentiment  
- **Strategy Generation** - Provides actionable pricing recommendations with reasoning

**Output:** Clear, merchant-friendly recommendations based on industry-standard pricing metrics (not AI opinions).

## Features

✅ **Real-Time Price Comparison** - Searches 5+ retailers for current prices using web search grounding  
✅ **Customer Sentiment Analysis** - Identifies strengths, weaknesses, and deal-breakers from real customer reviews  
✅ **Rule-Based Recommendations** - Uses deterministic formulas (not AI guesses) for trustable insights  
✅ **Festival Detection** - Automatically adjusts strategy for Indian festivals and sale seasons  
✅ **Image Support** - Can analyze product images for exact variant matching and better price comparison  
✅ **Confidence Scoring** - Shows reliability of each recommendation based on market stability  
✅ **Auto-Retry Mechanism** - Automatically retries failed API calls with proper error handling  
✅ **Progress Indicators** - Real-time CLI status updates during processing

## Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **pnpm** (recommended) or npm
- **Google Cloud Account** with Vertex AI enabled
- **Google Cloud Service Account** with credentials

### Setup

#### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd Kubera

# Install dependencies
pnpm install
# or
npm install
```

#### 2. Google Cloud Setup

Create a Google Cloud project and enable Vertex AI:

```bash
# Create new project (or use existing one)
gcloud projects create kubera-pricing --name="Kubera Pricing"

# Enable required APIs
gcloud services enable aiplatform.googleapis.com
gcloud services enable generativelanguage.googleapis.com

# Create service account
gcloud iam service-accounts create kubera-sa \
  --display-name="Kubera AI Service Account"

# Grant Vertex AI User role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:kubera-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# Download credentials
gcloud iam service-accounts keys create ~/kubera-credentials.json \
  --iam-account=kubera-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

**Alternative:** Use Application Default Credentials:

```bash
gcloud auth application-default login
gcloud auth application-default set-quota-project YOUR_PROJECT_ID
```

#### 3. Environment Configuration

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

#### 4. Run the Application

```bash
pnpm start
# or
npm start
```

### Usage

#### Run Complete Analysis

```bash
pnpm start
```

The system will:
1. Search for product prices across multiple retailers
2. Analyze customer feedback and expectations
3. Prompt you to enter your merchant price
4. Generate a comprehensive pricing recommendation report

#### Alternative Usage Methods

You can import and use individual modules programmatically:

```typescript
import { searchProductPrices } from "./web-search";
import { analyzeCustomerFeedback } from "./customer-expectation";
import { analyzeMarketStrategy } from "./market-analysis";

// Price discovery
const priceData = await searchProductPrices({ 
  productName: "iPhone 15 Pro",
  images: ["path/to/image.jpg"] // optional
});

// Customer analysis
const feedback = await analyzeCustomerFeedback({ 
  productName: "iPhone 15 Pro" 
});

// Market strategy
const strategy = await analyzeMarketStrategy(
  priceData, 
  feedback, 
  89999 // your merchant price
);
```

## How It Works

### Pricing Metrics & Formulas

Kubera uses **industry-standard retail pricing formulas** to make decisions:

#### 1️⃣ Price Index (Primary Metric)
```
Price Index = (Your Price / Median Market Price) × 100
```

**Interpretation:**
- `< 95` → Aggressive pricing (underpriced)
- `95-105` → Market aligned (optimal)
- `105-108` → Moderately overpriced  
- `> 108` → Significantly overpriced

#### 2️⃣ Price Spread (Market Volatility)
```
Price Spread % = ((Max - Min) / Median) × 100
```

**Interpretation:**
- `< 10%` → Stable market, high confidence
- `10-20%` → Moderate variation
- `> 20%` → Volatile market, low confidence

#### 3️⃣ Competitive Rank
```
Rank = Your position when all prices sorted (1 = cheapest)
```

#### 4️⃣ Position Percentile
```
Position Percentile = (Rank / Total Retailers) × 100
```

**Interpretation:**
- `0-25%` → Bottom quartile (cheapest)
- `25-75%` → Middle range (competitive)
- `75-100%` → Top quartile (premium)

### Decision-Making Logic

Kubera uses **deterministic rules** (not AI opinions) for recommendations:

#### For OVERPRICED Products (Price Index > 108)
1. **Primary:** Reduce price by 3-5%
2. **Alternative:** Add value bundle (bank discounts, free delivery)
3. **Urgency:** Create flash sales or limited-time offers

#### For MARKET-ALIGNED Products (Price Index 95-108)
1. **Primary:** Hold price, focus on conversion
2. **Secondary:** Improve product listing quality
3. **Tertiary:** Highlight product strengths

#### For UNDERPRICED Products (Price Index < 95)
1. **Primary:** Increase price by 1-3%
2. **Alternative:** Maintain price, push volume
3. **Always:** Address customer deal-breakers

### LLM Role

The AI (Gemini 2.5 Flash) is used **ONLY** for:
- ✅ Gathering real-time data via web search grounding
- ✅ Explaining recommendations in natural language
- ✅ Adding context from customer feedback
- ✅ Analyzing customer sentiment from reviews

The AI does **NOT**:
- ❌ Decide actions (rules decide)
- ❌ Change numbers (formulas decide)
- ❌ Invent recommendations (templates decide)

**This ensures trustable, reproducible results.**

### Automatic Analysis Flow

When you run the tool, it automatically:

1. **Detects Product** - Identifies product from name and optional images
2. **Searches Prices** - Queries multiple retailers for real-time pricing
3. **Analyzes Feedback** - Gathers and processes customer reviews and sentiments
4. **Calculates Metrics** - Computes pricing metrics using standard formulas
5. **Generates Recommendations** - Applies rule-based logic for 2-5 actionable suggestions
6. **Displays Results** - Provides comprehensive report with reasoning and confidence scores

## Example Output

```
======================================================================
🚀 KUBERA - AI-Powered Pricing & Market Analysis
======================================================================

⏳ Searching product prices across retailers...
✅ Found 6 retailers

------------------------------------------------------------
📊 PRICE SEARCH RESULTS (JSON)
------------------------------------------------------------
{
  "product": "iPhone 15 Pro 256GB",
  "results": [
    {
      "sno": 1,
      "website": "Amazon.in",
      "price": "₹1,34,900",
      "description": "Apple iPhone 15 Pro (256 GB) - Natural Titanium",
      "url": "https://www.amazon.in/..."
    },
    {
      "sno": 2,
      "website": "Flipkart",
      "price": "₹1,34,999",
      "description": "Apple iPhone 15 Pro 256GB Natural Titanium",
      "url": "https://www.flipkart.com/..."
    }
    // ... more results
  ]
}
------------------------------------------------------------

⏳ Analyzing customer feedback and expectations...
✅ Customer feedback analyzed

------------------------------------------------------------
💬 CUSTOMER FEEDBACK ANALYSIS
------------------------------------------------------------

   📈 Overall Sentiment: Positive
   ⭐ Average Rating: 4.5/5
   🎯 Target Audience: Premium smartphone buyers, photographers, tech enthusiasts

   ✅ Product Strengths:
      • Excellent camera quality with Pro features
      • Premium titanium build quality
      • Powerful A17 Pro chip performance
      • Long battery life

   ⚠️ Product Weaknesses:
      • High price point
      • USB-C charging cable not included
      • Heating issues during intensive tasks

   💡 Purchase Motivators:
      • Latest iOS features and updates
      • Professional-grade camera system
      • Brand value and ecosystem

   🚫 Deal Breakers:
      • Price significantly above budget
      • Limited storage options
      • No charger in box

   💰 Price Sensitivity: High - customers compare prices across platforms
------------------------------------------------------------

💰 Enter your merchant price (in ₹): 139900

⏳ Generating pricing recommendations...
✅ Recommendations ready

======================================================================
📊 PRICING & SALES RECOMMENDATION
======================================================================

📦 Product: iPhone 15 Pro 256GB

🔍 MARKET OVERVIEW

   Retailers Tracked: 6
   Price Range: ₹1,34,900 – ₹1,39,999
   Market Median: ₹1,34,999
   Your Price: ₹1,39,900

📈 CORE METRICS

   Price Spread: 3.8% - Excellent (< 10% = Stable Market)
   Price Index: 103.6 - Optimal (95 - 105 = Market Aligned)

⚠️ CURRENT SITUATION

   ✅ Priced COMPETITIVELY
   3.6% above median
   Rank: 5 of 6

✅ RECOMMENDED ACTIONS

💰 Action 1: Reduce price by ₹3,000 - ₹4,900 (High Confidence)
   Category: Pricing
   Why this works:
   • Price is 3.6% above market median
   • Ranked 5 of 6 sellers
   • Market is stable with low price variation
   📈 Expected Impact: Higher conversion and better visibility

📢 Action 2: Hold current price - focus on conversion optimization (Medium Confidence)
   Category: Marketing
   Why this works:
   • Price index 103.6 is in optimal range (95-108)
   • Focus on non-price factors to drive sales
   📈 Expected Impact: Maintain margin while improving visibility

======================================================================
💡 SUMMARY
======================================================================

   Price 3.6% above market → Reduce price by ₹3,000 - ₹4,900
   Position: Market-Aligned

======================================================================
```

## Configuration

### Environment Variables

The system uses the following environment variables (configured in `.env`):

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON credentials | Yes |
| `GOOGLE_VERTEX_PROJECT` | Google Cloud Project ID | Yes |
| `GOOGLE_VERTEX_LOCATION` | Vertex AI region (e.g., us-central1) | Yes |
| `GOOGLE_CLOUD_PROJECT_ID` | Google Cloud Project ID | Yes |

### NeuroLink Configuration

Kubera uses the [@juspay/neurolink](https://github.com/juspay/neurolink) library for AI integration. The library automatically handles:
- Web search grounding for real-time data
- Response streaming and parsing
- Error handling and retries
- JSON schema validation

## Architecture

```
Kubera/
├── main.ts                    # Main CLI interface & orchestration
├── web-search.ts              # Price discovery module (web search + AI)
├── customer-expectation.ts    # Customer feedback analysis module
├── market-analysis.ts         # Pricing strategy engine (formulas + rules)
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── .env                       # Environment variables (create this)
├── .env.examples              # Environment template
└── test/                      # Test images for product analysis
```

### Key Components

**AutoPriceAnalysis System:**
- Main interface for processing product analysis
- Orchestrates the complete analysis flow
- Handles CLI input/output

**Price Discovery Engine (web-search.ts):**
- Uses AI with web search grounding to find real-time prices
- Supports image-based product identification
- Returns structured JSON with price, retailer, and URL

**Customer Analysis Engine (customer-expectation.ts):**
- Gathers customer reviews from multiple sources
- Identifies strengths, weaknesses, and deal-breakers
- Provides actionable insights for improvement

**Market Strategy Engine (market-analysis.ts):**
- Calculates pricing metrics using industry-standard formulas
- Applies rule-based logic for recommendations
- Enhances explanations with AI for clarity

### Data Flow

```
User Input → Price Discovery → Customer Analysis → Merchant Price Input → 
Market Strategy → Recommendations Display
```

1. **Input Phase:** Product name and optional images
2. **Discovery Phase:** Web search for prices across retailers
3. **Analysis Phase:** Customer sentiment and feedback analysis
4. **Strategy Phase:** Calculate metrics and generate recommendations
5. **Output Phase:** Display comprehensive report with actions

## Pricing & Costs

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

## Files Generated

The system does not generate any persistent files during normal operation. All data is:
- Fetched in real-time via web search
- Processed in memory
- Displayed in CLI output

## Troubleshooting

### Common Issues

#### 1. Authentication Error
```
Error: GOOGLE_APPLICATION_CREDENTIALS not found
```
**Fix:** Check your `.env` file has correct `GOOGLE_APPLICATION_CREDENTIALS` path

#### 2. No Web Search Results
```
⚠️ No results found for the product
```
**Fix:** 
- Check product name spelling
- Try more generic search terms
- Verify internet connection

#### 3. JSON Parsing Error
```
Failed to parse JSON response: Unterminated string
```
**Fix:**
- Response was truncated
- Already handled with automatic retry
- Increase `maxTokens` if needed

#### 4. Rate Limiting
```
429 Too Many Requests
```
**Fix:**
- Wait a few seconds between requests
- Check your Google Cloud quota limits

### Debug Mode

For detailed logging, check the console output when running commands. The system provides comprehensive status information for each step, including:
- API call status and timing
- Retry attempts and failures
- JSON responses from each module
- Metric calculations

## Future Enhancements

- Support for more countries and currencies
- Multi-product batch analysis
- Historical price tracking and trends
- API endpoint for web integration
- Dashboard for analytics visualization
- Integration with e-commerce platforms (Shopify, WooCommerce)
- Support for more AI providers (OpenAI, Anthropic)
- Advanced festival calendar with custom date configuration
- Email alerts for price changes

## Contributing

Contributions welcome! Areas for improvement:
- Support for more countries/currencies
- Additional pricing models
- Enhanced festival detection
- Multi-language support
- Performance optimizations

## License

ISC

## Related Resources

- [Google Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Gemini API Pricing](https://cloud.google.com/vertex-ai/pricing)
- [NeuroLink Library](https://github.com/juspay/neurolink)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Cloud Free Tier](https://cloud.google.com/free)

## Notes

- **Data Privacy:** All data is processed via Google Cloud. No data is stored by Kubera.
- **API Costs:** Monitor your Google Cloud billing to avoid unexpected charges.
- **Rate Limits:** Vertex AI has rate limits. Add delays between bulk requests.
- **Accuracy:** Web search results may vary. Always verify critical business decisions.

---

**Built with ❤️ for E-Commerce Merchants**
