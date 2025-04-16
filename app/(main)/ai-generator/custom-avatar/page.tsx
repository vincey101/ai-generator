'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { toast } from 'sonner'

interface FileUpload {
  file: File | null
  url: string | null
}

interface GenerateResponse {
  id: string
  createdAt: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  model: string
  input: {
    url: string
    type: string
  }[]
  webhookUrl: string | null
  options: {
    pads: number[]
    sync_mode: string
    output_format: string
  }
  outputUrl: string | null
  outputDuration: number | null
  error: string | null
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB in bytes
const MAX_AUDIO_SIZE = 15 * 1024 * 1024 // 15MB in bytes
const MAX_POLL_TIME = 5 * 60 * 1000 // 5 minutes in milliseconds
const POLL_INTERVAL = 3000 // 3 seconds

export default function CustomAvatarPage() {
  const [imageUpload, setImageUpload] = useState<FileUpload>({ file: null, url: null })
  const [audioUpload, setAudioUpload] = useState<FileUpload>({ file: null, url: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const [processingImage, setProcessingImage] = useState(false)
  const [processingAudio, setProcessingAudio] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const startTimeRef = useRef<number>(0)
  const toastShownRef = useRef<boolean>(false)

  // Add effect to fetch data on mount if ID exists
  useEffect(() => {
    const id = localStorage.getItem('custom_avatar_id')
    if (id) {
      refreshVideo()
    }
    // Reset toast flag when component mounts
    return () => {
      toastShownRef.current = false
    }
  }, [])

  // Separate polling effect that doesn't depend on loading state
  useEffect(() => {
    const id = localStorage.getItem('custom_avatar_id')
    if (!id || !loading) return

    let pollInterval: NodeJS.Timeout
    startTimeRef.current = Date.now()

    const pollStatus = async () => {
      try {
        const response = await fetch('/api/sync/status/' + id)
        const data: GenerateResponse = await response.json()
        
        console.log('Polling status:', data.status, 'Output URL:', data.outputUrl)
        
        if (data.status === 'COMPLETED' && data.outputUrl) {
          setGeneratedVideo(data.outputUrl)
          setLoading(false)
          setGenerationStatus('COMPLETED')
          if (!toastShownRef.current) {
            toast.success(`Video generation completed! (${data.outputDuration?.toFixed(2)}s)`, {
              duration: 5000,
              position: 'top-right',
            })
            toastShownRef.current = true
          }
          clearInterval(pollInterval)
          return
        }
        
        if (data.status === 'FAILED') {
          setLoading(false)
          setGenerationStatus('FAILED')
          setError(data.error || 'Video generation failed')
          toast.error('Video generation failed. Please try again.', {
            duration: 5000,
            position: 'top-right',
          })
          clearInterval(pollInterval)
          return
        }

        // Check if we've exceeded the maximum polling time
        const elapsedTime = Date.now() - startTimeRef.current
        if (elapsedTime >= MAX_POLL_TIME) {
          clearInterval(pollInterval)
          setLoading(false)
          toast.info('Video is still processing. You can check back later using the ID: ' + id, {
            duration: 8000,
            position: 'top-right',
          })
          return
        }

        // Update status for UI feedback
        setGenerationStatus(data.status)

      } catch (err) {
        console.error('Polling error:', err)
        // Don't stop polling on network errors, just log them
        console.log('Continuing to poll despite error...')
      }
    }

    // Start polling immediately
    pollStatus()
    
    // Then continue polling every 3 seconds
    pollInterval = setInterval(pollStatus, POLL_INTERVAL)

    return () => {
      clearInterval(pollInterval)
    }
  }, [loading])

  const generateAvatar = async () => {
    if (!imageUpload.url || !audioUpload.url) {
      setError('Please upload both image and audio files')
      return
    }

    // Reset all states
    setError(null)
    setGeneratedVideo(null)
    setGenerationStatus('PENDING')
    startTimeRef.current = Date.now()
    setLoading(true)
    
    toast.info('Starting video generation...', {
      duration: 3000,
      position: 'top-right',
    })

    try {
      const response = await fetch('/api/sync/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'lipsync-1.7.1',
          input: [
            { type: 'image', url: imageUpload.url },
            { type: 'audio', url: audioUpload.url },
          ],
          options: {
            sync_mode: 'loop',
            pads: [5, 5, 5, 5],
            output_format: 'mp4',
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText)
      }

      const data: GenerateResponse = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Store the new ID and start polling
      localStorage.setItem('custom_avatar_id', data.id)
      setGenerationStatus('PROCESSING')

    } catch (err) {
      console.error('Generate error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate avatar video')
      setLoading(false)
      setGenerationStatus('FAILED')
      toast.error('Failed to start video generation', {
        duration: 5000,
        position: 'top-right',
      })
    }
  }

  const refreshVideo = async () => {
    const id = localStorage.getItem('custom_avatar_id')
    if (!id) {
      toast.error('No video ID found')
      return
    }

    try {
      setLoading(true)
      startTimeRef.current = Date.now()
      const response = await fetch(`/api/sync/status/${id}`)
      const data: GenerateResponse = await response.json()
      
      if (data.status === 'COMPLETED' && data.outputUrl) {
        setGeneratedVideo(data.outputUrl)
        setGenerationStatus('COMPLETED')
        setLoading(false)
        if (!toastShownRef.current) {
          toast.success(`Video generation completed! (${data.outputDuration?.toFixed(2)}s)`, {
            duration: 5000,
            position: 'top-right',
          })
          toastShownRef.current = true
        }
      } else {
        setGenerationStatus(data.status)
        if (data.status === 'PROCESSING') {
          toast.info('Video is still processing. Starting polling...', {
            duration: 3000,
            position: 'top-right',
          })
        }
      }
    } catch (err) {
      console.error('Refresh error:', err)
      setError('Failed to refresh video')
      setLoading(false)
      toast.error('Failed to refresh video', {
        duration: 3000,
        position: 'top-right',
      })
    }
  }

  const validateFileSize = (file: File, type: 'image' | 'audio'): boolean => {
    const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_AUDIO_SIZE
    if (file.size > maxSize) {
      const sizeMB = type === 'image' ? '10MB' : '15MB'
      setError(`${type.charAt(0).toUpperCase() + type.slice(1)} file size must be less than ${sizeMB}`)
      return false
    }
    return true
  }

  const handleFileUpload = async (file: File, type: 'image' | 'audio') => {
    try {
      setError(null)
      
      if (!validateFileSize(file, type)) {
        return
      }

      if (type === 'image') {
        setProcessingImage(true)
      } else {
        setProcessingAudio(true)
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload file')
      }

      const { url } = await response.json()
      
      if (type === 'image') {
        setImageUpload({ file, url })
        setProcessingImage(false)
      } else {
        setAudioUpload({ file, url })
        setProcessingAudio(false)
      }
    } catch (err) {
      setError('Failed to upload file')
      console.error(err)
      if (type === 'image') {
        setProcessingImage(false)
      } else {
        setProcessingAudio(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link 
            href="/ai-generator"
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold ml-4">Custom Avatar Generator</h1>
        </div>

        {/* Instructions Card */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <h2 className="text-sm font-medium mb-3">Instructions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <div className="space-y-1.5">
              <h3 className="text-xs font-medium text-gray-700">Image/Audio Requirements</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#01C39A] mt-0.5">•</span>
                  <span>Clear portrait photo (JPG/PNG format)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#01C39A] mt-0.5">•</span>
                  <span>Single face, front-facing</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#01C39A] mt-0.5">•</span>
                  <span>Good lighting, neutral expression</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#01C39A] mt-0.5">•</span>
                  <span>Plain or simple background</span>
                </li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#01C39A] mt-0.5">•</span>
                  <span>Clear, audible speech (MP3 format)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#01C39A] mt-0.5">•</span>
                  <span>No background noise</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#01C39A] mt-0.5">•</span>
                  <span>Professional audio quality</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#01C39A] mt-0.5">•</span>
                  <span className="text-[#ff0000]">Download video result as soon as it is ready or refresh the page after 1-2 minutes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Upload Image</label>
                  <span className="text-xs text-gray-500">Max size: 10MB</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={imageInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'image')
                  }}
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className={`w-full p-4 border-2 border-dashed rounded-lg transition-all duration-300 ${
                    processingImage 
                      ? 'border-[#01C39A] animate-pulse bg-gray-50' 
                      : imageUpload.file 
                        ? 'border-[#01C39A]' 
                        : 'border-gray-300 hover:border-[#01C39A]'
                  }`}
                >
                  {processingImage ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-[#01C39A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm text-gray-600">Processing image...</span>
                    </div>
                  ) : imageUpload.file ? (
                    <div className="text-sm text-gray-600">
                      <div>{imageUpload.file.name}</div>
                      <div className="text-xs text-gray-400">
                        {(imageUpload.file.size / (1024 * 1024)).toFixed(2)}MB
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Click to upload image</span>
                  )}
                </button>
              </div>

              {/* Audio Upload */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Upload Audio</label>
                  <span className="text-xs text-gray-500">Max size: 15MB</span>
                </div>
                <input
                  type="file"
                  accept=".mp3,.wav"
                  className="hidden"
                  ref={audioInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'audio')
                  }}
                />
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className={`w-full p-4 border-2 border-dashed rounded-lg transition-all duration-300 ${
                    processingAudio 
                      ? 'border-[#01C39A] animate-pulse bg-gray-50' 
                      : audioUpload.file 
                        ? 'border-[#01C39A]' 
                        : 'border-gray-300 hover:border-[#01C39A]'
                  }`}
                >
                  {processingAudio ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-[#01C39A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm text-gray-600">Processing audio...</span>
                    </div>
                  ) : audioUpload.file ? (
                    <div className="text-sm text-gray-600">
                      <div>{audioUpload.file.name}</div>
                      <div className="text-xs text-gray-400">
                        {(audioUpload.file.size / (1024 * 1024)).toFixed(2)}MB
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Click to upload audio</span>
                  )}
                </button>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateAvatar}
                disabled={loading || !imageUpload.file || !audioUpload.file}
                className={`w-full py-3 rounded-lg text-white font-medium
                  bg-[#01C39A] transition-all duration-200 ${
                  loading || !imageUpload.file || !audioUpload.file
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-opacity-90'
                }`}
              >
                {loading ? 'GENERATING...' : 'GENERATE AVATAR'}
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium">Preview</h2>
                {generationStatus === 'PROCESSING' && !generatedVideo && (
                  <span className="text-xs text-[#01C39A] animate-pulse">Processing...</span>
                )}
              </div>
            </div>
            {generatedVideo ? (
              <video
                key={generatedVideo}
                src={generatedVideo}
                controls
                className="w-full rounded-lg"
                autoPlay
              />
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">
                  {generationStatus === 'PROCESSING' 
                    ? 'Generating video...' 
                    : 'Generated video will appear here'}
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-500 rounded-lg text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  )
} 