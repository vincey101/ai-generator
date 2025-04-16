'use client';

import { useState, useRef } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { 
  PaperAirplaneIcon, 
  ArrowUpTrayIcon,
  SpeakerWaveIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import Link from 'next/link';

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
}

interface ClonedVoice {
  voice_id: string;
  name: string;
}

export default function VoiceCloning() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [clonedVoice, setClonedVoice] = useState<ClonedVoice | null>(null);
  const [text, setText] = useState('');
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<VoiceSettings>({
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.3,
  });
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('audio/')) {
      setError('Please upload an audio file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size should be less than 10MB');
      return;
    }

    setAudioFile(file);
    setError(null);
  };

  const cloneVoice = async () => {
    if (!audioFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', 'Custom Voice');
      formData.append('files', audioFile);

      const response = await fetch('/api/voice-cloning/clone', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to clone voice');
      }

      const data = await response.json();
      setClonedVoice(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clone voice');
    } finally {
      setIsUploading(false);
    }
  };

  const generateSpeech = async () => {
    if (!clonedVoice || !text.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/voice-cloning/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice_id: clonedVoice.voice_id,
          ...settings,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedAudio(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate speech');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAudio = async () => {
    if (!generatedAudio) return;

    const link = document.createElement('a');
    link.href = generatedAudio;
    link.download = `generated-speech-${Date.now()}.mp3`;
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
            href="/video-generator"
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold ml-4">Voice Cloning</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-lg">
            {error}
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-medium mb-4">Upload Voice Sample</h2>
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
            <button
              onClick={cloneVoice}
              disabled={!audioFile || isUploading}
              className={`px-6 py-3 rounded-lg ${
                !audioFile || isUploading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#01C39A] hover:bg-opacity-90'
              } text-white transition-colors`}
            >
              {isUploading ? 'Cloning...' : 'Clone Voice'}
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        {clonedVoice && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Generate Speech (2/3 width) */}
            <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium mb-4">Generate Speech</h2>
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    placeholder="Enter text to convert to speech..."
                    value={text}
                    onChange={(e) => {
                      const newText = e.target.value;
                      if (newText.length <= 350) {
                        setText(newText);
                      } else {
                        setText(newText.slice(0, 350));
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData('text');
                      const currentText = text;
                      const availableSpace = 350 - currentText.length;
                      
                      if (availableSpace > 0) {
                        const newText = currentText + pastedText.slice(0, availableSpace);
                        setText(newText);
                      }
                    }}
                    maxLength={350}
                    className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01C39A] min-h-[200px] resize-none"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>{text.length}</span>
                    <span>/350</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={generateSpeech}
                    disabled={!text.trim() || isGenerating}
                    className={`px-6 py-3 rounded-lg ${
                      !text.trim() || isGenerating
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-[#01C39A] hover:bg-opacity-90'
                    } text-white transition-colors`}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Speech'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Voice Settings and Preview (1/3 width) */}
            <div className="space-y-6">
              {/* Voice Settings */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-medium mb-3">Voice Settings</h2>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Stability
                      </label>
                      <span className="text-sm text-gray-500">{settings.stability}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.stability}
                      onChange={(e) => setSettings({ ...settings, stability: parseFloat(e.target.value) })}
                      className="w-full accent-[#01C39A] mt-1"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Similarity Boost
                      </label>
                      <span className="text-sm text-gray-500">{settings.similarity_boost}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.similarity_boost}
                      onChange={(e) => setSettings({ ...settings, similarity_boost: parseFloat(e.target.value) })}
                      className="w-full accent-[#01C39A] mt-1"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Style
                      </label>
                      <span className="text-sm text-gray-500">{settings.style}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.style}
                      onChange={(e) => setSettings({ ...settings, style: parseFloat(e.target.value) })}
                      className="w-full accent-[#01C39A] mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Audio Preview */}
              {generatedAudio && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h2 className="text-lg font-medium mb-3">Preview</h2>
                  <div className="flex items-center gap-2">
                    <audio 
                      ref={audioRef} 
                      src={generatedAudio} 
                      controls 
                      className="flex-1 h-8" 
                    />
                    <button
                      onClick={() => {
                        setGeneratedAudio(null);
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
        )}
      </div>
    </div>
  );
} 