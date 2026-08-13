'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Loader2, Check } from 'lucide-react';

interface Address {
  _id: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  // Form handling state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false
  });

  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/addresses');
      const data = await res.json();
      if (res.ok) {
        setAddresses(data.addresses);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load addresses.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (addr: Address) => {
    setEditId(addr._id);
    setForm({
      fullName: addr.fullName,
      phoneNumber: addr.phoneNumber,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    setError('');
    setFeedback('');
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedback('Address deleted successfully.');
      fetchAddresses();
    } catch (e: any) {
      setError(e.message || 'Failed to delete address.');
    }
  };

  const handleSetDefault = async (addr: Address) => {
    if (addr.isDefault) return;
    setError('');
    setFeedback('');
    try {
      const res = await fetch(`/api/addresses/${addr._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addr, isDefault: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedback('Default address updated.');
      fetchAddresses();
    } catch (e: any) {
      setError(e.message || 'Failed to set default.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFeedback('');
    setFormLoading(true);

    try {
      const url = editId ? `/api/addresses/${editId}` : '/api/addresses';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedback(editId ? 'Address updated successfully.' : 'New address created successfully.');
      setShowForm(false);
      setEditId(null);
      setForm({
        fullName: '',
        phoneNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false
      });
      fetchAddresses();
    } catch (err: any) {
      setError(err.message || 'Failed to save address.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-serif text-gray-900">
          Saved Addresses
        </h1>
        {!showForm && (
          <button
            onClick={() => {
              setEditId(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-[#0A1128] hover:bg-black text-white font-bold text-[10px] px-5 py-2.5 rounded-xl uppercase tracking-widest cursor-pointer transition-all shadow-md shadow-black/10"
          >
            <Plus size={14} /> Add Address
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

      {/* Form Dialog Panel */}
      {showForm ? (
        <form onSubmit={handleFormSubmit} className="bg-[#F9F7F2] p-8 rounded-3xl shadow-xl shadow-black/5 space-y-6 max-w-2xl">
          <h3 className="font-serif text-2xl text-gray-900 border-b border-gray-200 pb-4">
            {editId ? 'Edit Address' : 'Add New Address'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-2">Full Name</label>
              <div className="flex items-center border-b border-gray-400 py-2 focus-within:border-black transition-colors">
                <input
                  type="text"
                  required
                  className="appearance-none w-full bg-transparent border-none text-gray-900 focus:outline-none focus:ring-0 text-sm font-semibold"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Phone Number</label>
              <input
                type="tel"
                required
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-black focus:outline-none"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Address Line 1</label>
            <input
              type="text"
              required
              placeholder="House/Flat No., Street, Area"
              className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-black focus:outline-none"
              value={form.addressLine1}
              onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Address Line 2 (Optional)</label>
            <input
              type="text"
              placeholder="Landmark"
              className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-black focus:outline-none"
              value={form.addressLine2}
              onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">City</label>
              <input
                type="text"
                required
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-black focus:outline-none"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">State</label>
              <input
                type="text"
                required
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-black focus:outline-none"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Postal Code</label>
              <input
                type="text"
                required
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-black focus:outline-none"
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="form-default"
              className="h-4 w-4 border-gray-300 text-black focus:ring-black cursor-pointer"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            />
            <label htmlFor="form-default" className="text-xs text-gray-700 cursor-pointer">Set as default address</label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={formLoading}
              className="flex justify-center items-center py-3 px-6 text-sm font-bold rounded-2xl text-white bg-[#0A1128] hover:bg-black transition-all focus:outline-none disabled:opacity-50 shadow-lg shadow-black/10"
            >
              {formLoading ? 'Saving...' : 'Save Address'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
              className="flex justify-center items-center py-3 px-6 text-sm font-bold rounded-2xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all focus:outline-none"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading your addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded text-gray-550 text-xs">
          No addresses saved yet. Click "Add Address" to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div key={addr._id} className="relative p-6 rounded-3xl bg-[#F9F7F2] flex flex-col transition-transform hover:-translate-y-1 duration-300 shadow-sm border border-transparent hover:border-gray-200">
              
              {addr.isDefault && (
                <span className="absolute top-4 right-4 bg-[#0A1128] text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                  Default
                </span>
              )}
              
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-gray-900 mt-1">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="font-serif text-xl text-gray-900 mb-1">{addr.fullName}</p>
                  <p className="text-xs text-gray-500 font-bold tracking-wide">{addr.phoneNumber}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-6 flex-grow">
                {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}
                {addr.city}, {addr.state} - {addr.postalCode}
              </p>

              {/* Actions Footer */}
              <div className="mt-auto pt-6 flex items-center justify-between border-t border-gray-200/50">
                <div className="flex gap-4">
                  <button onClick={() => handleEditClick(addr)} className="flex items-center gap-1.5 text-gray-500 hover:text-[#0A1128] text-[10px] font-bold uppercase tracking-widest transition-colors">
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(addr._id)} className="flex items-center gap-1.5 text-gray-400 hover:text-red-600 text-[10px] font-bold uppercase tracking-widest transition-colors">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
                
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr)} className="text-[10px] font-bold uppercase tracking-widest text-[#0A1128] hover:underline">
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
