'use client';

import React, { useState, useEffect, use } from 'react';
import { Search, Loader2, Package, Truck, CheckCircle, Clock, Check } from 'lucide-react';

interface TrackOrderProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default function TrackOrderPage({ searchParams }: TrackOrderProps) {
  const params = use(searchParams);
  const initialOrderId = params.orderId || '';

  const [orderId, setOrderId] = useState(initialOrderId);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialOrderId) {
      handleTrack(initialOrderId);
    }
  }, [initialOrderId]);

  const handleTrack = async (idToTrack: string) => {
    if (!idToTrack.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const res = await fetch(`/api/orders/${idToTrack.trim()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch order information.');
      setOrder(data.order);
    } catch (err: any) {
      setOrder(null);
      setError(err.message || 'Order not found. Please verify the ID.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTrack(orderId);
  };

  // Status mapping to steps
  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const getStepIndex = (status: string) => {
    if (status === 'Cancelled') return -1;
    return statuses.indexOf(status);
  };

  const activeStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">Track Your Order</h1>
        <p className="text-sm text-gray-500">Monitor your shipment and delivery milestones.</p>
      </div>

      {/* Search Input bar */}
      <form onSubmit={onSubmit} className="flex gap-2 max-w-md mx-auto">
        <input
          type="text"
          placeholder="e.g. ORD-12345678"
          required
          className="w-full rounded border border-gray-300 bg-white px-4 py-2 text-xs focus:border-black focus:outline-none focus:ring-1 focus:ring-black uppercase font-semibold"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-6 py-2 rounded flex items-center gap-1 uppercase tracking-wider cursor-pointer"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />}
          Track
        </button>
      </form>

      {/* Results panel */}
      {searched && !loading && (
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 text-xs font-semibold rounded text-center">
              {error}
            </div>
          )}

          {order && (
            <div className="border border-gray-200 rounded p-6 bg-white space-y-8">
              
              {/* Top order summary */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 text-xs">
                <div>
                  <p className="text-gray-400">Order ID</p>
                  <p className="font-bold text-gray-900">{order.orderId}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400">Status</p>
                  <p className={`font-bold uppercase tracking-wider ${order.status === 'Cancelled' ? 'text-red-600' : 'text-green-600'}`}>
                    {order.status}
                  </p>
                </div>
              </div>

              {/* Status stepper */}
              {order.status === 'Cancelled' ? (
                <div className="bg-red-50 border border-red-150 p-4 rounded text-center text-xs font-semibold text-red-750">
                  This order has been cancelled. If you believe this is an error, please contact support.
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t-2 border-gray-200" />
                    <div 
                      className="absolute border-t-2 border-black transition-all duration-500" 
                      style={{ width: `${(Math.max(0, activeStep) / (statuses.length - 1)) * 100}%` }} 
                    />
                  </div>
                  <div className="relative flex justify-between">
                    {statuses.map((step, idx) => {
                      const isCompleted = idx < activeStep;
                      const isActive = idx === activeStep;

                      return (
                        <div key={step} className="flex flex-col items-center z-10">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                              isActive
                                ? 'bg-white border-black text-black font-extrabold ring-4 ring-black/10'
                                : isCompleted
                                ? 'bg-black border-black text-white'
                                : 'bg-white border-gray-200 text-gray-400'
                            }`}
                          >
                            {isCompleted ? (
                              <Check size={14} strokeWidth={3} />
                            ) : (
                              <>
                                {step === 'Pending' && <Clock size={14} />}
                                {step === 'Processing' && <Package size={14} />}
                                {step === 'Shipped' && <Truck size={14} />}
                                {step === 'Delivered' && <CheckCircle size={14} />}
                              </>
                            )}
                          </span>
                          <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${isCompleted || isActive ? 'text-black' : 'text-gray-400'}`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Details table */}
              <div className="space-y-4 text-xs border-t border-gray-100 pt-6">
                <div>
                  <h3 className="font-bold text-gray-800 uppercase text-[10px] tracking-wide mb-1">Estimated Delivery</h3>
                  <p className="text-gray-650">
                    {order.status === 'Delivered'
                      ? 'Package has been delivered successfully.'
                      : 'Expect delivery within 3 to 5 business days after processing completes.'}
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 uppercase text-[10px] tracking-wide mb-1">Delivery Address</h3>
                  <p className="text-gray-650 font-semibold">{order.shippingAddress.fullName}</p>
                  <p className="text-gray-500">
                    {order.shippingAddress.addressLine1}, {order.shippingAddress.addressLine2 && `${order.shippingAddress.addressLine2}, `}
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}
