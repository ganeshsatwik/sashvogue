'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useUIStore } from '@/store/useUIStore';
import { ShoppingBag, Heart, Search, Menu, X, User as UserIcon, ArrowLeft } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Men', href: '/men' },
  { label: 'Women', href: '/women' },
  { label: 'Accessories', href: '/accessories' },
  { label: 'About Us', href: '/about-us' },
];

export default function Navbar() {
  const { mongoUser, logout } = useAuth();
  const { openLoginModal } = useUIStore();
  const pathname = usePathname();
  const router = useRouter();

  const cartCount = useCartStore(s => s.totalCount());
  const wishlistCount = useWishlistStore(s => s.items.length);

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setMobileOpen(false); setDropdownOpen(false); setSearchOpen(false); }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-gray-200">

      {/* ── Main Bar ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* LEFT — Back Button & Logo */}
          <div className="flex items-center gap-1 sm:gap-2">
            {pathname !== '/' && (
              <button
                onClick={() => router.back()}
                className="md:hidden p-1.5 -ml-2 text-gray-600 hover:text-black transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={22} />
              </button>
            )}
            <Link href="/" className="flex items-center text-xl font-black tracking-tighter text-black hover:text-gray-700 transition-colors animate-in slide-in-from-left-8 fade-in duration-1000">
              <img src="/logo_Sash.png" alt="Sash Logo" className="h-10 sm:h-12 w-auto object-contain origin-left" />
            </Link>
          </div>

          {/* CENTER — Desktop Nav or Search */}
          <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 w-full max-w-3xl px-8 transition-all duration-300 justify-center">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="w-full relative flex items-center animate-in fade-in slide-in-from-top-2 duration-300">
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search products"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-400 bg-white py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-black transition-colors"
                />
                <button type="submit" className="absolute right-3 text-gray-600 hover:text-black">
                  <Search size={18} />
                </button>
              </form>
            ) : (
              <nav className="flex items-center gap-0 animate-in fade-in duration-300">
                {NAV_LINKS.map(link => {
                  const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-5 py-2 text-sm font-semibold uppercase tracking-wider transition-colors ${isActive
                        ? 'text-black border-b-2 border-black'
                        : 'text-gray-500 hover:text-black border-b-2 border-transparent'
                        }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <Link
                  href="/sale"
                  className={`px-5 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${pathname === '/sale' ? 'text-red-600 border-b-2 border-red-600' : 'text-red-600 hover:text-red-700 border-b-2 border-transparent'
                    }`}
                >
                  Sale
                </Link>
              </nav>
            )}
          </div>

          {/* RIGHT — Icons */}
          <div className="flex items-center gap-1">

            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-600 hover:text-black transition-colors"
            >
              {searchOpen ? <X size={19} /> : <Search size={19} />}
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative p-2 text-gray-600 hover:text-black transition-colors">
              <Heart size={19} />
              {mounted && wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-black text-white text-[8px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-black transition-colors">
              <ShoppingBag size={19} />
              {mounted && cartCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-black text-white text-[8px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account — desktop shows name/sign-in, mobile shows nothing (in hamburger menu) */}
            <div className="relative hidden md:block" ref={dropdownRef}>
              {mongoUser ? (
                <>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-1 p-2 text-gray-600 hover:text-black transition-colors"
                  >
                    <UserIcon size={19} />
                    <span className="text-xs font-semibold">{mongoUser.name?.split(' ')[0]}</span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 shadow-lg z-50">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Signed in as</p>
                        <p className="text-xs font-bold text-gray-800 truncate mt-0.5">{mongoUser.email}</p>
                      </div>
                      {[
                        { label: 'My Dashboard', href: '/dashboard' },
                        { label: 'My Profile', href: '/profile' },
                        { label: 'My Orders', href: '/orders' },
                      ].map(item => (
                        <Link key={item.href} href={item.href}
                          className="block px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-black transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Search bar ── */}
      {searchOpen && (
        <div className="md:hidden border-t border-gray-200 bg-background px-4 sm:px-6 lg:px-8 py-3">
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-20 py-2.5 text-sm border border-gray-300 focus:border-black focus:outline-none focus:ring-0 bg-white"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-0 top-0 bottom-0 px-5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors">
              Search
            </button>
          </form>
        </div>
      )}

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-background">
          <nav className="px-4 py-3 flex flex-col">
            {NAV_LINKS.map(link => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link key={link.href} href={link.href}
                  className={`py-3 text-sm font-semibold uppercase tracking-wider border-b border-gray-100 transition-colors ${isActive ? 'text-black' : 'text-gray-600 hover:text-black'
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link href="/sale" className="py-3 text-sm font-bold uppercase tracking-wider text-red-600 hover:text-red-700 transition-colors border-b border-gray-100">
              Sale
            </Link>
            {!mongoUser ? (
              <button
                onClick={() => { openLoginModal(); setMobileOpen(false); }}
                className="mt-3 w-full py-3 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
              >
                Sign In
              </button>
            ) : (
              <>
                <Link href="/dashboard" className="py-3 text-sm font-semibold text-gray-600 hover:text-black border-b border-gray-100">My Dashboard</Link>
                <Link href="/orders" className="py-3 text-sm font-semibold text-gray-600 hover:text-black border-b border-gray-100">My Orders</Link>
                <button onClick={logout} className="mt-3 w-full py-3 text-sm font-bold uppercase text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
                  Sign Out
                </button>
              </>
            )}
          </nav>
        </div>
      )}

    </header>
  );
}
