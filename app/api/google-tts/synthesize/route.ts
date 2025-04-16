import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import path from 'path'

const keyFilePath = path.join(process.cwd(), 'config', 'voicex-320513-54568f9979b3.json')

const client = new TextToSpeechClient({
  keyFilename: keyFilePath
})

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