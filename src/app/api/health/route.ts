import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`

    // Return healthy status
    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        services: {
          database: "connected",
          api: "running"
        }
      },
      {
        status: 200,
        headers: {
          // Cache for 5 seconds
          "Cache-Control": "public, max-age=5",
          // Add security headers
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "X-XSS-Protection": "1; mode=block",
        }
      }
    )
  } catch (error) {
    console.error("Health check failed:", error)
    
    // Return unhealthy status
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Service unavailable"
      },
      { 
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        }
      }
    )
  }
}

// Enable edge runtime for faster response
export const runtime = "edge"
