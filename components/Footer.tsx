'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#c6bba9] bg-[#cfc5b6] text-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Sash Column */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/logo_Sash.png" alt="Sash Logo" className="h-12 md:h-14 w-auto object-contain" />
            </Link>
            <ul className="space-y-2 text-xs">
              <li><Link href="/men" className="hover:text-black">Men</Link></li>
              <li><Link href="/women" className="hover:text-black">Women</Link></li>
              <li><Link href="/sale" className="text-red-600 hover:text-red-700 font-semibold">Sale</Link></li>
            </ul>
          </div>

          {/* Customer Service Column */}
          <div>
            <h3 className="text-sm font-bold text-black tracking-wider uppercase mb-4">Customer Service</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/contact-us" className="hover:text-black">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-black">FAQ</Link></li>
              <li><Link href="/track-order" className="hover:text-black">Track Order</Link></li>
              <li><Link href="/returns-refunds" className="hover:text-black">Returns & Refunds</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-black">Shipping Policy</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-sm font-bold text-black tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about-us" className="hover:text-black">About Us</Link></li>
              <li><Link href="/blogs" className="hover:text-black">Blogs</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-black">Privacy Policy</Link></li>
              <li><Link href="/terms-conditions" className="hover:text-black">Terms & Conditions</Link></li>
              <li><Link href="/sitemap" className="hover:text-black">Sitemap</Link></li>
            </ul>
          </div>

          {/* Newsletter / Contact Column */}
          <div>
            <h3 className="text-sm font-bold text-black tracking-wider uppercase mb-4">Newsletter</h3>
            <p className="text-xs text-black/80 mb-4">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            {subscribed ? (
              <p className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 p-2 rounded">
                Thank you for subscribing!
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 mb-4">
                <input
                  type="email"
                  placeholder="Your email address"
                  required
                  className="border border-gray-300 bg-white px-3 py-1.5 text-xs w-full focus:border-black focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-black hover:bg-gray-800 text-white font-semibold text-xs py-1.5 px-4 transition-colors"
                >
                  Join
                </button>
              </form>
            )}
            <div className="text-xs border-t border-gray-200 pt-4">
              <p className="font-semibold text-gray-850">Contact: support@sash.com</p>
              <p className="text-gray-500 mt-1">Phone: +91 98765 43210</p>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="mt-12 border-t border-black/10 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-black/60">
          <p>© {currentYear} Sash eCommerce. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms-conditions" className="hover:underline">Terms & Conditions</Link>
            <Link href="/shipping-policy" className="hover:underline">Shipping Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
