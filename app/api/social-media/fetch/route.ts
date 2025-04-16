import { NextResponse } from 'next/server';
import play from 'play-dl';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    // Validate URL
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Get video info
    const videoInfo = await play.video_info(url);
    
    // Log the structure to debug
    console.log('Video Info:', JSON.stringify(videoInfo, null, 2));

    // Access the correct properties based on play-dl structure
    return NextResponse.json({
      title: videoInfo.video_details.title || 'Untitled',
      thumbnail: videoInfo.video_details.thumbnails[0]?.url || '',
      duration: videoInfo.video_details.durationRaw || '0:00',
      videoUrl: url,
      videoId: videoInfo.video_details.id || ''
    });
  } catch (error) {
    console.error('Error fetching video info:', error);
    
    // More detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch video information';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 