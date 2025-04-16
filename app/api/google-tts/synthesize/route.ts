import { TextToSpeechClient } from '@google-cloud/text-to-speech'

// Create client with credentials from environment variable in production
const client = new TextToSpeechClient(
  process.env.NODE_ENV === 'production' 
    ? { credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}') }
    : { keyFilename: './config/voice-457015-9f28c99756fa.json' }
);

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
  } catch (error) {
    console.error('Error:', error)
    return Response.json({ error: 'Failed to synthesize speech' }, { status: 500 })
  }
} 