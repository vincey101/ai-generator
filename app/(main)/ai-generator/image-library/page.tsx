'use client';

import { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';

interface PixabayImage {
  id: number;
  webformatURL: string;
  largeImageURL: string;
  user: string;
  tags: string;
  downloads: number;
  likes: number;
  views: number;
}

export default function ImageLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<PixabayImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedImage, setSelectedImage] = useState<PixabayImage | null>(null);

  useEffect(() => {
    searchImages('nature lifestyle');
  }, []);

  const searchImages = async (query: string, pageNum: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://pixabay.com/api/?key=${process.env.NEXT_PUBLIC_PIXABAY_API_KEY}&q=${encodeURIComponent(
          query || 'nature lifestyle'
        )}&page=${pageNum}&per_page=20&image_type=photo&safesearch=true&order=popular`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      
      if (data.hits.length === 0 && pageNum === 1) {
        setError('No images found. Try a different search term.');
        setImages([]);
      } else {
        setImages(pageNum === 1 ? data.hits : [...images, ...data.hits]);
        setHasMore(data.hits.length === 20);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value === '') {
      setPage(1);
      searchImages('nature lifestyle');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    searchImages(searchQuery);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    searchImages(searchQuery, nextPage);
  };

  const downloadImage = async (imageUrl: string, imageName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${imageName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading image:', err);
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
          <h1 className="text-2xl font-bold ml-4">Image Library</h1>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for images..."
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

        {/* Masonry Image Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="break-inside-avoid cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => setSelectedImage(image)}
            >
              <div className="relative">
                <Image
                  src={image.webformatURL}
                  alt={image.tags}
                  width={600}
                  height={600}
                  className="w-full rounded-lg"
                  style={{ height: 'auto' }}
                  unoptimized
                />
              </div>
            </div>
          ))}
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative w-[400px]">
              {/* Close button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -right-4 -top-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 z-10"
              >
                <XMarkIcon className="w-4 h-4 text-gray-600" />
              </button>

              {/* Modal Content */}
              <div 
                className="relative rounded-lg overflow-hidden bg-white w-[400px]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-full">
                  <Image
                    src={selectedImage.largeImageURL}
                    alt={selectedImage.tags}
                    width={400}
                    height={400}
                    className="w-full h-auto"
                    unoptimized
                  />
                </div>
                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(selectedImage.largeImageURL, `image-${selectedImage.id}`);
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
        {hasMore && images.length > 0 && (
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
        {loading && images.length === 0 && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01C39A]"></div>
          </div>
        )}
      </div>
    </div>
  );
} 