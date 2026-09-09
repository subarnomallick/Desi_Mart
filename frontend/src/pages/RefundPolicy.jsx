import React from 'react';
import { RotateCcw, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-4">
        <div className="inline-flex items-center space-x-1.5 bg-forest-50 text-forest-700 px-3 py-1 rounded-full text-xs font-bold mb-2">
          <RotateCcw className="h-4 w-4" />
          <span>Customer Assurance</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Cancellation & Refund Policy</h1>
        <p className="text-slate-500 text-xs mt-1">Last Updated: September 9, 2026</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-slate-700 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Highlight Banner (Required by Razorpay Compliance) */}
        <div className="bg-sage-50 border border-sage-200 rounded-xl p-4 flex items-start space-x-3">
          <Clock className="h-5 w-5 text-forest-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-forest-900">
            <strong className="block text-sm font-bold text-slate-900 mb-0.5">
              Standard Refund Timeline: 5 to 7 Business Days
            </strong>
            Once approved, all refunds are automatically credited back to your original payment method (Credit/Debit Card, Netbanking, or UPI account) through our payment partner, Razorpay.
          </div>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Order Cancellation Policy</h2>
          <p>
            Customers may cancel an order free of charge at any time prior to shipment dispatch:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-650">
            <li><strong>Before Dispatch:</strong> You can cancel your order within <strong>12 hours of placement</strong> or before the seller marks it as dispatched. Full 100% refund will be initiated immediately.</li>
            <li><strong>After Dispatch:</strong> Once orders have been handed over to delivery couriers or regional harvest transit, cancellations cannot be processed. You may, however, request a return upon delivery in accordance with our return guidelines below.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Returns & Replacements Eligibility</h2>
          <p>
            Because DeshiMart offers both fresh agricultural produce and farming equipment, return criteria depend on product category:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                <CheckCircle className="h-4 w-4 text-forest-500" />
                <span>Farming Tools, Equipment & Sealed Seeds</span>
              </h3>
              <p className="text-xs text-slate-600">
                Eligible for return or replacement within <strong>7 days of delivery</strong> if the product is defective, damaged in transit, or significantly different from description. Item must be in unused condition with original packaging.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Fresh Crops, Fruits & Vegetables (Perishables)</span>
              </h3>
              <p className="text-xs text-slate-600">
                Due to perishable nature, returns are not accepted after 24 hours. If items arrive spoiled or damaged, notify us within <strong>24 hours of delivery</strong> with photos for an immediate replacement or full refund.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Refund Process & Settlement</h2>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-650">
            <li>Upon receiving your cancellation or return request, our inspection team verifies the claim within <strong>24 to 48 hours</strong>.</li>
            <li>Once approved, the refund command is issued via the <strong>Razorpay payment gateway</strong>.</li>
            <li>The refund amount will reflect in your bank account, credit card statement, or UPI wallet within <strong>5 to 7 working days</strong>, subject to your issuing bank's settlement cycle.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. How to Request a Cancellation or Refund</h2>
          <p className="text-xs text-slate-700">
            To initiate a return or refund, please reach out to our support team with your <strong>Order ID</strong>:
          </p>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
            <p><strong>Email:</strong> <a href="mailto:support@deshimart.org" className="text-forest-600 underline">support@deshimart.org</a> (Subject: "Refund Request - Order #DM-XXXX")</p>
            <p><strong>Helpline:</strong> +91 98765 43210 (Mon-Sat, 9:00 AM – 6:00 PM IST)</p>
          </div>
        </section>
      </div>
    </div>
  );
}
