'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Star } from 'lucide-react';

function BestSellersContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const genderQuery = categoryParam ? `&gender=${categoryParam}` : '';
    fetch(`/api/products?tag=best-seller${genderQuery}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setProducts(d.products);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categoryParam]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Category Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">
          Best Sellers {categoryParam ? `— ${categoryParam.toUpperCase()}` : ''}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Our most loved and highly rated styles.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Catalog */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-100" />
                  <div className="pt-3 space-y-1.5">
                    <div className="h-2 bg-gray-100 w-1/4" />
                    <div className="h-3 bg-gray-100 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p>No best sellers found.</p>
              <Link href="/" className="mt-4 inline-block text-xs uppercase tracking-wider font-bold underline">Go Back Home</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((prod) => {
                const discount = prod.compareAtPrice && prod.compareAtPrice > prod.price
                  ? Math.round(((prod.compareAtPrice - prod.price) / prod.compareAtPrice) * 100)
                  : 0;

                return (
                  <Link key={prod._id} href={`/product/${prod.slug || prod._id}`} className="group block">
                    <div className="relative overflow-hidden aspect-[3/4] bg-gray-100">
                      <img
                        src={prod.images?.[0]}
                        alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                          -{discount}%
                        </span>
                      )}
                      {!discount && (
                        <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                          Best Seller
                        </span>
                      )}
                    </div>
                    <div className="pt-3 pb-2">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{prod.category?.name}</p>
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mt-0.5 line-clamp-1">{prod.name}</h3>
                      {prod.ratings > 0 && (
                        <div className="flex gap-0.5 mt-1">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={9} className={s <= Math.round(prod.ratings) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-sm font-bold text-gray-900">₹{prod.price.toLocaleString()}</span>
                        {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                          <span className="text-xs text-gray-400 line-through">₹{prod.compareAtPrice.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BestSellersPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-gray-500">
        Loading...
      </div>
    }>
      <BestSellersContent />
    </Suspense>
  );
}
