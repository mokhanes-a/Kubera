import { NeuroLink } from "@juspay/neurolink";
import * as dotenv from "dotenv";
import * as readline from "readline";
import { WebSearchResponse } from "./web-search";
import { CustomerFeedbackResponse } from "./customer-expectation";

dotenv.config();

/**
 * =============================================================================
 * MARKET ANALYSIS & PRICING STRATEGY ENGINE
 * =============================================================================
 * 
 * This module implements industry-standard pricing metrics and rule-based
 * recommendations for e-commerce merchants. The system uses deterministic
 * calculations (not AI opinions) to generate trustable, actionable insights.
 * 
 * =============================================================================
 * CORE METRICS & FORMULAS
 * =============================================================================
 * 
 * 1️⃣ PRICE SPREAD (Market Volatility)
 * 
 *    Formula: Price Spread % = ((Max Price - Min Price) / Median Price) × 100
 * 
 *    Interpretation:
 *    • < 10%  → Stable market, high confidence
 *    • 10-20% → Moderate variation, medium confidence
 *    • > 20%  → Volatile market, low confidence
 * 
 * 2️⃣ PRICE INDEX (Your Competitive Position)
 * 
 *    Formula: Price Index = (Your Price / Median Market Price) × 100
 * 
 *    Interpretation:
 *    • < 95   → Aggressive pricing (underpriced)
 *    • 95-105 → Market aligned (optimal)
 *    • 105-108 → Moderately overpriced
 *    • > 108  → Significantly overpriced
 * 
 *    This is the PRIMARY metric used in retail pricing decisions.
 * 
 * 3️⃣ COMPETITIVE RANK
 * 
 *    Formula: Rank = Position when all prices sorted (1 = cheapest)
 * 
 *    Example:
 *    • Rank 1 of 7 → You are the cheapest
 *    • Rank 7 of 7 → You are the most expensive
 * 
 * 4️⃣ POSITION PERCENTILE
 * 
 *    Formula: Position Percentile = (Rank / Total Retailers) × 100
 * 
 *    Interpretation:
 *    • 0-25%   → Bottom quartile (cheapest sellers)
 *    • 25-75%  → Middle range (competitive zone)
 *    • 75-100% → Top quartile (premium/expensive)
 * 
 * 5️⃣ CONFIDENCE SCORE
 * 
 *    Based on:
 *    • Number of retailers (more = higher confidence)
 *    • Price spread (lower = higher confidence)
 * 
 *    Rules:
 *    • High: 6+ retailers AND spread < 10%
 *    • Medium: 4-5 retailers OR spread 10-20%
 *    • Low: < 4 retailers OR spread > 20%
 * 
 * =============================================================================
 * PRICING ZONES (Industry Standard)
 * =============================================================================
 * 
 * 🔴 OVERPRICED ZONE
 *    Conditions: Price Index > 108 AND Position Percentile > 75%
 *    Risk: Low conversion, losing customers to cheaper alternatives
 *    Action: Reduce price or add value
 * 
 * 🟢 MARKET-ALIGNED ZONE
 *    Conditions: Price Index between 95 and 108
 *    Status: Optimal competitive position
 *    Action: Maintain price, optimize other factors
 * 
 * 🟡 UNDERPRICED ZONE
 *    Conditions: Price Index < 95 AND Position Percentile < 25%
 *    Risk: Leaving margin on the table
 *    Action: Increase price or push volume
 * 
 * =============================================================================
 * DECISION RULES (Deterministic, Not AI-Based)
 * =============================================================================
 * 
 * All recommendations follow explicit rules based on metrics above.
 * LLM is used ONLY for:
 * • Explaining recommendations in natural language
 * • Adding context from customer feedback
 * • Improving clarity of reasoning
 * 
 * LLM does NOT:
 * • Decide actions (rules decide)
 * • Change numbers (metrics decide)
 * • Invent recommendations (predefined templates)
 * 
 * This ensures merchant trust and system reliability.
 * 
 * =============================================================================
 */

