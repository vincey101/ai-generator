'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { PlayIcon, StopIcon, ArrowPathIcon, VideoCameraIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

type WebcamPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export default function ScreenRecorderWithWebcam() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [webcamPosition, setWebcamPosition] = useState<WebcamPosition>('top-right');
  const [showWebcam, setShowWebcam] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  const webcamPositionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getSupportedMimeType = () => {
    const types = [
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp8',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp9',
      'video/webm;codecs=h264',
      'video/webm',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'video/webm'; // Fallback
  };

  const startRecording = async () => {
    try {
      // Get screen capture with system audio
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Get webcam stream
      const webcamStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      // Get microphone audio
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      // Store references to streams
      streamRef.current = screenStream;
      webcamStreamRef.current = webcamStream;

      // Set up video elements
      const videoPreview = videoPreviewRef.current!;
      const webcamPreview = webcamVideoRef.current!;
      
      videoPreview.srcObject = screenStream;
      webcamPreview.srcObject = webcamStream;

      // Wait for video elements to be ready
      await Promise.all([
        new Promise<void>((resolve) => {
          videoPreview.onloadedmetadata = () => {
            videoPreview.play();
            resolve();
          };
        }),
        new Promise<void>((resolve) => {
          webcamPreview.onloadedmetadata = () => {
            webcamPreview.play();
            resolve();
          };
        })
      ]);

      // Set up canvas for compositing
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d', { alpha: false })!;

      // Get screen video track settings
      const videoTrack = screenStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      canvas.width = settings.width || 1920;
      canvas.height = settings.height || 1080;

      // Combine all audio tracks
      const audioTracks = [
        ...screenStream.getAudioTracks(),
        ...micStream.getAudioTracks()
      ];

      let isDrawing = true;
      let animationFrameId: number;

      // Drawing function for the canvas
      const drawFrame = () => {
        if (!isDrawing) return;

        try {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw screen capture
          if (videoPreview.readyState >= 2) {
            ctx.drawImage(videoPreview, 0, 0, canvas.width, canvas.height);
          }

          // Draw webcam if enabled
          if (showWebcam && webcamPreview.readyState >= 2) {
            const webcamWidth = canvas.width / 4;
            const webcamHeight = (webcamWidth * 3) / 4;
            
            let x = 0;
            let y = 0;

            switch (webcamPosition) {
              case 'top-left':
                x = 20;
                y = 20;
                break;
              case 'top-right':
                x = canvas.width - webcamWidth - 20;
                y = 20;
                break;
              case 'bottom-left':
                x = 20;
                y = canvas.height - webcamHeight - 20;
                break;
              case 'bottom-right':
                x = canvas.width - webcamWidth - 20;
                y = canvas.height - webcamHeight - 20;
                break;
            }

            ctx.drawImage(webcamPreview, x, y, webcamWidth, webcamHeight);
          }

          animationFrameId = requestAnimationFrame(drawFrame);
        } catch (err) {
          console.error('Error in draw frame:', err);
        }
      };

      // Start the drawing loop
      drawFrame();

      // Create a canvas stream for recording
      const canvasStream = canvas.captureStream(30);

      // Add audio tracks to the canvas stream
      audioTracks.forEach(track => {
        canvasStream.addTrack(track);
      });

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(canvasStream, {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 1500000
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
          console.log('Chunk size:', e.data.size); // Debug log
        }
      };

      mediaRecorder.onstop = () => {
        isDrawing = false;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }

        try {
          console.log('Number of chunks:', chunks.length); // Debug log
          console.log('Total size:', chunks.reduce((size, chunk) => size + chunk.size, 0)); // Debug log

          // Create final video blob
          const blob = new Blob(chunks, { type: 'video/webm' });
          console.log('Final blob size:', blob.size); // Debug log
          
          if (blob.size > 0) {
            // Clean up old URL if it exists
            if (recordedVideo) {
              URL.revokeObjectURL(recordedVideo);
            }

            const url = URL.createObjectURL(blob);
            setRecordedVideo(url);
            setRecordedChunks(chunks);
          } else {
            throw new Error('Recording resulted in empty blob');
          }
        } catch (err) {
          console.error('Error creating recording:', err);
          setError('Failed to create recording: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
          // Stop all tracks
          screenStream.getTracks().forEach(track => track.stop());
          webcamStream.getTracks().forEach(track => track.stop());
          micStream.getTracks().forEach(track => track.stop());
          canvasStream.getTracks().forEach(track => track.stop());

          // Clear video sources
          videoPreview.srcObject = null;
          webcamPreview.srcObject = null;
        }
      };

      // Start recording with smaller chunks
      mediaRecorder.start(500);
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please make sure you have granted screen sharing and webcam permissions.');
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

    try {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      
      // Verify blob size
      if (blob.size === 0) {
        throw new Error('Recording is empty');
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `screen-recording-${Date.now()}.webm`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      requestAnimationFrame(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
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
          <h1 className="text-2xl font-bold ml-4">Screen & Webcam Recorder</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-lg">
            {error}
          </div>
        )}

        {/* Webcam Controls */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Webcam Position</h3>
          <div className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm">
            {[
              { value: 'top-left', label: 'Top Left' },
              { value: 'top-right', label: 'Top Right' },
              { value: 'bottom-left', label: 'Bottom Left' },
              { value: 'bottom-right', label: 'Bottom Right' }
            ].map((position) => (
              <label
                key={position.value}
                className="flex-1"
              >
                <input
                  type="radio"
                  name="webcamPosition"
                  value={position.value}
                  checked={webcamPosition === position.value}
                  onChange={(e) => setWebcamPosition(e.target.value as WebcamPosition)}
                  className="sr-only" // Hide default radio button
                />
                <div className={`
                  cursor-pointer rounded-md px-3 py-2 text-sm text-center transition-all
                  ${webcamPosition === position.value 
                    ? 'bg-[#01C39A] text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}>
                  {position.label}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Video Preview Container */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8 relative">
          {/* Main Screen Preview */}
          <video
            ref={videoPreviewRef}
            autoPlay
            muted
            playsInline
            className={`w-full aspect-video ${isRecording ? 'block' : 'hidden'}`}
          />
          
          {/* Webcam Preview - Always visible during recording */}
          <video
            ref={webcamVideoRef}
            autoPlay
            muted
            playsInline
            className={`absolute w-1/4 ${webcamPositionClasses[webcamPosition]} ${
              isRecording ? 'block' : 'hidden'
            }`}
          />

          {/* Canvas for Recording */}
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          
          {/* Recorded Video Playback */}
          {recordedVideo && !isRecording && (
            <div className="relative">
              <video
                key={recordedVideo}
                src={recordedVideo}
                controls
                playsInline
                autoPlay={false}
                className="w-full aspect-video"
                onError={(e) => {
                  const videoElement = e.target as HTMLVideoElement;
                  console.error('Video error:', videoElement.error);
                  setError(`Playback error: ${videoElement.error?.message || 'Unknown error'}`);
                }}
                onLoadedData={() => {
                  console.log('Video loaded successfully');
                  setError(null);
                }}
              />
            </div>
          )}
          
          {/* Initial State */}
          {!isRecording && !recordedVideo && (
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p>Click "Start Recording" to capture your screen with webcam overlay.</p>
                <p className="mt-2">Your recording will appear here for preview and download.</p>
              </div>
            </div>
          )}
        </div>

        {/* Control Buttons - Update the styles to match the theme */}
        <div className="flex justify-center gap-4">
          {!isRecording && !recordedVideo && (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-6 py-3 bg-[#01C39A] text-white rounded-lg hover:bg-opacity-90 transition-all shadow-sm hover:shadow-md"
            >
              <PlayIcon className="w-5 h-5" />
              Start Recording
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-opacity-90 transition-all shadow-sm hover:shadow-md"
            >
              <StopIcon className="w-5 h-5" />
              Stop Recording
            </button>
          )}

          {recordedVideo && (
            <>
              <button
                onClick={restartRecording}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-opacity-90 transition-all shadow-sm hover:shadow-md"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Record Again
              </button>
              <button
                onClick={downloadRecording}
                className="flex items-center gap-2 px-6 py-3 bg-[#01C39A] text-white rounded-lg hover:bg-opacity-90 transition-all shadow-sm hover:shadow-md"
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