import React from 'react';
import CategoryLayout from '@/components/CategoryLayout';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MenCategoryPage() {
  await connectDB();
  const category = await Category.findOne({ slug: 'men', status: 'active' });
  
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
    'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505022610485-0249ba5b3675?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506634572416-48cdfe530110?w=600&auto=format&fit=crop&q=80',
  ];

  return (
    <CategoryLayout
      title="MEN"
      tagline="Timeless essentials and contemporary styles, crafted for the man who values confidence, quality, and effortless sophistication."
      introImages={introImages}
      products={formattedProducts}
    />
  );
}
