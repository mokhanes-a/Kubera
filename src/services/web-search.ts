import { NeuroLink } from "@juspay/neurolink";
import * as dotenv from "dotenv";

dotenv.config();

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
  images?: string[];
  videos?: string[];
}

export async function searchProductPrices(
  options: WebSearchOptions
): Promise<WebSearchResponse> {
  const { productName, images } = options;
  const neurolink = new NeuroLink();

  const hasImages = images && images.length > 0;
  
  const textPrompt = hasImages
    ? `Find the current prices for "${productName}" from retailers. 
       I have provided product image(s) for reference - analyze them to identify the exact product variant, color, and specifications.
       Show in table format with columns: S.No, Website, Price (₹), Description. 
       Include at least 3 retailers, try to return all retailers you can find max 10 only don't return more then that.`
    : `Find the current prices for "${productName}" from retailers. 
       Show in table format with columns: S.No, Website, Price (₹), Description. 
       Include at least 3 retailers, try to return all retailers you can find max 10 only don't return more then that.`;

  const systemPrompt = hasImages
    ? `You are a helpful assistant that searches the web for product prices across multiple retailers.

INSTRUCTIONS:
1. ANALYZE THE PROVIDED IMAGE(S) to identify:
   - Exact product model and variant
   - Color/finish
   - Storage capacity or specifications
   - Any visible unique features
2. Search the web thoroughly to find THIS EXACT PRODUCT from as many different retailers and e-commerce websites as possible
3. Include all retailers you can find - aim for comprehensive coverage across all e-commerce platforms, official brand stores, local retailers, and price comparison sites
4. Extract the exact price in Indian Rupees (₹) from each website
5. Include a brief description or any key details (like offers, variants, availability)
6. Match the product based on the image - ensure the variant/color matches what's shown in the image
7. **CRITICAL - URL FORMAT**: Generate a VALID, CONCISE SEARCH URL for each retailer.
   - Use the retailer's standard search endpoint format
   - Common patterns: /search?q=, /s?k=, /search?keyword=, /search/?searchText=
   - Replace spaces in product name with + or %20
   - **MAXIMUM URL LENGTH: 150 characters** (keep search query short)
   - Use ONLY product name + model (skip long descriptions)
   - Example: https://www.amazon.in/s?k=Armour+Pro+Smartwatch
   - DO NOT generate long URLs with repeated characters or gibberish
8. Return the data in valid JSON format with the following structure:

{
    "product": "exact product name with variant details",
    "results": [
        {
            "sno": 1,
            "website": "Website Name",
            "price": "₹XX,XXX",
            "description": "Original Description of the product in that website(offers/details)",
            "url": "Valid search URL (e.g., https://www.retailer.com || .in/search?q=Product+Name)"
        }
    ]
}

9. If a price is not available on a website, skip that website
10. Ensure all prices are current and from live web searches
11. Sort results by price (lowest to highest)
12. Return ONLY valid JSON, no additional text or markdown
13. It should return at least 5 retailers
14. Use the image(s) to ensure you're finding the EXACT variant shown`
    : `You are a helpful assistant that searches the web for product prices across multiple retailers.
1. Search the web thoroughly to find the product price from as many different retailers and e-commerce websites as possible
2. Include all retailers you can find - aim for comprehensive coverage across all e-commerce platforms, official brand stores, local retailers, and price comparison sites
3. Extract the exact price in Indian Rupees (₹) from each website
4. Include a brief description or any key details (like offers, variants, availability)
5. **CRITICAL - URL FORMAT**: Generate a VALID, CONCISE SEARCH URL for each retailer.
   - Use the retailer's standard search endpoint format
   - Common patterns: /search?q=, /s?k=, /search?keyword=, /search/?searchText=
   - Replace spaces in product name with + or %20
   - **MAXIMUM URL LENGTH: 150 characters** (keep search query short)
   - Use ONLY product name + model (skip long descriptions)
   - Example: https://www.flipkart.com/search?q=Armour+Pro+Smartwatch
   - DO NOT generate long URLs with repeated characters or gibberish
6. Return the data in valid JSON format with the following structure:

{
    "product": "product name",
    "results": [
        {
            "sno": 1,
            "website": "Website Name",
            "price": "₹XX,XXX",
            "description": "Original Description of the product in that website(offers/details)",
            "url": "Valid search URL (e.g., https://www.retailer.com/search?q=Product+Name)"
        }
    ]
}

7. If a price is not available on a website, skip that website
8. Ensure all prices are current and from live web searches
9. Sort results by price (lowest to highest)
10. Return ONLY valid JSON, no additional text or markdown
11. It should return at least 5 or 7 and max 10 retailers`;

  const input: any = {
    text: textPrompt,
  };

  if (hasImages) {
    input.images = images;
  }

  const result = await neurolink.generate({
    input,
    provider: "vertex",
    model: "gemini-2.5-flash",
    temperature: 0.1,
    maxTokens: 35000,
    systemPrompt,
    output: {
      format: "json",
    },
  });

  try {
    let cleanedContent = result.content.trim();

    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.replace(/^```json\s*\n?/, "");
    } else if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.replace(/^```\s*\n?/, "");
    }

    if (cleanedContent.endsWith("```")) {
      cleanedContent = cleanedContent.replace(/\n?```\s*$/, "");
    }

    cleanedContent = cleanedContent.trim();

    if (!cleanedContent.endsWith("}")) {
      console.error("Response appears truncated");
      console.error("Raw response length:", result.content.length);
      console.error("Token usage:", result.usage);
      console.error("Partial response received:", cleanedContent);
      
      throw new Error(
        "Incomplete JSON response. Try: 1) Increase maxTokens, 2) Simplify prompt, 3) Request fewer retailers"
      );
    }

    const openBraces = (cleanedContent.match(/{/g) || []).length;
    const closeBraces = (cleanedContent.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      console.error("JSON structure is unbalanced");
      console.error(`Open braces: ${openBraces}, Close braces: ${closeBraces}`);
      console.error("Token usage:", result.usage);
      
      throw new Error(
        `Malformed JSON response - brace mismatch (${openBraces} open, ${closeBraces} close)`
      );
    }

    const parsedResult: WebSearchResponse = JSON.parse(cleanedContent);
    
    if (!parsedResult.product || !parsedResult.results || !Array.isArray(parsedResult.results)) {
      throw new Error("Invalid response structure - missing 'product' or 'results' fields");
    }

    if (parsedResult.results.length === 0) {
      console.warn("No results found for the product");
    }

    parsedResult.results = parsedResult.results.filter(result => {
      if (result.url.length > 200) {
        console.warn(`Skipping result with long URL (${result.url.length} chars) from ${result.website}`);
        return false;
      }
      
      const repeatedPatterns = /(.)\1{20,}/;
      if (repeatedPatterns.test(result.url)) {
        console.warn(`Skipping result with invalid URL pattern from ${result.website}`);
        return false;
      }
      
      return true;
    });

    if (parsedResult.results.length === 0) {
      throw new Error("All results filtered out due to invalid URLs");
    }

    return parsedResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error("\nJSON Parsing Error:", errorMessage);
    console.error("\nResponse Metadata:");
    console.error("  - Provider:", result.provider);
    console.error("  - Model:", result.model);
    console.error("  - Response time:", result.responseTime, "ms");
    
    if (result.usage) {
      console.error("  - Input tokens:", result.usage.input);
      console.error("  - Output tokens:", result.usage.output);
      console.error("  - Total tokens:", (result.usage.input || 0) + (result.usage.output || 0));
    }
    
    console.error("\nRaw response (first 500 chars):");
    console.error(result.content.substring(0, 500) + "...\n");
    
    if (errorMessage.includes("truncated") || errorMessage.includes("Unterminated")) {
      console.error("Suggestions:");
      console.error("  1. Increase maxTokens");
      console.error("  2. Reduce number of retailers requested");
      console.error("  3. Simplify the system prompt");
      console.error("  4. Check network connectivity");
    }
    
    throw new Error(`Failed to parse AI response: ${errorMessage}`);
  }
}
