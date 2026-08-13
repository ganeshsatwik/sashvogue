'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

interface SuccessPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  const params = use(searchParams);
  const orderId = params.orderId;
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load order details.');
      setOrder(data.order);
      setSettings(data.settings);
    } catch (e: any) {
      setError(e.message || 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-black" size={32} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <AlertCircle className="text-red-500 mx-auto" size={48} />
        <h1 className="text-xl font-bold uppercase tracking-wide">Order Not Found</h1>
        <p className="text-xs text-gray-500">{error || 'Unable to retrieve order information.'}</p>
        <Link href="/" className="inline-block bg-black text-white text-xs font-bold px-6 py-2.5 rounded uppercase tracking-wider">
          Return Home
        </Link>
      </div>
    );
  }


  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      
      {/* Visual confirmation heading */}
      <div className="text-center space-y-3">
        <CheckCircle2 className="text-green-600 mx-auto" size={56} />
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">Order Confirmed</h1>
        <p className="text-xs text-gray-500">
          Thank you for your order! Your Order ID is <span className="font-bold text-gray-900">{order.orderId}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Order Details Grid */}
        <div className="border border-gray-200 rounded p-6 bg-white space-y-6">
          <h2 className="text-xs font-bold text-gray-950 uppercase tracking-wider border-b border-gray-100 pb-2">
            Shipping & Order Summary
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <p className="font-bold text-gray-800 uppercase text-[10px] tracking-wide mb-1">Shipping Address</p>
              <p className="text-gray-600 font-semibold">{order.shippingAddress.fullName}</p>
              <p className="text-gray-500">
                {order.shippingAddress.addressLine1}, {order.shippingAddress.addressLine2 && `${order.shippingAddress.addressLine2}, `}
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              </p>
              <p className="text-gray-500">Phone: {order.shippingAddress.phoneNumber}</p>
            </div>

            <div>
              <p className="font-bold text-gray-800 uppercase text-[10px] tracking-wide mb-1">Payment Method</p>
              <p className="text-gray-600 font-bold">{order.paymentMethod}</p>
            </div>

            <div>
              <p className="font-bold text-gray-800 uppercase text-[10px] tracking-wide mb-1">Billing Summary</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Final Total</span>
                  <span className="font-bold text-gray-900">₹{order.totalPrice}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount Applied</span>
                    <span>-₹{order.discountAmount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex gap-2">
            <Link href={`/track-order?orderId=${order.orderId}`} className="flex-1 flex items-center justify-center gap-1 bg-black hover:bg-gray-800 text-white font-bold py-2.5 rounded text-xs uppercase tracking-wider">
              Track Order <ChevronRight size={14} />
            </Link>
            <Link href="/" className="flex-1 text-center border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded text-xs uppercase tracking-wider">
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Payment Instructions (Right Column) */}
        <div className="border border-gray-200 rounded p-6 bg-white space-y-6">
          <h2 className="text-xs font-bold text-gray-950 uppercase tracking-wider border-b border-gray-100 pb-2">
            Payment Verification
          </h2>

          {order.paymentMethod === 'COD' ? (
            <div className="space-y-3 text-xs leading-relaxed text-gray-600">
              <p className="font-semibold text-gray-800">You have selected Cash on Delivery (COD).</p>
              <p>Your order status will be updated to "Processing". Please keep the exact amount of <span className="font-bold text-black">₹{order.totalPrice}</span> ready in cash when the delivery executive arrives at your doorstep.</p>
            </div>
          ) : (
            <div className="space-y-3 text-xs leading-relaxed text-gray-600">
              <p className="font-semibold text-green-700">Payment details submitted successfully!</p>
              <p>We will verify your payment and send you a confirmation mail and message on your registered number shortly.</p>
              <p className="mt-2 text-gray-500">Your order will be processed once the payment is verified.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
