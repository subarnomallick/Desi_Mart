import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Trash2, 
  Sprout, 
  Landmark, 
  DollarSign, 
  Package, 
  Image, 
  AlertCircle, 
  CheckCircle,
  Clock,
  CheckCircle2,
  Wallet,
  Save,
  Building2,
  Smartphone,
  Info,
  Layers,
  ArrowDownRight
} from 'lucide-react';

export default function FarmerDashboard({ token, user }) {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'payouts'
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states for adding product
  const [name, setName] = useState('');
  const [category, setCategory] = useState('crops');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Payout states
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [payoutSummary, setPayoutSummary] = useState({
    grossSales: 0,
    totalCommission: 0,
    netEarnings: 0,
    settledAmount: 0,
    pendingAmount: 0,
    totalOrders: 0
  });
  const [payoutOrders, setPayoutOrders] = useState([]);
  const [upiId, setUpiId] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankSaveLoading, setBankSaveLoading] = useState(false);
  const [bankMsg, setBankMsg] = useState({ type: '', text: '' });

  // Preset image library
  const imagePresets = [
    { label: '🌾 Grains/Rice', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400' },
    { label: '🍅 Tomatoes', url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400' },
    { label: '🥔 Potatoes', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400' },
    { label: '🍂 Fertilizer', url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=400' },
    { label: '🛠️ Tools/Sickle', url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=400' },
    { label: '🥕 Carrots', url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=400' }
  ];

  const fetchMyProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?farmerId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setMyProducts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayouts = async () => {
    setPayoutsLoading(true);
    try {
      const res = await fetch('/api/farmers/payouts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPayoutSummary(data.summary || {});
        setPayoutOrders(data.orders || []);
        if (data.payoutDetails) {
          setUpiId(data.payoutDetails.upi_id || '');
          setBankName(data.payoutDetails.bank_name || '');
          setAccountNumber(data.payoutDetails.account_number || '');
          setIfscCode(data.payoutDetails.ifsc_code || '');
          setAccountHolderName(data.payoutDetails.account_holder_name || user.name || '');
        }
      }
    } catch (e) {
      console.error('Failed to load farmer payouts:', e);
    } finally {
      setPayoutsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
    fetchPayouts();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMsg('');

    if (!name || !price || !stock) {
      setSubmitError('Product name, price, and stock are required');
      return;
    }

    try {
      const finalImageUrl = imageUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400';
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          category,
          price: parseFloat(price),
          stock: parseInt(stock),
          description,
          imageUrl: finalImageUrl
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Product added successfully!');
        setName('');
        setCategory('crops');
        setPrice('');
        setStock('');
        setDescription('');
        setImageUrl('');
        fetchMyProducts();
      } else {
        setSubmitError(data.error || 'Failed to add product');
      }
    } catch (err) {
      setSubmitError('Network error adding product. Check backend connection.');
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`/api/products/${prodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchMyProducts();
      } else {
        alert('Failed to delete product listing');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveBankDetails = async (e) => {
    e.preventDefault();
    setBankSaveLoading(true);
    setBankMsg({ type: '', text: '' });

    try {
      const res = await fetch('/api/farmers/payout-details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          upi_id: upiId,
          bank_name: bankName,
          account_number: accountNumber,
          ifsc_code: ifscCode,
          account_holder_name: accountHolderName
        })
      });

      const resData = await res.json();
      if (res.ok) {
        setBankMsg({ type: 'success', text: 'Payout bank & UPI details saved successfully!' });
        setTimeout(() => setBankMsg({ type: '', text: '' }), 4000);
      } else {
        setBankMsg({ type: 'error', text: resData.error || 'Failed to save payout details' });
      }
    } catch (err) {
      setBankMsg({ type: 'error', text: 'Network error saving bank details' });
    } finally {
      setBankSaveLoading(false);
    }
  };

  const totalStock = myProducts.reduce((sum, p) => sum + p.stock, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header with Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Farmer Control Center</h1>
          <p className="text-slate-500 text-sm mt-1">Manage farm produce listings, track direct sales, and monitor bank payouts</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
              activeTab === 'products'
                ? 'bg-white text-forest-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Produce & Stock ({myProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
              activeTab === 'payouts'
                ? 'bg-white text-forest-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Landmark className="h-4 w-4" />
            <span>Earnings & Payouts</span>
            {payoutSummary.pendingAmount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: PRODUCTS & INVENTORY */}
      {activeTab === 'products' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
              <div className="bg-forest-50 p-4 rounded-xl text-forest-650">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Listings</p>
                <p className="text-2xl font-black text-slate-950 mt-1">{myProducts.length}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
              <div className="bg-sage-100 p-4 rounded-xl text-forest-650">
                <Sprout className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Items Stocked</p>
                <p className="text-2xl font-black text-slate-950 mt-1">{totalStock} units</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
              <div className="bg-emerald-50 p-4 rounded-xl text-emerald-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Net Sales Earnings</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">₹{payoutSummary.netEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Action Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 1. Add Product Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
              <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center space-x-1.5">
                <PlusCircle className="h-5 w-5 text-forest-500" />
                <span>Publish New Produce</span>
              </h2>

              {submitError && (
                <div className="bg-red-50 text-red-800 p-3 rounded-lg text-xs font-semibold flex items-center space-x-1.5 mb-4 border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-650 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {successMsg && (
                <div className="bg-green-50 text-green-800 p-3 rounded-lg text-xs font-semibold flex items-center space-x-1.5 mb-4 border border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-650 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Produce Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Organic Basmati Rice"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white transition-colors"
                    >
                      <option value="crops">Crops</option>
                      <option value="vegetables">Vegetables</option>
                      <option value="fruits">Fruits</option>
                      <option value="seeds">Seeds</option>
                      <option value="fertilizers">Fertilizers</option>
                      <option value="tools">Tools</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 95"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Available Stock (Units / Kg)</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Harvest & Origin Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe freshness, harvesting date, organic methods..."
                    rows="3"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white transition-colors"
                  />
                </div>

                {/* Quick Image Presets */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 flex items-center space-x-1">
                    <Image className="h-3.5 w-3.5" />
                    <span>Product Image URL</span>
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/crop.jpg"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white transition-colors mb-2"
                  />
                  <div className="flex flex-wrap gap-1">
                    {imagePresets.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                          imageUrl === preset.url
                            ? 'bg-forest-500 border-forest-500 text-white'
                            : 'bg-slate-50 border-slate-250 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-forest-500 hover:bg-forest-600 text-white font-bold py-2 rounded-xl text-xs shadow-sm hover:shadow transition-all"
                >
                  Publish Produce Listing
                </button>
              </form>
            </div>

            {/* 2. Active Listings Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
              <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center space-x-1.5">
                <Sprout className="h-5 w-5 text-forest-500" />
                <span>My Active Listings</span>
              </h2>

              {loading ? (
                <p className="text-slate-500 text-xs py-10 text-center">Loading listings...</p>
              ) : myProducts.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Package className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500 text-xs font-semibold">No active produce listings</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">Use the form to list your crops, seeds or fertilizers.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Image</th>
                        <th className="pb-3 font-semibold">Product Name</th>
                        <th className="pb-3 font-semibold">Category</th>
                        <th className="pb-3 font-semibold text-right">Price</th>
                        <th className="pb-3 font-semibold text-right">Stock</th>
                        <th className="pb-3 font-semibold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {myProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3">
                            <img 
                              src={prod.image_url} 
                              alt={prod.name} 
                              className="h-10 w-12 object-cover rounded-md border border-slate-200"
                            />
                          </td>
                          <td className="py-3 font-bold text-slate-800">{prod.name}</td>
                          <td className="py-3 capitalize text-slate-500 font-semibold">{prod.category}</td>
                          <td className="py-3 text-right font-bold text-forest-500">₹{prod.price.toFixed(2)}</td>
                          <td className="py-3 text-right text-slate-600 font-semibold">{prod.stock} units</td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                              title="Delete Listing"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EARNINGS & PAYOUTS */}
      {activeTab === 'payouts' && (
        <div className="space-y-8">
          
          {/* Transparent Settlement Notice */}
          <div className="bg-forest-50 border border-forest-150 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-2 bg-forest-100 text-forest-700 rounded-xl">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-forest-900">How Direct Farmer Payouts Work on DeshiMart</h3>
                <p className="text-xs text-forest-800/90 mt-1 max-w-2xl leading-relaxed">
                  When customers pay through Razorpay/UPI, funds arrive in the platform escrow. DeshiMart automatically reserves your <strong>95% net sales proportion</strong> (deducting a flat 5% technology & maintenance fee) and transfers it directly into your linked UPI ID or Bank Account.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-white text-forest-700 font-extrabold text-xs px-3 py-1.5 rounded-xl border border-forest-200 shadow-2xs">
                Your Share: 95% of Sales
              </span>
            </div>
          </div>

          {/* Financial Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Gross Sales */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Gross Produce Sold</span>
              <div className="text-2xl font-black text-slate-900 mt-2">
                ₹{payoutSummary.grossSales.toFixed(2)}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{payoutSummary.totalOrders} order item(s)</p>
            </div>

            {/* Platform Fee */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Platform Fee (5%)</span>
              <div className="text-2xl font-black text-slate-600 mt-2">
                -₹{payoutSummary.totalCommission.toFixed(2)}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Hosting, Razorpay & Tech maintenance</p>
            </div>

            {/* Settled in Bank */}
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
              <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">Transferred to Your Bank</span>
              <div className="text-2xl font-black text-emerald-600 mt-2">
                ₹{payoutSummary.settledAmount.toFixed(2)}
              </div>
              <p className="text-[10px] text-emerald-800/80 mt-1">Disbursed with bank UTR proof</p>
            </div>

            {/* Pending Payout */}
            <div className="bg-white p-5 rounded-2xl border border-amber-100 bg-amber-50/20 shadow-sm">
              <span className="text-[11px] text-amber-700 font-bold uppercase tracking-wider">Pending Transfer</span>
              <div className="text-2xl font-black text-amber-700 mt-2">
                ₹{payoutSummary.pendingAmount.toFixed(2)}
              </div>
              <p className="text-[10px] text-amber-800/80 mt-1">Processing for next bank cycle</p>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Bank / UPI Setup Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                  <Landmark className="h-5 w-5 text-forest-600" />
                  <span>My Payout Account Details</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Platform owner transfers your 95% share to these details.
                </p>
              </div>

              {bankMsg.text && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                  bankMsg.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {bankMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
                  <span>{bankMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveBankDetails} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center space-x-1">
                    <Smartphone className="h-3 w-3 text-forest-500" />
                    <span>UPI ID (Primary for Instant Transfers)</span>
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourname@okhdfcbank / yourphone@upi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center space-x-1">
                    <Building2 className="h-3 w-3 text-forest-500" />
                    <span>Bank Name & Branch</span>
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. State Bank of India, Amritsar"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="e.g. Harpreet Singh"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 50100482910"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="e.g. HDFC0001234"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bankSaveLoading}
                  className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold py-2 rounded-xl text-xs shadow-sm hover:shadow transition-all flex items-center justify-center space-x-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{bankSaveLoading ? 'Saving Details...' : 'Save Bank / UPI Details'}</span>
                </button>
              </form>
            </div>

            {/* Payout Ledger Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-forest-600" />
                <span>Payout & Order Settlement Ledger</span>
              </h3>

              {payoutsLoading ? (
                <p className="text-slate-400 text-xs py-12 text-center">Loading ledger...</p>
              ) : payoutOrders.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Landmark className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600 text-xs font-bold">No order settlements yet</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">When customers purchase your produce, each order's split will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="pb-3">Order ID & Date</th>
                        <th className="pb-3 text-right">Gross Sold</th>
                        <th className="pb-3 text-right">5% Platform Fee</th>
                        <th className="pb-3 text-right">Net Share (95%)</th>
                        <th className="pb-3 text-center">Status & Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payoutOrders.map((ord, i) => (
                        <tr key={`${ord.orderId}-${i}`} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5">
                            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              #{ord.orderId.slice(-8)}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(ord.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="text-[10px] text-slate-500">Customer: {ord.customerName}</div>
                          </td>
                          <td className="py-3.5 text-right font-semibold text-slate-700">
                            ₹{ord.itemsAmount.toFixed(2)}
                          </td>
                          <td className="py-3.5 text-right font-semibold text-slate-400">
                            -₹{ord.commissionAmount.toFixed(2)}
                          </td>
                          <td className="py-3.5 text-right font-black text-forest-700 text-sm">
                            ₹{ord.netPayout.toFixed(2)}
                          </td>
                          <td className="py-3.5 text-center">
                            {ord.payoutStatus === 'settled' ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Received in Bank</span>
                                </span>
                                {ord.payoutRef && (
                                  <span className="font-mono text-[9px] text-slate-400 mt-0.5">
                                    Ref: {ord.payoutRef}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="bg-amber-50 text-amber-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-amber-200 flex items-center space-x-1 w-fit mx-auto">
                                <Clock className="h-3 w-3" />
                                <span>Pending Transfer</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
