import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    // console.log('Fetching ID:', id)

    const response = await fetch(`https://api.sync.so/v2/generate/${id}`, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_SYNC_API_KEY || '',
      },
    })

    const data = await response.json()
    // console.log('API Response:', data) // Debug log

    return NextResponse.json(data)
  } catch (error) {
    // console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to check video status' },
      { status: 500 }
    )
  }
} 