'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useAuth } from '@/contexts/AuthContext';
import { useUIStore } from '@/store/useUIStore';
import {
  Heart, ShoppingBag, Check, Star, Shield, RefreshCw, Truck,
  ChevronDown, ChevronUp, ArrowRight,
} from 'lucide-react';

interface Variant { size: string; color: string; sku: string; price?: number; stock: number; }

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: { _id: string; name: string; slug: string };
  stock: number;
  variants: Variant[];
  paymentMethods: string[];
  ratings: number;
  numReviews: number;
  slug?: string;
}

interface RelatedProduct {
  _id: string; slug?: string; name: string; price: number; compareAtPrice?: number;
  images: string[]; category: { name: string };
}

/* ── Related Product Card ── */
function RelatedCard({ p }: { p: RelatedProduct }) {
  return (
    <Link href={`/product/${p.slug || p._id}`}
      className="group flex flex-col bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300"
    >
      <div className="relative overflow-hidden aspect-[3/4] bg-gray-50">
        <img
          src={p.images?.[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=60'}
          alt={p.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">{p.category?.name}</p>
        <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 mt-0.5 leading-snug">{p.name}</h4>
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="text-sm font-black text-gray-900">₹{p.price.toLocaleString()}</span>
          {p.compareAtPrice && p.compareAtPrice > p.price && (
            <span className="text-xs text-gray-400 line-through">₹{p.compareAtPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ProductDetails({ product }: { product: Product }) {
  const addItemToCart = useCartStore(s => s.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, hasItem: isInWishlist } = useWishlistStore();
  const { mongoUser } = useAuth();
  const { openLoginModal } = useUIStore();

  const [activeImage, setActiveImage]   = useState(product.images?.[0] || '');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity]         = useState(1);
  const [message, setMessage]           = useState('');
  const [isWished, setIsWished]         = useState(isInWishlist(product._id));
  const [descOpen, setDescOpen]         = useState(true);
  const [detailsOpen, setDetailsOpen]   = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);

  const sizes  = Array.from(new Set(product.variants.map(v => v.size)));
  const colors = Array.from(new Set(product.variants.map(v => v.color)));

  const activeVariant = product.variants.find(v =>
    (!selectedSize || v.size === selectedSize) && (!selectedColor || v.color === selectedColor)
  );

  const displayPrice = activeVariant?.price || product.price;
  const discount = product.compareAtPrice && product.compareAtPrice > displayPrice
    ? Math.round(((product.compareAtPrice - displayPrice) / product.compareAtPrice) * 100) : 0;
  const isOutOfStock = product.variants.length > 0
    ? (activeVariant ? activeVariant.stock <= 0 : product.stock <= 0)
    : product.stock <= 0;

  // Fetch related products by category
  useEffect(() => {
    if (!product.category?._id) return;
    fetch(`/api/products?limit=6`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setRelatedProducts(d.products.filter((p2: any) => p2._id !== product._id).slice(0, 5));
        }
      })
      .catch(() => {});
  }, [product._id, product.category?._id]);

  const handleAddToCart = () => {
    if (!mongoUser) {
      openLoginModal();
      return;
    }
    setMessage('');
    if (sizes.length > 0 && !selectedSize) { setMessage('Please select a size.'); return; }
    if (colors.length > 0 && !selectedColor) { setMessage('Please select a color.'); return; }
    addItemToCart({
      productId: product._id,
      variantId: activeVariant?.sku,
      name: product.name, price: displayPrice, quantity,
      image: product.images?.[0],
      variant: activeVariant ? { size: activeVariant.size, color: activeVariant.color } : undefined,
      paymentMethods: product.paymentMethods,
    });
    setMessage('Added to bag!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleWishlist = () => {
    if (!mongoUser) {
      openLoginModal();
      return;
    }
    if (isWished) { removeFromWishlist(product._id); setIsWished(false); }
    else { addToWishlist({ productId: product._id, name: product.name, price: product.price, image: product.images?.[0] }); setIsWished(true); }
  };

  const TRUST = [
    { icon: <Truck size={15} />, label: 'Free Shipping\n₹999+' },
    { icon: <RefreshCw size={15} />, label: '15-Day\nReturns' },
    { icon: <Shield size={15} />, label: '100%\nAuthentic' },
  ];

  return (
    <div>
      {/* ── Product Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-14">

        {/* LEFT: Images */}
        <div className="flex gap-3">
          {/* Thumbnail strip */}
          {product.images?.length > 1 && (
            <div className="flex flex-col gap-2 w-16 sm:w-[72px] shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === img ? 'border-black shadow-md ring-1 ring-black' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main image — fixed max height to prevent giant image */}
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-gray-50" style={{ maxHeight: 520 }}>
            {discount > 0 && (
              <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                -{discount}% OFF
              </span>
            )}
            <img
              src={activeImage || product.images?.[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              style={{ maxHeight: 520 }}
            />
          </div>
        </div>

        {/* RIGHT: Info */}
        <div className="flex flex-col gap-5">

          {/* Category + Name */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              {product.category?.name}
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight uppercase tracking-tight">
              {product.name}
            </h1>
            {product.numReviews > 0 && (
              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={13} className={s <= Math.round(product.ratings) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-600">{product.ratings.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({product.numReviews} reviews)</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 border-t border-b border-gray-100 py-4">
            <span className="text-3xl font-black text-gray-900">₹{displayPrice.toLocaleString()}</span>
            {product.compareAtPrice && product.compareAtPrice > displayPrice && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.compareAtPrice.toLocaleString()}</span>
                <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
                  Save ₹{(product.compareAtPrice - displayPrice).toLocaleString()}
                </span>
              </>
            )}
          </div>

          {/* Color */}
          {colors.length > 0 && (
            <div>
              <div className="flex justify-between mb-2">
                <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Color</h3>
                {selectedColor && <span className="text-[11px] text-gray-500">{selectedColor}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)}
                    className={`px-4 py-2 border text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      selectedColor === c ? 'border-black bg-black text-white shadow-md' : 'border-gray-200 text-gray-700 hover:border-gray-400'
                    }`}
                  >{c}</button>
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          {sizes.length > 0 && (
            <div>
              <div className="flex justify-between mb-2">
                <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Size</h3>
                {selectedSize && <span className="text-[11px] text-gray-500">{selectedSize}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map(sz => (
                  <button key={sz} onClick={() => setSelectedSize(sz)}
                    className={`min-w-[46px] px-4 py-2 border text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      selectedSize === sz ? 'border-black bg-black text-white shadow-md' : 'border-gray-200 text-gray-700 hover:border-gray-400'
                    }`}
                  >{sz}</button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">Quantity</h3>
            <div className="flex items-center border border-gray-200 rounded-2xl w-32 overflow-hidden bg-gray-50">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2.5 hover:bg-gray-100 text-gray-700 font-bold text-base transition-colors">−</button>
              <span className="flex-1 text-center text-sm font-bold text-gray-900">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2.5 hover:bg-gray-100 text-gray-700 font-bold text-base transition-colors">+</button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-semibold ${
              message.includes('select') ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {!message.includes('select') && <Check size={14} />}
              {message}
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-2xl uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-black/10 cursor-pointer"
            >
              <ShoppingBag size={16} />
              {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
            </button>
            <button
              onClick={handleWishlist}
              className={`w-14 flex items-center justify-center border-2 rounded-2xl transition-all cursor-pointer ${
                isWished ? 'border-red-500 bg-red-500 text-white shadow-md shadow-red-200' : 'border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-500'
              }`}
            >
              <Heart size={20} fill={isWished ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2">
            {TRUST.map((b, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 bg-gray-50 rounded-2xl p-3 text-center">
                <span className="text-gray-500">{b.icon}</span>
                <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide leading-tight whitespace-pre">{b.label}</span>
              </div>
            ))}
          </div>

          {/* Accordion: Description */}
          <div className="border-t border-gray-100 pt-4">
            <button onClick={() => setDescOpen(!descOpen)} className="flex items-center justify-between w-full py-1 group">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-900">Description</span>
              {descOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>
            {descOpen && <p className="text-sm text-gray-500 leading-relaxed mt-3">{product.description}</p>}
          </div>

          {/* Accordion: Details */}
          <div className="border-t border-gray-100 pt-4">
            <button onClick={() => setDetailsOpen(!detailsOpen)} className="flex items-center justify-between w-full py-1 group">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-900">Product Details</span>
              {detailsOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>
            {detailsOpen && (
              <ul className="mt-3 space-y-1.5 text-sm text-gray-500">
                {sizes.length > 0  && <li><span className="font-semibold text-gray-700">Sizes: </span>{sizes.join(', ')}</li>}
                {colors.length > 0 && <li><span className="font-semibold text-gray-700">Colors: </span>{colors.join(', ')}</li>}
                <li><span className="font-semibold text-gray-700">Payment: </span>{product.paymentMethods?.join(' & ')}</li>
                <li><span className="font-semibold text-gray-700">Category: </span>{product.category?.name}</li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
          YOU MIGHT ALSO LIKE
      ══════════════════════════════ */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 sm:mt-24 border-t border-gray-100 pt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">You Might Also Like</h2>
            <Link href={`/${product.category?.slug || 'sale'}`}
              className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-widest transition-colors"
            >
              See More <ArrowRight size={11} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
            {relatedProducts.map(p => <RelatedCard key={p._id} p={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
