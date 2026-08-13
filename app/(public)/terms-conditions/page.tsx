import React from 'react';

export default function TermsConditionsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">Terms & Conditions</h1>
        <p className="text-sm text-gray-500">Rules and guidelines governing website usage and orders</p>
      </div>

      <div className="prose prose-sm text-gray-600 space-y-6 text-sm leading-relaxed">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">1. Agreement to Terms</h3>
        <p>
          By accessing and browsing the Sash platform, you agree to comply with our general conditions of sale, payment processing requirements, and return terms.
        </p>

        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">2. Product Descriptions & Pricing</h3>
        <p>
          We strive to provide accurate imagery, pricing, and variant stock info. However, occasional pricing errors or item details mismatch can occur. Sash reserves the right to cancel orders arising from erroneous pricing configurations.
        </p>

        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">3. UPI Verification & Payments</h3>
        <p>
          When submitting custom UPI screenshots or Transaction IDs, you agree that submitting fraudulent transactions or fake screenshots will lead to immediate account suspension and order rejection.
        </p>
      </div>
    </div>
  );
}
