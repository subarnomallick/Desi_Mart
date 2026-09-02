import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Key, 
  ShoppingBag, 
  Sprout, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Save, 
  RefreshCw, 
  LogOut, 
  Package, 
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function Profile({ user, setUser, token, setActivePage, onLogout }) {
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'security' | 'activity'
  
  // Profile edit form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // Activity / Orders data
  const [orders, setOrders] = useState([]);
  const [farmerProducts, setFarmerProducts] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  // Fetch orders or products for activity tab
  useEffect(() => {
    if (!token || !user) return;

    async function fetchActivity() {
      setLoadingActivity(true);
      try {
        if (user.role === 'customer') {
          const res = await fetch('/api/orders', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setOrders(data);
          }
        } else if (user.role === 'farmer') {
          const res = await fetch(`/api/products?farmerId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            setFarmerProducts(data);
          }
        }
      } catch (err) {
        console.error('Failed to load activity details:', err);
      } finally {
        setLoadingActivity(false);
      }
    }

    fetchActivity();
  }, [user, token]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: '', text: '' });

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone, address })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update state and localStorage
      setUser(data.user);
      if (data.token) {
        localStorage.setItem('deshimart_token', data.token);
      }
      localStorage.setItem('deshimart_user', JSON.stringify(data.user));

      setProfileMsg({ type: 'success', text: 'Your profile details have been successfully updated!' });
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message });
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-600 mb-4">Please log in to view and manage your profile.</p>
        <button 
          onClick={() => setActivePage('login')}
          className="bg-forest-600 hover:bg-forest-700 text-white font-bold px-6 py-2 rounded-lg"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Get user initials
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'DM';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Profile Card */}
      <div className="bg-gradient-to-r from-forest-700 via-forest-600 to-forest-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <Sprout className="w-80 h-80" />
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 text-center sm:text-left">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-forest-900 border-4 border-forest-400/50 flex items-center justify-center text-3xl font-extrabold text-sage-300 shadow-inner">
              {initials}
            </div>

            {/* User Meta */}
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user.name}</h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  user.role === 'farmer' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                }`}>
                  {user.role === 'farmer' ? '🌾 Verified Farmer' : '🛒 Valued Customer'}
                </span>
              </div>
              <p className="text-forest-200 text-sm flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-4 h-4 text-sage-300" />
                {user.email}
              </p>
              {user.address && (
                <p className="text-forest-200 text-xs flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-sage-300" />
                  {user.address}
                </p>
              )}
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
            {user.role === 'farmer' && (
              <button
                onClick={() => setActivePage('farmer-dashboard')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-sage-500 hover:bg-sage-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-md active:scale-95"
              >
                <Layers className="w-4 h-4" />
                <span>Farmer Panel</span>
              </button>
            )}
            <button
              onClick={onLogout}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 font-semibold px-4 py-2 rounded-xl text-sm transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-forest-500/60 text-center sm:text-left">
          <div className="bg-forest-800/50 backdrop-blur-sm rounded-xl p-3 border border-forest-500/40">
            <span className="text-xs text-forest-300 uppercase font-semibold">Account Status</span>
            <p className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-1 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Active & Verified
            </p>
          </div>

          <div className="bg-forest-800/50 backdrop-blur-sm rounded-xl p-3 border border-forest-500/40">
            <span className="text-xs text-forest-300 uppercase font-semibold">
              {user.role === 'farmer' ? 'Products Listed' : 'Orders Placed'}
            </span>
            <p className="text-sm font-bold text-white mt-0.5">
              {user.role === 'farmer' ? `${farmerProducts.length} Active Items` : `${orders.length} Completed Orders`}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl shadow-sm p-1.5 gap-2">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'details'
              ? 'bg-forest-600 text-white shadow'
              : 'text-slate-600 hover:text-forest-700 hover:bg-forest-50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal Details</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'security'
              ? 'bg-forest-600 text-white shadow'
              : 'text-slate-600 hover:text-forest-700 hover:bg-forest-50'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Security & Password</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'activity'
              ? 'bg-forest-600 text-white shadow'
              : 'text-slate-600 hover:text-forest-700 hover:bg-forest-50'
          }`}
        >
          {user.role === 'farmer' ? <Sprout className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          <span>{user.role === 'farmer' ? 'Farm Inventory' : 'Order History'}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        {/* 1. PERSONAL DETAILS TAB */}
        {activeTab === 'details' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800">Edit Profile Information</h2>
              <p className="text-sm text-slate-500">Update your public contact details, phone number, and address.</p>
            </div>

            {profileMsg.text && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {profileMsg.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500 font-medium text-slate-800"
                    />
                  </div>
                </div>

                {/* Email (Read-Only) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Email Address <span className="text-slate-400 text-xs normal-case">(Managed by account)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 font-medium text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500 font-medium text-slate-800"
                    />
                  </div>
                </div>

                {/* Role (Read-only Badge) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Platform Role
                  </label>
                  <div className="py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 capitalize flex items-center gap-2">
                    {user.role === 'farmer' ? '🌾 Farmer / Producer' : '🛒 Customer / Consumer'}
                  </div>
                </div>
              </div>

              {/* Address / Farm Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {user.role === 'farmer' ? 'Farm / Warehouse Location' : 'Delivery Address'}
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={user.role === 'farmer' ? "e.g. Village Green Acres, Amritsar, Punjab" : "e.g. Flat 402, Green Glen Heights, Bengaluru, Karnataka"}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 bg-forest-600 hover:bg-forest-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md disabled:opacity-50 active:scale-95"
                >
                  {savingProfile ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2. SECURITY & PASSWORD TAB */}
        {activeTab === 'security' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800">Change Account Password</h2>
              <p className="text-sm text-slate-500">Ensure your account uses a strong, secure password.</p>
            </div>

            {passwordMsg.text && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {passwordMsg.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="max-w-lg space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Key className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Key className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Key className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex items-center gap-2 bg-forest-600 hover:bg-forest-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md disabled:opacity-50 active:scale-95"
                >
                  {savingPassword ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3. ACTIVITY & ORDERS / INVENTORY TAB */}
        {activeTab === 'activity' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {user.role === 'farmer' ? 'My Listed Farm Products' : 'My Order History'}
                </h2>
                <p className="text-sm text-slate-500">
                  {user.role === 'farmer'
                    ? 'Review your active listings in the marketplace.'
                    : 'Check your previous purchases and verified payment receipts.'}
                </p>
              </div>

              {user.role === 'farmer' && (
                <button
                  onClick={() => setActivePage('farmer-dashboard')}
                  className="flex items-center gap-1.5 bg-forest-100 hover:bg-forest-200 text-forest-800 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                >
                  <span>Manage Products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {loadingActivity ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-forest-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Loading your activity...</p>
              </div>
            ) : user.role === 'farmer' ? (
              /* Farmer Listings */
              farmerProducts.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <Sprout className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-700">No products published yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    List your fresh crops, certified seeds, or farming tools in the catalog.
                  </p>
                  <button
                    onClick={() => setActivePage('farmer-dashboard')}
                    className="bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    Go to Farmer Dashboard
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {farmerProducts.map((prod) => (
                    <div key={prod.id} className="flex gap-4 p-3.5 rounded-xl border border-slate-200 hover:border-forest-300 transition-colors bg-white">
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        className="w-16 h-16 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-sm text-slate-800 truncate">{prod.name}</h4>
                          <span className="text-xs font-bold text-forest-700 shrink-0">₹{prod.price}</span>
                        </div>
                        <span className="inline-block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                          {prod.category}
                        </span>
                        <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                          <span>Stock: <strong>{prod.stock} units</strong></span>
                          <span className="text-emerald-600 font-semibold">Active</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Customer Orders */
              orders.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-700">No orders placed yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    Explore farm-fresh crops, fertilizers, seeds, and tools in our marketplace.
                  </p>
                  <button
                    onClick={() => setActivePage('catalog')}
                    className="bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    Browse Market Catalog
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div key={ord.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase">Order ID</span>
                          <p className="font-mono text-xs font-bold text-slate-800">#{ord.id.substring(0, 8)}...</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase">Date</span>
                          <p className="text-xs text-slate-700">
                            {new Date(ord.createdAt || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase">Status</span>
                          <div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              ord.payment_status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {ord.payment_status === 'completed' ? '✓ Paid & Verified' : 'Pending Payment'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase">Total Amount</span>
                          <p className="text-sm font-extrabold text-forest-700">₹{ord.total_amount}</p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1">
                        {ord.items && ord.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-slate-600">
                            <span>{item.quantity}x {item.product_name}</span>
                            <span className="font-semibold">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {ord.upi_txn_id && (
                        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200/60 font-mono">
                          UPI Ref: {ord.upi_txn_id}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
