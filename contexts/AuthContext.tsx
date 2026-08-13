'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  mongoUser: any | null;
  loading: boolean;
  loginWithGoogleToken: (token: string, phoneNumber?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  user: any | null; // For backwards compatibility
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mongoUser, setMongoUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loginWithGoogleToken = async (token: string, phoneNumber?: string) => {
    setLoading(true);
    try {
      // Sync user to MongoDB
      const regRes = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, phoneNumber }),
      });
      const regData = await regRes.json();

      if (!regRes.ok) throw new Error(regData.error || 'Failed to sync MongoDB user');

      setMongoUser(regData.user);
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      setMongoUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setMongoUser(data.user);
      } else {
        setMongoUser(null);
      }
    } catch (err) {
      console.error('Refresh profile error:', err);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setMongoUser(data.user);
        } else {
          setMongoUser(null);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setMongoUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ mongoUser, loading, loginWithGoogleToken, logout, refreshProfile, user: mongoUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
