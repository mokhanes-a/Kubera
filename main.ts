import { searchProductPrices, WebSearchResponse } from "./web-search";
import {
  analyzeCustomerFeedback,
  CustomerFeedbackResponse,
} from "./customer-expectation";
import {
  analyzeMarketStrategy,
  getMerchantPriceFromCLI,
  MarketAnalysisResult,
} from "./market-analysis";

// Progress indicator utility
function showProgress(message: string): void {
  process.stdout.write(`⏳ ${message}...\n`);
}

function showComplete(message: string): void {
  console.log(`✅ ${message}`);
}

function showError(message: string): void {
  console.log(`❌ ${message}`);
}

// Retry wrapper for API calls
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = 2
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) {
        showProgress(`${operationName} (retry ${attempt}/${maxRetries})`);
      }
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        console.log(`\n⚠️  Attempt ${attempt} failed: ${lastError.message}`);
        console.log(`   Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  showError(`${operationName} failed after ${maxRetries} attempts`);
  throw lastError;
}

async function main() {
  const productName = "IQOO neo 10r 12 + 256";

  console.log("\n" + "=".repeat(60));
  console.log("🚀 KUBERA - AI-Powered Pricing & Market Analysis");
  console.log("=".repeat(60) + "\n");

  // Step 1: Search for product prices
  showProgress("Searching product prices across retailers");
  
  let priceResult: WebSearchResponse;
  try {
    priceResult = await withRetry(
      () => searchProductPrices({ productName , images: []}),
      "Price search"
    );
    showComplete(`Found ${priceResult.results.length} retailers`);
    
    // Display price search results in JSON format
    console.log("\n" + "-".repeat(60));
    console.log("📊 PRICE SEARCH RESULTS (JSON)");
    console.log("-".repeat(60));
    console.log(JSON.stringify(priceResult, null, 2));
    console.log("-".repeat(60) + "\n");
  } catch (error) {
    console.error("\n❌ Failed to fetch prices:", (error as Error).message);
    process.exit(1);
  }

  // Step 2: Analyze customer feedback
  showProgress("Analyzing customer feedback and expectations");
  
  let feedbackResult: CustomerFeedbackResponse;
  try {
    feedbackResult = await withRetry(
      () => analyzeCustomerFeedback({ productName }),
      "Customer feedback analysis"
    );
    showComplete("Customer feedback analyzed");
    
    // Display customer feedback results - comprehensive for market analysis
    console.log("\n" + "-".repeat(60));
    console.log("💬 CUSTOMER FEEDBACK ANALYSIS");
    console.log("-".repeat(60));
    const opinion = feedbackResult.marketAnalysis.generalOpinion;
    const needs = feedbackResult.marketAnalysis.customerNeeds;
    
    console.log(`\n   📈 Overall Sentiment: ${opinion.overallSentiment}`);
    console.log(`   ⭐ Average Rating: ${opinion.rating}`);
    console.log(`   🎯 Target Audience: ${opinion.targetAudience}`);
    
    if (opinion.strengths?.length > 0) {
      console.log("\n   ✅ Product Strengths:");
      opinion.strengths.slice(0, 4).forEach((s: string) => {
        console.log(`      • ${s}`);
      });
    }
    
    if (opinion.weaknesses?.length > 0) {
      console.log("\n   ⚠️ Product Weaknesses:");
      opinion.weaknesses.slice(0, 3).forEach((w: string) => {
        console.log(`      • ${w}`);
      });
    }
    
    if (needs.purchaseMotivators?.length > 0) {
      console.log("\n   💡 Purchase Motivators:");
      needs.purchaseMotivators.slice(0, 3).forEach((m: string) => {
        console.log(`      • ${m}`);
      });
    }
    
    if (needs.dealBreakers?.length > 0) {
      console.log("\n   🚫 Deal Breakers:");
      needs.dealBreakers.slice(0, 3).forEach((d: string) => {
        console.log(`      • ${d}`);
      });
    }
    
    console.log(`\n   💰 Price Sensitivity: ${needs.priceSensitivity}`);
    console.log("-".repeat(60) + "\n");
  } catch (error) {
    console.error("\n❌ Failed to analyze feedback:", (error as Error).message);
    process.exit(1);
  }

  // Step 3: Get merchant price
  const merchantPrice = await getMerchantPriceFromCLI();

  // Step 4: Generate market strategy
  showProgress("Generating pricing recommendations");
  
  let marketAnalysis: MarketAnalysisResult;
  try {
    marketAnalysis = await withRetry(
      () => analyzeMarketStrategy(priceResult, feedbackResult, merchantPrice),
      "Market strategy analysis"
    );
    showComplete("Recommendations ready");
  } catch (error) {
    console.error("\n❌ Failed to generate strategy:", (error as Error).message);
    process.exit(1);
  }

  // Display comprehensive merchant report
  console.log("\n" + "=".repeat(60));
  console.log("📊 PRICING & SALES RECOMMENDATION");
  console.log("=".repeat(60));

  console.log(`\n📦 Product: ${marketAnalysis.product}`);

  console.log("\n🔍 MARKET OVERVIEW\n");
  console.log(`   Retailers Tracked: ${marketAnalysis.marketSnapshot.retailersTracked}`);
  console.log(`   Price Range: ${marketAnalysis.marketSnapshot.lowestMarketPrice} – ${marketAnalysis.marketSnapshot.highestMarketPrice}`);
  console.log(`   Market Median: ${marketAnalysis.marketSnapshot.medianMarketPrice}`);
  console.log(`   Your Price: ${marketAnalysis.marketSnapshot.merchantCurrentPrice}`);

  // Display Core Metrics
  console.log("\n📈 CORE METRICS\n");
  
  const priceSpread = marketAnalysis.coreMetrics?.priceSpreadPercent || 0;
  const priceIndex = marketAnalysis.pricingStatus.priceIndex;
  const confidence = marketAnalysis.pricingStatus.zone.confidence;
  
  // Price Spread Rating
  let spreadRating = "";
  if (priceSpread < 10) {
    spreadRating = "Excellent (< 10% = Stable Market)";
  } else if (priceSpread <= 20) {
    spreadRating = "Good (10% - 20% = Moderate Variation)";
  } else {
    spreadRating = "Volatile (> 20% = High Variation)";
  }
  console.log(`   Price Spread: ${priceSpread.toFixed(1)}% - ${spreadRating}`);
  
  // Price Index Rating
  let indexRating = "";
  if (priceIndex < 95) {
    indexRating = "Aggressive (< 95 = Underpriced)";
  } else if (priceIndex <= 105) {
    indexRating = "Optimal (95 - 105 = Market Aligned)";
  } else if (priceIndex <= 108) {
    indexRating = "Moderate (105 - 108 = Slightly Above)";
  } else {
    indexRating = "High (> 108 = Overpriced)";
  }
  console.log(`   Price Index: ${priceIndex.toFixed(1)} - ${indexRating}`);

  console.log("\n⚠️ CURRENT SITUATION\n");

  const priceDiff = parseFloat(marketAnalysis.pricingStatus.priceDifferencePercent);
  const statusEmoji = marketAnalysis.pricingStatus.zone.zone === "Overpriced" ? "📈"
    : marketAnalysis.pricingStatus.zone.zone === "Underpriced" ? "📉" : "✅";

  if (marketAnalysis.pricingStatus.zone.zone === "Overpriced") {
    console.log(`   ${statusEmoji} Priced HIGHER than market`);
  } else if (marketAnalysis.pricingStatus.zone.zone === "Underpriced") {
    console.log(`   ${statusEmoji} Priced LOWER than market`);
  } else {
    console.log(`   ${statusEmoji} Priced COMPETITIVELY`);
  }

  console.log(`   ${Math.abs(priceDiff).toFixed(1)}% ${priceDiff > 0 ? "above" : "below"} median`);

  const rankParts = marketAnalysis.pricingStatus.competitiveRank.split(" of ");
  const yourRank = parseInt(rankParts[0]);
  const totalRanks = parseInt(rankParts[1]);

  if (yourRank === 1) {
    console.log(`   Rank: CHEAPEST`);
  } else if (yourRank === totalRanks) {
    console.log(`   Rank: MOST EXPENSIVE`);
  } else {
    console.log(`   Rank: ${yourRank} of ${totalRanks}`);
  }

  if (marketAnalysis.festivalContext?.isActiveFestival) {
    console.log(`\n🎉 ${marketAnalysis.festivalContext.festivalName} is active!`);
  }

  // Filter and show only impactful recommendations (2-5)
  const sortedRecs = marketAnalysis.recommendations
    .filter(rec => rec.confidence === "High" || rec.confidence === "Medium")
    .sort((a, b) => a.priority - b.priority);
  
  // Show minimum 2, maximum 5 recommendations
  const recsToShow = sortedRecs.slice(0, Math.max(2, Math.min(5, sortedRecs.length)));

  console.log("\n✅ RECOMMENDED ACTIONS\n");

  recsToShow.forEach((rec, index) => {
    let emoji = "📌";
    const cat = rec.category;
    if (cat === "Pricing") emoji = "💰";
    else if (cat === "Value-Add") emoji = "🎁";
    else if (cat === "Marketing") emoji = "📢";
    else if (cat === "Urgency") emoji = "⏰";
    else if (cat === "Quality") emoji = "⭐";
    else if (cat === "Festival") emoji = "🎉";

    // Action header with confidence
    console.log(`${emoji} Action ${index + 1}: ${rec.action} (${rec.confidence} Confidence)`);
    console.log(`   Category: ${rec.category}`);
    
    // Why this works section - detailed reasoning
    console.log("   Why this works:");
    rec.reasoning.forEach((reason: string) => {
      console.log(`   • ${reason}`);
    });
    
    // Expected impact
    console.log(`   📈 Expected Impact: ${rec.expectedImpact}`);
    console.log("");
  });

  console.log("=".repeat(60));
  console.log("💡 SUMMARY");
  console.log("=".repeat(60));

  let summary = "";
  if (marketAnalysis.pricingStatus.zone.zone === "Overpriced") {
    summary = `Price ${Math.abs(priceDiff).toFixed(1)}% above market → ${marketAnalysis.recommendations[0].action}`;
  } else if (marketAnalysis.pricingStatus.zone.zone === "Underpriced") {
    summary = `Price ${Math.abs(priceDiff).toFixed(1)}% below market → ${marketAnalysis.recommendations[0].action}`;
  } else {
    summary = `Price aligned → Focus on ${marketAnalysis.recommendations[0].category.toLowerCase()} optimization`;
  }

  console.log(`\n   ${summary}`);
  console.log(`   Position: ${marketAnalysis.pricingStatus.zone.zone}`);
  console.log("\n" + "=".repeat(60) + "\n");
}

main().catch((error) => {
  console.error("\n❌ Error:", error.message);
  process.exit(1);
});
