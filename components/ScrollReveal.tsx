'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'zoom-in';
  delay?: number;
  className?: string;
}

export default function ScrollReveal({ 
  children, 
  animation = 'fade-up', 
  delay = 0,
  className = '' 
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Optional: Unobserve after revealing to only animate once
          if (domRef.current) observer.unobserve(domRef.current);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => {
      if (domRef.current) observer.unobserve(domRef.current);
    };
  }, []);

  const baseClasses = "transition-all duration-1000 ease-out";
  
  const animationStyles = {
    'fade-up': isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16',
    'fade-left': isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16',
    'fade-right': isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16',
    'zoom-in': isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
  };

  return (
    <div 
      ref={domRef} 
      className={`${baseClasses} ${animationStyles[animation]} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
