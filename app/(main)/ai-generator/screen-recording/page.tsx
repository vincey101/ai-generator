'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { PlayIcon, StopIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

export default function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Get screen capture with system audio
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      // Get microphone audio
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
        video: false
      });

      // Combine all audio tracks with the video track
      const videoTrack = screenStream.getVideoTracks()[0];
      const audioTracks = [
        ...screenStream.getAudioTracks(),
        ...micStream.getAudioTracks()
      ];

      // Create a new stream with all tracks
      const combinedStream = new MediaStream([videoTrack, ...audioTracks]);
      streamRef.current = combinedStream;

      // Set the live stream to the video preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = combinedStream;
      }

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideo(url);
        setRecordedChunks(chunks);
        
        // Clear the live preview
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null;
        }
        
        // Stop all tracks
        combinedStream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please make sure you have granted screen sharing and microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const restartRecording = () => {
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo);
    }
    setRecordedVideo(null);
    setRecordedChunks([]);
    startRecording();
  };

  const downloadRecording = () => {
    if (recordedChunks.length === 0) return;

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = `screen-recording-${new Date().toISOString()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
          <h1 className="text-2xl font-bold ml-4">Screen Recorder</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-lg">
            {error}
          </div>
        )}

        {/* Video Preview - Show during recording and after recording */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <video
            ref={videoPreviewRef}
            autoPlay
            muted
            playsInline
            className={`w-full aspect-video ${isRecording ? 'block' : 'hidden'}`}
          />
          {recordedVideo && !isRecording && (
            <video
              src={recordedVideo}
              controls
              className="w-full aspect-video"
            />
          )}
          {!isRecording && !recordedVideo && (
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p>Click "Start Recording" and select the screen or window you want to record.</p>
                <p className="mt-2">Your recording will appear here for preview and download.</p>
              </div>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4">
          {!isRecording && !recordedVideo && (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-6 py-3 bg-[#01C39A] text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              <PlayIcon className="w-5 h-5" />
              Start Recording
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              <StopIcon className="w-5 h-5" />
              Stop Recording
            </button>
          )}

          {recordedVideo && (
            <>
              <button
                onClick={restartRecording}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Record Again
              </button>
              <button
                onClick={downloadRecording}
                className="flex items-center gap-2 px-6 py-3 bg-[#01C39A] text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Download Recording
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 