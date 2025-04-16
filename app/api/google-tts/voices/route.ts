import { TextToSpeechClient } from '@google-cloud/text-to-speech'

const getCredentials = () => {
  // For local development
  if (process.env.GOOGLE_CREDENTIALS) {
    return JSON.parse(process.env.GOOGLE_CREDENTIALS);
  }
  
  // For Vercel deployment
  const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
  if (!credentialsBase64) {
    throw new Error('Missing Google credentials');
  }
  
  const credentialsJson = Buffer.from(credentialsBase64, 'base64').toString();
  return JSON.parse(credentialsJson);
};

const client = new TextToSpeechClient({
  credentials: getCredentials()
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