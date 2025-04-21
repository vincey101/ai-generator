'use client';

import { useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { PaperAirplaneIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import Image from 'next/image';

type ImageStyle = 'natural' | 'vivid' | 'cartoon' | 'anime' | '3d';

interface GeneratedImage {
  url: string;
}

const STYLE_EXAMPLES = {
  natural: "A serene mountain landscape at sunset",
  vivid: "A vibrant cosmic nebula with swirling colors",
  cartoon: "A cute cartoon penguin playing basketball",
  anime: "An anime-style character with blue hair in a cyberpunk city",
  '3d': "A 3D rendered futuristic robot in a garden"
};

const STYLE_PROMPTS = {
  natural: "Create a highly detailed, photorealistic image in a natural style of",
  vivid: "Create a vibrant and colorful, high-contrast image with rich details of",
  cartoon: "Create a playful cartoon-style illustration with bold lines and simple shapes of",
  anime: "Create a detailed anime/manga-style illustration with characteristic anime features of",
  '3d': "Create a detailed 3D rendered image with realistic textures and lighting of"
};

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('natural');
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStyleSelect = (style: ImageStyle) => {
    setSelectedStyle(style);
    // Create the full prompt with style prefix
    const stylePrefix = STYLE_PROMPTS[style];
    const examplePrompt = STYLE_EXAMPLES[style];
    setPrompt(`${stylePrefix} ${examplePrompt}. The image should be high quality and well-composed.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/image-generator/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImage(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage?.url) return;

    try {
      const response = await fetch('/api/image-generator/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: generatedImage.url }),
      });

      if (!response.ok) throw new Error('Failed to download image');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `ai-generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error downloading image:', err);
      setError('Failed to download image. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            href="/ai-generator"
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold ml-4">AI Image Generator</h1>
        </div>

        {/* Style Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">Select Style</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(Object.keys(STYLE_EXAMPLES) as ImageStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => handleStyleSelect(style)}
                className={`p-3 rounded-lg text-sm font-medium transition-colors
                  ${selectedStyle === style 
                    ? 'bg-[#01C39A] text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-lg">
            {error}
          </div>
        )}

        {/* Prompt Input */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <textarea
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-4 pr-16 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#01C39A] min-h-[100px] resize-none"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className={`absolute right-4 bottom-4 p-2 rounded-full 
                ${loading || !prompt.trim() ? 'bg-gray-300' : 'bg-[#01C39A] hover:bg-opacity-90'} 
                text-white transition-colors`}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Generated Image Display */}
        {generatedImage && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={generatedImage.url}
                alt="Generated image"
                fill
                className="object-contain"
                unoptimized
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-4 border-t">
              <button
                onClick={downloadImage}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#01C39A] text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Download Image
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01C39A]"></div>
          </div>
        )}
      </div>
    </div>
  );
} 