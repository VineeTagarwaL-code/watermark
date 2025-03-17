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
  limiter: Ratelimit.slidingWindow(1, "30 s"),
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
        text: `Remove all watermarks from this image while maintaining the highest possible image quality and detail. Handle the following types of watermarks effectively:
1. Semi-transparent or translucent watermarks that blend with the background
2. Large watermarks covering significant portions of the image
3. Watermarks with complex patterns, gradients, or varying opacity
4. Multiple watermarks in different locations
5. Company logos and branding elements
6. Repeating pattern watermarks across the entire image
7. Text-based watermarks in any font style or language
8. Watermarks placed over highly detailed areas

Preserve all original image details, textures, and colors. Seamlessly reconstruct any image content hidden beneath watermarks using context from surrounding areas. Ensure there are no artifacts, blurring, or color inconsistencies where watermarks were removed. The final image should look as if the watermark was never present.`
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