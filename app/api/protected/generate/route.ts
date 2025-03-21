import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const apiKey = process.env.GEMINI_API_KEY;
const API_SECRET_KEY = process.env.API_SECRET_KEY;
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

if (!API_SECRET_KEY) {
  throw new Error("Missing API_SECRET_KEY environment variable");
}

if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("Missing Redis configuration");
}

// Initialize Redis client
const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});

// Create a new ratelimiter with more generous limits for API key users
// 20 requests per minute (better rate limit for API key users)
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "60 s"),
  analytics: true,
  prefix: "ratelimit:protected:", // Different prefix for the protected route
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

// Function to validate URL format
function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    // Check protocol
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return false;
    }
    // Check file extension for images
    const path = parsedUrl.pathname.toLowerCase();
    return path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.webp');
  } catch {
    return false;
  }
}

// Function to fetch image from URL and convert to base64
async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    // Get the content type
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Convert the image to buffer/array buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Convert to base64
    const base64Data = buffer.toString('base64');
    
    // Return as data URL
    return `data:${contentType};base64,${base64Data}`;
  } catch (error) {
    console.error('Error fetching image:', error);
    throw new Error('Failed to fetch image from URL');
  }
}

export async function POST(request: Request) {
  try {
    // Get API key from Authorization header
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    
    // Check if API key is provided and valid
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }
    
    const providedApiKey = authHeader.substring(7); // Remove "Bearer " prefix
    
    if (providedApiKey !== API_SECRET_KEY) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 403 }
      );
    }
    
    // Use API key for rate limiting instead of IP (more precise per-client limits)
    const rateLimitKey = `api:${providedApiKey}`;
    
    // Rate limiting
    const { success, limit, reset, remaining } = await ratelimit.limit(rateLimitKey);

    if (!success) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded",
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
    
    // Check if either image or imageUrl is provided
    if (!body || (typeof body.image !== "string" && typeof body.imageUrl !== "string")) {
      return NextResponse.json(
        { error: "Invalid request body. Please provide either 'image' (base64) or 'imageUrl'" },
        { status: 400 }
      );
    }

    let base64Image: string;
    
    // Handle base64 image input
    if (typeof body.image === "string") {
      if (!isValidBase64Image(body.image)) {
        return NextResponse.json(
          { error: "Invalid image data" },
          { status: 400 }
        );
      }
      base64Image = body.image;
    } 
    // Handle image URL input
    else {
      if (!isValidImageUrl(body.imageUrl)) {
        return NextResponse.json(
          { error: "Invalid image URL format" },
          { status: 400 }
        );
      }
      
      try {
        // Fetch image from URL and convert to base64
        base64Image = await fetchImageAsBase64(body.imageUrl);
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Failed to fetch image from URL" },
          { status: 400 }
        );
      }
    }

    const base64Data = base64Image.split(',')[1];
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp-image-generation",
      generationConfig: {
        // @ts-expect-error - this is a bug in the types
        responseModalities: ['Text', 'Image']
      },
    });

    const result = await model.generateContent([
      {
        text: `Create a perfectly transparent background removal of this image with absolutely NO background elements remaining:

1. Output format: PNG with 100% transparent background (alpha channel)
2. Remove EVERY SINGLE PIXEL of background - no exceptions
3. Only preserve the main character/subject with pixel-perfect edge detection
4. For cartoon/illustrated images:
   - Detect and preserve ONLY the character outlines and fills
   - Remove ALL background colors, patterns, gradients and effects completely
   - Use precise edge detection on cartoon character boundaries
5. Background definition: ANY color or element that is not part of the main subject
6. Ensure complete transparency (pure alpha) surrounds the subject
7. Do not leave any hints, shadows, or partial opacity from the background
8. Preserve the original colors and details of the subject only
9. Check all corners and edges to ensure NO background pixels remain
10. The final image should look like the character is floating on a completely transparent background

The success of this task depends on COMPLETE background removal with zero background pixels remaining.`
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