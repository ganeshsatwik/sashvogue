'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

export default function SneakersCategoryPage() {
  const products = [
    { id: 's1', name: 'Minimalist Leather Sneakers', price: 3499, compareAtPrice: 4999, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&auto=format&fit=crop&q=60' },
    { id: 's2', name: 'Retro Canvas Low Tops', price: 1899, compareAtPrice: 2499, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&auto=format&fit=crop&q=60' },
    { id: 's3', name: 'Urban Knit Running Shoes', price: 2799, compareAtPrice: 3799, image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&auto=format&fit=crop&q=60' },
    { id: 's4', name: 'Classic Suede Trainer', price: 3299, compareAtPrice: 4299, image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&auto=format&fit=crop&q=60' },
  ];

  const productsWithSizes = products.map(p => ({
    ...p,
    sizes: (p as any).sizes || ['S', 'M', 'L', 'XL']
  }));

  const [sortBy, setSortBy] = useState('Featured');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const processedProducts = useMemo(() => {
    let result = [...productsWithSizes];

    if (selectedSizes.length > 0) {
      result = result.filter(p => selectedSizes.some(s => p.sizes.includes(s)));
    }

    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Newest Arrivals') {
      result.reverse();
    }
    return result;
  }, [productsWithSizes, sortBy, selectedSizes]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">

      {/* Category Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">Sneakers</h1>
        <p className="mt-2 text-sm text-gray-500">
          Clean footwear staples engineered for active city streets, offering durable outsoles and lightweight construction.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">

        {/* Filters */}
        <aside className="w-full md:w-60 shrink-0 space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider mb-3">Sort By</h3>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-black focus:outline-none">
              <option>Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest Arrivals</option>
            </select>
          </div>

          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider mb-3">Sizes (UK)</h3>
            <div className="flex flex-wrap gap-2">
              {['6', '7', '8', '9', '10', '11'].map((sz) => (
                <button key={sz} className="border border-gray-300 rounded px-3 py-1 text-xs font-semibold text-gray-700 hover:border-black hover:text-black">
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Catalog */}
        <div className="flex-1">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {processedProducts.map((prod) => (
              <div key={prod.id} className="group flex flex-col border border-gray-200 rounded overflow-hidden bg-white">
                <div className="relative overflow-hidden aspect-[3/4] bg-gray-100">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/product/${(prod as any).slug || prod.id}`} className="block text-center bg-white text-black text-xs font-bold py-2 rounded hover:bg-gray-100 uppercase tracking-wider">
                      View Details
                    </Link>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1 gap-1">
                  <h3 className="text-xs font-semibold text-gray-800 line-clamp-1 group-hover:text-black">
                    <Link href={`/product/${(prod as any).slug || prod.id}`}>
                      {prod.name}
                    </Link>
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm font-bold text-gray-900">₹{prod.price}</span>
                    {prod.compareAtPrice && (
                      <span className="text-xs text-gray-500 line-through">₹{prod.compareAtPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
