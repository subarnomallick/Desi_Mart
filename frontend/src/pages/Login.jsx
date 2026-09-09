import React, { useState } from 'react';
import { Sprout, ShoppingBag, Lock, Mail, User, Phone, MapPin, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login({ setToken, setUser, setActivePage }) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' or 'farmer'
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin 
      ? { email, password } 
      : { name, email, password, role, address, phone };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (res.ok) {
        // Save to state
        setToken(data.token);
        setUser(data.user);
        
        // Save to localStorage for persistence
        localStorage.setItem('deshimart_token', data.token);
        localStorage.setItem('deshimart_user', JSON.stringify(data.user));

        // Navigate based on role
        if (data.user.role === 'admin') {
          setActivePage('admin-payouts');
        } else if (data.user.role === 'farmer') {
          setActivePage('farmer-dashboard');
        } else {
          setActivePage('catalog');
        }
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Connection failure. Check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        
        {/* Toggle tabs */}
        <div className="grid grid-cols-2 text-center border-b border-slate-100">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`py-4 font-bold text-sm transition-colors ${
              isLogin 
                ? 'text-forest-500 border-b-2 border-forest-500 bg-forest-50/20' 
                : 'text-slate-400 hover:text-slate-600 bg-slate-50/50'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`py-4 font-bold text-sm transition-colors ${
              !isLogin 
                ? 'text-forest-500 border-b-2 border-forest-500 bg-forest-50/20' 
                : 'text-slate-400 hover:text-slate-600 bg-slate-50/50'
            }`}
          >
            Register Profile
          </button>
        </div>

        {/* Form panel */}
        <div className="p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-slate-900">
              {isLogin ? 'Welcome Back!' : 'Create Agriculture Account'}
            </h2>
            <p className="text-slate-500 text-xs font-medium">
              {isLogin ? 'Sign in to access catalog & buy products' : 'Join DeshiMart to buy and upload products'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border border-red-200">
              <AlertCircle className="h-4.5 w-4.5 text-red-650 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* REGISTER ONLY FIELDS */}
            {!isLogin && (
              <>
                {/* Role selection blocks */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    I want to join as a:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('customer')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border font-bold text-xs transition-all ${
                        role === 'customer'
                          ? 'border-forest-500 bg-forest-50/40 text-forest-650 ring-2 ring-forest-500/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <ShoppingBag className="h-5 w-5 mb-1 text-sage-500" />
                      <span>Customer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('farmer')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border font-bold text-xs transition-all ${
                        role === 'farmer'
                          ? 'border-forest-500 bg-forest-50/40 text-forest-650 ring-2 ring-forest-500/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Sprout className="h-5 w-5 mb-1 text-forest-500" />
                      <span>Farmer</span>
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Devendra Sharma"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white transition-all"
                      required={!isLogin}
                    />
                    <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white transition-all"
                  required
                />
                <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white transition-all"
                  required
                />
                <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* REGISTER PROFILE ONLY OPTIONALS */}
            {!isLogin && (
              <>
                <div className="grid grid-cols-1 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 9876543210"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white transition-all"
                      />
                      <Phone className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Shipping / Farm Address</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. Village Rampur, District Karnal"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white transition-all"
                      />
                      <MapPin className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest-500 hover:bg-forest-600 disabled:bg-slate-300 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm hover:shadow transition-all flex items-center justify-center space-x-1"
            >
              <span>{loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Quick One-Click Demo Logins */}
            <div className="pt-4 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
                ⚡ Quick Demo Accounts (1-Click Fill)
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('customer@deshimart.com');
                    setPassword('customer123');
                    setIsLogin(true);
                  }}
                  className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-forest-50 hover:border-forest-300 text-left transition-all group"
                  title="Aarav Sharma (Customer)"
                >
                  <div className="text-[11px] font-black text-slate-800 group-hover:text-forest-700">🛒 Customer</div>
                  <div className="text-[9px] text-slate-400">Buyer Account</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('harpreet@deshimart.com');
                    setPassword('farmer123');
                    setIsLogin(true);
                  }}
                  className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-forest-50 hover:border-forest-300 text-left transition-all group"
                  title="Harpreet Singh (Farmer)"
                >
                  <div className="text-[11px] font-black text-slate-800 group-hover:text-forest-700">🌾 Farmer</div>
                  <div className="text-[9px] text-slate-400">Seller Account</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@deshimart.com');
                    setPassword('admin123');
                    setIsLogin(true);
                  }}
                  className="p-2 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-100 hover:border-amber-400 text-left transition-all group"
                  title="Subarno Mallick (Platform Owner)"
                >
                  <div className="text-[11px] font-black text-amber-900 group-hover:text-amber-950">👑 Admin</div>
                  <div className="text-[9px] text-amber-700">Owner / Escrow</div>
                </button>
              </div>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
