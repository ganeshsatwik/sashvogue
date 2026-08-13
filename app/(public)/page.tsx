'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, Truck, Headphones, ShieldCheck } from 'lucide-react';
import InteractiveSlider from '@/components/InteractiveSlider';
import ScrollReveal from '@/components/ScrollReveal';

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  bgText: string;
  imageUrl: string;
  linkUrl: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  tags: string[];
  ratings: number;
  category: { name: string; slug: string };
  slug?: string;
}

const CATEGORY_FILTERS = [
  { key: 'men', label: 'MEN', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80' },
  { key: 'women', label: 'WOMEN', image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&auto=format&fit=crop&q=80' },
  { key: 'accessories', label: 'ACCESSORIES', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80' },
];

/* ─── Product Card ─── */
function ProductCard({ product }: { product: Product }) {
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  return (
    <Link href={`/product/${product.slug || product._id}`} className="group block">
      <div className="relative overflow-hidden aspect-[3/4] bg-gray-100">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=60'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-300" />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
            -{discount}%
          </span>
        )}
        {!discount && product.tags?.includes('trending') && (
          <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">New</span>
        )}
        {!discount && !product.tags?.includes('trending') && product.tags?.includes('best-seller') && (
          <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">Best Seller</span>
        )}
        <div className="absolute bottom-0 inset-x-0 bg-black text-white text-[10px] font-bold uppercase tracking-widest text-center py-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          Quick View
        </div>
      </div>
      <div className="pt-3 pb-2">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{product.category?.name}</p>
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mt-0.5 line-clamp-1">{product.name}</h3>
        {product.ratings > 0 && (
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={9} className={s <= Math.round(product.ratings) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">₹{product.compareAtPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-gray-100" />
      <div className="pt-3 space-y-1.5">
        <div className="h-2 bg-gray-100 w-1/4" />
        <div className="h-3 bg-gray-100 w-3/4" />
        <div className="h-3 bg-gray-100 w-1/3" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Products state
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingBest, setLoadingBest] = useState(true);

  // Fetch banners
  useEffect(() => {
    fetch('/api/banners')
      .then(r => r.json())
      .then(d => { if (d.success && d.banners?.length > 0) setBanners(d.banners); })
      .catch(() => { });
  }, []);

  // Slider
  const goTo = useCallback((idx: number | ((p: number) => number)) => {
    setFadingOut(true);
    setTimeout(() => { setActiveSlide(idx as any); setFadingOut(false); }, 350);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => goTo((p) => (p + 1) % banners.length), 5000);
  }, [banners.length, goTo]);

  useEffect(() => {
    if (banners.length <= 1) return;
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [banners.length, resetTimer]);

  const prev = () => { resetTimer(); goTo(p => (p - 1 + banners.length) % banners.length); };
  const next = () => { resetTimer(); goTo(p => (p + 1) % banners.length); };

  // Fetch products
  useEffect(() => {
    setLoadingTrending(true);
    setLoadingBest(true);

    fetch(`/api/products?tag=trending&limit=4`)
      .then(r => r.json())
      .then(d => { if (d.success) setTrendingProducts(d.products); })
      .catch(() => { })
      .finally(() => setLoadingTrending(false));

    fetch(`/api/products?tag=best-seller&limit=10`)
      .then(r => r.json())
      .then(d => { if (d.success) setBestSellerProducts(d.products); })
      .catch(() => { })
      .finally(() => setLoadingBest(false));
  }, []);

  const banner = banners.length > 0 ? banners[activeSlide] : null;

  return (
    <div className="bg-background">

      {/* ═══════════════════════════════
          SLIDER HERO BANNER
      ═══════════════════════════════ */}
      {banner ? (
        <section className="relative w-full overflow-hidden bg-[#F6E6D7]" style={{ height: '80svh', minHeight: 600 }}>

        {/* Massive Background Text Centered */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden px-4">
          <h1 className={`text-[20vw] md:text-[15vw] leading-none font-black tracking-tighter text-white uppercase select-none text-center transition-opacity duration-500 ${fadingOut ? 'opacity-0' : 'opacity-100'}`}>
            {banner.bgText}
          </h1>
        </div>

        {/* Center Model Image with Fade Effect */}
        <div className={`absolute bottom-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 h-[75%] md:h-[95%] z-10 pointer-events-none transition-opacity duration-500 ${fadingOut ? 'opacity-0' : 'opacity-100'}`}>
          <img
            key={banner._id}
            src={banner.imageUrl}
            alt="Model"
            className="h-full w-auto max-w-none object-contain object-bottom"
          />
        </div>

        {/* Foreground Content on the Left with Fade Effect */}
        <div className="absolute inset-0 flex flex-col items-start justify-start pt-8 md:pt-0 md:justify-center pl-5 sm:pl-10 md:pl-20 z-20 pointer-events-none text-left">
          <div className={`pointer-events-auto w-[55%] sm:w-auto sm:max-w-xs md:max-w-sm transition-all duration-500 ${fadingOut ? 'opacity-0 -translate-x-4' : 'opacity-100 translate-x-0'}`}>
            <p className="text-[10px] md:text-[12px] font-bold uppercase tracking-[0.4em] text-gray-700 mb-2 md:mb-3 bg-white/40 md:bg-transparent px-2 py-0.5 rounded md:rounded-none inline-block md:block">New Collection</p>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none uppercase mb-3 md:mb-4 drop-shadow-sm break-words">
              {banner.title}
            </h2>
            {banner.subtitle && (
              <p className="text-xs sm:text-sm text-gray-800 md:text-gray-700 font-bold md:font-medium mb-6 md:mb-8 bg-white/40 md:bg-transparent px-3 py-1 md:p-0 rounded md:rounded-none inline-block md:block">
                {banner.subtitle}
              </p>
            )}
            <div className="w-full">
              <Link href={banner.linkUrl} className="inline-block bg-black text-white font-bold text-xs px-5 py-2.5 md:px-8 md:py-3.5 uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors shadow-xl md:shadow-none">
                SHOP NOW
              </Link>
            </div>
          </div>
        </div>

        {/* Arrows and Dots */}
        {banners.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/10 hover:bg-white/30 flex items-center justify-center text-white transition-colors rounded-full backdrop-blur-sm pointer-events-auto">
              <ChevronLeft size={20} />
            </button>
            <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/10 hover:bg-white/30 flex items-center justify-center text-white transition-colors rounded-full backdrop-blur-sm pointer-events-auto">
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-30 flex gap-2 pointer-events-auto">
              {banners.map((_, i) => (
                <button key={i} onClick={() => { resetTimer(); goTo(i); }}
                  className={`transition-all duration-300 rounded-full ${i === activeSlide ? 'bg-white w-6 h-1.5' : 'bg-white/40 w-2 h-1.5 hover:bg-white/70'}`}
                />
              ))}
            </div>
            </>
          )}
        </section>
      ) : (
        <section className="relative w-full flex items-center justify-center bg-gray-50 border-b border-gray-200" style={{ height: '40svh' }}>
          <div className="text-center">
            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-400">Welcome to SASH</h2>
            <p className="text-xs text-gray-500 mt-2">Exciting new collections dropping soon.</p>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════
          FEATURE BAR
      ═══════════════════════════════ */}
      <section className="w-full border-b border-gray-200 bg-background">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-gray-200 py-4 sm:py-6">
            <div className="flex flex-col items-center justify-center gap-1 sm:gap-3 px-2 sm:px-4">
              <Truck className="text-black w-5 h-5 md:w-6 md:h-6" />
              <span className="text-[8px] sm:text-[10px] md:text-xs font-semibold text-black uppercase tracking-tight text-center">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 sm:gap-3 px-2 sm:px-4">
              <Headphones className="text-black w-5 h-5 md:w-6 md:h-6" />
              <span className="text-[8px] sm:text-[10px] md:text-xs font-semibold text-black uppercase tracking-tight text-center">Online Support 24/7</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 sm:gap-3 px-2 sm:px-4">
              <ShieldCheck className="text-black w-5 h-5 md:w-6 md:h-6" />
              <span className="text-[8px] sm:text-[10px] md:text-xs font-semibold text-black uppercase tracking-tight text-center">Secure Payment</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          SHOP BY CATEGORY — Filter Cards
      ═══════════════════════════════ */}
      <ScrollReveal animation="fade-up">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
          <div className="flex flex-col items-center justify-center pb-3 mb-8">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-gray-900 text-center">Shop by Category</h2>
          </div>

          {/* 3 filter cards: Men / Women / Accessories */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {CATEGORY_FILTERS.map(cat => {
              return (
                <Link
                  key={cat.key}
                  href={`/${cat.key}`}
                  className="group block text-left focus:outline-none"
                >
                  <div className="relative overflow-hidden aspect-[4/5] transition-all duration-200">
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 transition-colors duration-200 bg-black/25 group-hover:bg-black/40" />

                    {/* Label */}
                    <div className="absolute inset-0 flex flex-col items-start justify-end p-3 sm:p-4">
                      <p className="font-black text-sm sm:text-base uppercase tracking-tight text-white">
                        {cat.label}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </ScrollReveal>

      {/* ═══════════════════════════════
          NEW COLLECTIONS SECTION
      ═══════════════════════════════ */}
      <section className="hidden sm:flex mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6 cursor-pointer justify-center">
        <Link href="/new-collection" className="flex flex-col items-center justify-center relative hover:opacity-75 transition-opacity">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-gray-900 text-center">
            NEW Collections
          </h2>
        </Link>
      </section>

      <ScrollReveal animation="fade-right">
        <section className="relative w-full bg-[#f4f4f4] pt-12 sm:pt-16 pb-16 overflow-hidden mb-12 sm:mb-14">

          {/* Background Beige Decor */}
          <div className="absolute top-0 left-0 w-[5%] sm:w-[15%] h-[60%] sm:h-[100%] bg-gradient-to-r from-[#cfc5b6] to-transparent z-0 opacity-40"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">

              {/* Mobile only layout based on user design */}
              <div className="flex sm:hidden flex-col w-full -mt-6 mb-8 relative z-20">
                {/* Header part */}
                <div className="flex flex-col items-center justify-center mb-6 text-center px-4">
                  <span className="text-[9px] text-[#b89b5e] font-semibold tracking-[0.3em] uppercase mb-2">
                    LATEST ARRIVALS
                  </span>
                  <h2 className="text-2xl font-black tracking-widest text-gray-900 uppercase mb-3">
                    NEW COLLECTIONS
                  </h2>
                  <div className="w-12 h-px bg-[#b89b5e]"></div>
                </div>
                
                {/* Content part (Side-by-side) */}
                <div className="flex flex-row items-center gap-4 px-4">
                  {/* Image */}
                  <Link href="/new-collection" className="w-1/2 aspect-[4/5] relative overflow-hidden group block">
                    <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600" alt="Summer Edit" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </Link>
                  
                  {/* Text Content */}
                  <div className="w-1/2 flex flex-col items-start justify-center py-2">
                    <span className="text-[9px] text-[#b89b5e] font-semibold tracking-[0.2em] uppercase mb-1.5">
                      NEW IN
                    </span>
                    <h3 className="text-xl font-black tracking-widest text-gray-900 uppercase mb-2 leading-tight">
                      SUMMER EDIT
                    </h3>
                    <p className="text-[10px] text-gray-600 mb-4 leading-relaxed pr-2">
                      Discover the latest styles<br />curated for the season.
                    </p>
                    <Link href="/new-collection" className="inline-flex items-center gap-2 bg-[#171717] text-white text-[8px] font-bold px-4 py-2.5 uppercase tracking-[0.2em] hover:bg-black transition-colors">
                      SHOP NOW <span className="text-[10px] font-light">→</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Left Overlapping Images - hidden on mobile, shown on sm+ */}
              <div className="hidden sm:block relative w-full lg:w-1/2 flex-shrink-0">

                {/* Circular text badge */}
                <div className="absolute top-0 left-0 sm:-left-4 w-28 h-28 sm:w-32 sm:h-32 z-30 animate-spin" style={{ animationDuration: '12s' }}>
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
                    <text className="text-[10px] font-bold tracking-[0.2em] uppercase" fill="black">
                      <textPath href="#circlePath" startOffset="0%">
                        •NEW SEASON •NEW ARRIVALS
                      </textPath>
                    </text>
                  </svg>
                </div>

                {/* Back Image */}
                <div className="relative w-[60%] sm:w-[50%] aspect-[3/4] ml-auto">
                  <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600" alt="Collection 1" className="w-full h-full object-cover" />
                </div>

                {/* Front Image */}
                <div className="absolute bottom-[-10%] left-4 sm:left-12 w-[55%] sm:w-[50%] aspect-[4/5] shadow-2xl z-20">
                  <img src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=600" alt="Collection 2" className="w-full h-full object-cover" />
                </div>

              </div>

              {/* Right Content - Hidden on mobile because it's replaced by the grid above */}
              <div className="hidden sm:flex w-full lg:w-1/2 flex-col sm:flex-row items-start sm:items-center mt-2 sm:mt-20 lg:mt-0 relative">

                {/* Vertical Divider & Text */}
                <div className="hidden sm:flex flex-col items-center justify-center mr-10 relative h-[18rem]">
                  <div className="absolute w-px h-[120%] bg-gray-300 left-[-20px] top-[-10%]"></div>
                  <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-black" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                    ELEVATE YOUR FASHION GAME
                  </p>
                </div>

                <div className="max-w-md w-full flex flex-col items-center sm:items-start text-center sm:text-left">
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif text-gray-900 mb-3 sm:mb-6">New Season Collection</h2>
                  <p className="hidden sm:block text-sm text-gray-600 font-medium leading-relaxed mb-8">
                    Refresh your wardrobe with our newest collection, where contemporary trends meet timeless elegance in pieces you'll reach for season after season.
                  </p>
                  <Link href="/new-collection" className="inline-block bg-[#1a1a1a] text-white text-[10px] sm:text-xs font-bold px-8 py-3.5 uppercase tracking-widest hover:bg-black transition-colors mt-1 sm:mt-0">
                    SHOP NOW
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </section>
      </ScrollReveal>

      {/* ═══════════════════════════════
          BEST SELLERS
      ═══════════════════════════════ */}
      <ScrollReveal animation="fade-up">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
          <div className="flex flex-col items-center justify-center pb-2 mb-4 relative">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-gray-900 text-center mb-2 sm:mb-0">
              Best Sellers
            </h2>
            <Link href="/best-sellers"
              className="sm:absolute sm:right-0 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
            >
              View All →
            </Link>
          </div>

          {loadingBest ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : bestSellerProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm font-semibold">No best sellers found</p>
            </div>
          ) : (
            <InteractiveSlider products={bestSellerProducts} />
          )}
        </section>
      </ScrollReveal>

      {/* ═══════════════════════════════
          BOTTOM PROMO
      ═══════════════════════════════ */}
      <ScrollReveal animation="fade-up">
        <section className="relative w-full bg-[#463f3a] overflow-hidden mb-20 sm:mb-28 py-6 sm:py-8 text-center">

          {/* Left Model */}
          <div className="hidden md:block absolute left-0 bottom-0 h-[90%] sm:h-[110%] opacity-90 pointer-events-none transform -translate-x-[5%] sm:translate-x-10 z-0">
            <img src="https://freepngimg.com/thumb/fashion/3-2-fashion-model-transparent.png" alt="Women Model" className="h-full w-auto object-contain object-bottom" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          </div>

          {/* Right Model */}
          <div className="hidden md:block absolute right-0 bottom-0 h-[90%] sm:h-[110%] opacity-90 pointer-events-none transform translate-x-[5%] sm:-translate-x-10 z-0">
            <img src="https://www.pngall.com/wp-content/uploads/5/Model-Man-PNG.png" alt="Men Model" className="h-full w-auto object-contain object-bottom" onError={(e) => { e.currentTarget.src = '/bannerimg3.png' }} />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto px-4 flex flex-col items-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/60 mb-2">Limited Offer</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-white mb-4 leading-tight drop-shadow-md">
              Free Shipping on Orders ₹999+
            </h2>

            {/* Styled Code Display matching Timer look */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4">
              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white">SASHFREE</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/50 mt-1">USE CODE</span>
              </div>
            </div>

            <p className="text-white/60 text-[10px] mb-8 tracking-[0.2em] uppercase">
              apply at checkout
            </p>

            <Link href="/sale"
              className="inline-block bg-[#1a1a1a] text-white font-bold text-xs px-10 py-3.5 uppercase tracking-[0.2em] hover:bg-black transition-colors"
            >
              SHOP NOW
            </Link>
          </div>
        </section>
      </ScrollReveal>

      {/* ═══════════════════════════════
          ABOUT US
      ═══════════════════════════════ */}
      <ScrollReveal animation="fade-right">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 sm:pb-14">
          
          {/* Desktop/Tablet Layout */}
          <div className="hidden md:grid grid-cols-2 gap-8 items-center bg-gray-50">
            <div className="relative w-full overflow-hidden h-[500px]">
              <img
                src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=800"
                alt="Fashion Model"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col items-start space-y-6 px-12 py-8">
              <h2 className="text-3xl md:text-4xl uppercase tracking-widest text-gray-900"><span className="font-normal">KNOW</span> <span className="font-black">SASHVOGUE</span></h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Fueled by a deep-rooted passion, SashVOGUE's journey reflects our fearless ambition to redefine modern menswear and womenswear on a global scale. We bring quality, utility, and timeless garments directly to you.
              </p>
              <div className="flex gap-4 pt-4 w-full">
                <a href="https://www.instagram.com/sashvogue.in" target="_blank" rel="noreferrer"
                  className="flex-1 flex items-center justify-center border border-black text-black font-bold text-xs px-8 py-3.5 uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors text-center"
                >
                  Follow Us
                </a>
                <Link href="/about-us"
                  className="flex-1 flex items-center justify-center bg-black text-white font-bold text-xs px-8 py-3.5 uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors text-center"
                >
                  Our Story
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Overlay Layout */}
          <div className="block md:hidden relative w-full aspect-[4/5] overflow-hidden group shadow-md">
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=800"
              alt="Fashion Model"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            {/* Dark Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            <div className="absolute bottom-0 inset-x-0 flex flex-col items-center justify-end p-6 text-center">
              <h2 className="text-2xl uppercase tracking-widest text-white mb-3">
                <span className="font-light">KNOW</span> <span className="font-black">SASHVOGUE</span>
              </h2>
              <p className="text-gray-200 text-[11px] leading-relaxed mb-6 max-w-[95%] mx-auto">
                Fueled by a deep-rooted passion, SashVOGUE's journey reflects our fearless ambition to redefine modern menswear and womenswear on a global scale.
              </p>
              <div className="flex gap-3 w-full">
                <a href="https://www.instagram.com/sashvogue.in" target="_blank" rel="noreferrer"
                  className="flex-1 flex items-center justify-center border border-white/50 text-white font-bold text-[10px] px-2 py-3.5 uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors text-center"
                >
                  Follow Us
                </a>
                <Link href="/about-us"
                  className="flex-1 flex items-center justify-center bg-white text-black font-bold text-[10px] px-2 py-3.5 uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors text-center"
                >
                  Our Story
                </Link>
              </div>
            </div>
          </div>

        </section>
      </ScrollReveal>

    </div>
  );
}
