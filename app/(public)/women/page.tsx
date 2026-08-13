import React from 'react';
import CategoryLayout from '@/components/CategoryLayout';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function WomenCategoryPage() {
  await connectDB();
  const category = await Category.findOne({ slug: 'women', status: 'active' });
  
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
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550639525-c97d455acf70?w=600&auto=format&fit=crop&q=80',
  ];

  return (
    <CategoryLayout
      title="WOMEN"
      tagline="Step into your main character era with pieces that turn everyday moments into unforgettable style statements."
      introImages={introImages}
      products={formattedProducts}
    />
  );
}