// Type definitions for market analysis
export interface PricingMetrics {
  minMarketPrice: number;
  maxMarketPrice: number;
  medianMarketPrice: number;
  averageMarketPrice: number;
  priceSpreadPercent: number;
  merchantPrice: number;
  priceIndex: number; // (merchantPrice / median) * 100
  competitiveRank: number; // 1 = cheapest, N = most expensive
  totalRetailers: number;
  positionPercentile: number; // rank / total
}

export interface PricingZone {
  zone: "Overpriced" | "Market-Aligned" | "Underpriced";
  severity: "Critical" | "Moderate" | "Optimal";
  confidence: "High" | "Medium" | "Low";
}

export interface ActionableRecommendation {
  priority: number;
  action: string;
  reasoning: string[];
  expectedImpact: string;
  confidence: "High" | "Medium" | "Low";
  category: "Pricing" | "Value-Add" | "Marketing" | "Urgency" | "Quality" | "Festival";
}

export interface MarketAnalysisResult {
  product: string;
  marketSnapshot: {
    retailersTracked: number;
    lowestMarketPrice: string;
    highestMarketPrice: string;
    medianMarketPrice: string;
    merchantCurrentPrice: string;
  };
  coreMetrics: {
    priceSpreadPercent: number;
    priceIndex: number;
    positionPercentile: number;
  };
  pricingStatus: {
    status: string;
    priceIndex: number;
    priceDifferencePercent: string;
    competitiveRank: string;
    zone: PricingZone;
  };
  recommendations: ActionableRecommendation[];
  festivalContext?: {
    isActiveFestival: boolean;
    festivalName?: string;
    festivalStrategy?: string;
  };
}

/**
 * Calculate core pricing metrics from market data
 */
function calculatePricingMetrics(
  prices: number[],
  merchantPrice: number
): PricingMetrics {
  const sortedPrices = [...prices].sort((a, b) => a - b);

  const min = sortedPrices[0];
  const max = sortedPrices[sortedPrices.length - 1];
  const median =
    sortedPrices.length % 2 === 0
      ? (sortedPrices[sortedPrices.length / 2 - 1] +
          sortedPrices[sortedPrices.length / 2]) /
        2
      : sortedPrices[Math.floor(sortedPrices.length / 2)];
  const average = prices.reduce((a, b) => a + b, 0) / prices.length;

  const priceSpread = ((max - min) / median) * 100;
  const priceIndex = (merchantPrice / median) * 100;

  // Calculate competitive rank (1 = cheapest)
  const allPrices = [...prices, merchantPrice].sort((a, b) => a - b);
  const rank = allPrices.indexOf(merchantPrice) + 1;
  const positionPercentile = (rank / allPrices.length) * 100;

  return {
    minMarketPrice: min,
    maxMarketPrice: max,
    medianMarketPrice: median,
    averageMarketPrice: average,
    priceSpreadPercent: priceSpread,
    merchantPrice,
    priceIndex,
    competitiveRank: rank,
    totalRetailers: allPrices.length,
    positionPercentile,
  };
}

/**
 * Determine pricing zone based on industry-standard rules
 */
function determinePricingZone(metrics: PricingMetrics): PricingZone {
  const { priceIndex, positionPercentile, priceSpreadPercent, totalRetailers } =
    metrics;

  // Confidence calculation
  let confidence: "High" | "Medium" | "Low" = "Medium";
  if (totalRetailers >= 6 && priceSpreadPercent < 10) {
    confidence = "High";
  } else if (totalRetailers <= 3 || priceSpreadPercent > 20) {
    confidence = "Low";
  }

  // Zone determination (industry standard)
  if (priceIndex > 108 && positionPercentile > 75) {
    return {
      zone: "Overpriced",
      severity: priceIndex > 115 ? "Critical" : "Moderate",
      confidence,
    };
  } else if (priceIndex >= 95 && priceIndex <= 108) {
    return {
      zone: "Market-Aligned",
      severity: "Optimal",
      confidence,
    };
  } else {
    return {
      zone: "Underpriced",
      severity: priceIndex < 90 ? "Critical" : "Moderate",
      confidence,
    };
  }
}

