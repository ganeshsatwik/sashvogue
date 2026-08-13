'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCartStore } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Check, MapPin, Loader2, X, HelpCircle, Video } from 'lucide-react';

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

export default function CheckoutPage() {
  const { mongoUser, loading: authLoading } = useAuth();
  const { items, clearCart } = useCartStore();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  
  // Form for new address
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
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

  const [error, setError] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingAddresses, setFetchingAddresses] = useState(false);

  const [settings, setSettings] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [modalError, setModalError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!authLoading && !mongoUser) {
      router.push('/login');
    }
  }, [mongoUser, authLoading, router]);

  useEffect(() => {
    if (mongoUser) {
      fetchAddresses();
      fetchSettings();
    }
  }, [mongoUser]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  };

  const fetchAddresses = async () => {
    setFetchingAddresses(true);
    try {
      const res = await fetch('/api/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses);
        const defaultAddr = data.addresses.find((a: Address) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
        } else if (data.addresses.length > 0) {
          setSelectedAddressId(data.addresses[0]._id);
        }
      }
    } catch (e) {
      console.error('Failed to load addresses:', e);
    } finally {
      setFetchingAddresses(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add address');

      // Refresh addresses and close form
      await fetchAddresses();
      setSelectedAddressId(data.address._id);
      setShowAddressForm(false);
      setNewAddress({
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
    } catch (err: any) {
      setError(err.message || 'Failed to save address.');
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponCode.trim()) return;

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to validate coupon');

      setAppliedCoupon({ code: data.code, discount: data.discount });
      setCouponSuccess(`Coupon applied! You saved ₹${data.discount}`);
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon.');
      setAppliedCoupon(null);
    }
  };

  const handlePlaceOrder = () => {
    setError('');
    if (!selectedAddressId) {
      setError('Please select a shipping address.');
      return;
    }
    if (!paymentMethod) {
      setError('Please select a payment method.');
      return;
    }

    if (paymentMethod === 'UPI') {
      setShowPaymentModal(true);
    } else {
      submitOrder();
    }
  };

  const submitOrder = async () => {
    setLoading(true);
    setModalError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          addressId: selectedAddressId,
          paymentMethod,
          couponCode: appliedCoupon?.code,
          transactionId: paymentMethod === 'UPI' ? transactionId : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order.');

      clearCart();
      setShowPaymentModal(false);
      router.push(`/order-success?orderId=${data.orderId}`);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || 'An error occurred while placing your order.';
      if (showPaymentModal) setModalError(errMsg);
      else setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Pricing calculations
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const discount = appliedCoupon?.discount || 0;
  const shippingFee = subtotal - discount >= 1999 || subtotal === 0 ? 0 : 99;
  const total = subtotal - discount + shippingFee;

  const payeeUPI = settings?.upiId || 'dyhardx@okaxis';
  const payeeName = settings?.upiMerchantName || 'Sash Clothing';
  const amount = total.toFixed(2);
  const upiLink = `upi://pay?pa=${payeeUPI}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

  // Calculate payment method intersection
  const allowedMethods = items.reduce((acc, item) => {
    const itemMethods = item.paymentMethods || ['UPI', 'COD'];
    return acc.filter((m) => itemMethods.includes(m));
  }, ['UPI', 'COD']);

  // Set default payment method if available
  useEffect(() => {
    if (allowedMethods.length > 0 && !paymentMethod) {
      setPaymentMethod(allowedMethods[0]);
    }
  }, [allowedMethods, paymentMethod]);

  if (authLoading || !mongoUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-black" size={32} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        Your cart is empty. Please add items to checkout. <Link href="/" className="text-black font-bold underline">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">Checkout</h1>
        <p className="mt-2 text-sm text-gray-500">Complete your shipping and billing details.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-xs font-semibold rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Shipping & Payment (Left Column) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Address Section */}
          <section className="bg-white border border-gray-200 p-6 rounded space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-gray-950 uppercase tracking-wider">
                Shipping Address
              </h2>
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-black cursor-pointer"
                >
                  <Plus size={14} /> Add Address
                </button>
              )}
            </div>

            {fetchingAddresses ? (
              <div className="text-xs text-gray-500">Loading addresses...</div>
            ) : showAddressForm ? (
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs focus:border-black focus:outline-none"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs focus:border-black focus:outline-none"
                      value={newAddress.phoneNumber}
                      onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Address Line 1</label>
                  <input
                    type="text"
                    required
                    placeholder="House/Flat No., Street, Area"
                    className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs focus:border-black focus:outline-none"
                    value={newAddress.addressLine1}
                    onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    placeholder="Landmark"
                    className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs focus:border-black focus:outline-none"
                    value={newAddress.addressLine2}
                    onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">City</label>
                    <input
                      type="text"
                      required
                      className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs focus:border-black focus:outline-none"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">State</label>
                    <input
                      type="text"
                      required
                      className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs focus:border-black focus:outline-none"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs focus:border-black focus:outline-none"
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is-default"
                    className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  />
                  <label htmlFor="is-default" className="text-xs text-gray-700">Set as default address</label>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded cursor-pointer"
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs px-4 py-2 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : addresses.length === 0 ? (
              <div className="text-xs text-gray-550 py-4 text-center">
                No shipping addresses saved yet. Please add an address to continue.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    onClick={() => setSelectedAddressId(addr._id)}
                    className={`relative p-4 border rounded cursor-pointer flex flex-col justify-between ${
                      selectedAddressId === addr._id
                        ? 'border-black bg-black/[0.01]'
                        : 'border-gray-200 bg-white hover:border-gray-400'
                    }`}
                  >
                    {selectedAddressId === addr._id && (
                      <span className="absolute right-3 top-3 bg-black text-white p-0.5 rounded-full">
                        <Check size={10} />
                      </span>
                    )}
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-800 flex items-center gap-1">
                        <MapPin size={12} />
                        {addr.fullName}
                      </p>
                      <p className="text-[10px] text-gray-550 leading-relaxed">
                        {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}
                        {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <p className="text-[10px] text-gray-550">Phone: {addr.phoneNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Payment Section */}
          <section className="bg-white border border-gray-200 p-6 rounded space-y-4">
            <h2 className="text-sm font-bold text-gray-950 uppercase tracking-wider border-b border-gray-100 pb-3">
              Payment Method
            </h2>

            {allowedMethods.length === 0 ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-xs rounded">
                The items in your bag have incompatible payment methods. Please checkout separately.
              </div>
            ) : (
              <div className="space-y-3">
                {allowedMethods.map((method) => (
                  <label
                    key={method}
                    className={`flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                      paymentMethod === method ? 'border-black bg-black/[0.01]' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="h-4 w-4 border-gray-300 text-black focus:ring-black cursor-pointer"
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-900">{method}</p>
                      <p className="text-[10px] text-gray-500">
                        {method === 'UPI'
                          ? 'Pay instantly using any UPI app (scan QR code on success screen).'
                          : 'Pay in cash upon physical package delivery.'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Checkout Order Summary Column */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 border border-gray-200 rounded space-y-6 h-fit">
            <h2 className="text-sm font-bold text-gray-955 uppercase tracking-wider border-b border-gray-200 pb-2">
              Order Review
            </h2>

            {/* Cart Items list */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId || 'default'}`} className="flex gap-3 text-xs items-center">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100'}
                    alt=""
                    className="w-10 aspect-[3/4] object-cover rounded border border-gray-200 bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                    <div className="flex flex-col gap-1 mt-0.5">
                      <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                      {item.variant && (
                        <div className="flex gap-1.5 items-center">
                          {item.variant.size && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded">Size: {item.variant.size}</span>}
                          {item.variant.color && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded">Color: {item.variant.color}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="border-t border-b border-gray-200 py-4 space-y-2">
              <label className="block text-[10px] font-bold text-gray-700 uppercase">Promo Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="COUPON100"
                  className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs w-full focus:border-black focus:outline-none focus:ring-1 focus:ring-black uppercase"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-4 py-1.5 rounded cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-[10px] text-red-600 font-semibold">{couponError}</p>}
              {couponSuccess && <p className="text-[10px] text-green-700 font-semibold">{couponSuccess}</p>}
            </form>

            {/* Calculations */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-550">Subtotal</span>
                <span className="font-semibold text-gray-900">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-550">Shipping Fee</span>
                <span className="font-semibold text-gray-900">
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between text-sm font-bold text-gray-950">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || allowedMethods.length === 0 || !selectedAddressId}
              className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-bold py-3 rounded text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={14} /> Placing Order...
                </>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">UPI Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="text-center space-y-3">
                <p className="text-xs font-semibold text-gray-700">Scan QR to pay ₹{total}</p>
                <div className="inline-block p-3 border border-gray-200 rounded bg-gray-50">
                  <img src={qrCodeUrl} alt="UPI QR Code" className="w-48 h-48 mx-auto" />
                </div>
                <p className="text-[10px] text-gray-400">UPI ID: {payeeUPI}</p>
                
                {/* Mobile Pay Now Button */}
                <div className="pt-2 md:hidden">
                  <a
                    href={upiLink}
                    className="inline-flex items-center justify-center w-full max-w-[200px] bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded text-xs tracking-wider transition-colors"
                  >
                    Pay Now with UPI App
                  </a>
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-4">
                {modalError && (
                  <p className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 p-2 rounded">
                    {modalError}
                  </p>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-gray-600">Transaction Ref / UPI Ref ID (12 digits)</label>
                    <button
                      onClick={() => setShowHelp(!showHelp)}
                      className="text-gray-400 hover:text-black transition-colors"
                      title="Need help finding this?"
                    >
                      <HelpCircle size={14} />
                    </button>
                  </div>
                  
                  {showHelp && (
                    <div className="bg-[#F9F7F2] border border-gray-200 p-3 rounded space-y-3">
                      <p className="text-[10px] text-gray-600 leading-relaxed whitespace-pre-line">
                        {settings?.upiHelpText || 'After making the payment, open your UPI app\'s transaction history. Look for a 12-digit number labeled as "UPI Ref. ID", "UTR", or "Transaction ID". Enter it exactly as shown.'}
                      </p>
                      
                      {settings?.upiHelpImageUrl && (
                        <div className="mt-2 rounded overflow-hidden border border-gray-200">
                          <img src={settings.upiHelpImageUrl} alt="Transaction ID Help Example" className="w-full max-w-sm" />
                        </div>
                      )}

                      {settings?.upiHelpVideoUrl && (
                        <a
                          href={settings.upiHelpVideoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded text-[10px] font-bold transition-colors"
                        >
                          <Video size={12} /> Watch Video Guide
                        </a>
                      )}
                    </div>
                  )}

                  <input
                    type="text"
                    required
                    placeholder="e.g. 123456789012"
                    className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs focus:border-black focus:outline-none"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => {
                  if (transactionId.trim().length !== 12) {
                    setModalError('Transaction ID must be exactly 12 digits.');
                    return;
                  }
                  submitOrder();
                }}
                disabled={loading || transactionId.trim().length !== 12}
                className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-bold py-2.5 rounded text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={14} /> Processing...
                  </>
                ) : (
                  'Confirm Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
