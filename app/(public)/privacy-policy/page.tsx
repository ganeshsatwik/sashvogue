import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">Privacy Policy</h1>
        <p className="text-sm text-gray-500">How we handle and safeguard your personal information</p>
      </div>

      <div className="prose prose-sm text-gray-600 space-y-6 text-sm leading-relaxed">
        <p>
          At Sash, we value your privacy and are committed to protecting your personal data. This privacy statement outlines the types of information we collect, how we use it, and the security protocols we employ.
        </p>

        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">1. Information Collection</h3>
        <p>
          We collect information when you register, make a purchase (name, shipping address, contact phone), or verify UPI transactions. Google OAuth details are only collected to establish secure authentication.
        </p>

        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">2. Use of Information</h3>
        <p>
          Your information is solely used to fulfill orders, verify transaction IDs, provide support tickets feedback, and send relevant notification alerts regarding order tracking. We do not sell or lease customer records to third-party advertisers.
        </p>

        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">3. Data Security</h3>
        <p>
          All session variables and transactions are protected via SSL/TLS layers. Payment verification details and credentials are securely cached and stored using standard database encryption.
        </p>
      </div>
    </div>
  );
}
