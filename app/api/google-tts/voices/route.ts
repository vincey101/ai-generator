import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import path from 'path'

const client = new TextToSpeechClient({ 
  keyFilename: path.join(process.cwd(), 'config', 'voice-457015-9f28c99756fa.json')
});

export async function GET() {
  try {
    const [result] = await client.listVoices({})
    return Response.json({ voices: result.voices })
  } catch (error: any) {
    console.error('Error fetching voices:', error.message);
    return Response.json({ 
      error: 'Failed to fetch voices', 
      details: error.message,
      code: error.code
    }, { status: 500 })
  }
}