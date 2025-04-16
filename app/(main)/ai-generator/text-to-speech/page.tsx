'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import ReactCountryFlag from 'react-country-flag';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';

// Google Cloud TTS interfaces
interface GoogleVoice {
  name: string;
  languageCodes: string[];
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  naturalSampleRateHertz: number;
}

interface GoogleVoiceSettings {
  speakingRate: number;  // 0.25 to 4.0
  pitch: number;         // -20.0 to 20.0
  volumeGainDb: number;  // -96.0 to 16.0
}

interface GeneratedVoice {
  id: string;
  text: string;
  audioUrl: string;
  voiceName: string;
  timestamp: Date;
}

// Comment out ElevenLabs interfaces
/*
interface Voice {
  voice_id: string;
  name: string;
  labels: {
    accent?: string;
    age?: string;
    gender?: string;
    description?: string;
    use_case?: string;
  };
}

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  speed: number;
  style_exaggeration: number;
}
*/

const MAX_STORED_VOICES = 10; // Adjust this number based on your needs

// Voice name mappings by language and gender
const voiceNameMappings: { [key: string]: { male: string[], female: string[] } } = {
  'en': {
    male: ['James', 'William', 'John', 'Michael', 'David'],
    female: ['Emma', 'Sarah', 'Elizabeth', 'Mary', 'Jennifer']
  },
  'fr': {
    male: ['Jean', 'Pierre', 'Louis', 'François', 'Michel'],
    female: ['Marie', 'Sophie', 'Claire', 'Isabelle', 'Anne']
  },
  'de': {
    male: ['Hans', 'Klaus', 'Wolfgang', 'Thomas', 'Michael'],
    female: ['Anna', 'Maria', 'Christina', 'Elisabeth', 'Sabine']
  },
  'es': {
    male: ['Carlos', 'Juan', 'Miguel', 'José', 'Antonio'],
    female: ['María', 'Ana', 'Carmen', 'Isabel', 'Sofia']
  },
  'it': {
    male: ['Marco', 'Giuseppe', 'Antonio', 'Giovanni', 'Luigi'],
    female: ['Maria', 'Anna', 'Giulia', 'Sofia', 'Laura']
  },
  'ja': {
    male: ['Hiroshi', 'Takashi', 'Kenji', 'Akira', 'Yuki'],
    female: ['Yuki', 'Akiko', 'Sakura', 'Yoko', 'Naomi']
  },
  'ko': {
    male: ['Min-ho', 'Jung-ho', 'Seung-ho', 'Ji-hoon', 'Min-jun'],
    female: ['Ji-eun', 'Min-ji', 'Soo-jin', 'Hye-jin', 'Yoon-ah']
  },
  'zh': {
    male: ['Wei', 'Ming', 'Jian', 'Lei', 'Hao'],
    female: ['Xia', 'Mei', 'Ling', 'Yan', 'Jun']
  },
  'hi': {
    male: ['Raj', 'Amit', 'Vikram', 'Arun', 'Suresh'],
    female: ['Priya', 'Anjali', 'Neha', 'Meera', 'Pooja']
  }
};

