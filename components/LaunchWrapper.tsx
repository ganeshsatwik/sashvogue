"use client";

import React, { useState, useEffect } from "react";

export default function LaunchWrapper({ children }: { children: React.ReactNode }) {
  // Launch Date: August 14, 2026, 8:00 PM IST
  const launchDate = new Date("2026-08-14T20:00:00+05:30").getTime();
  
  const [isLaunched, setIsLaunched] = useState(false);
  const [isBypassed, setIsBypassed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setMounted(true);
    
    if (isBypassed) return;
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = launchDate - now;

      if (distance <= 0) {
        setIsLaunched(true);
      } else {
        setIsLaunched(false);
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    
    return () => clearInterval(intervalId);
  }, [launchDate, isBypassed]);

  if (!mounted) {
    // Return a minimal loading state to avoid hydration errors while ensuring layout structure
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isLaunched || isBypassed) {
    return <>{children}</>;
  }

  // Pre-launch UI
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-neutral-800 rounded-full blur-[120px] opacity-50"></div>
      
      <div className="z-10 flex flex-col items-center px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-light tracking-widest mb-6 font-serif">SASHVOGUE</h1>
        
        <p className="text-xl md:text-2xl font-light tracking-wide text-neutral-300 mb-12">
          Elegance is arriving soon.
        </p>

        <div className="flex items-center gap-4 md:gap-8 mb-16">
          <TimeUnit value={timeLeft.days} label="Days" />
          <span className="text-3xl md:text-5xl font-light text-neutral-600 mb-8">:</span>
          <TimeUnit value={timeLeft.hours} label="Hours" />
          <span className="text-3xl md:text-5xl font-light text-neutral-600 mb-8">:</span>
          <TimeUnit value={timeLeft.minutes} label="Minutes" />
          <span className="text-3xl md:text-5xl font-light text-neutral-600 mb-8">:</span>
          <TimeUnit value={timeLeft.seconds} label="Seconds" />
        </div>

        <div className="text-sm md:text-base tracking-widest text-neutral-400 uppercase">
          <p>Grand Launch</p>
          <p className="mt-2 text-white">August 14, 2026 • 8:00 PM IST</p>
        </div>
      </div>
      
      {/* Bypass button for admin/dev access */}
      <button 
        onClick={() => setIsBypassed(true)}
        className="absolute bottom-4 right-4 text-xs text-neutral-700 hover:text-white transition-colors opacity-50 hover:opacity-100 z-50"
      >
        Bypass
      </button>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center w-16 md:w-24">
      <div className="text-4xl md:text-6xl font-light mb-2">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-xs md:text-sm tracking-widest text-neutral-400 uppercase">
        {label}
      </div>
    </div>
  );
}
