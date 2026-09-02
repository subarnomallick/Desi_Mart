import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Sprout, Landmark, DollarSign, Package, Image, AlertCircle, CheckCircle } from 'lucide-react';

export default function FarmerDashboard({ token, user }) {
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('crops');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

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

  useEffect(() => {
    fetchMyProducts();
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
        // Reset form
        setName('');
        setCategory('crops');
        setPrice('');
        setStock('');
        setDescription('');
        setImageUrl('');
        // Refresh products list
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

  // Mock dashboard calculations
  const totalStock = myProducts.reduce((sum, p) => sum + p.stock, 0);
  const totalRevenueMock = myProducts.length * 1230; 

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Farmer Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your direct agricultural sales and listings</p>
      </div>

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
          <div className="bg-terracotta-50 p-4 rounded-xl text-terracotta-600">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Estimated Revenue</p>
            <p className="text-2xl font-black text-slate-950 mt-1">₹{totalRevenueMock.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Action Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 1. Add Product Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center space-x-1.5">
            <PlusCircle className="h-5 w-5 text-forest-500" />
            <span>Publish New Product</span>
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
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Product Title</label>
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
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Available Stock</label>
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
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe freshness, origin, harvesting methods..."
                rows="3"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white transition-colors"
              />
            </div>

            {/* Quick Image Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 flex items-center space-x-1">
                <Image className="h-3.5 w-3.5" />
                <span>Product Image URL (Select below or paste)</span>
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
              Publish Product Listing
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
              <p className="text-slate-500 text-xs font-semibold">No active product listings</p>
              <p className="text-slate-400 text-[10px] mt-0.5">Use the form to list your crops, seeds or tools.</p>
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
  );
}
