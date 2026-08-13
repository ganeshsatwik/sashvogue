'use client';

import React, { useState } from 'react';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">Contact Us</h1>
        <p className="text-sm text-gray-500">We'd love to hear from you. Get in touch with our team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Contact Info */}
        <div className="space-y-6 text-sm text-gray-600">
          <div>
            <h3 className="font-bold text-gray-900 uppercase tracking-wide mb-2">Customer Support</h3>
            <p>Email: support@sash.com</p>
            <p>Phone: +91 98765 43210</p>
            <p>Hours: Mon - Sat, 9:00 AM - 6:00 PM IST</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 uppercase tracking-wide mb-2">Corporate Office</h3>
            <p>SashVOGUE Clothing Pvt. Ltd.</p>
            <p>102, Fashion Enclave, Sector 5,</p>
            <p>Gurugram, Haryana - 122001, India</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-gray-50 p-6 border border-gray-200 rounded">
          {submitted ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 text-xs font-semibold rounded text-center">
              Thank you for getting in touch! We'll reply to your query shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs focus:border-black focus:outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs focus:border-black focus:outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs focus:border-black focus:outline-none"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded text-xs font-bold hover:bg-gray-800 transition-colors uppercase tracking-wider"
              >
                Send Message
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
