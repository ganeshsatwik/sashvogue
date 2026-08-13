'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/contexts/AuthContext';
import { useUIStore } from '@/store/useUIStore';
import { Trash2, ShoppingBag } from 'lucide-react';

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addItemToCart = useCartStore((state) => state.addItem);
  const { mongoUser } = useAuth();
  const { openLoginModal } = useUIStore();

  const [mounted, setMounted] = useState(false);
  const [feedback, setFeedback] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMoveToCart = (item: any) => {
    if (!mongoUser) {
      openLoginModal();
      return;
    }
    addItemToCart({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    });
    removeItem(item.productId);
    setFeedback(`Moved "${item.name}" to shopping bag.`);
    setTimeout(() => setFeedback(''), 3000);
  };

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        Loading wishlist...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">
          My Wishlist
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Items you've saved for later.
        </p>
      </div>

      {feedback && (
        <div className="bg-gray-50 border border-gray-200 text-black p-3 text-xs font-semibold rounded">
          {feedback}
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 max-w-md mx-auto">
          {/* Black Banner above empty state */}
          {!mongoUser && (
            <div className="w-full bg-black text-white text-center py-2 text-xs font-bold mb-10">
              Login to Save Your Wishlist Forever
            </div>
          )}

          <div className="relative w-48 h-48 mb-6">
            {/* Empty Heart SVG */}
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-black">
              {/* Background Blob */}
              <path d="M45.5 108.5C36 86 63 68.5 86 69C111.5 69.5 151 71.5 163.5 87C176 102.5 163 125 147 131.5C131 138 98 147.5 73.5 142.5C49 137.5 55 131 45.5 108.5Z" fill="#fcf0f2"/>
              {/* Broken/Empty Heart */}
              <path d="M100 135C100 135 55 95 55 70C55 50 75 45 85 55C92 62 100 70 100 70C100 70 108 62 115 55C125 45 145 50 145 70C145 95 100 135 100 135Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="white"/>
              {/* Sparkles */}
              <path d="M135 40 L135 45" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M130 42.5 L140 42.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M60 120 L60 125" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M55 122.5 L65 122.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              {/* Tear drop / Broken effect */}
              <circle cx="115" cy="95" r="3" fill="currentColor"/>
              <circle cx="95" cy="115" r="2" fill="currentColor"/>
            </svg>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            Your Wishlist is Empty
          </h2>
          <p className="text-sm text-gray-500 mb-8 text-center px-4 leading-relaxed font-medium">
            Keep track of your favorite items here. Start browsing and save what you love!
          </p>

          <Link
            href="/"
            className="w-full max-w-xs bg-black text-white text-center py-4 rounded-xl font-bold hover:bg-gray-900 transition-colors"
          >
            Discover Fashion
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.productId} className="group flex flex-col border border-gray-200 rounded overflow-hidden bg-white">
              <div className="relative overflow-hidden aspect-[3/4] bg-gray-100">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
                  loading="lazy"
                />
                <button
                  onClick={() => removeItem(item.productId)}
                  className="absolute right-2 top-2 p-2 bg-white/80 hover:bg-white text-gray-600 hover:text-red-600 rounded border border-gray-200 shadow-sm transition-colors z-10 cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="p-4 flex flex-col flex-1 gap-3">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xs font-bold text-gray-900 truncate hover:text-black mt-2">
                    <Link href={`/product/${(item as any).slug || item.productId}`}>
                      {item.name}
                    </Link>
                  </h3>
                  <span className="text-sm font-bold text-gray-900">₹{item.price}</span>
                </div>

                <button
                  onClick={() => handleMoveToCart(item)}
                  className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-bold py-2 rounded text-[11px] uppercase tracking-wider cursor-pointer"
                >
                  <ShoppingBag size={14} />
                  Add to Bag
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
