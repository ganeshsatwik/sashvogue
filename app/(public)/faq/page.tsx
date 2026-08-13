'use client';

import React, { useState } from 'react';

export default function FAQPage() {
  const faqs = [
    { q: 'How long does shipping take?', a: 'Standard shipping usually takes 3 to 5 business days for major metro cities in India. For tier-2/3 cities and remote regions, it can take 5 to 7 business days.' },
    { q: 'What is your return policy?', a: 'We offer a 10-day return policy. Items must be unworn, unwashed, and returned with original tags intact. You can initiate a return directly from your dashboard.' },
    { q: 'Can I change my delivery address after placing an order?', a: 'If your order has not been dispatched, you can contact our support team to update the delivery address. Once shipped, address changes are not possible.' },
    { q: 'What payment methods do you support?', a: 'We support Cash on Delivery (COD) and UPI Payments. UPI can be configured dynamically by scanning a generated QR code during checkout.' },
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">Frequently Asked Questions</h1>
        <p className="text-sm text-gray-500">Quick answers to common queries</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded overflow-hidden">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center bg-gray-50 px-6 py-4 text-left text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <span>{faq.q}</span>
              <span className="text-lg font-bold">{activeIndex === index ? '-' : '+'}</span>
            </button>
            {activeIndex === index && (
              <div className="px-6 py-4 bg-white text-xs leading-relaxed text-gray-600 border-t border-gray-150">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
