import React from 'react';
import CategoryLayout from '@/components/CategoryLayout';

export default function SaleCategoryPage() {
  return (
    <CategoryLayout
      title="SALE"
      tagline="Act fast on limited stock! Discover discounted apparel and footwear from past seasons at unbeatable prices."
      introImages={[]} // Minimal banner
      products={[]}
    />
  );
}
