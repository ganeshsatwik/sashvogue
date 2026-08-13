'use client';

import React, { useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SplashScreen from '@/components/SplashScreen';
import LoginModal from '@/components/LoginModal';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useUIStore } from '@/store/useUIStore';

function LoginQueryHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { openLoginModal } = useUIStore();

  useEffect(() => {
    if (searchParams.get('login') === 'true') {
      openLoginModal();
      // Remove the query param from URL without reloading
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('login');
      const newUrl = pathname + (newParams.toString() ? `?${newParams.toString()}` : '');
      router.replace(newUrl);
    }
  }, [searchParams, openLoginModal, router, pathname]);

  return null;
}

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <LoginQueryHandler />
      </Suspense>
      <Navbar />
      <LoginModal />
      <main className="flex-1 flex flex-col bg-white">
        {children}
      </main>
      <Footer />
    </div>
  );
}
