'use client';

import { useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { PaperAirplaneIcon, ClipboardIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

export default function AIContentGenerator() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setResponse(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            href="/video-generator"
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold ml-4">AI Content Generator</h1>
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
              placeholder="Enter your prompt here..."
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

        {/* Response Display */}
        {(response || loading) && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-medium">Generated Content</h2>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                <ClipboardIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
            <div className={`p-4 whitespace-pre-wrap ${loading ? 'opacity-50' : 'opacity-100'}`}>
              {response}
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