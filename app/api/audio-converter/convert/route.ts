import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const targetFormat = formData.get('format') as string;

    if (!file || !targetFormat) {
      return NextResponse.json({ error: 'Missing file or format' }, { status: 400 });
    }

    // Just return the file info - conversion will happen client-side
    return NextResponse.json({ 
      originalFile: {
        type: file.type,
        size: file.size,
      }
    });
  } catch (error) {
    console.error('Error processing audio:', error);
    return NextResponse.json(
      { error: 'Failed to process audio' },
      { status: 500 }
    );
  }
} 