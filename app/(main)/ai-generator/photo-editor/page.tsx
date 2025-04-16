'use client'

import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function PhotoEditorPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="flex items-center p-4 bg-white shadow-sm">
        <Link 
          href="/ai-generator"
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold ml-4">Photo Editor</h1>
      </div>

      {/* Editor iframe */}
      <iframe
        src="https://myedgeapp.com/graphic/"
        className="w-full h-[calc(100vh-73px)]" // 73px is header height
        style={{
          border: 'none',
          display: 'block'
        }}
        allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone"
      />
    </div>
  )
} 