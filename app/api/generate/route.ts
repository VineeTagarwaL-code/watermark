import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const apiKey = process.env.GEMINI_API_KEY;
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("Missing Redis configuration");
}

// Initialize Redis client
const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, "30 s"),
  analytics: true,
});

const genAI = new GoogleGenerativeAI(apiKey);

// Validate image data
function isValidBase64Image(base64String: string): boolean {
  try {
    // Check if it's a valid base64 string
    if (!/^data:image\/(jpeg|png|jpg);base64,/.test(base64String)) {
      return false;
    }
    
    // Check if the base64 part is valid
    const base64Data = base64String.split(',')[1];
    if (!base64Data || !/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
      return false;
    }
    
    // Check if the decoded size is reasonable (max 10MB)
    const decodedSize = Math.ceil((base64Data.length * 3) / 4);
    if (decodedSize > 10 * 1024 * 1024) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    // Get IP address for rate limiting
    const headersList = await headers();
    const ip =  headersList.get("x-forwarded-for") ?? "anonymous";
    
    // Rate limiting
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { 
          error: "Too many requests",
          limit,
          reset,
          remaining
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          }
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    if (!body || typeof body.image !== "string") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate image data
    if (!isValidBase64Image(body.image)) {
      return NextResponse.json(
        { error: "Invalid image data" },
        { status: 400 }
      );
    }

    const base64Data = body.image.split(',')[1];
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp-image-generation",
      generationConfig: {
        // @ts-expect-error - this is a bug in the types
        responseModalities: ['Text', 'Image']
      },
    });

    const result = await model.generateContent([
      {
        text: `PRIORITY TASK: COMPLETELY REMOVE ALL WATERMARKS FROM THIS IMAGE

This is a real estate property image with a watermark that must be completely eliminated while preserving perfect image quality. The watermark appears to be a real estate company logo with text that is semi-transparent.

Step 1: DETECTION - Identify ALL watermark elements:
- Use frequency domain analysis to detect the house/building icon
- Employ OCR to identify any text elements like "Property" or "Realty"
- Focus on the center region where watermarks are commonly placed
- Scan all color channels separately to detect low-opacity elements
- Identify exact boundaries of the watermark region
- Detect any subtle shadows, glows, or blend effects around the watermark

Step 2: REMOVAL - Apply multiple specialized techniques:
- Use advanced content-aware fill algorithms to replace the watermarked region
- Implement structural inpainting to preserve architectural details
- Apply seamless cloning to maintain consistent lighting and texture
- Use gradient domain techniques to eliminate any transition artifacts
- Preserve exact building details including window frames, doors, walls, and facade textures
- Maintain consistent color temperature and lighting across the entire image

Step 3: VERIFICATION - Ensure complete removal:
- Perform differential analysis between original and processed regions
- Confirm complete elimination of all watermark traces
- Ensure no blurring, artifacts, or inconsistencies in the reconstruction area
- Verify texture consistency in all formerly watermarked areas

THE FINAL IMAGE MUST:
1. Have absolutely NO trace of the original watermark
2. Maintain perfect architectural detail integrity
3. Show completely natural lighting and textures
4. Be indistinguishable from a professional photograph with no watermark
5. Have perfect clarity and sharpness in all areas, especially where the watermark was removed

Apply the highest level of processing power and advanced algorithms to achieve perfect, undetectable watermark removal. This is a critical task requiring the most sophisticated techniques available.`
      },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const imageResponse = response.candidates?.[0].content.parts[0].inlineData?.data;
    
    return NextResponse.json({ 
      response: imageResponse
    }, {
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      }
    });    
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 }
    );
  }
} 