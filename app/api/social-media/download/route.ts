import { NextResponse } from 'next/server';
import play from 'play-dl';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Get video info first to validate the URL
    const videoInfo = await play.video_info(url);
    const stream = await play.stream(videoInfo.video_details.url || url);
    
    if (!stream || !stream.stream) {
      throw new Error('Failed to get video stream');
    }

    // Convert stream to blob
    const response = new Response(stream.stream);
    const blob = await response.blob();

    return new Response(blob, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${videoInfo.video_details.title || 'video'}.mp4"`,
      },
    });
  } catch (error) {
    console.error('Error downloading video:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to download video';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 