'use client';

import React, { useState, useEffect } from 'react';

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Only run on mount
    const timer1 = setTimeout(() => {
      setFade(true); // Start fade out animation
    }, 2000); // 2 seconds of showing the splash screen

    const timer2 = setTimeout(() => {
      setShow(false); // Unmount after fade out is done
    }, 2800); // 800ms fade transition duration

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-all duration-700 ease-in-out ${fade ? 'opacity-0 -translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`}
    >
      <div className="flex flex-col items-center animate-in zoom-in-95 duration-1000">
        <img src="/logo_Sash.png" alt="Sash Logo" className="h-16 sm:h-24 md:h-32 w-auto object-contain mb-3" />
      </div>
    </div>
  );
}
