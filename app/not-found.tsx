'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const router = useRouter();
  const [hasAuthToken, setHasAuthToken] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const authToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='));

    if (authToken && window.location.pathname === '/') {
      router.push('/tutorial');
      return;
    }

    setHasAuthToken(!!authToken);
    setIsChecking(false);
  }, [router]);

  if (isChecking) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#194f43] overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-[#27C8A4]/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-[#27C8A4]/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute w-96 h-96 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#27C8A4]/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 text-center">
        {/* 404 with glitch effect */}
        <div className="relative inline-block">
          <h1 className="text-[180px] font-bold text-[#27C8A4] leading-none animate-glitch-1 
            before:content-['404'] before:absolute before:left-[2px] before:text-[#27C8A4] 
            after:content-['404'] after:absolute after:left-[-2px] after:text-[#27C8A4]">
            404
          </h1>
        </div>

        {/* Content container with glass effect */}
        <div className="max-w-md mx-auto mt-8 px-8 py-12 bg-white/10 backdrop-blur-lg rounded-2xl 
          border border-white/20 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
          <h2 className="text-2xl font-bold text-white mb-4 animate-fade-in">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-300 mb-8 animate-fade-in animation-delay-200">
            Oops! This page is playing hide and seek... and it's winning! 🙈 <br/>
            <span className="text-sm opacity-80">
              Let's get you back to somewhere that actually exists.
            </span>
          </p>

          <div className="space-y-4">
            <button
              onClick={() => router.push(hasAuthToken ? '/tutorial' : '/login')}
              className="w-full px-6 py-3 bg-[#27C8A4] text-white rounded-xl 
                transform hover:-translate-y-1 hover:shadow-lg hover:bg-[#194f43] 
                transition-all duration-300 animate-fade-in animation-delay-400
                focus:outline-none focus:ring-2 focus:ring-[#27C8A4] focus:ring-opacity-50"
            >
              {hasAuthToken ? 'Back to Dashboard' : 'Go to Login'}
            </button>
            
            <button
              onClick={() => router.back()}
              className="w-full px-6 py-3 bg-transparent text-[#27C8A4] rounded-xl 
                border-2 border-[#27C8A4] transform hover:-translate-y-1 
                hover:shadow-lg hover:bg-[#27C8A4] hover:text-white
                transition-all duration-300 animate-fade-in animation-delay-600
                focus:outline-none focus:ring-2 focus:ring-[#27C8A4] focus:ring-opacity-50"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 