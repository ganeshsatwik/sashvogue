'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { mongoUser, refreshProfile } = useAuth();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (mongoUser) {
      setName(mongoUser.name);
    }
  }, [mongoUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      // Refresh the context user
      await refreshProfile();
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!mongoUser) return null;

  // Detect temporary email addresses
  const isTemporaryEmail = mongoUser.email.endsWith('@temporary-sash.com');

  return (
    <div className="space-y-6 max-w-xl">
      
      {/* Header */}
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-serif text-gray-900 mb-2">
          My Profile
        </h1>
        <p className="text-sm font-medium tracking-wide leading-relaxed text-gray-500">Manage your profile details and identifiers.</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 text-xs font-semibold rounded flex items-center gap-2">
          <Check size={14} /> Profile details updated successfully.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-xs font-semibold rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name input */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-gray-900 mb-2">Full Name</label>
          <div className="flex items-center border-b border-gray-400 py-2 focus-within:border-black transition-colors">
            <input
              type="text"
              required
              className="appearance-none w-full bg-transparent border-none text-gray-900 focus:outline-none focus:ring-0 text-sm font-semibold"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* Email display (Locked) */}
        {!isTemporaryEmail && (
          <div className="pt-4">
            <label className="block text-xs font-bold text-gray-400 mb-2">Email Address (Locked)</label>
            <div className="flex items-center border-b border-gray-200 py-2">
              <input
                type="email"
                disabled
                className="appearance-none w-full bg-transparent border-none text-gray-400 focus:outline-none focus:ring-0 text-sm font-semibold cursor-not-allowed"
                value={mongoUser.email}
              />
            </div>
          </div>
        )}

        {/* Phone display (Locked) */}
        {mongoUser.phone && (
          <div className="pt-4">
            <label className="block text-xs font-bold text-gray-400 mb-2">Phone Number (Locked)</label>
            <div className="flex items-center border-b border-gray-200 py-2">
              <input
                type="tel"
                disabled
                className="appearance-none w-full bg-transparent border-none text-gray-400 focus:outline-none focus:ring-0 text-sm font-semibold"
                value={mongoUser.phone}
              />
            </div>
          </div>
        )}

        <div className="pt-8">
          <button
            type="submit"
            disabled={loading || name === mongoUser.name}
            className="w-full sm:w-auto flex justify-center py-3 px-8 border border-transparent text-sm font-bold rounded-2xl text-white bg-[#0A1128] hover:bg-black transition-all focus:outline-none disabled:opacity-50 shadow-lg shadow-black/10"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>

    </div>
  );
}
