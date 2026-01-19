# Troubleshooting Guide

## Token Truncation Issues

### Problem
AI responses getting truncated, causing JSON parsing errors and system crashes.

### Root Causes

1. **URL Hallucination (FIXED)** ✅
   - AI was generating URLs with thousands of repeated characters (e.g., `000000...`)
   - Example: 25,096 character response where 24,000+ were garbage URL data
   - **Fix**: Added strict URL validation and length limits (max 150 chars in prompt, max 200 in code)

2. **Wrong Product Data** ⚠️
   - Customer feedback returns data about wrong products (e.g., vaping products for smartwatches)
   - **Fix**: Added product name in system prompt: `🎯 PRODUCT TO ANALYZE: "${productName}"`

3. **Token Limits**
   - Web Search: 25,000 tokens (was 40,000)
   - Customer Expectation: 15,000 tokens
   - Market Analysis: 8,192 tokens

### Current Fixes Applied

#### 1. Web Search URL Validation
```typescript
// In web-search.ts - filters out bad URLs
parsedResult.results = parsedResult.results.filter(result => {
  if (result.url.length > 200) return false;  // Too long
  if (/(.)\1{20,}/.test(result.url)) return false;  // Repeated chars
  return true;
});
```

#### 2. Strict Prompt Instructions
- ✅ **MAXIMUM URL LENGTH: 150 characters** in prompt
- ✅ "DO NOT generate long URLs with repeated characters or gibberish"
- ✅ Product name explicitly stated in customer feedback prompt

#### 3. Better Error Messages
- Shows token usage breakdown
- Displays first 500 chars of failed response
- Provides specific suggestions based on error type

## About maxTokens Setting

### Should You Remove maxTokens?

**❌ NO - Keep maxTokens set!**

**Why:**
- Without limits, AI can generate infinite responses
- Costs increase exponentially with token usage
- More prone to hallucination in long responses
- Harder to debug issues

**Current Settings (Optimal):**
```typescript
web-search.ts:         maxTokens: 25000  // Enough for 10 retailers
customer-expectation:  maxTokens: 15000  // Detailed feedback analysis
market-analysis.ts:    maxTokens: 8192   // Focused recommendations
```

### When to Adjust maxTokens

**Increase if:**
- Consistently hitting limit with valid data
- Need more retailers (10+ results)
- Response shows "..." truncation in valid JSON

**Decrease if:**
- Getting too much verbose/irrelevant data
- Want to save costs
- Responses contain filler content

## Common Errors

### 1. "Incomplete JSON response - AI response was truncated"

**Cause:** Response hit maxTokens limit

**Solutions:**
1. ✅ Check for URL hallucination (already fixed)
2. Simplify the prompt (remove verbose instructions)
3. Request fewer retailers (default is 5-10)
4. Last resort: Increase maxTokens

### 2. "setRawMode EIO"

**Cause:** Terminal input stream closed/interrupted

**Solutions:**
- Don't Ctrl+C during price input
- Check terminal is in proper state
- Restart if terminal becomes unresponsive

### 3. Wrong Product Data in Customer Feedback

**Cause:** AI couldn't find specific product, returned related category data

**Fixed:** Now includes product name in prompt and warns when data is ambiguous

### 4. All Results Filtered Out (Invalid URLs)

**Cause:** AI generated all bad URLs (hallucination mode)

**Solutions:**
1. Retry (use existing retry logic)
2. Check internet connectivity
3. Verify Gemini API is responding properly

## Testing Best Practices

### Recommended Test Flow

1. **Start with simple products**
   - Well-known brands
   - Clear model names
   - Example: "iPhone 15 Pro"

2. **Monitor token usage**
   - Check console output for token counts
   - Warning if > 80% of maxTokens used

3. **Validate URLs**
   - URLs should be < 150 characters
   - Should look like real search URLs
   - No repeated characters

4. **Check product consistency**
   - Web search product name should match input
   - Customer feedback should analyze same product
   - Market analysis should reference correct product

### What to Do When It Crashes

1. **Check the error type**
   - JSON truncation → Token limit issue
   - URL validation → All URLs were bad (retry)
   - setRawMode → Terminal issue (restart)

2. **Look at token usage**
   ```
   Input tokens: 10515
   Output tokens: 24902  ← Too high? Check for garbage
   Total tokens: 35417
   ```

3. **Inspect raw response**
   - First 500 characters shown in error
   - Look for repeated characters
   - Check if it's valid JSON start

4. **Use retry logic**
   - System auto-retries 2 times
   - Second attempt often succeeds

## Performance Metrics

### Expected Token Usage (Normal)

```
Web Search:
- Input: ~2,000-4,000 tokens
- Output: ~1,500-4,000 tokens (10 retailers)
- Total: ~5,500 tokens

Customer Feedback:
- Input: ~4,000-6,000 tokens  
- Output: ~2,000-5,000 tokens
- Total: ~8,000 tokens

Market Analysis:
- Input: ~3,000-5,000 tokens
- Output: ~2,000-4,000 tokens
- Total: ~7,000 tokens
```

### Red Flags

- Output tokens > 20,000 → Likely hallucination
- Response length > 50,000 chars → Check for repeated content
- URL length > 200 chars → Garbage URL
- Parse time > 10 seconds → Network/API issue

## Summary

✅ **Fixed Issues:**
- URL hallucination with validation
- Added product specificity
- Better error messages

⚠️ **Still Monitor:**
- Customer feedback accuracy
- Token usage patterns
- URL quality

🎯 **Best Practice:**
- Keep maxTokens set (don't remove)
- Use retry logic
- Validate output quality
- Monitor token consumption
