'use client';

import { useState, useRef } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { 
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import Link from 'next/link';

const SUPPORTED_FORMATS = [
  'webm',
  'mp3',
] as const;

type AudioFormat = typeof SUPPORTED_FORMATS[number];

interface ConvertedAudio {
  url: string;
  format: AudioFormat;
}

export default function AudioConverter() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<AudioFormat>('mp3');
  const [convertedAudio, setConvertedAudio] = useState<ConvertedAudio | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      setError('Please upload an audio file');
      return;
    }

    setAudioFile(file);
    setError(null);
    setConvertedAudio(null);
  };

  const convertAudio = async () => {
    if (!audioFile) return;

    setIsConverting(true);
    setError(null);

    try {
      // Create an audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Read the file
      const arrayBuffer = await audioFile.arrayBuffer();
      
      // Decode the audio
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Get supported MIME type
      const mimeType = getSupportedMimeType(targetFormat);
      if (!mimeType) {
        throw new Error(`Format ${targetFormat} is not supported by your browser`);
      }

      // Create media stream
      const mediaStreamDestination = audioContext.createMediaStreamDestination();
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(mediaStreamDestination);
      source.start();

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream, {
        mimeType: mimeType
      });

      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setConvertedAudio({ url, format: targetFormat });
        setIsConverting(false);
      };

      // Start recording
      mediaRecorder.start();

      // Stop after the duration of the audio
      setTimeout(() => {
        mediaRecorder.stop();
        source.stop();
        audioContext.close();
      }, (audioBuffer.duration * 1000));

    } catch (err) {
      console.error('Conversion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to convert audio');
      setIsConverting(false);
    }
  };

  // Helper function to get supported MIME type
  const getSupportedMimeType = (format: string): string | null => {
    const types = [
      `audio/webm;codecs=opus`,
      'audio/webm',
      'audio/mpeg',
    ];

    return types.find(type => MediaRecorder.isTypeSupported(type)) || null;
  };

  const downloadAudio = async () => {
    if (!convertedAudio) return;

    const link = document.createElement('a');
    link.href = convertedAudio.url;
    link.download = `converted-audio.${convertedAudio.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            href="/ai-generator"
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold ml-4">Audio Converter</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-lg">
            {error}
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="flex-1">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-[#01C39A] transition-colors">
                <ArrowUpTrayIcon className="w-5 h-5 text-gray-500" />
                <span className="text-gray-500">
                  {audioFile ? audioFile.name : 'Choose audio file'}
                </span>
              </div>
            </label>

            <select
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value as AudioFormat)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01C39A]"
            >
              {SUPPORTED_FORMATS.map(format => (
                <option key={format} value={format}>
                  {format.toUpperCase()}
                </option>
              ))}
            </select>

            <button
              onClick={convertAudio}
              disabled={!audioFile || isConverting}
              className={`px-6 py-2 rounded-lg ${
                !audioFile || isConverting
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#01C39A] hover:bg-opacity-90'
              } text-white transition-colors`}
            >
              {isConverting ? 'Converting...' : 'Convert'}
            </button>
          </div>
        </div>

        {/* Audio Preview */}
        {convertedAudio && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-medium mb-3">Preview</h2>
            <div className="flex items-center gap-2">
              <audio 
                ref={audioRef} 
                src={convertedAudio.url} 
                controls 
                className="flex-1 h-8" 
              />
              <button
                onClick={() => {
                  setConvertedAudio(null);
                  if (audioRef.current) {
                    audioRef.current.pause();
                  }
                }}
                className="p-1.5 text-gray-600 hover:text-red-500 transition-colors"
                title="Delete"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
              <button
                onClick={downloadAudio}
                className="p-1.5 text-gray-600 hover:text-[#01C39A] transition-colors"
                title="Download"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 