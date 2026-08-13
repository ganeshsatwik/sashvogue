'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUIStore } from '@/store/useUIStore';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { loginWithGoogleToken } = useAuth();
  const { closeLoginModal } = useUIStore();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Checking URL...');

  useEffect(() => {
    let isMounted = true;
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const hashStr = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hashStr);
        
        const errorMsg = urlParams.get('error') || hashParams.get('error');
        if (errorMsg) {
          if (isMounted) setError(`Google Login failed: ${errorMsg}`);
          setTimeout(() => { if (isMounted) window.location.href = '/'; }, 3000);
          return;
        }

        const accessToken = hashParams.get('access_token');
        if (!accessToken) {
          if (isMounted) {
            setError(`No access token found in URL. Hash: ${window.location.hash || 'None'}, Search: ${window.location.search || 'None'}`);
          }
          setTimeout(() => { if (isMounted) window.location.href = '/'; }, 5000);
          return;
        }

        if (isMounted) setStatus('Logging you in...');
        const phoneNumber = localStorage.getItem('pending_login_phone') || '';
        await loginWithGoogleToken(accessToken, phoneNumber);
        
        // Cleanup
        localStorage.removeItem('pending_login_phone');
        closeLoginModal(); // just in case
        
        if (isMounted) setStatus('Success! Redirecting...');
        window.location.href = '/'; // Hard redirect to be safe
      } catch (err: any) {
        console.error('Login error:', err);
        if (isMounted) setError(err.message || 'Failed to complete login.');
        setTimeout(() => window.location.href = '/', 3000);
      }
    };

    handleCallback();
    return () => { isMounted = false; };
  }, [router, loginWithGoogleToken, closeLoginModal]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F7F2]">
      {error ? (
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-100 max-w-lg mx-4 break-all">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif text-gray-900 mb-2">Login Error</h2>
          <p className="text-gray-600 mb-6 text-sm">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-3 px-4 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-colors"
          >
            Return to Home
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-serif font-medium text-gray-900">{status}</h2>
          <p className="text-sm text-gray-500 mt-2">Please wait while we securely log you in.</p>
        </div>
      )}
    </div>
  );
}
