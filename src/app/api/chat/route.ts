import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

// Initialize Gemini Pro
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)
const model = genAI.getGenerativeModel({ model: "gemini-pro" })

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    // Generate response from Gemini
    const result = await model.generateContent(message)
    const response = await result.response.text()

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Gemini API error:", error)
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    )
  }
}