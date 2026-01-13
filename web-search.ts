import { NeuroLink } from "@juspay/neurolink";
import * as dotenv from "dotenv";

dotenv.config();

// Type definitions for the response
export interface PriceResult {
  sno: number;
  website: string;
  price: string;
  description: string;
  url: string;
}

export interface WebSearchResponse {
  product: string;
  results: PriceResult[];
}

export interface WebSearchOptions {
  productName: string;
  images?: string[]; // Optional array of image URLs
}

/**
 * Search the web for product prices across multiple retailers
 * @param options - Product name and optional image URLs
 * @returns JSON response with price comparison data
 */
export async function searchProductPrices(
  options: WebSearchOptions
): Promise<WebSearchResponse> {
  const { productName, images } = options;
  const neurolink = new NeuroLink();

  // Build the text prompt based on whether images are provided
  const hasImages = images && images.length > 0;
  
  const textPrompt = hasImages
    ? `Find the current prices for "${productName}" from retailers. 
       I have provided product image(s) for reference - analyze them to identify the exact product variant, color, and specifications.
       Show in table format with columns: S.No, Website, Price (₹), Description. 
       Include at least 3 retailers, try to return all retailers you can find.`
    : `Find the current prices for "${productName}" from retailers. 
       Show in table format with columns: S.No, Website, Price (₹), Description. 
       Include at least 3 retailers, try to return all retailers you can find.`;

  // Build the system prompt based on whether images are provided
  const systemPrompt = hasImages
    ? `You are a helpful assistant that searches the web for product prices across multiple retailers.

INSTRUCTIONS:
1. ANALYZE THE PROVIDED IMAGE(S) to identify:
   - Exact product model and variant
   - Color/finish
   - Storage capacity or specifications
   - Any visible unique features
2. Search the web thoroughly to find THIS EXACT PRODUCT from as many different retailers and e-commerce websites as possible
3. Include all retailers you can find - aim for comprehensive coverage (Amazon.in, Flipkart, official brand stores, Croma, Reliance Digital, Vijay Sales, Tata Cliq, local retailers, price comparison sites, etc.)
4. Extract the exact price in Indian Rupees (₹) from each website
5. Include a brief description or any key details (like offers, variants, availability)
6. Match the product based on the image - ensure the variant/color matches what's shown in the image
7. Return the data in valid JSON format with the following structure:

{
    "product": "exact product name with variant details",
    "results": [
        {
            "sno": 1,
            "website": "Website Name",
            "price": "₹XX,XXX",
            "description": "Original Description of the product in that website(offers/details)",
            "url": "product link on that website"
        }
    ]
}

8. If a price is not available on a website, skip that website
9. Ensure all prices are current and from live web searches
10. Sort results by price (lowest to highest)
11. Return ONLY valid JSON, no additional text or markdown
12. It should return at least 5 retailers
13. Use the image(s) to ensure you're finding the EXACT variant shown`
    : `You are a helpful assistant that searches the web for product prices across multiple retailers.
INSTRUCTIONS:
1. Search the web thoroughly to find the product price from as many different retailers and e-commerce websites as possible
2. Include all retailers you can find - aim for comprehensive coverage (Amazon.in, Flipkart, official brand stores, Croma, Reliance Digital, Vijay Sales, Tata Cliq, local retailers, price comparison sites, etc.)
3. Extract the exact price in Indian Rupees (₹) from each website
4. Include a brief description or any key details (like offers, variants, availability)
5. Return the data in valid JSON format with the following structure:

{
    "product": "product name",
    "results": [
        {
            "sno": 1,
            "website": "Website Name",
            "price": "₹XX,XXX",
            "description": "Original Description of the product in that website(offers/details)",
            "url": "product link on that website"
        }
    ]
}

6. If a price is not available on a website, skip that website
7. Ensure all prices are current and from live web searches
8. Sort results by price (lowest to highest)
9. Return ONLY valid JSON, no additional text or markdown
10. It should return at least 5 retailers`;

  // Build the input object
  const input: any = {
    text: textPrompt,
  };

  // Add images if provided
  if (hasImages) {
    input.images = images;
  }

  const result = await neurolink.generate({
    input,
    provider: "vertex",
    model: "gemini-2.5-flash",
    temperature: 0.1,
    maxTokens: 5000, // Increased to prevent truncation
    systemPrompt,
    output: {
      format: "json",
    },
  });

  // Parse and return the JSON response
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

    // Validate that the JSON appears complete
    if (!cleanedContent.endsWith("}")) {
      console.error("⚠️  Response appears truncated (doesn't end with '}')\n");
      console.error("Raw response length:", result.content.length);
      console.error("Token usage:", result.usage);
      console.error("\n📝 Partial response received:");
      console.error(cleanedContent);
      
      throw new Error(
        `Incomplete JSON response - AI response was truncated. ` +
        `Try: 1) Increase maxTokens, 2) Simplify the prompt, 3) Request fewer retailers`
      );
    }

    // Count braces to check if JSON is balanced
    const openBraces = (cleanedContent.match(/{/g) || []).length;
    const closeBraces = (cleanedContent.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      console.error("⚠️  JSON structure is unbalanced\n");
      console.error(`Open braces: ${openBraces}, Close braces: ${closeBraces}`);
      console.error("Token usage:", result.usage);
      
      throw new Error(
        `Malformed JSON response - brace mismatch (${openBraces} open, ${closeBraces} close). ` +
        `This usually means the response was cut off.`
      );
    }

    const parsedResult: WebSearchResponse = JSON.parse(cleanedContent);
    
    // Validate the parsed structure
    if (!parsedResult.product || !parsedResult.results || !Array.isArray(parsedResult.results)) {
      throw new Error(
        "Invalid response structure - missing 'product' or 'results' fields"
      );
    }

    if (parsedResult.results.length === 0) {
      console.warn("⚠️  No results found for the product");
    }

    return parsedResult;
  } catch (error) {
    // Enhanced error reporting
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error("\n❌ JSON Parsing Error:", errorMessage);
    console.error("\n📊 Response Metadata:");
    console.error("  - Provider:", result.provider);
    console.error("  - Model:", result.model);
    console.error("  - Response time:", result.responseTime, "ms");
    
    if (result.usage) {
      console.error("  - Input tokens:", result.usage.input);
      console.error("  - Output tokens:", result.usage.output);
      console.error("  - Total tokens:", (result.usage.input || 0) + (result.usage.output || 0));
    }
    
    console.error("\n📝 Raw response (first 500 chars):");
    console.error(result.content.substring(0, 500) + "...\n");
    
    // Provide helpful suggestions based on error type
    if (errorMessage.includes("truncated") || errorMessage.includes("Unterminated")) {
      console.error("💡 Suggestions:");
      console.error("  1. Increase maxTokens (currently 4000)");
      console.error("  2. Reduce number of retailers requested");
      console.error("  3. Simplify the system prompt");
      console.error("  4. Check network connectivity");
    }
    
    throw new Error(`Failed to parse AI response: ${errorMessage}`);
  }
}
