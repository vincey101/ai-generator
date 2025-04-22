import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge'; // Use Edge Runtime

// Add logging to check if API key is present
console.log('API Key exists:', !!process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY?.trim(), // Add trim to remove any potential whitespace
  maxRetries: 2, // Add retries
  timeout: 45 * 1000, // 45 second timeout
});

export async function POST(req: Request) {
  // Check for API key first
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key is missing');
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    );
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    console.log('Making request to OpenAI with prompt length:', prompt.length);
    console.log('API Key format check:', process.env.OPENAI_API_KEY?.startsWith('sk-proj-') ? 'Project-scoped key' : 'Standard key');

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "vivid",
    });

    if (!response.data?.[0]?.url) {
      console.error('No image URL in response:', response);
      throw new Error('No image URL received');
    }

    return NextResponse.json({ url: response.data[0].url });
  } catch (error) {
    // Enhanced error logging
    console.error('Detailed error:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error:', {
        status: error.status,
        message: error.message,
        code: error.code,
        type: error.type
      });
      
      // Add more specific error handling for common OpenAI errors
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key or unauthorized access' },
          { status: 401 }
        );
      }
      
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded or quota reached' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: `OpenAI API Error: ${error.message}` },
        { status: error.status || 504 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
    return NextResponse.json(
      { error: errorMessage },
      { status: 504 }
    );
  }
} 