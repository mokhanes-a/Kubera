# 📁 Kubera - Project Structure

## Project Organization

```
Kubera/
│
├── 📄 .env                          # Environment variables (API keys)
├── 📄 .env.examples                 # Example environment configuration
├── 📄 .gitignore                    # Git ignore rules
├── 📄 package.json                  # Project dependencies & scripts
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 README.md                     # Project documentation
│
├── 📁 src/                          # Source code (organized)
│   ├── 📄 main.ts                   # 🚀 Application entry point
│   │
│   ├── 📁 core/                     # 🧠 Core business logic
│   │   └── 📄 market-analysis.ts   # Pricing strategy engine
│   │
│   ├── 📁 services/                 # 🔌 External integrations
│   │   ├── 📄 web-search.ts        # Product price search
│   │   └── 📄 customer-expectation.ts # Feedback analysis
│   │
│   ├── 📁 types/                    # 📝 TypeScript types (future)
│   │
│   └── 📁 utils/                    # 🛠️ Helper utilities
│       └── 📄 temp.ts               # Temporary code/examples
│
├── 📁 test/                         # Test files
│
└── 📁 node_modules/                 # Dependencies (gitignored)
```

## 🎯 Module Responsibilities

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| `main.ts` | Application orchestrator | CLI interface, workflow coordination |
| `market-analysis.ts` | Pricing engine | Metrics calculation, recommendations |
| `web-search.ts` | Price discovery | Web search, price extraction |
| `customer-expectation.ts` | Feedback analysis | Sentiment, motivators, concerns |

## 🔄 Data Flow

```
User Input (Product Name)
    ↓
web-search.ts → [Web Search] → Price Data
    ↓
customer-expectation.ts → [AI Analysis] → Customer Insights
    ↓
market-analysis.ts → [Pricing Engine] → Recommendations
    ↓
main.ts → [Display] → User
```

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run application
pnpm start
```

## 📦 Import Structure

```typescript
// From main.ts
import { searchProductPrices } from "./services/web-search";
import { analyzeCustomerFeedback } from "./services/customer-expectation";
import { analyzeMarketStrategy } from "./core/market-analysis";

// From market-analysis.ts
import { WebSearchResponse } from "../services/web-search";
import { CustomerFeedbackResponse } from "../services/customer-expectation";
```

## 🏗️ Architecture Principles

✅ **Separation of Concerns** - Core logic isolated from services
✅ **Deterministic Business Logic** - Pricing rules are traceable
✅ **Service Modularity** - Each service has single responsibility
✅ **Clean Imports** - Organized folder structure with clear paths
✅ **Type Safety** - TypeScript for all modules

## 📝 Notes

- All paths updated to reflect new structure
- `package.json` updated to run `src/main.ts`
- Import paths use relative imports (`../services/`, `../core/`)
- Ready for production deployment
