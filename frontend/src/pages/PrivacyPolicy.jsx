import React from 'react';
import { ShieldCheck, Lock, Eye } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-4">
        <div className="inline-flex items-center space-x-1.5 bg-forest-50 text-forest-700 px-3 py-1 rounded-full text-xs font-bold mb-2">
          <ShieldCheck className="h-4 w-4" />
          <span>Data Protection & Privacy</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
        <p className="text-slate-500 text-xs mt-1">Last Updated: September 9, 2026</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-slate-700 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Introduction</h2>
          <p>
            At <strong>DeshiMart</strong>, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you visit our Platform, in accordance with the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-650">
            <li><strong>Personal Identification Details:</strong> Name, email address, telephone number, and physical shipping address provided during registration or checkout.</li>
            <li><strong>Farmer Verification Details:</strong> Farm address, crop types, and contact details for verifying direct agricultural producer accounts.</li>
            <li><strong>Transaction & Order History:</strong> Products purchased, order amounts, and transaction reference identifiers.</li>
            <li><strong>Technical Data:</strong> Device IP address, browser type, operating system, and session timestamps.</li>
          </ul>
        </section>

        <section className="space-y-2 bg-forest-50/50 p-4 rounded-xl border border-forest-100">
          <div className="flex items-center space-x-2 text-forest-800 font-bold text-sm mb-1">
            <Lock className="h-4 w-4 text-forest-600" />
            <span>3. Payment Card & Financial Information Security</span>
          </div>
          <p className="text-xs text-forest-900">
            All online financial transactions on DeshiMart are routed through secure, encrypted, PCI-DSS compliant third-party payment aggregators, including <strong>Razorpay Software Private Limited</strong> and authorized UPI rails.
          </p>
          <p className="text-xs text-forest-900 font-semibold mt-1">
            ⚠️ DeshiMart NEVER stores, logs, or has access to your full credit/debit card numbers, CVVs, expiry dates, or netbanking passwords.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. How We Use Your Information</h2>
          <p>We use your information strictly for legitimate operational purposes:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-650">
            <li>Processing, dispatching, and fulfilling orders for crops, seeds, fertilizers, and tools.</li>
            <li>Sending order confirmations, digital receipts, and delivery tracking updates.</li>
            <li>Enabling customer care responses and grievance redressal.</li>
            <li>Complying with statutory accounting and tax reporting obligations in India.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">5. Cookies and Web Analytics</h2>
          <p>
            We use essential session tokens and cookies to maintain your shopping basket state and account login session. We do not sell or rent personal information to third-party advertisers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">6. Data Retention & User Rights</h2>
          <p>
            You have the right to access, review, and request deletion of your personal account data by contacting our support desk. Transaction records are retained as required by Indian taxation and regulatory laws.
          </p>
        </section>

        <section className="space-y-2 pt-2 border-t border-slate-150">
          <h2 className="text-base font-bold text-slate-900">7. Grievance Officer</h2>
          <p className="text-xs">
            For inquiries, concerns, or complaints regarding data privacy practices, you may write to our designated Grievance Officer:
          </p>
          <p className="text-xs font-semibold text-slate-800">
            Subarno Mallick — Email: <a href="mailto:grievance@deshimart.org" className="text-forest-600 underline">grievance@deshimart.org</a>
          </p>
        </section>
      </div>
    </div>
  );
}