/**
 * Generate rule-based recommendations (deterministic)
 */
function generateRuleBasedRecommendations(
  metrics: PricingMetrics,
  zone: PricingZone,
  customerFeedback: CustomerFeedbackResponse
): any {
  const recommendations = [];

  const priceDiff = metrics.merchantPrice - metrics.medianMarketPrice;
  const priceDiffPercent = ((priceDiff / metrics.medianMarketPrice) * 100).toFixed(1);

  // ZONE 1: OVERPRICED
  if (zone.zone === "Overpriced") {
    // Determine target price and reduction strategy based on severity
    let targetPriceLow: number;
    let targetPriceHigh: number;
    let primaryRecommendation: string;
    
    if (metrics.priceIndex > 130) {
      // Severely overpriced (>30% above market) - suggest psychological pricing at/below median
      // Use psychological pricing (X999 format) to maximize appeal
      const medianPsychological = Math.floor(metrics.medianMarketPrice / 1000) * 1000 - 1;
      const medianSlightlyAbove = Math.floor(metrics.medianMarketPrice / 1000) * 1000 + 999;
      
      targetPriceLow = medianPsychological;
      targetPriceHigh = medianSlightlyAbove;
      primaryRecommendation = `Reduce price to ₹${targetPriceLow.toLocaleString()} - ₹${targetPriceHigh.toLocaleString()} (psychological pricing at market level)`;
      
      recommendations.push({
        priority: 1,
        action: primaryRecommendation,
        category: "Pricing",
        confidence: "High",
        rule: "OVERPRICED_SEVERE",
        reasoning: [
          `Price Index of ${metrics.priceIndex.toFixed(1)} means you're ${priceDiffPercent}% above market median (₹${metrics.medianMarketPrice.toLocaleString()}), losing sales to competitors daily.`,
          `Psychological pricing at ₹${targetPriceLow.toLocaleString()} appears significantly cheaper than ₹${Math.ceil(targetPriceLow / 1000) * 1000} while matching market expectations.`,
          `Market range ₹${metrics.minMarketPrice.toLocaleString()}-₹${metrics.maxMarketPrice.toLocaleString()} shows ${metrics.totalRetailers - 1} retailers compete here; pricing at median captures maximum volume.`,
        ],
        expectedImpact: "Significant conversion improvement and market competitiveness",
      });
    } else if (metrics.priceIndex > 115) {
      // Moderately overpriced (15-30% above) - close 60-70% of gap
      const gapToClose = priceDiff * 0.65; // Close 65% of gap
      targetPriceLow = Math.round((metrics.merchantPrice - gapToClose * 1.1) / 100) * 100;
      targetPriceHigh = Math.round((metrics.merchantPrice - gapToClose * 0.9) / 100) * 100;
      primaryRecommendation = `Reduce price to ₹${targetPriceLow.toLocaleString()} - ₹${targetPriceHigh.toLocaleString()}`;
      
      recommendations.push({
        priority: 1,
        action: primaryRecommendation,
        category: "Pricing",
        confidence: zone.confidence,
        rule: "OVERPRICED_MODERATE",
        reasoning: [
          `Price ${priceDiffPercent}% above market median reduces conversion and visibility.`,
          `Competitors at ₹${metrics.medianMarketPrice.toLocaleString()} are capturing price-sensitive ${customerFeedback.marketAnalysis.generalOpinion.targetAudience.toLowerCase()}.`,
          `Current rank ${metrics.competitiveRank} of ${metrics.totalRetailers} indicates poor competitive position requiring adjustment.`,
        ],
        expectedImpact: "Higher conversion rates and better market visibility",
      });
    } else {
      // Slightly overpriced (8-15% above) - small reduction
      const suggestedReduction = priceDiff * 0.6; // Reduce 60% of gap
      const lowerBound = Math.round(suggestedReduction / 100) * 100;
      const upperBound = Math.round((suggestedReduction * 0.8) / 100) * 100;
      primaryRecommendation = `Reduce price by ₹${lowerBound.toLocaleString()} - ₹${upperBound.toLocaleString()}`;
      
      recommendations.push({
        priority: 1,
        action: primaryRecommendation,
        category: "Pricing",
        confidence: zone.confidence,
        rule: "OVERPRICED_MINOR",
        reasoning: [
          `Priced ${priceDiffPercent}% above median, minor reduction improves competitiveness.`,
          `Market stability (spread: ${metrics.priceSpreadPercent.toFixed(1)}%) allows strategic price adjustment.`,
          `Aligning closer to market average of ₹${metrics.medianMarketPrice.toLocaleString()} enhances conversion without sacrificing quality perception.`,
        ],
        expectedImpact: "Improved conversion without compromising brand positioning",
      });
    }

    // Alternative: Value-add instead of price cut (for all severity levels)
    recommendations.push({
      priority: 2,
      action: "Add value bundle instead of price cut",
      category: "Value-Add",
      confidence: "Medium",
      rule: "OVERPRICED_VALUE_BUNDLE",
      reasoning: [
        `Bundling protects margins while enhancing perceived value for ${customerFeedback.marketAnalysis.generalOpinion.targetAudience.toLowerCase()}.`,
        `Bank discounts or free accessories effectively lower cost, attracting price-sensitive customers.`,
        `Addresses customer motivator for an affordable price point without direct price reduction.`,
      ],
      expectedImpact: "Maintains margin while improving attractiveness",
    });

    // Urgency tactics (only for moderately overpriced, not severely overpriced)
    if (metrics.priceIndex <= 130) {
      recommendations.push({
        priority: 3,
        action: "Create urgency with flash sale or limited stock",
        category: "Urgency",
        confidence: "High",
        rule: "OVERPRICED_URGENCY",
        reasoning: [
          `Time-limited flash sales can overcome price resistance for an overpriced product.`,
          `Scarcity drives faster purchase decisions, converting ${customerFeedback.marketAnalysis.generalOpinion.targetAudience.toLowerCase()} quickly.`,
          `${customerFeedback.marketAnalysis.generalOpinion.overallSentiment} customer sentiment could be leveraged to boost quick sales during urgency events.`,
        ],
        expectedImpact: "Faster decisions, reduced comparison shopping",
      });
    }
  }

  // ZONE 2: MARKET-ALIGNED
  else if (zone.zone === "Market-Aligned") {
    recommendations.push({
      priority: 1,
      action: "Hold current price - focus on conversion optimization",
      category: "Marketing",
      confidence: zone.confidence,
      rule: "ALIGNED_HOLD_OPTIMIZE",
      reasoning: [
        `Price index ${metrics.priceIndex.toFixed(1)} is in optimal range (95-108)`,
        "Focus on non-price factors to drive sales",
      ],
      expectedImpact: "Maintain margin while improving visibility",
    });

    recommendations.push({
      priority: 2,
      action: "Improve product listing quality and visibility",
      category: "Marketing",
      confidence: "High",
      rule: "ALIGNED_VISIBILITY",
      reasoning: [
        "Better images and descriptions improve conversion",
        `Address concerns: ${customerFeedback.marketAnalysis.generalOpinion.commonComplaints.slice(0, 2).join(", ")}`,
      ],
      expectedImpact: "Higher conversion without margin loss",
    });
  }

  // ZONE 3: UNDERPRICED
  else if (zone.zone === "Underpriced") {
    const priceDiffFromMedian = metrics.medianMarketPrice - metrics.merchantPrice;
    
    // Determine target price and increase strategy based on severity
    let targetPriceLow: number;
    let targetPriceHigh: number;
    let primaryRecommendation: string;
    
    if (metrics.priceIndex < 50) {
      // Severely underpriced (>50% below market) - suggest psychological pricing at market level
      // Use psychological pricing (X999 format) to maximize perceived value
      const medianPsychological = Math.floor(metrics.medianMarketPrice / 1000) * 1000 - 1;
      const medianSlightlyAbove = Math.floor(metrics.medianMarketPrice / 1000) * 1000 + 999;
      
      targetPriceLow = medianPsychological;
      targetPriceHigh = medianSlightlyAbove;
      primaryRecommendation = `Increase price to ₹${targetPriceLow.toLocaleString()} - ₹${targetPriceHigh.toLocaleString()} (psychological pricing at market level)`;
      
      recommendations.push({
        priority: 1,
        action: primaryRecommendation,
        category: "Pricing",
        confidence: "High",
        rule: "UNDERPRICED_SEVERE",
        reasoning: [
          `Price Index of ${metrics.priceIndex.toFixed(1)} means severe underpricing at ${Math.abs(Math.round(100 - metrics.priceIndex))}% below market; you're losing ₹${Math.round(priceDiffFromMedian).toLocaleString()} per sale.`,
          `Psychological pricing at ₹${targetPriceLow.toLocaleString()} captures market value while appearing more attractive than ₹${Math.ceil(targetPriceLow / 1000) * 1000}.`,
          `Market median ₹${metrics.medianMarketPrice.toLocaleString()} shows customers willing to pay this; capture full margin without losing competitiveness.`,
        ],
        expectedImpact: "Significantly improved margins while maintaining competitive position",
      });
    } else if (metrics.priceIndex < 90) {
      // Moderately underpriced (10-50% below) - suggest closing 50-70% of gap
      const gapToClose = priceDiffFromMedian * 0.6; // Close 60% of gap
      targetPriceLow = Math.round((metrics.merchantPrice + gapToClose * 0.8) / 100) * 100;
      targetPriceHigh = Math.round((metrics.merchantPrice + gapToClose * 1.2) / 100) * 100;
      primaryRecommendation = `Increase price to ₹${targetPriceLow.toLocaleString()} - ₹${targetPriceHigh.toLocaleString()}`;
      
      recommendations.push({
        priority: 1,
        action: primaryRecommendation,
        category: "Pricing",
        confidence: zone.confidence,
        rule: "UNDERPRICED_MODERATE",
        reasoning: [
          `Price ${Math.abs(Math.round(100 - metrics.priceIndex))}% below market median leaves margin on the table.`,
          `Competitors charging ₹${metrics.medianMarketPrice.toLocaleString()} indicates market acceptance of higher price.`,
          `Current rank ${metrics.competitiveRank} of ${metrics.totalRetailers} provides room for strategic price increase.`,
        ],
        expectedImpact: "Improved margin while remaining competitive",
      });
    } else {
      // Slightly underpriced (5-10% below) - small adjustment
      const suggestedIncrease = priceDiffFromMedian * 0.5;
      const lowerBound = Math.round(suggestedIncrease / 100) * 100;
      const upperBound = Math.round((suggestedIncrease * 1.3) / 100) * 100;
      primaryRecommendation = `Increase price by ₹${lowerBound.toLocaleString()} - ₹${upperBound.toLocaleString()}`;
      
      recommendations.push({
        priority: 1,
        action: primaryRecommendation,
        category: "Pricing",
        confidence: zone.confidence,
        rule: "UNDERPRICED_MINOR",
        reasoning: [
          `Priced ${Math.abs(Math.round(100 - metrics.priceIndex))}% below median, minor adjustment optimizes revenue.`,
          `Market stability (spread: ${metrics.priceSpreadPercent.toFixed(1)}%) supports incremental price increase.`,
          `Maintaining competitive position while capturing available margin.`,
        ],
        expectedImpact: "Optimized margin without affecting conversion",
      });
    }

    // Alternative: Volume strategy (only for non-severe cases)
    if (metrics.priceIndex >= 50) {
      recommendations.push({
        priority: 2,
        action: "Maintain low price and focus on volume",
        category: "Marketing",
        confidence: "Medium",
        rule: "UNDERPRICED_VOLUME",
        reasoning: [
          `Low price maintains competitive rank ${metrics.competitiveRank}, attracting price-sensitive ${customerFeedback.marketAnalysis.generalOpinion.targetAudience.toLowerCase()}.`,
          `${customerFeedback.marketAnalysis.generalOpinion.overallSentiment} customer sentiment can be leveraged for high volume sales.`,
          `Builds strong brand loyalty among target audience before competitors emerge.`,
        ],
        expectedImpact: "Market share growth, customer acquisition",
      });
    }
  }

  // UNIVERSAL RECOMMENDATIONS (apply to all zones)

  // Customer feedback-based action
  if (customerFeedback.marketAnalysis.customerNeeds.dealBreakers.length > 0) {
    const dealBreaker = customerFeedback.marketAnalysis.customerNeeds.dealBreakers[0];
    const missingFeature = customerFeedback.marketAnalysis.customerNeeds.missingFeatures[0] || "ergonomic improvements";
    
    recommendations.push({
      priority: 3,
      action: `Address critical customer concerns`,
      category: "Quality",
      confidence: "High",
      rule: "UNIVERSAL_DEALBREAKERS",
      reasoning: [
        `Customer feedback highlights ${dealBreaker.toLowerCase()}, specifically ${missingFeature.toLowerCase()}, as a key concern.`,
        `Addressing this critical design flaw removes a significant purchase barrier for ${customerFeedback.marketAnalysis.generalOpinion.targetAudience.toLowerCase()}.`,
        `Improved ${missingFeature.toLowerCase()} enhances ergonomic support, appealing to ${customerFeedback.marketAnalysis.generalOpinion.targetAudience.toLowerCase()}.`,
      ],
      expectedImpact: "Removes purchase barriers, improves satisfaction",
    });
  }

  // Marketing angle based on strengths
  if (customerFeedback.marketAnalysis.generalOpinion.strengths.length > 0) {
    const topStrength = customerFeedback.marketAnalysis.generalOpinion.strengths[0];
    const secondStrength = customerFeedback.marketAnalysis.generalOpinion.strengths[1] || "quality construction";
    
    recommendations.push({
      priority: 4,
      action: "Highlight product strengths in marketing",
      category: "Marketing",
      confidence: "High",
      rule: "UNIVERSAL_STRENGTHS",
      reasoning: [
        `Customers highly praise ${topStrength.toLowerCase()} and ${secondStrength.toLowerCase()}.`,
        `Marketing should emphasize ergonomic benefits and ${secondStrength.toLowerCase()} for durability.`,
        `Highlighting proven strengths directly addresses customer motivators and reduces price sensitivity.`,
      ],
      expectedImpact: "Better positioning, reduced price sensitivity",
    });
  }

  // Competitive advantage
  recommendations.push({
    priority: 5,
    action: "Offer superior service or faster delivery",
    category: "Value-Add",
    confidence: "Medium",
    rule: "UNIVERSAL_SERVICE",
    reasoning: [
      `Superior service enhances ${customerFeedback.marketAnalysis.generalOpinion.overallSentiment.toLowerCase()} customer sentiment, fostering brand advocacy.`,
      `Faster delivery meets expectations of ${customerFeedback.marketAnalysis.generalOpinion.targetAudience.toLowerCase()}.`,
      `Value-added services can differentiate product beyond just price for target audience.`,
    ],
    expectedImpact: "Differentiation, repeat customers",
  });

  return {
    rawRecommendations: recommendations,
    metrics: {
      priceIndex: metrics.priceIndex,
      rank: `${metrics.competitiveRank} of ${metrics.totalRetailers}`,
      priceDiff: priceDiff,
      priceDiffPercent: priceDiffPercent,
    },
  };
}

