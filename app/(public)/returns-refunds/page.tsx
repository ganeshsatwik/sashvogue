import React from 'react';

export default function ReturnsRefundsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">Returns & Refunds</h1>
        <p className="text-sm text-gray-500">Our policies on exchanges and money back guarantees</p>
      </div>

      <div className="prose prose-sm text-gray-600 space-y-6 text-sm leading-relaxed">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">10-Day Return Policy</h3>
        <p>
          If you are not completely satisfied with your purchase, you may return the item within <strong>10 days</strong> of delivery. To be eligible for a return, the product must be unused, unwashed, and in the same condition as received, with all original tags attached.
        </p>

        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Exchanges</h3>
        <p>
          We offer size exchanges free of charge. If you would like to swap your item for a different size, please select "Exchange" in the Order History section of your customer profile dashboard.
        </p>

        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Refund Timeline</h3>
        <p>
          Once we receive and inspect your returned items at our warehouse, we will verify the refund. Approved refunds will be credited back to your original payment mode (e.g. UPI account or bank transfer for COD refunds) within <strong>3 to 5 business days</strong>.
        </p>
      </div>
    </div>
  );
}
