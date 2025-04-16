import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import path from 'path'

const keyFilePath = path.join(process.cwd(), 'config', 'voicex-320513-54568f9979b3.json')

const client = new TextToSpeechClient({
  keyFilename: keyFilePath
})

export async function GET() {
  try {
    const [result] = await client.listVoices({})
    return Response.json({ voices: result.voices })
  } catch (error) {
    console.error('Error:', error)
    return Response.json({ error: 'Failed to fetch voices' }, { status: 500 })
  }
} 