import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Search, Filter, RefreshCw, Slash } from 'lucide-react';

export default function Catalog({ onAddToCart, user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'crops', label: 'Crops' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'seeds', label: 'Seeds' },
    { value: 'fertilizers', label: 'Fertilizers' },
    { value: 'tools', label: 'Tools' }
  ];

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/api/products';
      if (selectedCategory !== 'all') {
        url += `?category=${selectedCategory}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch catalog products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError('Could not load products. Please check if the server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.description?.toLowerCase().includes(search.toLowerCase()) ||
                          p.farmer_name?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Agri Marketplace</h1>
          <p className="text-slate-500 text-sm mt-1">Direct buy farming supplies and fresh organic crops</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crop, seeds, or farmer..."
            className="w-full bg-white text-sm border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-forest-400 transition-shadow shadow-sm"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Category Selection Filter Tabs */}
      <div className="flex overflow-x-auto space-x-2 pb-2 custom-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border whitespace-nowrap transition-all shadow-sm ${
              selectedCategory === cat.value
                ? 'bg-forest-500 border-forest-500 text-white hover:bg-forest-600'
                : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Grid Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="h-8 w-8 text-forest-500 animate-spin" />
          <p className="text-slate-500 text-sm font-semibold">Fetching marketplace items...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-5 text-center shadow-sm">
          <p className="font-semibold">{error}</p>
          <button 
            onClick={fetchProducts}
            className="mt-3 bg-red-600 hover:bg-red-750 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center space-y-4">
          <div className="bg-slate-50 p-4 rounded-full h-16 w-16 mx-auto flex items-center justify-center text-slate-400">
            <Filter className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">No products found</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
              We couldn't find any products matching your search or category choice.
            </p>
          </div>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('all'); }}
            className="bg-forest-500 hover:bg-forest-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition-all"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  );
}