/**
 * Check for active festivals and generate context
 */
function checkFestivalContext(): {
  isActiveFestival: boolean;
  festivalName?: string;
  festivalStrategy?: string;
} {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // Indian festival calendar (simplified)
  const festivals = [
    {
      name: "Republic Day Sale",
      start: { month: 1, day: 20 },
      end: { month: 1, day: 31 },
    },
    {
      name: "Holi Sale",
      start: { month: 3, day: 15 },
      end: { month: 3, day: 25 },
    },
    {
      name: "Summer Sale",
      start: { month: 4, day: 1 },
      end: { month: 5, day: 31 },
    },
    {
      name: "Independence Day Sale",
      start: { month: 8, day: 10 },
      end: { month: 8, day: 20 },
    },
    {
      name: "Diwali/Festive Season",
      start: { month: 10, day: 1 },
      end: { month: 11, day: 15 },
    },
    {
      name: "Year-End Sale",
      start: { month: 12, day: 15 },
      end: { month: 12, day: 31 },
    },
  ];

  for (const festival of festivals) {
    const isActive =
      (month > festival.start.month ||
        (month === festival.start.month && day >= festival.start.day)) &&
      (month < festival.end.month ||
        (month === festival.end.month && day <= festival.end.day));

    if (isActive) {
      return {
        isActiveFestival: true,
        festivalName: festival.name,
        festivalStrategy:
          "Festival season = high competition. Consider aggressive offers, limited-time deals, or bundle promotions.",
      };
    }
  }

  return { isActiveFestival: false };
}

