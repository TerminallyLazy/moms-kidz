import { NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { logger } from '@/lib/logger'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Generation config
const generationConfig = {
  temperature: 0.5,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
}

// Safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
]

const systemInstruction = `You are an AI assistant for Mom's Kidz, designed to help mothers navigate the healthcare system for their children. Your task is to provide caring, thoughtful, and empathetic responses while offering helpful information based on the following user query:

<user_query>
{{question}}
</user_query>

Follow these guidelines for your response:
1. Analyze the user's query and provide a helpful, informative response.
2. Always include credible sources from the approved list in your response.
3. Prioritize health articles and actionable links in each response.
4. If the user has uploaded an image, use it to provide more accurate and relevant information.
5. You will only address the question asked, not any other questions that may be implied.
6. Stay on topic and do not deviate from the user's original question.
7. If the user's question is not clear, ask for clarification.
8. IMPORTANT! If the user asks a question that is not related to healthcare or Mom's Kidz, politely inform them that you are only able to answer healthcare related questions and suggest consulting a healthcare professional for their concerns.
9. Encourage users to consult healthcare professionals for any medical concerns.
10. You will use proper formatting including bolded text, italics, bullets, and numbered lists when appropriate.
11. If applicable, provide guidance for preparing for doctor visits, including maintaining a health diary, knowing key medical terminology, and having a question list ready.
12. Finish your response with a mention that Mom's Kidz is here to help.
13. Format your response in markdown.`

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const message = formData.get('message') as string
    const userId = formData.get('userId') as string
    const imageFile = formData.get('image') as File | null

    // Configure model based on whether there's an image
    const model = imageFile 
      ? genAI.getGenerativeModel({ 
          model: "gemini-pro-vision",
          generationConfig,
          safetySettings
        })
      : genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          generationConfig,
          safetySettings
        })

    let prompt = message.replace('{{question}}', message)

    let response
    let chatHistory: never[] = []

    if (imageFile) {
      // Handle image analysis
      const imageData = await imageFile.arrayBuffer()
      const imageBase64 = Buffer.from(imageData).toString('base64')
      
      response = await model.generateContent([
        {
          text: systemInstruction + "\n\n" + prompt
        },
        {
          inlineData: {
            mimeType: imageFile.type,
            data: imageBase64
          }
        }
      ])
    } else {
      // Start chat session
      const chat = model.startChat({
        history: chatHistory,
        generationConfig,
        safetySettings,
      })

      response = await chat.sendMessage(systemInstruction + "\n\n" + prompt)
    }

    const result = await response.response
    const text = result.text()

    // Log the interaction
    logger.info('AI Chat Interaction', {
      userId,
      hasImage: !!imageFile,
      messageLength: message.length,
      responseLength: text.length
    })

    return NextResponse.json({
      response: text,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('AI Chat Error:', error as Error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

// Helper function to validate image
function validateImage(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid image type. Please upload JPEG, PNG, or WebP.')
  }

  if (file.size > maxSize) {
    throw new Error('Image size should be less than 5MB.')
  }

  return true
}