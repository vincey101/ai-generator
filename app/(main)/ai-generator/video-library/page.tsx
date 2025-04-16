'use client';

import { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface PixabayVideo {
  id: number;
  videos: {
    large: {
      url: string;
    };
    medium: {
      url: string;
    };
    small: {
      url: string;
    };
  };
  picture_id: string;
  duration: number;
  tags: string;
}

export default function VideoLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<PixabayVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<PixabayVideo | null>(null);

  useEffect(() => {
    searchVideos('nature lifestyle');
  }, []);

  const searchVideos = async (query: string, pageNum: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://pixabay.com/api/videos/?key=${process.env.NEXT_PUBLIC_PIXABAY_API_KEY}&q=${encodeURIComponent(
          query || 'nature lifestyle'
        )}&page=${pageNum}&per_page=20&safesearch=true&order=popular`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      
      if (data.hits.length === 0 && pageNum === 1) {
        setError('No videos found. Try a different search term.');
        setVideos([]);
      } else {
        setVideos(pageNum === 1 ? data.hits : [...videos, ...data.hits]);
        setHasMore(data.hits.length === 20);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value === '') {
      setPage(1);
      searchVideos('nature lifestyle');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    searchVideos(searchQuery);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    searchVideos(searchQuery, nextPage);
  };

  const downloadVideo = async (videoUrl: string, videoId: string) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `video-${videoId}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading video:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            href="/video-generator"
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold ml-4">Video Library</h1>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for videos..."
              value={searchQuery}
              onChange={handleSearchInput}
              className="w-full p-4 pr-12 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#01C39A]"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-[#01C39A]"
            >
              <MagnifyingGlassIcon className="w-6 h-6" />
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-900"
              onClick={() => setSelectedVideo(video)}
            >
              <video
                src={video.videos.small.url}
                className="w-full aspect-video object-cover group-hover:opacity-75 transition-opacity"
                poster={`https://i.vimeocdn.com/video/${video.picture_id}_640x360.jpg`}
                muted
                loop
                playsInline
                autoPlay
                onLoadedData={(e) => {
                  e.currentTarget.play().catch(err => console.log('Auto-play prevented:', err));
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex flex-col items-center space-y-2">
                  <PlayIcon className="w-12 h-12 text-white" />
                  <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                    {Math.floor(video.duration)}s
                  </span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const videoEl = e.currentTarget.parentElement?.parentElement?.previousElementSibling as HTMLVideoElement;
                      if (videoEl) {
                        if (videoEl.paused) {
                          videoEl.play();
                        } else {
                          videoEl.pause();
                        }
                      }
                    }}
                    className="text-white hover:text-[#01C39A] transition-colors"
                  >
                    <PlayIcon className="w-6 h-6" />
                  </button>
                  <span className="text-white text-sm">
                    {Math.floor(video.duration)}s
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Modal */}
        {selectedVideo && (
          <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <div className="relative w-full max-w-4xl">
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -right-4 -top-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 z-10"
              >
                <XMarkIcon className="w-4 h-4 text-gray-600" />
              </button>

              <div 
                className="relative rounded-lg overflow-hidden bg-black"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Video */}
                <video
                  src={selectedVideo.videos.large.url}
                  className="w-full"
                  controls
                  autoPlay
                />
                
                {/* White space for download button */}
                <div className="bg-white p-4 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadVideo(selectedVideo.videos.large.url, selectedVideo.id.toString());
                    }}
                    className="px-4 py-2 bg-[#01C39A] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && videos.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && videos.length === 0 && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01C39A]"></div>
          </div>
        )}
      </div>
    </div>
  );
} 