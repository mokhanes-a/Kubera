
/* 
================================================================================
NEUROLINK GENERATE FUNCTION - ALL POSSIBLE PARAMETERS
================================================================================

input: {
  // TEXT INPUT (required - at least one input type)
  text: "Your prompt or query here",

  // IMAGE INPUTS (optional - supports multiple formats)
  images: [
    Buffer.from("..."),                                    // Buffer object
    "https://example.com/image.jpg",                       // URL string
    "/path/to/local/image.png",                           // Local file path
    { data: Buffer | "url", altText: "Description" }      // With alt text
  ],

  // VIDEO INPUTS (optional)
  videoFiles: [
    Buffer.from("..."),                                    // Buffer object
    "/path/to/video.mp4"                                  // Local file path
  ],

  // PDF INPUTS (optional)
  pdfFiles: [
    Buffer.from("..."),                                    // Buffer object
    "/path/to/document.pdf"                               // Local file path
  ],

  // CSV INPUTS (optional)
  csvFiles: [
    Buffer.from("..."),                                    // Buffer object
    "/path/to/data.csv"                                   // Local file path
  ],

  // FILES (optional - generic file input)
  files: [Buffer.from("..."), "/path/to/file.txt"],

  // ADVANCED MULTIMODAL CONTENT (optional)
  content: [/* Content array for complex multimodal inputs 
},

// PROVIDER (required)
provider: "vertex"           // Google Vertex AI (required for web search grounding)
        | "google-ai"        // Google AI Studio (no web search)
        | "openai"           // OpenAI GPT models
        | "anthropic"        // Anthropic Claude models
        | "cohere"           // Cohere models
        | "mistral"          // Mistral AI models
        | "groq"             // Groq models
        | "together"         // Together AI models
        | "fireworks"        // Fireworks AI models
        | "replicate",       // Replicate models

// MODEL (required)
model: "gemini-2.5-flash"              // Google Gemini Flash (fast, efficient)
     | "gemini-2.5-pro"                // Google Gemini Pro (advanced reasoning)
     | "gemini-3-flash-preview"        // Gemini 3 Flash (with thinking)
     | "gemini-3-pro-preview"          // Gemini 3 Pro (with thinking)
     | "gpt-4"                         // OpenAI GPT-4
     | "gpt-4-turbo"                   // OpenAI GPT-4 Turbo
     | "claude-3-7-sonnet-20250219"    // Anthropic Claude 3.7 Sonnet
     | "claude-3-5-sonnet-20241022"    // Anthropic Claude 3.5 Sonnet
     | "veo-3.1",                      // Google Veo (video generation)

// TEMPERATURE (optional - default varies by provider)
temperature: 0.0 - 1.0
  // 0.0-0.3: Precise, factual, deterministic (best for prices, data extraction)
  // 0.4-0.7: Balanced creativity and consistency
  // 0.8-1.0: Highly creative, varied responses

// MAX TOKENS (optional - controls response length)
maxTokens: 100            // Short responses
         | 500            // Medium responses
         | 1000           // Long responses
         | 4000           // Very long responses
         | 8000,          // Maximum for most models

// SYSTEM PROMPT (optional - sets AI behavior/personality)
systemPrompt: "You are a helpful assistant that...",

// REGION (optional - for cloud providers)
region: "us-central1"     // US Central
      | "us-east1"        // US East
      | "europe-west1"    // Europe West
      | "asia-southeast1", // Asia Southeast

// OUTPUT CONFIGURATION (optional)
output: {
  format: "text"          // Plain text output (default)
        | "structured"    // Structured data with schema validation
        | "json",         // JSON output

  mode: "text"            // Text generation (default)
      | "video",          // Video generation (requires images input)

  video: {                // Video generation options (when mode = "video")
    resolution: "720p" | "1080p" | "4k",
    length: 8,            // Duration in seconds (4-24)
    aspectRatio: "16:9" | "9:16" | "1:1",
    audio: true | false   // Include audio
  }
},

// SCHEMA (optional - for structured/validated JSON output)
schema: z.object({
  product: z.string(),
  price: z.number(),
  currency: z.string()
}),
// ⚠️ IMPORTANT: Must use disableTools: true with Google providers when using schema

// TOOLS (optional - custom functions AI can call)
tools: {
  getWeather: {
    description: "Get current weather",
    parameters: z.object({ city: z.string() }),
    execute: async ({ city }) => { /* implementation  }
  }
},

// DISABLE TOOLS (required when using schema with Google providers)
disableTools: true | false,

// TOOL USAGE CONTEXT (optional - helps AI decide when to use tools)
toolUsageContext: "Additional context about when to use tools",

// CONVERSATION HISTORY (optional - for multi-turn conversations)
conversationHistory: [
  { role: "user", content: "Hello" },
  { role: "assistant", content: "Hi! How can I help?" },
  { role: "user", content: "Tell me about..." }
],

// TEXT-TO-SPEECH (optional - generate audio from response)
tts: {
  enabled: true | false,
  voice: "en-US-Neural2-C"        // Voice ID
       | "en-US-Neural2-D"
       | "en-IN-Neural2-A",        // Indian English
  speed: 0.25 - 4.0,                // Playback speed (1.0 = normal)
  pitch: -20.0 - 20.0,              // Voice pitch adjustment
  format: "mp3" | "wav" | "ogg",    // Audio format
  quality: "standard" | "high"      // Audio quality
},

// THINKING CONFIG (optional - for extended reasoning models)
thinkingConfig: {
  enabled: true | false,
  
  // For Gemini 3 models
  thinkingLevel: "minimal"          // Minimal thinking (Flash only)
               | "low"              // Fast reasoning
               | "medium"           // Balanced
               | "high",            // Maximum reasoning (Pro default)
  
  // For Anthropic Claude models
  budgetTokens: 10000               // Token budget for thinking
},

// CSV OPTIONS (optional - when processing CSV files)
csvOptions: {
  maxRows: 1000,                    // Maximum rows to process
  formatStyle: "raw"                // Raw CSV data
             | "markdown"           // Markdown table
             | "json",              // JSON array
  includeHeaders: true | false      // Include CSV headers
},

// VIDEO OPTIONS (optional - when processing video files)
videoOptions: {
  frames: 10,                       // Number of frames to extract
  quality: 1-100,                   // Frame quality
  format: "jpeg" | "png",           // Image format for frames
  transcribeAudio: true | false     // Enable audio transcription
},

// TIMEOUT (optional - request timeout)
timeout: 30000                      // Milliseconds
       | "30s"                      // String format
       | "1m",                      // String format

// ENABLE ANALYTICS (optional - track usage metrics)
enableAnalytics: true | false,

// ENABLE EVALUATION (optional - evaluate response quality)
enableEvaluation: true | false,

// EVALUATION DOMAIN (optional - context for evaluation)
evaluationDomain: "e-commerce" | "healthcare" | "finance" | "general",

// CONTEXT (optional - additional metadata)
context: {
  userId: "user123",
  sessionId: "session456",
  customData: { key: "value" }
},

// STREAMING (optional - stream responses in chunks)
streaming: {
  enabled: true | false,
  chunkSize: 100,                   // Size of each chunk
  bufferSize: 1000,                 // Buffer size
  enableProgress: true | false,     // Show progress
  fallbackToGenerate: true | false  // Fallback if streaming fails
},

// FACTORY CONFIG (optional - advanced domain configuration)
factoryConfig: {
  domainType: "e-commerce" | "customer-support" | "content-generation",
  domainConfig: { /* domain-specific settings },
  enhancementType: "domain-configuration" 
                 | "streaming-optimization" 
                 | "mcp-integration",
  preserveLegacyFields: true | false,
  validateDomainData: true | false
}

================================================================================
RESULT OBJECT - RETURNED BY generate()
================================================================================

{
  // MAIN CONTENT (always present)
  content: "Generated text response",

  // TEXT OUTPUT (alternative format)
  outputs: {
    text: "Generated text response"
  },

  // AUDIO (present when tts enabled)
  audio: {
    buffer: Buffer,                  // Audio data
    size: 12345,                     // Size in bytes
    format: "mp3",                   // Audio format
    duration: 5.2,                   // Duration in seconds
    voice: "en-US-Neural2-C"         // Voice used
  },

  // VIDEO (present when output.mode = "video")
  video: {
    data: Buffer,                    // Video data
    metadata: {
      duration: 8,                   // Duration in seconds
      dimensions: { width: 1920, height: 1080 },
      format: "mp4",
      size: 1048576                  // Size in bytes
    }
  },

  // IMAGE OUTPUT (for image generation)
  imageOutput: {
    base64: "base64-encoded-image-data"
  },

  // METADATA
  provider: "vertex",                // Provider used
  model: "gemini-2.5-flash",         // Model used
  
  // TOKEN USAGE
  usage: {
    input: 150,                      // Input tokens
    output: 450,                     // Output tokens
    total: 600                       // Total tokens
  },

  responseTime: 2500,                // Response time in milliseconds

  // TOOL INFORMATION (when tools are used)
  toolCalls: [
    {
      toolCallId: "call_123",
      toolName: "websearchGrounding",
      args: { query: "..." }
    }
  ],
  
  toolResults: [/* tool execution results ],
  
  toolsUsed: ["websearchGrounding"], // List of tools used
  
  toolExecutions: [
    {
      name: "websearchGrounding",
      input: { query: "..." },
      output: { /* search results }
    }
  ],

  enhancedWithTools: true,           // Whether tools were used
  
  availableTools: [                  // Available tools for this request
    {
      name: "websearchGrounding",
      description: "Search the web",
      parameters: { /* schema }
    }
  ],

  // ANALYTICS (when enableAnalytics: true)
  analytics: {
    requestId: "req_123",
    timestamp: 1234567890,
    cost: 0.005,                     // Estimated cost in USD
    latency: 2500                    // Latency in ms
  },

  // EVALUATION (when enableEvaluation: true)
  evaluation: {
    score: 0.95,                     // Quality score (0-1)
    feedback: "Excellent response",
    metrics: { /* detailed metrics}
  },

  // FACTORY METADATA (when factoryConfig used)
  factoryMetadata: {
    enhancementApplied: true,
    enhancementType: "domain-configuration",
    domainType: "e-commerce",
    processingTime: 150
  },

  // STREAMING METADATA (when streaming used)
  streamingMetadata: {
    streamingUsed: true,
    chunkCount: 45,
    streamingDuration: 3200,
    streamId: "stream_123"
  }
}

================================================================================
USAGE EXAMPLES
================================================================================

// 1. SIMPLE TEXT GENERATION
const result = await neurolink.generate({
  input: { text: "Explain quantum computing" },
  provider: "vertex",
  model: "gemini-2.5-flash"
});

// 2. WEB SEARCH + PRICE COMPARISON (current code)
const result = await neurolink.generate({
  input: { text: "Find prices for product X" },
  provider: "vertex",  // Required for web search
  model: "gemini-2.5-flash",
  temperature: 0.3,
  systemPrompt: "Return JSON with prices..."
});

// 3. IMAGE ANALYSIS
const result = await neurolink.generate({
  input: {
    text: "What's in this image?",
    images: ["https://example.com/product.jpg"]
  },
  provider: "vertex",
  model: "gemini-2.5-flash"
});

// 4. VIDEO GENERATION
const result = await neurolink.generate({
  input: {
    text: "Product showcase animation",
    images: [productImageBuffer]  // First image used as source
  },
  provider: "vertex",
  model: "veo-3.1",
  output: {
    mode: "video",
    video: { resolution: "1080p", length: 8 }
  }
});

// 5. TEXT-TO-SPEECH
const result = await neurolink.generate({
  input: { text: "Welcome to our store" },
  provider: "google-ai",
  model: "gemini-2.5-flash",
  tts: {
    enabled: true,
    voice: "en-IN-Neural2-A",
    format: "mp3"
  }
});
// Access audio: result.audio.buffer

// 6. STRUCTURED OUTPUT WITH SCHEMA
const PriceSchema = z.object({
  product: z.string(),
  prices: z.array(z.object({
    retailer: z.string(),
    price: z.number(),
    currency: z.string()
  }))
});

const result = await neurolink.generate({
  input: { text: "Find prices for iPhone 15" },
  provider: "vertex",
  model: "gemini-2.5-flash",
  schema: PriceSchema,
  disableTools: true  // Required for Google with schema
});

// 7. MULTI-TURN CONVERSATION
const result = await neurolink.generate({
  input: { text: "What about the 256GB variant?" },
  provider: "vertex",
  model: "gemini-2.5-flash",
  conversationHistory: [
    { role: "user", content: "Tell me about iPhone 15" },
    { role: "assistant", content: "iPhone 15 features..." }
  ]
});

// 8. EXTENDED THINKING (Gemini 3 or Claude)
const result = await neurolink.generate({
  input: { text: "Solve this complex math problem..." },
  provider: "google-ai",
  model: "gemini-3-pro-preview",
  thinkingConfig: {
    enabled: true,
    thinkingLevel: "high"
  }
});

================================================================================
*/
