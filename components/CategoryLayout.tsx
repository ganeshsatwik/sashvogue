'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useAuth } from '@/contexts/AuthContext';
import { useUIStore } from '@/store/useUIStore';
import { ShoppingBag, Heart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  slug?: string;
}

interface CategoryLayoutProps {
  title: string;
  tagline: string;
  introImages: string[];
  products: Product[];
}

export default function CategoryLayout({ title, tagline, introImages, products }: CategoryLayoutProps) {
  const addItemToCart = useCartStore(state => state.addItem);
  const { addItem: addWishlist, removeItem: removeWishlist, items: wishlistItems } = useWishlistStore();
  const { mongoUser } = useAuth();
  const { openLoginModal } = useUIStore();
  const [gridCols, setGridCols] = useState<1 | 2 | 3 | 4>(4);
  const [sortBy, setSortBy] = useState('Featured');
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const processedProducts = useMemo(() => {
    let result = [...products];

    // Apply Price Filter
    if (priceRange === 'Under ₹2000') {
      result = result.filter(p => p.price < 2000);
    } else if (priceRange === '₹2000 - ₹5000') {
      result = result.filter(p => p.price >= 2000 && p.price <= 5000);
    } else if (priceRange === 'Over ₹5000') {
      result = result.filter(p => p.price > 5000);
    }

    // Apply Sort
    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Newest Arrivals') {
      result.reverse();
    }
    return result;
  }, [products, sortBy, priceRange]);

  // Dynamic Theme Colors based on Title
  let bannerBg = "bg-[#111111]";
  let titleColor = "text-white";
  let taglineColor = "text-gray-200";
  let lineColor = "bg-white/30";

  const upperTitle = title.toUpperCase();
  if (upperTitle.includes('SALE')) {
    bannerBg = "bg-red-50";
    titleColor = "text-red-600";
    taglineColor = "text-red-800";
    lineColor = "bg-red-200";
  } else if (upperTitle.includes('WOMEN')) {
    bannerBg = "bg-pink-50";
    titleColor = "text-pink-600";
    taglineColor = "text-pink-800";
    lineColor = "bg-pink-200";
  } else if (upperTitle.includes('MEN')) {
    bannerBg = "bg-blue-50";
    titleColor = "text-blue-700";
    taglineColor = "text-blue-900";
    lineColor = "bg-blue-200";
  } else if (upperTitle.includes('ACCESSORIES')) {
    bannerBg = "bg-amber-50";
    titleColor = "text-amber-700";
    taglineColor = "text-amber-900";
    lineColor = "bg-amber-200";
  }

  return (
    <div className="bg-white min-h-screen text-black overflow-x-hidden">
      
      {/* 1. The Banner with Integrated Intro */}
      <section className={`w-full ${bannerBg} py-8 sm:py-16 relative flex flex-col items-center justify-center overflow-hidden min-h-[auto] sm:min-h-[200px] transition-colors duration-500`}>

        {/* Text Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl flex flex-col items-center w-full">
          <h1 
            className={`${titleColor} text-2xl sm:text-4xl md:text-5xl uppercase tracking-[0.2em] sm:tracking-[0.25em] font-black mb-3 sm:mb-4`}
            style={{ fontFamily: '"Didot", "Bodoni Moda", "Libre Bodoni", serif' }}
          >
            {title}
          </h1>
          <div className={`w-12 sm:w-16 h-[1px] ${lineColor} mb-3 sm:mb-4`}></div>
          <p 
            className={`text-xs sm:text-base md:text-lg ${taglineColor} leading-relaxed font-semibold px-2 sm:px-12 w-full break-words`}
            style={{ fontFamily: '"Didot", "Bodoni Moda", "Libre Bodoni", serif' }}
          >
            "{tagline}"
          </p>
        </div>
      </section>

      {/* 2. Product Catalog Area */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-8 sm:pt-16">
        
        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 border-y border-gray-200 mb-6 sm:mb-8 gap-4">
          
          {/* Desktop Filters Title */}
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-gray-900 hidden md:block">Filters</h2>
          
          {/* Mobile Controls: Filter, Sort, View */}
          <div className="flex items-center justify-between w-full sm:hidden">
            <button 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-900"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              Filter {priceRange && '(1)'}
            </button>
            
            <div className="flex items-center gap-1">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="bg-transparent text-xs font-bold border-none px-1 py-1 focus:ring-0 cursor-pointer text-gray-900 uppercase tracking-wider"
              >
                <option>Featured</option>
                <option value="Price: Low to High">Low to High</option>
                <option value="Price: High to Low">High to Low</option>
                <option value="Newest Arrivals">Newest</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={() => setGridCols(1)} className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${gridCols === 1 ? 'bg-[#111111] text-white' : 'bg-gray-100 text-gray-600'}`}>
                 <div className="flex gap-0.5"><div className="w-2.5 h-2.5 bg-current rounded-sm"></div></div>
              </button>
              <button onClick={() => setGridCols(2)} className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${gridCols === 2 ? 'bg-[#111111] text-white' : 'bg-gray-100 text-gray-600'}`}>
                 <div className="flex gap-[2px]"><div className="w-0.5 h-3 bg-current"></div><div className="w-0.5 h-3 bg-current"></div></div>
              </button>
            </div>
          </div>

          {/* Desktop Controls: Sort, View */}
          <div className="hidden sm:flex items-center justify-between w-full md:w-auto gap-8">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Sort:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="bg-transparent text-sm font-medium border-none p-0 focus:ring-0 cursor-pointer text-gray-800"
              >
                <option>Most relevant</option>
                <option>Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest Arrivals</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-widest mr-2">View</span>
              
              <button onClick={() => setGridCols(2)} className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${gridCols === 2 ? 'bg-[#111111] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                 <div className="flex gap-[3px]"><div className="w-0.5 h-3.5 bg-current"></div><div className="w-0.5 h-3.5 bg-current"></div></div>
              </button>

              <button onClick={() => setGridCols(3)} className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${gridCols === 3 ? 'bg-[#111111] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                 <div className="flex gap-[2px]"><div className="w-0.5 h-3.5 bg-current"></div><div className="w-0.5 h-3.5 bg-current"></div><div className="w-0.5 h-3.5 bg-current"></div></div>
              </button>

              <button onClick={() => setGridCols(4)} className={`w-8 h-8 items-center justify-center rounded transition-colors hidden lg:flex ${gridCols === 4 ? 'bg-[#111111] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                 <div className="flex gap-[2px]"><div className="w-0.5 h-3.5 bg-current"></div><div className="w-0.5 h-3.5 bg-current"></div><div className="w-0.5 h-3.5 bg-current"></div><div className="w-0.5 h-3.5 bg-current"></div></div>
              </button>
            </div>
          </div>

        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          
          {/* Sidebar */}
          <aside className={`w-full md:w-56 shrink-0 ${showMobileFilters ? 'block mb-4' : 'hidden md:block'}`}>
            
            <div className="bg-gray-50 md:bg-transparent p-4 md:p-0 rounded-lg md:rounded-none border border-gray-200 md:border-none">
              <div className="flex items-center justify-between border-b border-gray-200 md:border-gray-100 pb-2 mb-4">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Price Range</h3>
                {priceRange && (
                  <button onClick={() => setPriceRange(null)} className="text-[10px] text-gray-500 hover:text-black uppercase tracking-wider font-semibold">Clear</button>
                )}
              </div>
              <div className="space-y-3 flex flex-col sm:flex-row md:flex-col sm:gap-6 md:gap-0 sm:space-y-0 md:space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="price" checked={priceRange === 'Under ₹2000'} onChange={() => setPriceRange('Under ₹2000')} className="hidden" />
                  <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${priceRange === 'Under ₹2000' ? 'border-black bg-black' : 'border-gray-300 group-hover:border-black'}`}>
                    {priceRange === 'Under ₹2000' && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className={`text-sm ${priceRange === 'Under ₹2000' ? 'text-black font-semibold' : 'text-gray-600 group-hover:text-black'}`}>Under ₹2000</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="price" checked={priceRange === '₹2000 - ₹5000'} onChange={() => setPriceRange('₹2000 - ₹5000')} className="hidden" />
                  <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${priceRange === '₹2000 - ₹5000' ? 'border-black bg-black' : 'border-gray-300 group-hover:border-black'}`}>
                    {priceRange === '₹2000 - ₹5000' && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className={`text-sm ${priceRange === '₹2000 - ₹5000' ? 'text-black font-semibold' : 'text-gray-600 group-hover:text-black'}`}>₹2000 - ₹5000</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="price" checked={priceRange === 'Over ₹5000'} onChange={() => setPriceRange('Over ₹5000')} className="hidden" />
                  <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${priceRange === 'Over ₹5000' ? 'border-black bg-black' : 'border-gray-300 group-hover:border-black'}`}>
                    {priceRange === 'Over ₹5000' && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className={`text-sm ${priceRange === 'Over ₹5000' ? 'text-black font-semibold' : 'text-gray-600 group-hover:text-black'}`}>Over ₹5000</span>
                </label>
              </div>
            </div>

          </aside>

          {/* Grid Area */}
          <div className="flex-1">
            <div className={`grid gap-4 sm:gap-6 transition-all duration-500 ease-in-out ${gridCols === 1 ? 'grid-cols-1' : gridCols === 2 ? 'grid-cols-2' : gridCols === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
              
              {processedProducts.map((prod) => (
                <div key={prod.id} className="group flex flex-col relative overflow-hidden bg-white">
                  
                  {/* Image container */}
                  <div className="relative overflow-hidden bg-gray-100 mb-4 block group-hover:shadow-lg transition-shadow duration-300" style={{ aspectRatio: '3/4' }}>
                    <Link href={`/product/${prod.slug || prod.id}`} className="absolute inset-0 block">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>

                    {/* Quick Action Overlay (Right Side) */}
                    <div className="absolute right-3 top-3 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!mongoUser) {
                            openLoginModal();
                            return;
                          }
                          const inWishlist = wishlistItems.some(i => i.productId === prod.id);
                          if (inWishlist) {
                            removeWishlist(prod.id);
                          } else {
                            addWishlist({ productId: prod.id, name: prod.name, price: prod.price, image: prod.image });
                          }
                        }}
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-700 hover:text-black hover:scale-110 transition-transform shadow-md"
                        title="Wishlist"
                      >
                        <Heart size={16} className={wishlistItems.some(i => i.productId === prod.id) ? 'fill-black text-black' : ''} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!mongoUser) {
                            openLoginModal();
                            return;
                          }
                          addItemToCart({ productId: prod.id, name: prod.name, price: prod.price, quantity: 1, image: prod.image });
                        }}
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-700 hover:text-black hover:scale-110 transition-transform shadow-md"
                        title="Add to Cart"
                      >
                        <ShoppingBag size={16} />
                      </button>
                    </div>

                    {/* Hover overlay with button */}
                    <Link href={`/product/${prod.slug || prod.id}`} className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 pointer-events-none">
                       <div className="bg-white text-black text-[10px] font-bold uppercase tracking-widest px-8 py-3 rounded-full shadow-xl pointer-events-auto">
                         View Details
                       </div>
                    </Link>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col items-center text-center px-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-gray-600 transition-colors uppercase tracking-wide">
                      <Link href={`/product/${prod.slug || prod.id}`}>
                        {prod.name}
                      </Link>
                    </h3>
                    <div className="flex items-center justify-center gap-3 mt-2">
                      {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                        <span className="text-xs text-gray-400 line-through">₹{prod.compareAtPrice}</span>
                      )}
                      <span className="text-sm font-bold text-[#111111]">₹{prod.price}</span>
                    </div>
                  </div>

                </div>
              ))}
              
            </div>
          </div>
          
        </div>
      </section>

    </div>
  );
}
