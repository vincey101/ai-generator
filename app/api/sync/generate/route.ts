import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    // Add this at the top to check if API key exists
    if (!process.env.NEXT_PUBLIC_SYNC_API_KEY) {
      console.error('Missing SYNC_API_KEY environment variable')
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    const body = await req.json()

    // Log the request body
    console.log('Request body:', body)

    const response = await fetch('https://api.sync.so/v2/generate', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_SYNC_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      // Log the error response
      const errorText = await response.text()
      console.error('Sync.so API error:', errorText)
      throw new Error(`Failed to generate: ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    // Log the full error
    console.error('Generate API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate video' },
      { status: 500 }
    )
  }
} 