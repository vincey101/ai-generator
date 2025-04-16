import { TextToSpeechClient } from '@google-cloud/text-to-speech'

const client = new TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!)
});

export async function GET() {
  try {
    const [result] = await client.listVoices({})
    return Response.json({ voices: result.voices })
  } catch (error: any) {
    return Response.json({ 
      error: 'Failed to fetch voices', 
      details: error.message,
      code: error.code
    }, { status: 500 })
  }
} 