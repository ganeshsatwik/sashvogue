'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const PRELOAD_IMAGES: string[] = [];

export default function GlobalPreloader() {
  const [loading, setLoading] = useState(true);
  const [fading, setFading] = useState(false);
  const pathname = usePathname();
  
  // Track if we've already shown the preloader during this session
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check session storage so we don't show it on every internal navigation
    const sessionLoaded = sessionStorage.getItem('sash_preloaded');
    
    if (sessionLoaded || hasShown) {
      setLoading(false);
      return;
    }

    let loadedCount = 0;
    let isFinished = false;

    // Fallback timer: wait max 500ms
    const timeout = setTimeout(() => {
      finishLoading();
    }, 500);

    const finishLoading = () => {
      if (isFinished) return;
      isFinished = true;
      clearTimeout(timeout);
      setFading(true);
      sessionStorage.setItem('sash_preloaded', 'true');
      setHasShown(true);
      
      setTimeout(() => {
        setLoading(false);
      }, 500); // Match this with CSS transition duration
    };

    const handleImageLoad = () => {
      loadedCount++;
      if (loadedCount >= PRELOAD_IMAGES.length) {
        finishLoading();
      }
    };

    if (PRELOAD_IMAGES.length > 0) {
      PRELOAD_IMAGES.forEach(src => {
        const img = new window.Image();
        img.src = src;
        img.onload = handleImageLoad;
        img.onerror = handleImageLoad;
      });
    } else {
      finishLoading();
    }
    
    return () => clearTimeout(timeout);
  }, [hasShown]);

  if (!loading) return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
       <div className="flex flex-col items-center animate-in zoom-in-95 duration-1000">
         <img src="/logo_Sash.png" alt="Sash Logo" className="h-16 sm:h-24 md:h-32 w-auto object-contain mb-8" />
       </div>
       
       <div className="w-48 h-[2px] bg-gray-200 mt-2 overflow-hidden relative rounded-full">
         <div 
           className="absolute top-0 left-0 h-full bg-black rounded-full animate-loader-bar" 
           style={{ width: '30%' }}
         />
       </div>

       <style>{`
         @keyframes loader-bar {
           0% { transform: translateX(-100%); }
           100% { transform: translateX(330%); }
         }
         .animate-loader-bar {
           animation: loader-bar 1.5s ease-in-out infinite;
         }
       `}</style>
    </div>
  );
}
