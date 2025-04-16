import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('files') as File;
    const name = formData.get('name') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create form data for Eleven Labs API
    const apiFormData = new FormData();
    apiFormData.append('name', name);
    apiFormData.append('files', new Blob([buffer], { type: file.type }), file.name);

    // Call Eleven Labs API to add voice
    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY!,
      },
      body: apiFormData,
    });

    if (!response.ok) {
      throw new Error('Failed to clone voice');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error cloning voice:', error);
    return NextResponse.json(
      { error: 'Failed to clone voice' },
      { status: 500 }
    );
  }
} 