/**
 * Use LLM to enhance recommendations with natural language explanations
 */
async function enhanceRecommendationsWithLLM(
  ruleBasedData: any,
  metrics: PricingMetrics,
  zone: PricingZone,
  customerFeedback: CustomerFeedbackResponse,
  festivalContext: any
): Promise<ActionableRecommendation[]> {
  const neurolink = new NeuroLink();

  // Build festival context string
  const festivalInfo = festivalContext.isActiveFestival 
    ? `\n\n🎉 FESTIVAL ALERT: ${festivalContext.festivalName} is currently active!
       - This is a high-traffic period with increased buyer activity
       - Competitors are likely running aggressive promotions
       - Consider adding a Festival-specific recommendation with category "Festival"`
    : "";

  const prompt = `You are a senior e-commerce pricing strategist. Enhance these recommendations with concise, impactful reasoning.

CONTEXT:
- Pricing Zone: ${zone.zone} (${zone.severity} severity)
- Price Index: ${metrics.priceIndex.toFixed(1)}
- Competitive Rank: ${metrics.competitiveRank} of ${metrics.totalRetailers}
- Customer Sentiment: ${customerFeedback.marketAnalysis.generalOpinion.overallSentiment}
- Target Audience: ${customerFeedback.marketAnalysis.generalOpinion.targetAudience}${festivalInfo}

STRICT RULES FOR REASONING:
- Each reasoning point: 15-25 words ONLY (one clear sentence)
- Be specific and data-driven, not generic
- Include customer insights where relevant
${festivalContext.isActiveFestival ? "- ADD a Festival-specific recommendation for " + festivalContext.festivalName : ""}

VALID CATEGORIES: "Pricing", "Value-Add", "Marketing", "Urgency", "Quality", "Festival"

INPUT RECOMMENDATIONS:
${JSON.stringify(ruleBasedData.rawRecommendations, null, 2)}

CUSTOMER INSIGHTS:
- Strengths: ${customerFeedback.marketAnalysis.generalOpinion.strengths.slice(0, 3).join(", ")}
- Concerns: ${customerFeedback.marketAnalysis.generalOpinion.commonComplaints.slice(0, 3).join(", ")}
- Motivators: ${customerFeedback.marketAnalysis.customerNeeds.purchaseMotivators.slice(0, 2).join(", ")}

OUTPUT FORMAT (JSON array):
[
  {
    "priority": 1,
    "action": "Clear action statement (under 60 chars)",
    "category": "Pricing|Value-Add|Marketing|Urgency|Quality|Festival",
    "confidence": "High|Medium|Low",
    "reasoning": [
      "15-25 word explanation with specific data or insight",
      "15-25 word customer-focused reasoning",
      "15-25 word market or competitive insight"
    ],
    "expectedImpact": "Concise measurable outcome (under 50 chars)"
  }
]

Return ONLY valid JSON array.`;

  try {
    const result = await neurolink.generate({
      input: { text: prompt },
      provider: "vertex",
      model: "gemini-2.5-flash",
      temperature: 0.6, // Higher temperature for creativity
      maxTokens: 4000,
      systemPrompt: `You are a senior e-commerce pricing strategist.

CRITICAL: Each reasoning point must be 15-25 words only. One clear, specific sentence.
- Be data-driven and specific, not generic
- Include numbers, percentages, or specific insights
- Reference customer feedback where relevant

Return valid JSON array only. No markdown.`,
      output: { format: "json" },
    });

    let cleanedContent = result.content.trim();
    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.replace(/^```json\s*\n?/, "");
    }
    if (cleanedContent.endsWith("```")) {
      cleanedContent = cleanedContent.replace(/\n?```\s*$/, "");
    }

    const enhanced = JSON.parse(cleanedContent);
    return enhanced;
  } catch (error) {
    console.warn("⚠️  LLM enhancement failed, using rule-based recommendations");
    return ruleBasedData.rawRecommendations;
  }
}

/**
 * Main market analysis function
 */
export async function analyzeMarketStrategy(
  priceData: WebSearchResponse,
  customerFeedback: CustomerFeedbackResponse,
  merchantPrice: number
): Promise<MarketAnalysisResult> {
  // Extract prices from market data
  const marketPrices = priceData.results.map((r) => {
    const priceStr = r.price.replace(/[₹,]/g, "");
    return parseFloat(priceStr);
  });

  // Step 1: Calculate metrics (deterministic)
  const metrics = calculatePricingMetrics(marketPrices, merchantPrice);

  // Step 2: Determine zone (rule-based)
  const zone = determinePricingZone(metrics);

  // Step 3: Check festival context
  const festivalContext = checkFestivalContext();

  // Step 4: Generate rule-based recommendations
  const ruleBasedData = generateRuleBasedRecommendations(
    metrics,
    zone,
    customerFeedback
  );

  // Step 5: Enhance with LLM (optional, for better explanations)
  const enhancedRecommendations = await enhanceRecommendationsWithLLM(
    ruleBasedData,
    metrics,
    zone,
    customerFeedback,
    festivalContext
  );

  // Build final result
  const result: MarketAnalysisResult = {
    product: priceData.product,
    marketSnapshot: {
      retailersTracked: priceData.results.length,
      lowestMarketPrice: `₹${metrics.minMarketPrice.toLocaleString()}`,
      highestMarketPrice: `₹${metrics.maxMarketPrice.toLocaleString()}`,
      medianMarketPrice: `₹${metrics.medianMarketPrice.toLocaleString()}`,
      merchantCurrentPrice: `₹${merchantPrice.toLocaleString()}`,
    },
    coreMetrics: {
      priceSpreadPercent: metrics.priceSpreadPercent,
      priceIndex: metrics.priceIndex,
      positionPercentile: metrics.positionPercentile,
    },
    pricingStatus: {
      status:
        zone.zone === "Overpriced"
          ? "⚠️ Overpriced compared to market"
          : zone.zone === "Underpriced"
            ? "💰 Underpriced - opportunity zone"
            : "✅ Market-aligned pricing",
      priceIndex: parseFloat(metrics.priceIndex.toFixed(1)),
      priceDifferencePercent: `${ruleBasedData.metrics.priceDiffPercent}%`,
      competitiveRank: ruleBasedData.metrics.rank,
      zone: zone,
    },
    recommendations: enhancedRecommendations,
  };

  if (festivalContext.isActiveFestival) {
    result.festivalContext = festivalContext;
  }

  return result;
}

/**
 * Helper function to ask for price recursively until valid input
 */
async function askForPrice(rl: readline.Interface): Promise<number> {
  return new Promise((resolve) => {
    rl.question("\n💰 Enter your price (in ₹): ", (answer) => {
      const price = parseFloat(answer.replace(/[₹,]/g, ""));
      if (isNaN(price) || price <= 0) {
        console.error("❌ Invalid price. Please enter a positive number (e.g., 30999)");
        // Recursively ask again
        askForPrice(rl).then(resolve);
      } else {
        rl.close();
        resolve(price);
      }
    });
  });
}

/**
 * Get merchant price from CLI input
 * Keeps prompting until a valid price is entered
 */
export async function getMerchantPriceFromCLI(): Promise<number> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return askForPrice(rl);
}
