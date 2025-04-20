import { TextToSpeechClient } from '@google-cloud/text-to-speech'

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
    keyFilename: './config/voice-457015-b14c173a4586.json'
  }
}

// Create client with credentials
const client = new TextToSpeechClient(getGCPCredentials());

export async function POST(request: Request) {
  try {
    const { text, voice, audioConfig } = await request.json()

    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice,
      audioConfig: {
        audioEncoding: 'MP3',
        ...audioConfig
      }
    })

    const audioContent = response.audioContent
    if (!audioContent) {
      throw new Error('No audio content received')
    }

    return new Response(audioContent, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    })
  } catch (error: any) {
    console.error('TTS Synthesis Error:', {
      environment: process.env.NODE_ENV,
      isVercel: !!process.env.GCP_PRIVATE_KEY,
      error: error.message,
      code: error.code
    });
    return Response.json({ 
      error: 'Failed to synthesize speech',
      details: error.message,
      code: error.code
    }, { status: 500 })
  }
} 