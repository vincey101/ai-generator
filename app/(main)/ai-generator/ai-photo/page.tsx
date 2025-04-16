'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface FormData {
  name: string
  age: string
  gender: string
  ethnicity: string
  orientation: string
  pose: string
  style: string
  appearance: string
}

interface GenerationResponse {
  error: null | string
  data: {
    generation_id: string
  }
}

interface ResultResponse {
  error: null | string
  data: {
    id: string
    status: string
    msg: null | string
    image_url_list: string[]
  }
}

const ageOptions = ['Young Adult', 'Early middle Age', 'Late middle age', 'Senior', 'Unspecified']
const genderOptions = ['Woman', 'Man', 'Unspecified']
const ethnicityOptions = [
  'White', 'Black', 'Asian American', 'East Asian', 'South East Asian',
  'South Asian', 'Middle Eastern', 'Pacific', 'Hispanic', 'Unspecified'
]
const orientationOptions = ['square', 'horizontal', 'vertical']
const poseOptions = ['half_body', 'close_up', 'full_body']
const styleOptions = ['Realistic', 'Pixar', 'Cinematic', 'Vintage', 'Noir', 'Cyberpunk', 'Unspecified']

export default function AIPhotoGenerator() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: 'Young Adult',
    gender: 'Unspecified',
    ethnicity: 'Unspecified',
    orientation: 'square',
    pose: 'half_body',
    style: 'Realistic',
    appearance: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    const loadExistingImages = async () => {
      const generationId = localStorage.getItem('generation_id')
      if (generationId) {
        await checkResult(generationId)
      }
    }

    loadExistingImages()
  }, [])

  const refreshResults = async () => {
    const generationId = localStorage.getItem('generation_id')
    if (generationId) {
      await checkResult(generationId)
    }
  }

  const generateAvatar = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('https://api.heygen.com/v2/photo_avatar/photo/generate', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_HEYGEN_API_KEY || '',
        },
        body: JSON.stringify(formData),
      })

      const data: GenerationResponse = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      localStorage.setItem('generation_id', data.data.generation_id)
      await checkResult(data.data.generation_id)

      // Reset form after successful submission
      setFormData({
        name: '', // Clear name
        age: 'Young Adult', // Keep default value
        gender: 'Unspecified',
        ethnicity: 'Unspecified',
        orientation: 'square',
        pose: 'half_body',
        style: 'Realistic',
        appearance: '', // Clear appearance
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate avatar')
    } finally {
      setLoading(false)
    }
  }

  const checkResult = async (generationId: string) => {
    try {
      const response = await fetch(`https://api.heygen.com/v2/photo_avatar/generation/${generationId}`, {
        headers: {
          'accept': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_HEYGEN_API_KEY || '',
        },
      })

      const data: ResultResponse = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.data.status === 'success') {
        setImages(data.data.image_url_list)
      } else if (data.data.status === 'processing') {
        setTimeout(() => checkResult(generationId), 1000)
      } else if (data.data.status === 'failed') {
        setError('Generation failed')
        localStorage.removeItem('generation_id')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch results')
    }
  }

  const isFormValid = () => {
    return Object.values(formData).every(value => value.trim() !== '')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link 
            href="/video-generator"
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold ml-4">AI Photo Avatar</h1>
        </div>

        <div className="space-y-6">
          {/* Top row - Compact Basic Info and Image Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info Card - More compact */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="grid grid-cols-2 gap-3">
                {/* Name Field */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1">Name</label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#01C39A] text-sm"
                  />
                </div>

                {/* Age and Gender in grid */}
                <div>
                  <label className="block text-xs font-medium mb-1">Age</label>
                  <select
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#01C39A] text-sm"
                  >
                    {ageOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#01C39A] text-sm"
                  >
                    {genderOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {/* Ethnicity */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1">Ethnicity</label>
                  <select
                    value={formData.ethnicity}
                    onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#01C39A] text-sm"
                  >
                    {ethnicityOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Image Settings Card - More compact */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-xs font-medium mb-3">Image Settings</h3>
              <div className="space-y-3">
                <div className="w-full">
                  <label className="block text-xs font-medium mb-1">Orientation</label>
                  <select
                    value={formData.orientation}
                    onChange={(e) => setFormData({ ...formData, orientation: e.target.value })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#01C39A] text-sm"
                  >
                    {orientationOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full">
                  <label className="block text-xs font-medium mb-1">Pose</label>
                  <select
                    value={formData.pose}
                    onChange={(e) => setFormData({ ...formData, pose: e.target.value })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#01C39A] text-sm"
                  >
                    {poseOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full">
                  <label className="block text-xs font-medium mb-1">Style</label>
                  <select
                    value={formData.style}
                    onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#01C39A] text-sm"
                  >
                    {styleOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row - Appearance Description and Results */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Appearance Description Card */}
            <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm">
              <div className="h-full flex flex-col">
                <label className="block text-sm font-medium mb-2">Appearance Description</label>
                <textarea
                  placeholder="Describe the appearance of your avatar..."
                  value={formData.appearance}
                  onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
                  maxLength={1000}
                  className="flex-grow w-full p-3 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[#01C39A] mb-2 min-h-[200px]"
                />
                <div className="flex items-center justify-between mt-auto">
                  <div className="text-sm text-gray-500">
                    <span>{formData.appearance.length}</span>
                    <span>/1000</span>
                  </div>
                  <button 
                    onClick={generateAvatar} 
                    disabled={loading || !isFormValid()}
                    className={`px-6 py-2 rounded-lg text-white font-medium
                      bg-[#01C39A] transition-all duration-200 ${
                      loading || !isFormValid() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'
                    }`}
                  >
                    {loading ? 'GENERATING...' : 'GENERATE AVATAR'}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium">Generated Avatars</h2>
                {images.length > 0 && (
                  <button
                    onClick={refreshResults}
                    className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                )}
              </div>
              {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                      <Image
                        src={url}
                        alt={`Generated avatar ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200">
                        <a 
                          href={url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"
                        >
                          <span className="bg-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                            View Full Size
                          </span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="min-h-[200px] flex items-center justify-center text-gray-400">
                  {loading ? 'Generating images...' : 'Generated images will appear here'}
                </div>
              )}
            </div>
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
