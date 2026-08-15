'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const { mongoUser } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 1999 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shippingFee;

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        Loading shopping bag...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">
          Shopping Bag
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Review the items in your bag before checkout.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 max-w-md mx-auto">
          {/* Black Banner above empty state */}
          {!mongoUser && (
            <div className="w-full bg-black text-white text-center py-2 text-xs font-bold mb-10">
              Login to Unlock Exciting Discounts
            </div>
          )}

          <div className="relative w-48 h-48 mb-6">
            {/* Sad Cart SVG */}
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-black">
              {/* Background Blob */}
              <path d="M45.5 108.5C36 86 63 68.5 86 69C111.5 69.5 151 71.5 163.5 87C176 102.5 163 125 147 131.5C131 138 98 147.5 73.5 142.5C49 137.5 55 131 45.5 108.5Z" fill="#f3f4f6"/>
              {/* Cart Body */}
              <path d="M70 65L160 60L150 115C148 125 140 130 130 130H80C70 130 65 120 62 110L50 50L30 52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Wheels */}
              <circle cx="85" cy="145" r="8" stroke="currentColor" strokeWidth="3" fill="white"/>
              <circle cx="130" cy="145" r="8" stroke="currentColor" strokeWidth="3" fill="white"/>
              {/* Sad Face */}
              <circle cx="105" cy="95" r="2" fill="currentColor"/>
              <circle cx="125" cy="95" r="2" fill="currentColor"/>
              <path d="M105 110 Q115 105 125 110" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              {/* Details/Sparks */}
              <path d="M95 50 L95 55" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M85 52 L90 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M140 45 L145 45" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M70 145 L72 145" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M145 155 L147 155" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M150 80 L155 80" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            Oops! Your cart is empty!
          </h2>
          <p className="text-sm text-gray-500 mb-8 text-center px-4 leading-relaxed font-medium">
            There is nothing in your cart lets add some items.
          </p>

          <Link
            href="/"
            className="w-full max-w-xs bg-black text-white text-center py-4 rounded-xl font-bold hover:bg-gray-900 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId || 'default'}`}
                className="flex gap-4 p-4 border border-gray-200 rounded bg-white items-center"
              >
                <div className="w-20 aspect-[3/4] bg-gray-50 rounded overflow-hidden shrink-0 border border-gray-150">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-xs font-bold text-gray-900 truncate hover:text-black">
                    <Link href={`/product/${(item as any).slug || item.productId}`}>{item.name}</Link>
                  </h3>
                  {item.variant && (
                    <div className="flex gap-2 items-center mt-1">
                      {item.variant.size && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded">Size: {item.variant.size}</span>}
                      {item.variant.color && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded">Color: {item.variant.color}</span>}
                    </div>
                  )}
                  <p className="text-xs font-semibold text-gray-800">₹{item.price}</p>
                </div>

                {/* Adjuster */}
                <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                    className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold"
                  >
                    <Minus size={10} />
                  </button>
                  <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                    className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold"
                  >
                    <Plus size={10} />
                  </button>
                </div>

                <div className="text-right pl-4">
                  <p className="text-xs font-bold text-gray-900">₹{item.price * item.quantity}</p>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-gray-400 hover:text-red-600 mt-2 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="bg-gray-50 p-6 border border-gray-200 rounded h-fit space-y-6">
            <h2 className="text-sm font-bold text-gray-950 uppercase tracking-wider border-b border-gray-200 pb-2">
              Order Summary
            </h2>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-550">Subtotal</span>
                <span className="font-semibold text-gray-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-550">Shipping Fee</span>
                <span className="font-semibold text-gray-900">
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                </span>
              </div>
              {shippingFee > 0 && (
                <p className="text-[10px] text-gray-400">
                  Add ₹{1999 - subtotal} more for FREE shipping!
                </p>
              )}
              <div className="border-t border-gray-200 my-4 pt-4 flex justify-between text-sm font-bold text-gray-950">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded text-[10px] sm:text-xs uppercase tracking-wider transition-colors shadow-md hover:shadow-lg"
            >
              <span className="truncate">Proceed to Checkout</span>
              <ArrowRight size={14} className="shrink-0" />
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
