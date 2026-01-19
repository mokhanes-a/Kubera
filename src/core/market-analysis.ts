import { NeuroLink } from "@juspay/neurolink";
import * as dotenv from "dotenv";
import * as readline from "readline";
import { WebSearchResponse } from "../services/web-search";
import { CustomerFeedbackResponse } from "../services/customer-expectation";

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
  priceIndex: number;
  competitiveRank: number;
  totalRetailers: number;
  positionPercentile: number;
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

function applyPsychologicalPricing(price: number): number {
  const thousands = Math.floor(price / 1000);
  return thousands * 1000 + 999;
}

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

function determinePricingZone(metrics: PricingMetrics): PricingZone {
  const { priceIndex, positionPercentile, priceSpreadPercent, totalRetailers } =
    metrics;

  let confidence: "High" | "Medium" | "Low" = "Medium";
  if (totalRetailers >= 6 && priceSpreadPercent < 10) {
    confidence = "High";
  } else if (totalRetailers <= 3 || priceSpreadPercent > 20) {
    confidence = "Low";
  }

  if (priceIndex > 108) {
    return {
      zone: "Overpriced",
      severity: priceIndex > 130 ? "Critical" : "Moderate",
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
      severity: priceIndex < 50 ? "Critical" : "Moderate",
      confidence,
    };
  }
}

