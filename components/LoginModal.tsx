'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUIStore } from '@/store/useUIStore';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal } = useUIStore();
  const { loginWithGoogleToken, user } = useAuth();
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loadingAction, setLoadingAction] = useState<'' | 'google'>('');

  // Close modal when user successfully logs in
  useEffect(() => {
    if (user && isLoginModalOpen) {
      closeLoginModal();
    }
  }, [user, isLoginModalOpen, closeLoginModal]);

  useEffect(() => {
    if (!isLoginModalOpen) {
      // Reset state when closed
      setPhoneNumber('');
      setError('');
      setLoadingAction('');
    } else {
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLoginModalOpen]);

  const triggerGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Google Client ID is missing.');
      setLoadingAction('');
      return;
    }
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'openid email profile';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&prompt=select_account`;
    window.location.href = authUrl;
  };

  const handleRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    if (formattedPhone.length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }

    setLoadingAction('google');
    // Save phone number before redirect
    if (phoneNumber) {
      localStorage.setItem('pending_login_phone', phoneNumber);
    } else {
      localStorage.removeItem('pending_login_phone');
    }
    // We intentionally trigger Google Login instead of sending OTP
    triggerGoogleLogin();
  };

  const handleDirectGoogleLogin = () => {
    setError('');
    setLoadingAction('google');
    // Clear phone number so it isn't associated if they didn't want it to be
    setPhoneNumber('');
    localStorage.removeItem('pending_login_phone');
    triggerGoogleLogin();
  };

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-[calc(100vw-2rem)] md:max-w-[850px] max-h-[95vh] bg-[#F9F7F2] rounded-3xl sm:rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-y-auto overflow-x-hidden animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={closeLoginModal}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 text-gray-800 transition-colors backdrop-blur-md"
        >
          <X size={18} />
        </button>

        {/* Left Side: Image & Branding (Hidden on mobile) */}
        <div className="hidden md:flex flex-col relative w-1/2 bg-[#dfd6cb] shrink-0">
          <img 
            src="/login_image.png" 
            alt="Sashvogue Fashion" 
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          
          <div className="relative z-10 p-10 h-full flex flex-col justify-end text-white">
            <h2 className="text-3xl lg:text-4xl font-serif italic mb-4">Welcome to <span className="uppercase font-sans not-italic font-black tracking-widest text-2xl lg:text-3xl ml-1">SASHVOGUE</span></h2>
            <p className="text-sm font-medium tracking-wide leading-relaxed text-gray-200">
              Where timeless elegance meets modern style. Sign in to discover curated collections, exclusive member benefits, and a seamless shopping experience designed just for you.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex flex-col w-full md:w-1/2 p-6 sm:p-10 md:p-12 justify-center">
          <h2 className="text-3xl font-serif text-gray-900 mb-3">Sign In</h2>
          <p className="text-sm text-gray-600 mb-8 font-medium leading-relaxed">
            Enter your details to access your account.
          </p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 text-xs rounded-lg font-semibold break-words">
              {error}
            </div>
          )}

          <form onSubmit={handleRequestOTP} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-2">
                Phone Number
              </label>
              <div className="flex items-center border-b border-gray-400 py-2 focus-within:border-black transition-colors w-full">
                <div className="flex items-center text-gray-600 mr-2 text-sm font-bold shrink-0">
                  <svg className="w-4 h-4 text-[#2E8B57] mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  +91
                </div>
                <div className="h-4 w-px bg-gray-300 mr-3 shrink-0"></div>
                <input
                  type="tel"
                  required
                  className="appearance-none w-full min-w-0 bg-transparent border-none text-gray-900 focus:outline-none focus:ring-0 text-sm font-semibold"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingAction !== ''}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-[#0A1128] hover:bg-black transition-all focus:outline-none disabled:opacity-50 shadow-lg shadow-black/10"
            >
              {loadingAction === 'google' ? 'Processing...' : 'Login'}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center relative">
            <div className="w-full h-px bg-gray-300"></div>
            <span className="absolute bg-[#F9F7F2] px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              -- OR --
            </span>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={handleDirectGoogleLogin}
              disabled={loadingAction !== ''}
              className="w-full flex items-center justify-center px-4 py-3.5 border border-gray-300 rounded-2xl shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-900 transition-all focus:outline-none disabled:opacity-50"
            >
              <svg className="h-4 w-4 mr-3" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.466 0-6.277-2.85-6.277-6.36s2.81-6.36 6.277-6.36c1.55 0 2.96.56 4.055 1.48l3.25-3.25C19.333 2.227 15.938 1 12.24 1 5.922 1 1 5.922 1 12.24s4.922 11.24 11.24 11.24c6.236 0 11.49-4.512 11.49-11.24 0-.7-.08-1.395-.23-2.072H12.24z" />
              </svg>
              {loadingAction === 'google' ? 'Signing in...' : 'Sign In with Google'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
