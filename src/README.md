# Source Code Structure

This directory contains the organized source code for the Kubera pricing engine.

## 📁 Directory Structure

```
src/
├── main.ts                    # Application entry point
├── core/                      # Core business logic
│   └── market-analysis.ts     # Pricing strategy & recommendations engine
├── services/                  # External service integrations
│   ├── web-search.ts          # Web search for product prices
│   └── customer-expectation.ts # Customer feedback analysis
├── types/                     # TypeScript type definitions (future)
└── utils/                     # Utility functions and helpers
    └── temp.ts                # Temporary utilities & examples
```

## 📦 Module Overview

### `main.ts`
- Application orchestrator
- Coordinates web search, customer feedback, and market analysis
- CLI interface for user input
- Error handling and retry logic

### `core/market-analysis.ts`
- **Deterministic pricing engine**
- Calculates pricing metrics (index, spread, rank)
- Zone classification (Overpriced/Market-Aligned/Underpriced)
- Rule-based recommendation generation
- Festival context detection
- LLM explanation enhancement

### `services/web-search.ts`
- Web search for product prices across retailers
- Price extraction and normalization
- Search URL generation
- Image-based product search support

### `services/customer-expectation.ts`
- Customer feedback analysis
- Sentiment analysis
- Purchase motivators and deal-breakers detection
- Target audience identification

### `utils/`
- Helper functions
- Temporary code and experiments
- Shared utilities

### `types/`
- Type definitions (to be populated)
- Shared interfaces and types

## 🚀 Running the Application

```bash
# From project root
pnpm start

# Or with npm
npm start
```

## 🔧 Development

All TypeScript files are compiled on-the-fly using `ts-node`. No build step required for development.

## 📝 Import Paths

- Use relative imports within modules
- Services: `../services/module-name`
- Core: `../core/module-name`
- Utils: `../utils/module-name`
