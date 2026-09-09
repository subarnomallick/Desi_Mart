import React from 'react';
import { Leaf, ShieldCheck, Mail, Phone, MapPin, Clock, Lock, CreditCard } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer className="bg-forest-900 text-forest-100 border-t border-forest-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Brand & Legal Entity */}
          <div className="space-y-3">
            <div 
              onClick={() => { setActivePage('home'); window.scrollTo(0, 0); }}
              className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <Leaf className="h-7 w-7 text-sage-500 fill-sage-500" />
              <span className="font-extrabold text-2xl text-white tracking-tight">Deshi<span className="text-sage-400">Mart</span></span>
            </div>
            <p className="text-xs text-forest-200 leading-relaxed">
              Empowering local Indian farmers by bridging the gap to consumers. Direct farm-fresh produce, certified seeds, bio-fertilizers, and equipment.
            </p>
            <div className="text-[11px] text-forest-300/80 pt-1">
              <span className="font-semibold text-forest-200">Legal Entity: </span>
              DeshiMart (Proprietorship: Subarno Mallick)
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs text-forest-200">
              <li>
                <button 
                  onClick={() => { setActivePage('home'); window.scrollTo(0, 0); }}
                  className="hover:text-sage-300 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActivePage('catalog'); window.scrollTo(0, 0); }}
                  className="hover:text-sage-300 transition-colors"
                >
                  Agri Marketplace
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActivePage('cart'); window.scrollTo(0, 0); }}
                  className="hover:text-sage-300 transition-colors"
                >
                  Shopping Basket
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActivePage('about-us'); window.scrollTo(0, 0); }}
                  className="hover:text-sage-300 transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActivePage('contact-us'); window.scrollTo(0, 0); }}
                  className="hover:text-sage-300 transition-colors"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Mandatory Razorpay Legal Policies */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">Policies & Legal</h4>
            <ul className="space-y-2 text-xs text-forest-200">
              <li>
                <button 
                  onClick={() => { setActivePage('terms-conditions'); window.scrollTo(0, 0); }}
                  className="hover:text-sage-300 transition-colors text-left"
                >
                  Terms and Conditions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActivePage('privacy-policy'); window.scrollTo(0, 0); }}
                  className="hover:text-sage-300 transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActivePage('refund-policy'); window.scrollTo(0, 0); }}
                  className="hover:text-sage-300 transition-colors text-left"
                >
                  Cancellation & Refund Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActivePage('shipping-policy'); window.scrollTo(0, 0); }}
                  className="hover:text-sage-300 transition-colors text-left"
                >
                  Shipping & Delivery Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact, Grievance & Operating Hours */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">Customer Care</h4>
            <div className="space-y-2 text-xs text-forest-200">
              <p className="flex items-start space-x-1.5">
                <MapPin className="h-4 w-4 text-sage-400 flex-shrink-0 mt-0.5" />
                <span>Kolkata, West Bengal – 700001, India</span>
              </p>
              <p className="flex items-center space-x-1.5">
                <Mail className="h-4 w-4 text-sage-400 flex-shrink-0" />
                <a href="mailto:support@deshimart.org" className="hover:underline">support@deshimart.org</a>
              </p>
              <p className="flex items-center space-x-1.5">
                <Phone className="h-4 w-4 text-sage-400 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </p>
              <p className="flex items-center space-x-1.5 text-[11px] text-forest-300 pt-1">
                <Clock className="h-3.5 w-3.5 text-sage-400 flex-shrink-0" />
                <span>Mon – Sat: 9:00 AM – 6:00 PM IST</span>
              </p>
            </div>
          </div>

        </div>

        {/* Security & Payment Badges (Required for Razorpay Compliance) */}
        <div className="border-t border-forest-800 mt-10 pt-6 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-forest-300">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center space-x-1.5 bg-forest-800/80 px-3 py-1 rounded-lg border border-forest-700">
              <ShieldCheck className="h-4 w-4 text-sage-400" />
              <span className="font-semibold text-white text-[11px]">100% Secure Payments via Razorpay</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-forest-800/80 px-3 py-1 rounded-lg border border-forest-700 text-[11px] font-semibold text-white">
              <Lock className="h-3.5 w-3.5 text-sage-400" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <span className="text-[11px] text-forest-400">Accepted: Cards, UPI, Netbanking</span>
          </div>

          <p className="text-center lg:text-right text-[11px]">
            © {new Date().getFullYear()} DeshiMart (Proprietorship: Subarno Mallick). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
