import React from 'react';
import { Sprout, ShieldCheck, Cpu, ArrowRight, UserPlus, ShoppingBag } from 'lucide-react';

export default function Home({ setActivePage, user }) {
  const categories = [
    { name: 'Direct Farm Crops', desc: 'Fresh harvest straight from agricultural lands.', tag: 'crops', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400' },
    { name: 'High Yield Seeds', desc: 'Certified seeds for vegetables, grains and fruits.', tag: 'seeds', image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400' },
    { name: 'Organic Fertilizers', desc: 'Bio-composts and nutrients to support soil health.', tag: 'fertilizers', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=400' },
    { name: 'Farming Equipment', desc: 'Industrial and manual harvesting tools.', tag: 'tools', image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=400' }
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner Section */}
      <div className="relative bg-forest-500 text-white py-20 px-6 sm:px-12 rounded-3xl overflow-hidden shadow-lg mx-4 mt-6">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500937386664-56d159062255?auto=format&fit=crop&q=80&w=800')" }}></div>
        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 bg-forest-600 border border-forest-400 px-3.5 py-1.5 rounded-full text-xs font-semibold">
            <Sprout className="h-4 w-4 text-sage-400 animate-pulse" />
            <span className="text-sage-100 uppercase tracking-wider">Direct Agri-Link</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
            Connecting Farmers directly with Consumers.
          </h1>
          <p className="text-forest-100 text-base sm:text-lg max-w-xl font-medium leading-relaxed">
            Upload your harvests directly as a farmer, or browse seeds, fertilizers, crops and equipment as a customer. Built-in secure UPI payments and farming expert AI assistant.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => setActivePage('catalog')}
              className="bg-sage-500 hover:bg-sage-600 text-white font-bold px-6 py-3 rounded-xl shadow transition-colors flex items-center space-x-2 text-sm sm:text-base group"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            {!user && (
              <button
                onClick={() => setActivePage('login')}
                className="bg-forest-600 hover:bg-forest-700 border border-forest-400 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm sm:text-base"
              >
                Join as Farmer / User
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feature List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start space-x-4">
          <div className="bg-forest-50 p-3 rounded-xl text-forest-500">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Direct From Farms</h3>
            <p className="text-slate-600 text-sm mt-1 leading-relaxed">
              Eliminate middlemen fees. Farmers enjoy maximum profits, and buyers receive the freshest produce.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start space-x-4">
          <div className="bg-sage-100 p-3 rounded-xl text-forest-500">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">UPI Pay Protection</h3>
            <p className="text-slate-600 text-sm mt-1 leading-relaxed">
              Complete payments seamlessly via UPI QR code scans. Direct transaction validation and ledger logging.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start space-x-4">
          <div className="bg-terracotta-50 p-3 rounded-xl text-terracotta-600">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">AI Farming Assistant</h3>
            <p className="text-slate-600 text-sm mt-1 leading-relaxed">
              Ask our smart AI helper farming queries about crops, pests, sowing dates, soil nutrition, or marketplace guidelines.
            </p>
          </div>
        </div>
      </div>

      {/* Product Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Featured Categories</h2>
            <p className="text-slate-500 text-sm mt-1">Browse specific farming and grocery items</p>
          </div>
          <button 
            onClick={() => setActivePage('catalog')}
            className="text-forest-500 hover:text-forest-600 font-bold text-sm flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full"
            >
              <div className="h-40 overflow-hidden relative">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{cat.name}</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">{cat.desc}</p>
                </div>
                <button
                  onClick={() => setActivePage('catalog')}
                  className="mt-4 text-xs font-bold text-forest-500 hover:text-forest-600 flex items-center space-x-1 group"
                >
                  <span>Shop now</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
