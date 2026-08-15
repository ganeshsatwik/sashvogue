import React from 'react';

export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">Shipping Policy</h1>
        <p className="text-sm text-gray-500">How we package, process, and ship your orders</p>
      </div>

      <div className="prose prose-sm text-gray-600 space-y-6 text-sm leading-relaxed">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Processing Timelines</h3>
        <p>
          All successfully verified orders (COD orders or approved UPI payments) are packaged and processed within <strong>24 to 48 hours</strong>. Orders placed on Sundays or public holidays will be dispatched on the next business day.
        </p>

        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Delivery Estimates</h3>
        <p>
          Sash ships nationwide. Standard domestic shipping is transit-linked and normally completed within 3 to 7 business days depending on location details. Tracking numbers are updated on your dashboard as soon as the courier receives the package.
        </p>

        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Shipping Rates</h3>
        <p>
          We offer flat-rate shipping of ₹69 on orders under ₹1999. Free shipping is automatically applied on checkout for orders above ₹1999.
        </p>
      </div>
    </div>
  );
}
