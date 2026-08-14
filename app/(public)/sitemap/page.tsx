import React from 'react';
import Link from 'next/link';

export default function SitemapPage() {
  const sections = [
    {
      title: 'Shop Catalog',
      links: [
        { label: 'Homepage', href: '/' },
        { label: 'Men Apparel', href: '/men' },
        { label: 'Women Apparel', href: '/women' },
        // { label: 'Accessories', href: '/accessories' },
        { label: 'Special Sale', href: '/sale' },
      ],
    },
    {
      title: 'Customer Dashboard',
      links: [
        { label: 'Dashboard Home', href: '/dashboard' },
        { label: 'My Profile', href: '/profile' },
        { label: 'My Orders', href: '/orders' },
        { label: 'Saved Addresses', href: '/profile' },
        { label: 'My Wishlist', href: '/wishlist' },
        { label: 'Support Tickets', href: '/dashboard' },
      ],
    },
    {
      title: 'Support & Policies',
      links: [
        { label: 'Contact Us', href: '/contact-us' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Returns & Refunds', href: '/returns-refunds' },
        { label: 'Shipping Policy', href: '/shipping-policy' },
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Terms & Conditions', href: '/terms-conditions' },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">Sitemap</h1>
        <p className="text-sm text-gray-500">Comprehensive list of all pages on our customer platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-4">
            <h3 className="text-sm font-bold text-gray-955 uppercase tracking-wider border-b border-gray-200 pb-2">
              {sec.title}
            </h3>
            <ul className="space-y-2 text-xs">
              {sec.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-600 hover:text-black hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
