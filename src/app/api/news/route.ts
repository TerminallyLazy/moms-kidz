import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=health&language=en&pageSize=12&apiKey=${process.env.NEWS_API_KEY}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch news')
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('News API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}
