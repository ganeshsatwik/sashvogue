'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Eye, MessageSquare, Loader2, Check } from 'lucide-react';

interface Ticket {
  _id: string;
  ticketId: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Closed';
  department: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  // Form handling state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    description: '',
    department: 'Support'
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFeedback('');
    setFormLoading(true);

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedback(`Ticket ${data.ticket.ticketId} created successfully.`);
      setShowForm(false);
      setForm({ subject: '', description: '', department: 'Support' });
      fetchTickets();
    } catch (err: any) {
      setError(err.message || 'Failed to create support ticket.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
          Support Desk
        </h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 bg-black hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded uppercase tracking-wider cursor-pointer"
          >
            <Plus size={14} /> Open Ticket
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

      {/* Ticket creation form panel */}
      {showForm ? (
        <form onSubmit={handleFormSubmit} className="bg-gray-55 p-6 border border-gray-200 rounded space-y-4 max-w-xl">
          <h3 className="font-bold text-gray-900 uppercase text-[10px] tracking-wide border-b border-gray-150 pb-2">
            Open Support Ticket
          </h3>

          <div>
            <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Subject</label>
            <input
              type="text"
              required
              placeholder="Summary of issue"
              className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-black focus:outline-none"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Department</label>
            <select
              className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-black focus:outline-none"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            >
              <option value="Support">General Support</option>
              <option value="Billing">Billing & Refunds</option>
              <option value="Returns">Returns & Exchanges</option>
              <option value="Delivery">Shipping & Delivery</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Description</label>
            <textarea
              required
              rows={4}
              placeholder="Provide exact details so our staff can assist you."
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs focus:border-black focus:outline-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={formLoading}
              className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded cursor-pointer disabled:opacity-50"
            >
              {formLoading ? 'Submitting...' : 'Submit Ticket'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs px-4 py-2 rounded cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded text-gray-550 text-xs">
          No support tickets created yet. Click "Open Ticket" if you need assistance.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-700">
              <tr>
                <th className="px-6 py-3">Ticket ID</th>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date Created</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white text-gray-650 font-medium">
              {tickets.map((tck) => (
                <tr key={tck._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900">{tck.ticketId}</td>
                  <td className="px-6 py-4 max-w-[200px] truncate">{tck.subject}</td>
                  <td className="px-6 py-4">{tck.department}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                      tck.status === 'Open'
                        ? 'bg-blue-50 text-blue-700 border-blue-150'
                        : tck.status === 'In Progress'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-150'
                        : 'bg-gray-50 text-gray-700 border-gray-150'
                    }`}>
                      {tck.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(tck.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/support/${tck.ticketId}`}
                      className="inline-flex items-center gap-1 bg-black hover:bg-gray-800 text-white font-bold py-1 px-3 rounded uppercase text-[10px] tracking-wide cursor-pointer"
                    >
                      <MessageSquare size={12} />
                      Chat
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
