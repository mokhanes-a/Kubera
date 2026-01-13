# Kubera - AI-Powered Pricing & Market Analysis Engine

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
