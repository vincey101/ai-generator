import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import path from 'path'

const getGCPCredentials = () => {
  // for Vercel, use environment variables
  if (process.env.GCP_PRIVATE_KEY) {
    return {
      credentials: {
        client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      projectId: process.env.GCP_PROJECT_ID,
    }
  }
  // for local development, use JSON file
  return {
    keyFilename: path.join(process.cwd(), 'config', 'voice-457015-b14c173a4586.json')
  }
}

const client = new TextToSpeechClient(getGCPCredentials());

export async function GET() {
  try {
    const [result] = await client.listVoices({})
    return Response.json({ voices: result.voices })
  } catch (error: any) {
    console.error('TTS Client Error:', {
      environment: process.env.NODE_ENV,
      isVercel: !!process.env.GCP_PRIVATE_KEY,
      error: error.message
    });
    return Response.json({ 
      error: 'Failed to fetch voices', 
      details: error.message,
      code: error.code
    }, { status: 500 })
  }
}