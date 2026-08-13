import React from 'react';
import CategoryLayout from '@/components/CategoryLayout';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AccessoriesCategoryPage() {
  await connectDB();
  const category = await Category.findOne({ slug: 'accessories', status: 'active' });
  
  if (!category) {
    notFound();
  }

  const products = await Product.find({
    category: category._id,
    status: 'published',
  });

  const formattedProducts = products.map(p => ({
    id: p._id.toString(),
    name: p.name,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    image: p.images?.[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
    slug: p.slug
  }));

  const introImages = [
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&auto=format&fit=crop&q=80',
  ];

  return (
    <CategoryLayout
      title="ACCESSORIES"
      tagline="Complete your look with thoughtfully curated accessories that bring together timeless elegance, everyday functionality, and effortless sophistication."
      introImages={introImages}
      products={formattedProducts}
    />
  );
}
