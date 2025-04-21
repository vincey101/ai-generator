'use client';

import { useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  videoUrl: string;
  videoId: string;
}

export default function SocialMediaDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      // Call your API route to handle video info fetching
      const response = await fetch('/api/social-media/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch video information');
      }

      const data = await response.json();
      setVideoInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch video');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo) return;

    try {
      const response = await fetch('/api/social-media/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoInfo.videoUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to download video');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${videoInfo.title}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download video');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            href="/ai-generator"
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold ml-4">Social Media Downloader</h1>
        </div>

        {/* URL Input */}
        <form onSubmit={handleFetch} className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter video URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-4 pr-24 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#01C39A]"
            />
            <button
              type="submit"
              disabled={loading || !url}
              className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#01C39A] text-white rounded-lg 
                ${loading || !url ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'}`}
            >
              {loading ? 'Fetching...' : 'Fetch'}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="text-center py-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Video Preview */}
        {videoInfo && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="aspect-video relative">
              <iframe
                src={`https://www.youtube.com/embed/${videoInfo.videoId}`}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
              />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">{videoInfo.title}</h2>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">{videoInfo.duration}</span>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-[#01C39A] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 