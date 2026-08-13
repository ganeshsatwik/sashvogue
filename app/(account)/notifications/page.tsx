'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';

interface NotificationAlert {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (notifications.filter((n) => !n.read).length === 0) return;
    setError('');
    setFeedback('');
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedback('All notifications marked as read.');
      fetchNotifications();
    } catch (e: any) {
      setError(e.message || 'Failed to update notifications.');
    }
  };

  const handleMarkRead = async (id: string, currentlyRead: boolean) => {
    if (currentlyRead) return;
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      if (res.ok) {
        // Optimistic UI update
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
      }
    } catch (e) {
      console.error('Failed to mark read:', e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
          Notifications
        </h1>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-xs font-bold text-gray-655 hover:text-black uppercase tracking-wider cursor-pointer"
          >
            <Check size={14} /> Mark All as Read
          </button>
        )}
      </div>

      {feedback && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 text-xs font-semibold rounded flex items-center gap-2">
          <Check size={14} /> {feedback}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-xs font-semibold rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading alerts...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded text-gray-550 text-xs">
          No notifications received yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleMarkRead(n._id, n.read)}
              className={`p-4 border rounded cursor-pointer transition-colors text-xs flex gap-3 items-start ${
                n.read
                  ? 'border-gray-200 bg-white hover:bg-gray-50'
                  : 'border-black/30 bg-black/[0.015] hover:bg-black/[0.03]'
              }`}
            >
              <span className={`p-1.5 rounded-full shrink-0 ${n.read ? 'bg-gray-105 text-gray-500' : 'bg-black text-white'}`}>
                <Bell size={12} />
              </span>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex justify-between items-baseline gap-2">
                  <p className={`font-bold ${n.read ? 'text-gray-800' : 'text-gray-950'}`}>{n.title}</p>
                  <span className="text-[9px] text-gray-400 shrink-0">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-550 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