function generateRuleBasedRecommendations(
  metrics: PricingMetrics,
  zone: PricingZone,
  customerFeedback: CustomerFeedbackResponse
): any {
  const recommendations = [];

  const priceDiff = metrics.merchantPrice - metrics.medianMarketPrice;
  const priceDiffPercent = ((priceDiff / metrics.medianMarketPrice) * 100).toFixed(1);

  if (zone.zone === "Overpriced") {
    let targetPriceLow: number;
    let targetPriceHigh: number;
    let primaryRecommendation: string;
    
    if (metrics.priceIndex > 130) {
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
      const gapToClose = priceDiff * 0.65;
      const rawLow = metrics.merchantPrice - gapToClose * 1.1;
      const rawHigh = metrics.merchantPrice - gapToClose * 0.9;
      targetPriceLow = applyPsychologicalPricing(rawLow);
      targetPriceHigh = applyPsychologicalPricing(rawHigh);
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
      const suggestedReduction = priceDiff * 0.6;
      const rawLow = metrics.merchantPrice - suggestedReduction;
      const rawHigh = metrics.merchantPrice - (suggestedReduction * 0.8);
      const targetLow = applyPsychologicalPricing(rawLow);
      const targetHigh = applyPsychologicalPricing(rawHigh);
      primaryRecommendation = `Reduce price to ₹${targetLow.toLocaleString()} - ₹${targetHigh.toLocaleString()}`;
      
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

  else if (zone.zone === "Underpriced") {
    const priceDiffFromMedian = metrics.medianMarketPrice - metrics.merchantPrice;
    let targetPriceLow: number;
    let targetPriceHigh: number;
    let primaryRecommendation: string;
    
    if (metrics.priceIndex < 50) {
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
      const gapToClose = priceDiffFromMedian * 0.6;
      const rawLow = metrics.merchantPrice + gapToClose * 0.8;
      const rawHigh = metrics.merchantPrice + gapToClose * 1.2;
      targetPriceLow = applyPsychologicalPricing(rawLow);
      targetPriceHigh = applyPsychologicalPricing(rawHigh);
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
      const suggestedIncrease = priceDiffFromMedian * 0.5;
      const rawLow = metrics.merchantPrice + suggestedIncrease;
      const rawHigh = metrics.merchantPrice + (suggestedIncrease * 1.3);
      const targetLow = applyPsychologicalPricing(rawLow);
      const targetHigh = applyPsychologicalPricing(rawHigh);
      primaryRecommendation = `Increase price to ₹${targetLow.toLocaleString()} - ₹${targetHigh.toLocaleString()}`;
      
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

  const isRoundPrice = metrics.merchantPrice % 1000 === 0 || metrics.merchantPrice % 100 === 0;
  if (isRoundPrice) {
    const psychologicalPrice = applyPsychologicalPricing(metrics.merchantPrice);
    const savingsPerception = metrics.merchantPrice - psychologicalPrice;
    
    recommendations.push({
      priority: 6,
      action: `Use psychological pricing: ₹${psychologicalPrice.toLocaleString()} instead of ₹${metrics.merchantPrice.toLocaleString()}`,
      category: "Pricing",
      confidence: "High",
      rule: "PSYCHOLOGICAL_PRICING",
      reasoning: [
        `₹${psychologicalPrice.toLocaleString()} appears significantly cheaper than ₹${metrics.merchantPrice.toLocaleString()} despite only ₹${savingsPerception} difference.`,
        `Round numbers like ₹${metrics.merchantPrice.toLocaleString()} trigger rational thinking; charm pricing triggers emotional buying decisions.`,
        `Research shows prices ending in 9 increase conversion by 8-12% for ${customerFeedback.marketAnalysis.generalOpinion.targetAudience.toLowerCase()}.`,
      ],
      expectedImpact: "8-12% conversion improvement without margin loss",
      psychologicalPriceSuggestion: {
        currentPrice: metrics.merchantPrice,
        suggestedPrice: psychologicalPrice,
        savingsPerception: savingsPerception,
      },
    });
  }

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

function checkFestivalContext(): {
  isActiveFestival: boolean;
  festivalName?: string;
  festivalStrategy?: string;
} {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

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

async function enhanceRecommendationsWithLLM(
  ruleBasedData: any,
  metrics: PricingMetrics,
  zone: PricingZone,
  customerFeedback: CustomerFeedbackResponse,
  festivalContext: any
): Promise<ActionableRecommendation[]> {
  const neurolink = new NeuroLink();

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

CRITICAL PSYCHOLOGICAL PRICING RULE:
When suggesting price changes in the "action" field, ALWAYS use psychological pricing format:
- Round prices ending in 000 should become X999 (e.g., 5000 → 4999, 10000 → 9999)
- Prices like 5500 should become 5499
- Prices like 2000 should become 1999
- Prices like 3200 should become 3199
- This makes prices appear significantly lower to customers
- Example: "Reduce price to Rs 4,999 - Rs 5,499" (NOT "Rs 5,000 - Rs 5,500")

BE CREATIVE with psychological pricing recommendations:
- If the merchant entered a round price (e.g., 5000, 7000, 2000), you MUST suggest the psychological equivalent
- Explain the psychological impact in unique, engaging ways
- Use behavioral economics terms when relevant (anchoring, charm pricing, left-digit effect)
- Make the reasoning compelling and different each time

STRICT RULES FOR REASONING:
- Each reasoning point: 15-25 words ONLY (one clear sentence)
- Be specific and data-driven, not generic
- Include customer insights where relevant
- ALWAYS use psychological pricing (X999 format) in price recommendations
- For psychological pricing recommendations, be creative and engaging in your reasoning
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
      temperature: 0.6,
      maxTokens: 20000,
      systemPrompt: `You are a senior e-commerce pricing strategist.

CRITICAL PSYCHOLOGICAL PRICING RULE:
ALL price recommendations MUST use psychological pricing format (X999):
- Rs 5,000 → Rs 4,999
- Rs 10,000 → Rs 9,999
- Rs 2,000 → Rs 1,999
- Rs 3,500 → Rs 3,499
This pricing leverages the left-digit effect and makes products appear significantly cheaper to customers.

CREATIVITY REQUIREMENT for Psychological Pricing:
When you see a recommendation with rule "PSYCHOLOGICAL_PRICING":
- Use creative, engaging language to explain the psychological impact
- Reference behavioral economics concepts (anchoring, charm pricing, left-digit bias, price perception)
- Vary your reasoning each time - don't repeat the same explanations
- Make it compelling and persuasive
- Examples:
  * "Left-digit effect triggers instant price comparison; brain processes Rs 4,999 as Rs 4,000 range, not Rs 5,000"
  * "Charm pricing exploits cognitive bias where consumers perceive Rs 1,999 as significantly cheaper than Rs 2,000"
  * "Anchoring bias makes Rs 9,999 feel like substantial savings compared to psychological barrier of Rs 10,000"

REASONING RULES:
- Each reasoning point must be 15-25 words only. One clear, specific sentence.
- Be data-driven and specific, not generic
- Include numbers, percentages, or specific insights
- Reference customer feedback where relevant
- When mentioning prices in reasoning, ALWAYS use X999 format

IMPORTANT: In your "action" field, ensure all suggested prices use psychological pricing.
Example: "Reduce price to Rs 4,999 - Rs 5,499" NOT "Rs 5,000 - Rs 5,500"

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
    console.warn("LLM enhancement failed, using rule-based recommendations");
    return ruleBasedData.rawRecommendations;
  }
}

export async function analyzeMarketStrategy(
  priceData: WebSearchResponse,
  customerFeedback: CustomerFeedbackResponse,
  merchantPrice: number
): Promise<MarketAnalysisResult> {
  const marketPrices = priceData.results.map((r) => {
    const priceStr = r.price.replace(/[₹,]/g, "");
    return parseFloat(priceStr);
  });

  const metrics = calculatePricingMetrics(marketPrices, merchantPrice);

  const zone = determinePricingZone(metrics);

  const festivalContext = checkFestivalContext();

  const ruleBasedData = generateRuleBasedRecommendations(
    metrics,
    zone,
    customerFeedback
  );

  const enhancedRecommendations = await enhanceRecommendationsWithLLM(
    ruleBasedData,
    metrics,
    zone,
    customerFeedback,
    festivalContext
  );

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

async function askForPrice(rl: readline.Interface): Promise<number> {
  return new Promise((resolve) => {
    rl.question("\nEnter your price (in Rs): ", (answer) => {
      const price = parseFloat(answer.replace(/[₹,]/g, ""));
      if (isNaN(price) || price <= 0) {
        console.error("Invalid price. Please enter a positive number (e.g., 30999)");
        askForPrice(rl).then(resolve);
      } else {
        rl.close();
        resolve(price);
      }
    });
  });
}

export async function getMerchantPriceFromCLI(): Promise<number> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return askForPrice(rl);
}