export default function TextToSpeechPage() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedVoices, setGeneratedVoices] = useState<GeneratedVoice[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // New state for Google voices
  const [googleVoices, setGoogleVoices] = useState<GoogleVoice[]>([]);
  const [googleVoiceSettings, setGoogleVoiceSettings] = useState<GoogleVoiceSettings>({
    speakingRate: 1.0,
    pitch: 0,
    volumeGainDb: 0,
  });

  // Comment out ElevenLabs state
  /*
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    stability: 0.5,
    similarity_boost: 0.75,
    speed: 1.0,
    style_exaggeration: 0.3,
  });
  */

  // Fetch Google voices
  useEffect(() => {
    const fetchGoogleVoices = async () => {
      try {
        const response = await fetch('/api/google-tts/voices');
        if (!response.ok) throw new Error('Failed to fetch voices');
        const data = await response.json();
        setGoogleVoices(data.voices);
      } catch (err) {
        console.error('Error fetching voices:', err);
        setError(err instanceof Error ? err.message : 'Failed to load voices');
      }
    };

    fetchGoogleVoices();
  }, []);

  // Comment out ElevenLabs fetch
  /*
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: {
            'accept': 'application/json',
            'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || ''
          }
        });

        if (!response.ok) throw new Error('Failed to fetch voices');
        const data = await response.json();
        setVoices(data.voices);
      } catch (err) {
        console.error('Error fetching voices:', err);
        setError(err instanceof Error ? err.message : 'Failed to load voices');
      }
    };

    fetchVoices();
  }, []);
  */

  // Load stored voices from localStorage
  useEffect(() => {
    const savedVoices = localStorage.getItem('generatedVoices');
    if (savedVoices) {
      const voices = JSON.parse(savedVoices)
        .slice(0, MAX_STORED_VOICES) // Ensure we only load up to the limit
        .map((voice: GeneratedVoice) => ({
          ...voice,
          timestamp: new Date(voice.timestamp)
        }));
      setGeneratedVoices(voices);
    }
  }, []);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // New Google TTS handler
  const handleTextToSpeech = async () => {
    if (!text || !selectedVoice) return;

    setLoading(true);
    try {
      const selectedVoiceData = googleVoices.find(v => v.name === selectedVoice);
      
      const response = await fetch('/api/google-tts/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: {
            name: selectedVoice,
            languageCode: selectedVoiceData?.languageCodes[0],
          },
          audioConfig: {
            speakingRate: googleVoiceSettings.speakingRate,
            pitch: googleVoiceSettings.pitch,
            volumeGainDb: googleVoiceSettings.volumeGainDb,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to convert text to speech');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const newVoice: GeneratedVoice = {
        id: Date.now().toString(),
        text: text,
        audioUrl: audioUrl,
        voiceName: selectedVoiceData?.name || 'Unknown Voice',
        timestamp: new Date()
      };
      
      setGeneratedVoices(prev => {
        const updatedVoices = [newVoice, ...prev].slice(0, MAX_STORED_VOICES);
        localStorage.setItem('generatedVoices', JSON.stringify(updatedVoices));
        return updatedVoices;
      });
    } catch (err) {
      console.error('Error converting text to speech:', err);
      setError(err instanceof Error ? err.message : 'Failed to convert text to speech');
    } finally {
      setLoading(false);
    }
  };

  // Keep existing utility functions
  const handleDeleteVoice = (id: string) => {
    setGeneratedVoices(prev => {
      const updatedVoices = prev.filter(voice => voice.id !== id);
      localStorage.setItem('generatedVoices', JSON.stringify(updatedVoices));
      return updatedVoices;
    });
  };

  const handlePlayVoice = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= 350) {
      setText(newText);
    } else {
      setText(newText.slice(0, 350));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const currentText = text;
    const availableSpace = 350 - currentText.length;
    
    if (availableSpace > 0) {
      const newText = currentText + pastedText.slice(0, availableSpace);
      setText(newText);
    }
  };

  const handleDownloadVoice = (audioUrl: string, text: string) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    const filename = text.slice(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${filename}_voice.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper function to format voice name
  const formatVoiceName = (name: string, voices: GoogleVoice[]) => {
    const voice = voices.find(v => v.name === name);
    if (!voice) return name;

    const langCode = voice.languageCodes[0].split('-')[0];
    const gender = voice.ssmlGender.toLowerCase();
    const voiceIndex = parseInt(name.slice(-1), 36) % 5; // Convert last character to number mod 5

    // Get the appropriate name mapping
    const langMapping = voiceNameMappings[langCode] || voiceNameMappings['en']; // Default to English names
    const names = gender === 'female' ? langMapping.female : langMapping.male;
    
    return names[voiceIndex] || name;
  };

  // Helper function to get language name from code
  const getLanguageName = (code: string) => {
    try {
      const language = new Intl.DisplayNames(['en'], { type: 'language' });
      return language.of(code.split('-')[0]);
    } catch (e) {
      return code;
    }
  };

  // Helper function to get country code (modified for Google voices)
  const getCountryCode = (languageCode: string = ''): string => {
    const codeMap: { [key: string]: string } = {
      'en-US': 'US',
      'en-GB': 'GB',
      'en-AU': 'AU',
      'hi-IN': 'IN',
      'de-DE': 'DE',
      'fr-FR': 'FR',
      'es-ES': 'ES',
      'it-IT': 'IT',
      'ar-XA': 'SA',

      // Add more mappings as needed
    };
    return codeMap[languageCode] || languageCode.split('-')[1] || 'US';
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      generatedVoices.forEach(voice => {
        if (voice.audioUrl.startsWith('blob:')) {
          URL.revokeObjectURL(voice.audioUrl);
        }
      });
    };
  }, []);

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
          <h1 className="text-2xl font-bold ml-4">Text to Speech</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area (left side) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Speaker Selection */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <label className="block text-sm font-medium mb-2">Choose a Speaker</label>
              <div className="relative" ref={dropdownRef}>
                <div
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg cursor-pointer flex items-center justify-between"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {selectedVoice ? (
                    <div className="flex items-center space-x-2">
                      <ReactCountryFlag
                        countryCode={getCountryCode(googleVoices.find(v => v.name === selectedVoice)?.languageCodes[0])}
                        svg
                        className="w-5 h-5"
                      />
                      <span className="font-medium">{formatVoiceName(selectedVoice, googleVoices)}</span>
                      <span className="text-sm text-gray-500">
                        ({getLanguageName(googleVoices.find(v => v.name === selectedVoice)?.languageCodes[0] || '')})
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Select a voice</span>
                  )}
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {isOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {googleVoices.map((voice) => (
                      <div
                        key={voice.name}
                        className={`p-3 flex items-center space-x-2 cursor-pointer hover:bg-gray-50 ${
                          selectedVoice === voice.name ? 'bg-gray-50' : ''
                        }`}
                        onClick={() => {
                          setSelectedVoice(voice.name);
                          setIsOpen(false);
                        }}
                      >
                        <ReactCountryFlag
                          countryCode={getCountryCode(voice.languageCodes[0])}
                          svg
                          className="w-5 h-5"
                        />
                        <div>
                          <span className="font-medium">{formatVoiceName(voice.name, googleVoices)}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({getLanguageName(voice.languageCodes[0])} - {voice.ssmlGender.toLowerCase()})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Text Input */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <textarea
                placeholder="Enter Text here.."
                className="w-full h-[300px] p-4 bg-gray-50 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[#01C39A]"
                value={text}
                onChange={handleTextChange}
                onPaste={handlePaste}
                maxLength={350}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>{text.length}</span>
                <span>/350</span>
              </div>
            </div>

            {/* Convert Button */}
            <button
              onClick={handleTextToSpeech}
              disabled={loading || !text || !selectedVoice}
              className={`w-full py-4 rounded-lg text-white font-medium flex items-center justify-center space-x-2 
                bg-[#01C39A] transition-all duration-200 ${
                loading || !text || !selectedVoice
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-opacity-90'
              }`}
            >
              <GraphicEqIcon className="w-5 h-5" />
              <span>{loading ? 'GENERATING...' : 'TEXT TO SPEECH'}</span>
            </button>
          </div>

          {/* Right Side Column */}
          <div className="space-y-4">
            {/* Voice Settings Card */}
            <div className="bg-white rounded-lg shadow-sm p-3 h-fit">
              <h3 className="text-xs font-medium mb-2">Voice Settings</h3>
              <div className="space-y-2">
                {/* Speaking Rate Control */}
                <div>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span>Speaking Rate</span>
                    <span className="text-[#01C39A]">{googleVoiceSettings.speakingRate.toFixed(2)}</span>
                  </div>
                  <div className="space-y-0.5">
                    <input
                      type="range"
                      min="0.25"
                      max="4.0"
                      step="0.05"
                      value={googleVoiceSettings.speakingRate}
                      onChange={(e) => setGoogleVoiceSettings(prev => ({
                        ...prev,
                        speakingRate: parseFloat(e.target.value)
                      }))}
                      className="w-full accent-[#01C39A] h-1.5"
                    />
                    <div className="flex justify-between text-[9px] text-gray-400">
                      <span>Slower</span>
                      <span>Faster</span>
                    </div>
                  </div>
                </div>

                {/* Pitch Control */}
                <div>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span>Pitch</span>
                    <span className="text-[#01C39A]">{googleVoiceSettings.pitch.toFixed(1)}</span>
                  </div>
                  <div className="space-y-0.5">
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      step="1"
                      value={googleVoiceSettings.pitch}
                      onChange={(e) => setGoogleVoiceSettings(prev => ({
                        ...prev,
                        pitch: parseFloat(e.target.value)
                      }))}
                      className="w-full accent-[#01C39A] h-1.5"
                    />
                    <div className="flex justify-between text-[9px] text-gray-400">
                      <span>Lower</span>
                      <span>Higher</span>
                    </div>
                  </div>
                </div>

                {/* Volume Control */}
                <div>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span>Volume</span>
                    <span className="text-[#01C39A]">{googleVoiceSettings.volumeGainDb.toFixed(1)}</span>
                  </div>
                  <div className="space-y-0.5">
                    <input
                      type="range"
                      min="-96"
                      max="16"
                      step="1"
                      value={googleVoiceSettings.volumeGainDb}
                      onChange={(e) => setGoogleVoiceSettings(prev => ({
                        ...prev,
                        volumeGainDb: parseFloat(e.target.value)
                      }))}
                      className="w-full accent-[#01C39A] h-1.5"
                    />
                    <div className="flex justify-between text-[9px] text-gray-400">
                      <span>Quieter</span>
                      <span>Louder</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Voices List */}
            {generatedVoices.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-3 flex-grow">
                <h2 className="text-xs font-medium mb-2">Generated Voices</h2>
                <div className="space-y-2">
                  {generatedVoices.map((voice) => (
                    <div 
                      key={voice.id}
                      className="bg-gray-50 rounded-lg p-2 flex items-center justify-between group hover:shadow-sm transition-shadow"
                    >
                      <div className="flex-1 min-w-0 mr-2">
                        <div className="flex items-center space-x-1">
                          <h3 className="text-xs font-medium text-gray-900 truncate">{voice.voiceName}</h3>
                          <span className="text-[10px] text-gray-500">
                            {voice.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 line-clamp-1">{voice.text}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handlePlayVoice(voice.audioUrl)}
                          className="p-1 hover:bg-white rounded-full transition-colors"
                          title="Play"
                        >
                          <GraphicEqIcon className="w-3.5 h-3.5 text-[#FFB300]" />
                        </button>
                        <button
                          onClick={() => handleDownloadVoice(voice.audioUrl, voice.text)}
                          className="p-1 hover:bg-white rounded-full transition-colors"
                          title="Download"
                        >
                          <svg 
                            className="w-3.5 h-3.5 text-[#01C39A]"
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteVoice(voice.id)}
                          className="p-1 hover:bg-white rounded-full transition-colors"
                          title="Delete"
                        >
                          <XMarkIcon className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-center mt-4">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 