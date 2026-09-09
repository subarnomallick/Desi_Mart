import React from 'react';
import { FileText, Shield, AlertCircle } from 'lucide-react';

export default function TermsConditions() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-4">
        <div className="inline-flex items-center space-x-1.5 bg-forest-50 text-forest-700 px-3 py-1 rounded-full text-xs font-bold mb-2">
          <FileText className="h-4 w-4" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Terms and Conditions</h1>
        <p className="text-slate-500 text-xs mt-1">Last Updated: September 9, 2026</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-slate-700 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Overview & Acceptance</h2>
          <p>
            Welcome to <strong>DeshiMart</strong> ("we", "us", or "our"), operated by proprietor Subarno Mallick. By accessing or using our website, services, and mobile-optimized application (collectively, the "Platform"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to all terms and conditions, you must discontinue using our Platform immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. User Eligibility & Accounts</h2>
          <p>
            To register an account or place orders on DeshiMart, you must be at least 18 years old and capable of entering into a legally binding contract under the Indian Contract Act, 1872. You are responsible for maintaining the confidentiality of your account credentials and passwords.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Farmer Marketplace & Product Listings</h2>
          <p>
            DeshiMart acts as an agritech platform facilitating direct interaction between independent agricultural producers ("Farmers") and buyers ("Customers").
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-650">
            <li>Farmers are solely responsible for ensuring that produce, seeds, and fertilizers meet certified agricultural safety standards.</li>
            <li>All product prices are quoted in Indian Rupees (INR / ₹) and are inclusive of applicable taxes, unless stated otherwise.</li>
            <li>We reserve the right to correct pricing errors and cancel orders resulting from inadvertent technical or typographical inaccuracies.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Payment Gateway & Financial Processing</h2>
          <p>
            All electronic payments on DeshiMart are processed through RBI-authorized payment aggregators (including <strong>Razorpay</strong> and authorized UPI channels).
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-650">
            <li>You agree to provide valid, authorized payment instruments (Credit Cards, Debit Cards, Netbanking credentials, or UPI VPAs).</li>
            <li>DeshiMart does not capture or store your sensitive payment card details or netbanking passwords on its servers.</li>
            <li>In the event of payment failure where funds are debited, the amount is automatically reconciled and refunded by your issuing bank and payment gateway within standard banking timelines (typically 5 to 7 business days).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">5. AI Farming Assistant Disclaimer</h2>
          <p>
            The DeshiMart AI Farming Assistant provides agricultural information, pest control recommendations (such as organic neem sprays), and crop guidance for educational and assistive purposes only. Users must verify local soil conditions, agrochemical regulations, and weather advisories before making high-value agricultural decisions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by Indian law, DeshiMart and its proprietor shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from the use of the platform, logistics transit delays, or natural crop yield variations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">7. Governing Law & Jurisdiction</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these Terms or the Platform shall be subject to the exclusive jurisdiction of the competent courts in <strong>Kolkata, West Bengal, India</strong>.
          </p>
        </section>

        <section className="space-y-2 pt-2 border-t border-slate-150">
          <h2 className="text-base font-bold text-slate-900">8. Contact Information</h2>
          <p className="text-xs">
            For questions regarding these Terms and Conditions, please contact us at <a href="mailto:support@deshimart.org" className="text-forest-600 underline">support@deshimart.org</a> or visit our <a href="#contact" className="text-forest-600 underline">Contact Us</a> page.
          </p>
        </section>
      </div>
    </div>
  );
}
