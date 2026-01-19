import { NeuroLink } from "@juspay/neurolink";
import * as dotenv from "dotenv";

dotenv.config();

// Type definitions for customer feedback analysis
export interface CustomerOpinion {
  overallSentiment: "Positive" | "Mixed" | "Negative";
  rating: string; // e.g., "4.2/5"
  strengths: string[]; // What customers love
  weaknesses: string[]; // What customers complain about
  commonPraises: string[]; // Frequently mentioned positive points
  commonComplaints: string[]; // Frequently mentioned negative points
  targetAudience: string; // Who is buying this product
  competitorComparison?: string; // How it compares to competitors
}

export interface CustomerNeeds {
  mustHaveFeatures: string[]; // Essential features customers expect
  desiredImprovements: string[]; // What customers want to be better
  priceSensitivity: string; // Price expectations and value perception
  missingFeatures: string[]; // Features customers wish existed
  dealBreakers: string[]; // Issues that prevent purchases
  purchaseMotivators: string[]; // What convinces customers to buy
}

export interface CustomerFeedbackResponse {
  product: string;
  marketAnalysis: {
    generalOpinion: CustomerOpinion;
    customerNeeds: CustomerNeeds;
  };
  actionableInsights: {
    toIncreaseOrders: string[]; // Specific actions to boost sales
    priorityImprovements: string[]; // What to fix first
    marketingAngles: string[]; // How to position the product
  };
  dataSource: string; // Where the feedback was gathered from
  analysisDate: string;
}

export interface CustomerFeedbackOptions {
  productName: string;
}

/**
 * Analyze customer expectations and feedback for a product
 * Gathers insights for market analysis and sales optimization
 * @param options - Product name to analyze
 * @returns Structured customer feedback and market analysis
 */
