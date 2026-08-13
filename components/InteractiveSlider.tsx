'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useAuth } from '@/contexts/AuthContext';
import { useUIStore } from '@/store/useUIStore';
import { ShoppingBag, Heart } from 'lucide-react';

export default function InteractiveSlider({ products }: { products: any[] }) {
  const addItemToCart = useCartStore(state => state.addItem);
  const { addItem: addWishlist, removeItem: removeWishlist, items: wishlistItems } = useWishlistStore();
  const { mongoUser } = useAuth();
  const { openLoginModal } = useUIStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Auto center the middle item on mount and setup auto slide
  useEffect(() => {
    if (products.length > 0) {
      // Small timeout to allow DOM to render before animating
      setTimeout(() => setActiveIndex(Math.floor(products.length / 2)), 100);
    }
    
    // Auto slide every 3 seconds
    if (products.length > 1) {
      const timer = setInterval(() => {
        setActiveIndex(p => (p + 1) % products.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [products.length]);

  const toggleDetails = (id: string, index: number) => {
    if (activeIndex !== index) {
      setActiveIndex(index);
    } else {
      // If already active, toggle details on/off
      setExpandedId(prev => prev === id ? null : id);
    }
  };

  const handleNext = () => {
    setExpandedId(null);
    setActiveIndex(p => (p + 1) % products.length);
  };
  const handlePrev = () => {
    setExpandedId(null);
    setActiveIndex(p => (p - 1 + products.length) % products.length);
  };

  // Mouse drag implementation
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    startX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
  };

  const onDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = currentX - startX.current;
    
    if (diff > 50) {
      handlePrev();
      setIsDragging(false);
    } else if (diff < -50) {
      handleNext();
      setIsDragging(false);
    }
  };

  const onDragEnd = () => {
    setIsDragging(false);
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden py-4 pb-8 select-none touch-pan-y" 
         onMouseDown={onDragStart} onMouseMove={onDragMove} onMouseUp={onDragEnd} onMouseLeave={onDragEnd}
         onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}
    >
      {/* Container height set tightly around the images to eliminate extra spacing */}
      <div className="relative flex justify-center items-start h-[320px] sm:h-[380px] md:h-[440px]">
        {products.map((product, idx) => {
          let offset = idx - activeIndex;
          
          // Wrap around logic for infinite visual effect
          const halfLength = Math.floor(products.length / 2);
          if (offset > halfLength) {
            offset -= products.length;
          } else if (offset < -halfLength) {
            offset += products.length;
          }

          const absOffset = Math.abs(offset);
          const isActive = offset === 0;
          
          // Use smaller spacing on mobile
          const spacing = typeof window !== 'undefined' && window.innerWidth < 640 ? 140 : 220;
          let x = offset * spacing;
          let scale = isActive ? 1.05 : 1 - (absOffset * 0.15);
          let zIndex = 100 - absOffset;
          let opacity = absOffset > 2 ? 0 : 1 - (absOffset * 0.25);

          return (
            <div 
              key={product._id}
              className="absolute top-0 left-1/2 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col items-center"
              style={{
                transform: `translateX(calc(-50% + ${x}px)) scale(${scale})`,
                zIndex,
                opacity,
                pointerEvents: opacity > 0 ? 'auto' : 'none'
              }}
              onClick={() => {
                if (!isActive) setActiveIndex(idx);
              }}
            >
              <div className={`relative overflow-hidden rounded-2xl bg-gray-100 transition-all duration-500 cursor-pointer 
                ${isActive ? 'w-[220px] sm:w-[260px] md:w-[300px] shadow-2xl' : 'w-[180px] sm:w-[200px] md:w-[240px] shadow-md hover:shadow-lg'}`}
              >
                <img 
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=60'} 
                  alt={product.name} 
                  className="w-full aspect-[3/4] object-cover pointer-events-none" 
                  draggable={false}
                />

                {/* Quick Action Overlay (Right Side) */}
                <div className={`absolute right-3 top-3 flex flex-col gap-2 transition-all duration-300 z-50
                    ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12 pointer-events-none'}`}
                >
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!mongoUser) {
                        openLoginModal();
                        return;
                      }
                      const inWishlist = wishlistItems.some(i => i.productId === product._id);
                      if (inWishlist) {
                        removeWishlist(product._id);
                      } else {
                        addWishlist({ productId: product._id, name: product.name, price: product.price, image: product.images?.[0] });
                      }
                    }}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-700 hover:text-black hover:scale-110 transition-transform shadow-md cursor-pointer"
                    title="Wishlist"
                  >
                    <Heart size={16} className={wishlistItems.some(i => i.productId === product._id) ? 'fill-black text-black' : ''} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!mongoUser) {
                        openLoginModal();
                        return;
                      }
                      addItemToCart({ productId: product._id, name: product.name, price: product.price, quantity: 1, image: product.images?.[0] });
                    }}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-700 hover:text-black hover:scale-110 transition-transform shadow-md cursor-pointer"
                    title="Add to Cart"
                  >
                    <ShoppingBag size={16} />
                  </button>
                </div>

                {/* White Overlay Card like Screenshot 1 */}
                <div className={`absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-xl p-4 transition-all duration-500 ease-in-out z-50
                    ${isActive ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="max-w-[70%]">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{product.name}</h3>
                      <p className="text-[10px] font-bold text-gray-500 mt-1">From ₹{product.price}</p>
                    </div>
                    <Link href={`/product/${product.slug || product._id}`} className="bg-gray-50 hover:bg-gray-100 p-2 rounded-full border border-gray-200 transition-colors shrink-0 flex items-center justify-center">
                      <svg className="w-3 h-3 text-black transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </Link>
                  </div>

                  {/* Sizes Layout exactly like Screenshot */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    <span className="text-[9px] font-bold capitalize text-black">Size</span>
                    <div className="flex gap-1 ml-auto">
                      {['S', 'M', 'L', 'XL'].map((s, i) => (
                        <span key={s} className={`text-[8px] px-2 py-0.5 rounded font-bold ${i===0 ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>{s}</span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Colors Layout exactly like Screenshot */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] font-bold capitalize text-black">Color</span>
                    <div className="flex gap-2 ml-auto items-center h-4">
                      <span className="w-3 h-3 rounded-full bg-black shadow-inner"></span>
                      <span className="w-3 h-3 rounded-full bg-stone-300 shadow-inner"></span>
                      <span className="w-3 h-3 rounded-full bg-[#2a3c5a] shadow-inner"></span>
                      <span className="w-3 h-3 rounded-full bg-[#d6bcbc] shadow-inner"></span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Prev / Next controls */}
      <div className="flex justify-center gap-4 mt-8 relative z-50">
        <button onClick={handlePrev} className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer">
           <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={handleNext} className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer">
           <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

    </div>
  );
}
