'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LayoutDashboard, ShoppingBag, MapPin, User, Bell, HelpCircle, LogOut, Loader2 } from 'lucide-react';

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { mongoUser, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !mongoUser) {
      router.push('/?login=true');
    }
  }, [mongoUser, loading, router]);

  if (loading || !mongoUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-black" size={32} />
      </div>
    );
  }

  const sidebarLinks = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Orders', href: '/orders', icon: ShoppingBag },
    { label: 'Saved Addresses', href: '/addresses', icon: MapPin },
    { label: 'My Profile', href: '/profile', icon: User },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'Support Desk', href: '/support', icon: HelpCircle },
  ];

  return (
    <div className="min-h-full flex flex-col bg-[#F9F7F2]">
      <Navbar />
      
      <div className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Side Navigation */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-6 space-y-4">
              <div className="border-b border-gray-100 pb-4 mb-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Welcome,</p>
                <p className="text-xl font-serif text-gray-900 truncate">{mongoUser.name}</p>
              </div>

              <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-1 pb-2 md:pb-0">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                        isActive
                          ? 'bg-[#0A1128] text-white shadow-md'
                          : 'text-gray-600 hover:bg-[#F9F7F2] hover:text-black'
                      }`}
                    >
                      <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400'} />
                      {link.label}
                    </Link>
                  );
                })}

                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer shrink-0 md:mt-6 border-t border-gray-100 pt-4 transition-all"
                >
                  <LogOut size={16} className="text-red-400" />
                  Sign Out
                </button>
              </nav>
            </div>
          </aside>

          {/* Account Sub-Page Content Container */}
          <main className="flex-1 bg-white rounded-3xl shadow-xl shadow-black/5 p-8 min-h-[450px]">
            {children}
          </main>

        </div>
      </div>

      <Footer />
    </div>
  );
}
