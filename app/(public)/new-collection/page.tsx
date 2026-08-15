'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';

// Helper component for the Bento Grid Product Cards
const ProductCard = ({ 
  img, 
  title, 
  price, 
  colors, 
  rating, 
  href = "/sale",
  aspectClass = "aspect-[4/5]" 
}: { 
  img: string, title: string, price: string, colors: string, rating: string, href?: string, aspectClass?: string 
}) => {
  return (
    <Link href={href} className={`block relative w-full ${aspectClass} bg-[#f4f0ec] rounded-[2rem] overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500`}>
      {/* Product Image */}
      <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      
      {/* Vertical Colors Badge */}
      <div className="absolute top-6 left-4 bg-white/80 backdrop-blur-sm rounded-full py-3 px-1.5 flex flex-col items-center justify-center shadow-sm">
        <span className="text-[9px] font-black tracking-widest uppercase text-gray-800" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          {colors}
        </span>
      </div>

      {/* Floating Info Box */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg min-w-[140px] flex flex-col items-center transform translate-y-2 opacity-90 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold mb-1">
          <span className="text-yellow-500 text-xs">★</span> {rating}
        </div>
        <p className="text-xl font-black text-gray-900 tracking-tighter mb-2">₹{price}</p>
        <div className="w-full border border-black/20 text-black text-[9px] font-bold uppercase tracking-widest py-2 rounded-full text-center hover:bg-black hover:text-white transition-colors">
          Shop Now
        </div>
      </div>

      {/* Decorative Star (subtle) */}
      <div className="absolute top-4 right-4 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        </svg>
      </div>
    </Link>
  );
};

export default function NewCollectionPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = React.useState<any[]>([]);

  useEffect(() => {
    // Fetch newly added products
    fetch('/api/products?limit=12')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.products) {
          setProducts(data.products);
        }
      })
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let animationFrameId: number;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    // Auto scroll logic
    const scroll = () => {
      if (!isDown) {
        el.scrollLeft += 1.5;
        // loop back to start smoothly (assumes content is duplicated enough)
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };
    animationFrameId = requestAnimationFrame(scroll);

    // Mouse drag logic
    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };
    const handleMouseLeave = () => { isDown = false; };
    const handleMouseUp = () => { isDown = false; };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 2;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      el.removeEventListener('mousedown', handleMouseDown);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const col1 = products.filter((_, i) => i % 3 === 0);
  const col2 = products.filter((_, i) => i % 3 === 1);
  const col3 = products.filter((_, i) => i % 3 === 2);

  return (
    <div className="bg-[#fcfbf9] min-h-screen text-foreground pb-24">

      {/* ═══════════════════════════════
          SCROLLING BANNER SECTION
      ═══════════════════════════════ */}
      <section className="relative w-full h-[80vh] min-h-[600px] overflow-hidden bg-background flex items-center border-b border-black/5">
        
        {/* Centered Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none px-4">
          <div className="bg-background/80 backdrop-blur-md p-8 sm:p-12 rounded-3xl flex flex-col items-center shadow-2xl border border-white/20">
            <h2 className="flex flex-col items-center leading-none text-center">
              <span className="text-[12vw] sm:text-[8vw] font-black uppercase tracking-tighter text-[#111] leading-none" style={{ transform: 'scaleX(1.05)' }}>
                NEW SEASON
              </span>
              <span className="text-[9vw] sm:text-[6vw] font-medium uppercase tracking-tight text-[#333] leading-none mt-2" style={{ fontFamily: '"Didot", "Libre Bodoni", "Bodoni Moda", serif' }}>
                NEW COLLECTIONS
              </span>
            </h2>
            
            {/* Tagline */}
            <div className="mt-6 sm:mt-10 max-w-2xl text-center">
              <p className="text-[10px] sm:text-xs font-bold text-gray-900 leading-[1.8] tracking-widest font-mono uppercase">
                DISCOVER THE FRESH STYLES IN OUR SASH VOGUE COLLECTIONS —SHOP NOW AND ELEVATE YOUR WARDROBE!
              </p>
            </div>
          </div>
        </div>

        {/* Auto-scrolling Draggable Images */}
        <div 
          ref={scrollRef}
          className="relative w-full h-full overflow-hidden flex items-center cursor-grab active:cursor-grabbing z-0 select-none"
        >
          <div className="flex gap-8 sm:gap-16 min-w-max items-center px-10 pointer-events-auto">
            {/* Duplicate the image list 4 times to allow seamless scrolling */}
            {[...Array(4)].map((_, index) => (
              <React.Fragment key={index}>
                {/* Item 1 */}
                <div className="w-[180px] sm:w-[240px] aspect-[5/4] bg-gray-100 mb-48 overflow-hidden flex-shrink-0 transition-transform duration-700 hover:scale-105">
                  <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600" alt="Style 1" className="w-full h-full object-cover pointer-events-none" />
                </div>

                {/* Item 2 */}
                <div className="w-[160px] sm:w-[220px] aspect-[2/3] bg-gray-100 mt-32 overflow-hidden shadow-lg flex-shrink-0 transition-transform duration-700 hover:scale-105">
                  <img src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600" alt="Style 2" className="w-full h-full object-cover pointer-events-none" />
                </div>

                {/* Item 3 */}
                <div className="w-[220px] sm:w-[320px] aspect-square bg-[#e6a9a9] p-4 sm:p-6 mb-20 overflow-hidden shadow-2xl flex-shrink-0 transition-transform duration-700 hover:scale-105">
                  <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600" alt="Style 3" className="w-full h-full object-cover pointer-events-none" />
                </div>

                {/* Item 4 */}
                <div className="w-[160px] sm:w-[200px] aspect-[4/5] bg-gray-100 mt-40 overflow-hidden flex-shrink-0 transition-transform duration-700 hover:scale-105">
                  <img src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=600" alt="Style 4" className="w-full h-full object-cover pointer-events-none" />
                </div>

                {/* Item 5 */}
                <div className="w-[150px] sm:w-[200px] aspect-[3/4] bg-[#9ba99d] p-4 sm:p-5 mb-32 overflow-hidden shadow-md flex-shrink-0 transition-transform duration-700 hover:scale-105">
                  <img src="https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=600" alt="Style 5" className="w-full h-full object-cover pointer-events-none" />
                </div>

                {/* Item 6 */}
                <div className="w-[200px] sm:w-[280px] aspect-square bg-[#764b4b] p-6 sm:p-8 mt-20 overflow-hidden shadow-2xl flex-shrink-0 transition-transform duration-700 hover:scale-105">
                  <img src="https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=600" alt="Style 6" className="w-full h-full object-cover pointer-events-none" />
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>
      
      {/* ═══════════════════════════════
          HERO SECTION (Arched Design)
      ═══════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col md:flex-row items-center gap-12 md:gap-20 border-b border-black/5 mb-16">
        
        {/* Left: Arched Image */}
        <div className="w-full md:w-1/2 flex justify-center relative">
          {/* Decorative Large Star */}
          <div className="absolute -top-6 right-8 md:right-16 text-[#c4a4a4] z-10 animate-pulse" style={{ animationDuration: '4s' }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L14.5 9.5L23 12L14.5 14.5L12 23L9.5 14.5L1 12L9.5 9.5L12 1Z" />
            </svg>
          </div>
          
          <div className="relative w-64 sm:w-72 md:w-80 h-[380px] sm:h-[450px] md:h-[500px] overflow-hidden rounded-t-[10rem] border-8 border-white shadow-2xl bg-gray-100">
            <img 
              src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=800" 
              className="w-full h-full object-cover" 
              alt="Summer Collection Model" 
            />
          </div>
        </div>
        
        {/* Right: Text and Action */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-[#111] mb-8 leading-[1.1]" style={{ fontFamily: '"Didot", "Libre Bodoni", "Bodoni Moda", serif' }}>
            Fill your wardrobe with new collection available for men and women.
          </h1>
          
          <button 
            onClick={() => {
              document.getElementById('collection-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-4 bg-[#2a2f3a] text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black hover:scale-105 transition-all duration-300 shadow-xl"
          >
            <span>View All Collection</span>
            <span className="text-lg">↓</span>
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════
          BENTO GRID SECTION
      ═══════════════════════════════ */}
      <section id="collection-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-24">
        
        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest">
            Loading New Collections...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Column 1 */}
            <div className="flex flex-col gap-6 sm:gap-8">
              {col1.map((p, i) => (
                <ProductCard 
                  key={p._id}
                  img={p.images?.[0] || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600'} 
                  title={p.name} 
                  price={p.price} 
                  colors={p.sizes ? `${p.sizes.length} SIZES` : 'NEW'} 
                  rating={p.rating ? p.rating.toString() : '5.0'} 
                  href={`/product/${p.slug || p._id}`}
                  aspectClass={i % 2 === 0 ? "aspect-[4/3] md:aspect-square" : "aspect-[4/3] md:aspect-[4/5]"} 
                />
              ))}
            </div>
            
            {/* Column 2 */}
            <div className="flex flex-col gap-6 sm:gap-8 md:pt-12">
              {col2.map((p, i) => (
                <ProductCard 
                  key={p._id}
                  img={p.images?.[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600'} 
                  title={p.name} 
                  price={p.price} 
                  colors={p.sizes ? `${p.sizes.length} SIZES` : 'NEW'} 
                  rating={p.rating ? p.rating.toString() : '5.0'} 
                  href={`/product/${p.slug || p._id}`}
                  aspectClass={i % 2 === 0 ? "aspect-[4/3] md:aspect-[3/4]" : "aspect-[4/3] md:aspect-square"} 
                />
              ))}
            </div>
            
            {/* Column 3 (Tall) */}
            <div className="flex flex-col gap-6 sm:gap-8 md:pt-24">
              {col3.map((p, i) => (
                <ProductCard 
                  key={p._id}
                  img={p.images?.[0] || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600'} 
                  title={p.name} 
                  price={p.price} 
                  colors={p.sizes ? `${p.sizes.length} SIZES` : 'NEW'} 
                  rating={p.rating ? p.rating.toString() : '5.0'} 
                  href={`/product/${p.slug || p._id}`}
                  aspectClass={i === 0 ? "aspect-[3/4] md:h-full md:aspect-auto" : "aspect-[4/3] md:aspect-square"} 
                />
              ))}
            </div>

          </div>
        )}
      </section>

    </div>
  );
}