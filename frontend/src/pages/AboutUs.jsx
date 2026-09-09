import React from 'react';
import { Sprout, ShieldCheck, HeartHandshake, Users, Award, MapPin, Mail, Phone } from 'lucide-react';

export default function AboutUs({ setActivePage }) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-forest-500 to-forest-650 text-white rounded-3xl p-8 sm:p-12 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-forest-600/80 border border-forest-400/50 px-3 py-1 rounded-full text-xs font-semibold text-sage-200">
            <Sprout className="h-4 w-4" />
            <span>Direct Farm-to-Consumer Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">About DeshiMart</h1>
          <p className="text-forest-100 text-sm sm:text-base leading-relaxed">
            DeshiMart is an agricultural e-commerce marketplace dedicated to empowering local farmers by providing them a direct digital channel to sell their fresh crops, certified seeds, organic bio-fertilizers, and farming equipment directly to consumers.
          </p>
        </div>
      </div>

      {/* Business Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="bg-forest-50 w-12 h-12 rounded-xl flex items-center justify-center text-forest-600">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Zero Middlemen</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            By eliminating unnecessary brokers and intermediaries, our farmers receive fair remuneration for their hard work, and buyers get the freshest farm harvest at honest prices.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="bg-sage-50 w-12 h-12 rounded-xl flex items-center justify-center text-forest-600">
            <Award className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Quality & Purity</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Every product listed—from organic Basmati rice and fresh garden vegetables to bio-composts and farming sickles—undergoes quality inspection and transparent origin labeling.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="bg-amber-50 w-12 h-12 rounded-xl flex items-center justify-center text-amber-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Secure Transactions</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            We partner with RBI-authorized payment gateways like Razorpay and secure instant UPI channels, guaranteeing 100% encryption and consumer purchase protection.
          </p>
        </div>
      </div>

      {/* Legal Entity & Operational Disclosure (Required by Razorpay Compliance) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
          Merchant & Legal Entity Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-700">
          <div>
            <span className="font-semibold text-slate-500 uppercase text-xs block mb-1">Business / Brand Name</span>
            <p className="font-bold text-slate-900 text-base">DeshiMart</p>
          </div>
          <div>
            <span className="font-semibold text-slate-500 uppercase text-xs block mb-1">Entity Type / Proprietor</span>
            <p className="font-bold text-slate-900 text-base">Subarno Mallick (Sole Proprietorship)</p>
          </div>
          <div>
            <span className="font-semibold text-slate-500 uppercase text-xs block mb-1">Operating Location</span>
            <p className="text-slate-800 flex items-start space-x-1.5 mt-0.5">
              <MapPin className="h-4 w-4 text-forest-500 flex-shrink-0 mt-0.5" />
              <span>Kolkata, West Bengal – 700001, India</span>
            </p>
          </div>
          <div>
            <span className="font-semibold text-slate-500 uppercase text-xs block mb-1">Customer Care Contacts</span>
            <p className="text-slate-800 flex items-center space-x-1.5 mt-0.5">
              <Mail className="h-4 w-4 text-forest-500 flex-shrink-0" />
              <span>support@deshimart.org</span>
            </p>
            <p className="text-slate-800 flex items-center space-x-1.5 mt-1">
              <Phone className="h-4 w-4 text-forest-500 flex-shrink-0" />
              <span>+91 98765 43210</span>
            </p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center pt-4">
        <button
          onClick={() => setActivePage('catalog')}
          className="bg-forest-500 hover:bg-forest-600 text-white font-bold px-8 py-3.5 rounded-xl shadow transition-all text-sm"
        >
          Explore Farmers Marketplace
        </button>
      </div>
    </div>
  );
}