export async function analyzeCustomerFeedback(
  options: CustomerFeedbackOptions
): Promise<CustomerFeedbackResponse> {
  const { productName } = options;
  const neurolink = new NeuroLink();

  const result = await neurolink.generate({
    input: {
      text: `Perform a comprehensive customer feedback and market analysis for "${productName}".
      
I need detailed insights about:
1. What customers THINK about this product (general opinion, ratings, reviews)
2. What customers NEED and EXPECT from this product
3. How to INCREASE ORDERS and sales for this product

Search for:
- Customer reviews from e-commerce sites (Amazon, Flipkart, etc.)
- User feedback on social media and forums
- Expert reviews and comparisons
- Common complaints and praise
- Feature requests and improvement suggestions
- Competitor comparisons
- Price value perception

Provide data-driven insights for market analysis and sales optimization.`,
    },
    provider: "vertex", // Required for web search grounding
    model: "gemini-2.5-flash",
    temperature: 0.3, // Lower temperature for factual analysis
    maxTokens: 5000, // Comprehensive analysis needs more tokens
    systemPrompt: `You are a market research analyst specializing in product-specific customer feedback analysis.

YOUR MISSION:
Analyze customer feedback ONLY about the PRODUCT ITSELF - its features, quality, design, and functionality.

⚠️ IMPORTANT - IGNORE THESE (Common to all e-commerce, not product-specific):
- Delivery issues (late delivery, packaging damage, wrong item sent)
- Customer service complaints (returns, refunds, response time)
- Website/app issues (payment problems, order tracking)
- Seller-specific issues (fraud, fake products from specific sellers)
- Shipping and logistics problems

✅ FOCUS ONLY ON:
- Product quality and build
- Product features and functionality
- Product design and aesthetics
- Product durability and reliability
- Product value for money (is the product worth its price)
- Product comparison with alternatives (feature-wise)

ANALYSIS FRAMEWORK:

📊 GENERAL OPINION (Product-Specific):
- Overall sentiment based on product quality
- Rating based on product satisfaction
- Product strengths (design, features, quality)
- Product weaknesses (defects, missing features, poor quality)
- What customers love about the product itself
- What customers dislike about the product itself
- Who is this product best suited for
- How does this product compare feature-wise with competitors

🎯 CUSTOMER NEEDS (Product Features):
- Essential product features customers expect
- Product improvements customers want
- Is the product worth its price
- Features customers wish the product had
- Product issues that prevent purchase
- Product features that convince customers to buy

💡 ACTIONABLE INSIGHTS (Product Improvement):
- How to improve the product itself
- What product features to highlight
- How to position product against competitors

DATA COLLECTION:
- Focus on product reviews mentioning quality, features, design
- Ignore reviews about delivery, seller, or service issues
- Extract only product-related feedback

RESPONSE FORMAT:
Return ONLY valid JSON in this exact structure:

{
  "product": "Product Name with variant",
  "marketAnalysis": {
    "generalOpinion": {
      "overallSentiment": "Positive|Mixed|Negative",
      "rating": "4.2/5 stars (based on product quality reviews)",
      "strengths": ["product strength 1", "product strength 2", "product strength 3"],
      "weaknesses": ["product weakness 1", "product weakness 2", "product weakness 3"],
      "commonPraises": ["what users love about product", "feature praise", "quality praise"],
      "commonComplaints": ["product defect", "missing feature", "quality issue"],
      "targetAudience": "Who should buy this product",
      "competitorComparison": "Feature comparison with alternatives"
    },
    "customerNeeds": {
      "mustHaveFeatures": ["essential feature 1", "essential feature 2"],
      "desiredImprovements": ["product improvement 1", "product improvement 2"],
      "priceSensitivity": "Is the product worth its price",
      "missingFeatures": ["feature customers want", "feature competitors have"],
      "dealBreakers": ["product issue preventing purchase", "quality concern"],
      "purchaseMotivators": ["feature that sells", "quality that attracts"]
    }
  },
  "actionableInsights": {
    "toIncreaseOrders": [
      "Product improvement suggestion",
      "Marketing angle for product features"
    ],
    "priorityImprovements": [
      "Most critical product fix",
      "Feature to add"
    ],
    "marketingAngles": [
      "Highlight this product feature",
      "Target this user segment"
    ]
  },
  "dataSource": "Product reviews from verified purchases",
  "analysisDate": "2026-01-13"
}

QUALITY STANDARDS:
- ONLY include product-specific feedback (quality, features, design)
- EXCLUDE delivery, service, seller, or logistics complaints
- Focus on what makes the product good or bad
- Be specific about product features and issues
- Keep insights actionable for product improvement

Return ONLY valid JSON, no markdown formatting, no additional text.`,
    output: {
      format: "json",
    },
  });

  // Parse and return the JSON response with error handling
  try {
    // Clean the response - remove markdown code blocks if present
    let cleanedContent = result.content.trim();

    // Remove ```json and ``` markers
    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.replace(/^```json\s*\n?/, "");
    } else if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.replace(/^```\s*\n?/, "");
    }

    if (cleanedContent.endsWith("```")) {
      cleanedContent = cleanedContent.replace(/\n?```\s*$/, "");
    }

    cleanedContent = cleanedContent.trim();

    // Validate JSON completeness
    if (!cleanedContent.endsWith("}")) {
      console.error("⚠️  Response appears truncated (doesn't end with '}')\n");
      console.error("Token usage:", result.usage);
      throw new Error(
        `Incomplete JSON response - Analysis was truncated. Try increasing maxTokens.`
      );
    }

    // Count braces to check balance
    const openBraces = (cleanedContent.match(/{/g) || []).length;
    const closeBraces = (cleanedContent.match(/}/g) || []).length;

    if (openBraces !== closeBraces) {
      console.error("⚠️  JSON structure is unbalanced\n");
      console.error(`Open braces: ${openBraces}, Close braces: ${closeBraces}`);
      throw new Error(
        `Malformed JSON response - brace mismatch (${openBraces} open, ${closeBraces} close)`
      );
    }

    const parsedResult: CustomerFeedbackResponse = JSON.parse(cleanedContent);

    // Validate structure
    if (
      !parsedResult.product ||
      !parsedResult.marketAnalysis ||
      !parsedResult.marketAnalysis.generalOpinion ||
      !parsedResult.marketAnalysis.customerNeeds
    ) {
      throw new Error(
        "Invalid response structure - missing required fields in market analysis"
      );
    }

    return parsedResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error("\n❌ JSON Parsing Error:", errorMessage);
    console.error("\n📊 Response Metadata:");
    console.error("  - Provider:", result.provider);
    console.error("  - Model:", result.model);
    console.error("  - Response time:", result.responseTime, "ms");

    if (result.usage) {
      console.error("  - Input tokens:", result.usage.input);
      console.error("  - Output tokens:", result.usage.output);
      console.error(
        "  - Total tokens:",
        (result.usage.input || 0) + (result.usage.output || 0)
      );
    }

    console.error("\n📝 Raw response (first 500 chars):");
    console.error(result.content.substring(0, 500) + "...\n");

    throw new Error(`Failed to analyze customer feedback: ${errorMessage}`);
  }
}
