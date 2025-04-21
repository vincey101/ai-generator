'use client';

import { useState } from 'react';
import Image from 'next/image';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TuneIcon from '@mui/icons-material/Tune';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import PersonIcon from '@mui/icons-material/Person';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import InterestsIcon from '@mui/icons-material/Interests';
import { useRouter } from 'next/navigation';
import { VideoCameraIcon } from '@heroicons/react/24/outline';

export default function VideoGenerator() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNav, setSelectedNav] = useState('For you');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const router = useRouter();

  const navigationItems = [
    // { name: 'For you', icon: ThumbUpAltIcon, bgColor: 'bg-blue-500' },
    { name: 'Text to Speech', icon: GraphicEqIcon, bgColor: 'bg-teal-400', link: '/ai-generator/text-to-speech' },
    { name: 'AI Photo Avatar', icon: PersonIcon, bgColor: 'bg-blue-400', link: '/ai-generator/ai-photo' },
    { name: 'AI Content Generator', icon: BubbleChartIcon, bgColor: 'bg-purple-400', link: '/ai-generator/ai-content' },
    { name: 'Video Library', icon: InterestsIcon, bgColor: 'bg-rose-700', link: '/ai-generator/video-library' },
    { name: 'Image Library', icon: ImageOutlinedIcon, bgColor: 'bg-green-400', link: '/ai-generator/image-library' },
    // { name: 'Marketing', icon: BusinessCenterIcon, bgColor: 'bg-indigo-400' },
  ];

  const quickStartItems = [
    {
      title: 'Text to Speech',
      description: 'Convert text into natural-sounding voices instantly.',
      icon: '/images/features/text2speech.jpg',
      link: '/ai-generator/text-to-speech'
    },
    {
      title: 'AI Photo Avatar',
      description: 'Generate realistic AI avatars by describing appearance and style.',
      icon: '/images/features/ai-photo.png',
      link: '/ai-generator/ai-photo'
    },
    {
      title: 'Custom Avatar',
      description: 'Upload your preferred custom photo Avatar.',
      icon: '/images/features/custom-photo.png',
      link: '/ai-generator/custom-avatar'
    },
    {
      title: 'Screen Recording',
      description: 'Record your screen with professional quality.',
      icon: '/images/features/screen-recording.png',
      link: '/ai-generator/screen-recording'
    },
    {
      title: 'Screen & Cam Recording',
      description: 'Record your screen activities with webcam overlay.',
      icon: '/images/features/screen-webcam.jpg',
      link: '/ai-generator/screen-recording-webcam'
    },
    {
      title: 'Video Library',
      description: 'Access our extensive collection of videos.',
      icon: '/images/features/video-library.jpg',
      link: '/ai-generator/video-library'
    },
    {
      title: 'Image Library',
      description: 'Browse through our curated image collection.',
      icon: '/images/features/image-library.jpg',
      link: '/ai-generator/image-library'
    },
    {
      title: 'Talking Head Videos',
      description: 'Create engaging presenter-style videos.',
      icon: '/images/features/talking-head.jpg',
      link: '/ai-generator/talking-head'
    },
    {
      title: 'Images to Videos',
      description: 'Transform your images into dynamic videos.',
      icon: '/images/features/images-video.jpg',
      link: '/ai-generator/images-to-video'
    },
    {
      title: 'URL to Short Videos',
      description: 'Convert web content into short-form videos.',
      icon: '/images/features/url-video.jpg',
      link: '/ai-generator/url-to-video'
    },
    {
      title: 'AI Content Generation',
      description: 'Generate creative content with AI assistance.',
      icon: '/images/features/prompt-generate.jpeg',
      link: '/ai-generator/ai-content'
    },
    {
      title: 'Video Shortener',
      description: 'Create concise versions of your videos.',
      icon: '/images/features/video-shortener.png',
      link: '/ai-generator/video-shortener'
    },
    {
      title: 'Voice Cloning',
      description: 'Clone and customize voice for your content.',
      icon: '/images/features/voice-clone.jpeg',
      link: '/ai-generator/voice-cloning'
    },
    {
      title: 'Audio Converter',
      description: 'Convert audio files to different formats.',
      icon: '/images/features/audio-converter.jpg',
      link: '/ai-generator/audio-converter'
    },
    {
      title: 'Video Converter',
      description: 'Convert video files to different formats.',
      icon: '/images/features/video-converter.jpg',
      link: '/ai-generator/video-converter'
    },
    {
      title: 'Image Generator',
      description: 'Create unique images using AI technology.',
      icon: '/images/features/image-generator.png',
      link: '/ai-generator/image-generator'
    },
    {
      title: 'Social Media Downloader',
      description: 'Download content from various social media platforms.',
      icon: '/images/features/social-media.jpg',
      link: '/ai-generator/social-media'
    },
    {
      title: 'Photo Editor',
      description: 'Edit and enhance your photos with professional tools.',
      icon: '/images/features/photo-editor.jpg',
      link: '/ai-generator/photo-editor'
    }
  ];

  // Add a function to filter items based on search query
  const filteredItems = quickStartItems.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower)
    );
  });

  const handleAvatarClick = () => {
    router.push('/ai-generator/ai-photo');
  };

  return (
    <div className="min-h-screen bg-gray-50 -mt-8">
      <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-[#27C8A4] rounded-b-[40px] p-8 pb-20 relative">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <h1 className="text-2xl font-bold text-white text-center mb-8">
            What AI-Powered Project Will You Bring to Life?
          </h1>

          {/* Search Bar */}
          <div className="relative max-w-3xl mx-auto mb-12">
            <div className="flex items-center bg-white rounded-lg p-2 shadow-lg">
              <AutoAwesomeIcon className="ml-2 text-[#FFA800]" />
              <input
                type="text"
                placeholder="Explore our AI features and tools....."
                className="flex-1 px-4 py-2 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
              <TuneIcon className="text-gray-400 mr-2 cursor-pointer hover:text-gray-600" />
            </div>

            {/* Search Results Dropdown */}
            {isSearchFocused && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-xl z-50 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4">
                  {searchQuery === '' ? (
                    // Show all items when no search query
                    quickStartItems.map((item) => (
                      <div
                        key={item.title}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
                        onClick={() => router.push(item.link)}
                      >
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <img
                            src={item.icon}
                            alt={item.title}
                            className="object-cover w-full h-full rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-[#FFA800]">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-500 truncate group-hover:text-[#FFA800]">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : filteredItems.length > 0 ? (
                    // Show filtered items when there's a search query
                    filteredItems.map((item) => (
                      <div
                        key={item.title}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
                        onClick={() => router.push(item.link)}
                      >
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <img
                            src={item.icon}
                            alt={item.title}
                            className="object-cover w-full h-full rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-[#FFA800]">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-500 truncate group-hover:text-[#FFA800]">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Show "No results found" when there are no matches
                    <div className="col-span-full text-center py-4 text-gray-500">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Start and Navigation Container */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-10 w-full max-w-xl">
            {/* Quick Start Label */}
            <div className="relative mx-auto bg-white border-t border-l border-r border-gray-300 rounded-t-full px-4 py-1 shadow-md w-fit -mb-2">
              <span className="text-[#FFA800] font-medium text-sm">Quick Start</span>
            </div>

            {/* Navigation Icons */}
            <div className="bg-white rounded-[20px] py-3 px-2 shadow-lg relative z-10">
              <div className="flex justify-center gap-3">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  const isSelected = selectedNav === item.name;
                  
                  return (
                    <div 
                      key={item.name} 
                      className="text-center px-1 cursor-pointer"
                      onClick={() => {
                        setSelectedNav(item.name);
                        router.push(item.link);
                      }}
                    >
                      <div className={`w-9 h-9 ${
                        isSelected ? 'bg-purple-500' : item.bgColor
                      } rounded-full mb-1.5 mx-auto flex items-center justify-center shadow-md 
                      transition-colors duration-200`}>
                        <IconComponent className="text-white w-4 h-4" />
                      </div>
                      <span className={`text-xs font-medium transition-colors duration-200 ${
                        isSelected ? 'text-purple-500' : 'text-gray-600'
                      } hover:text-[#FFA800]`}>
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start Section - Now with proper spacing from the navigation */}
      <div className="max-w-6xl mx-auto px-8 pt-16">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickStartItems.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-lg overflow-hidden cursor-pointer shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-300"
              onClick={() => router.push(item.link)}
            >
              <div className="relative w-full h-40">
                <img
                  src={item.icon}
                  alt={item.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-3 group">
                <h3 className="text-lg font-semibold mb-0.5 group-hover:text-[#FFA800]">{item.title}</h3>
                <p className="text-sm text-gray-500 group-hover:text-[#FFA800]">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 