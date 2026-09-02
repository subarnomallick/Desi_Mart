import React from 'react';
import { ShoppingCart, User, Check, AlertCircle } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, user }) {
  const isOutOfStock = product.stock <= 0;
  
  // Tag styling helper
  const getCategoryBadge = (category) => {
    const styles = {
      crops: 'bg-green-100 text-green-800 border-green-200',
      vegetables: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      fruits: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      seeds: 'bg-sage-200 text-forest-700 border-sage-300',
      fertilizers: 'bg-amber-100 text-amber-800 border-amber-200',
      tools: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return styles[category] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
      {/* Product Image */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400';
          }}
        />
        {/* Category Badge */}
        <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full border shadow-sm capitalize ${getCategoryBadge(product.category)}`}>
          {product.category}
        </span>
      </div>

      {/* Product Info */}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-bold text-lg text-slate-900 group-hover:text-forest-500 transition-colors line-clamp-1">
          {product.name}
        </h3>
        
        {/* Farmer Info */}
        <div className="flex items-center text-xs text-slate-500 mt-1 mb-2">
          <User className="h-3 w-3 mr-1" />
          <span>Seller: <strong className="font-semibold">{product.farmer_name || 'DeshiMart'}</strong></span>
        </div>

        <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-grow">
          {product.description || 'No description provided.'}
        </p>

        <div className="flex items-center justify-between mt-auto">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Price</span>
            <span className="font-extrabold text-xl text-forest-500">₹{product.price.toFixed(2)}</span>
          </div>

          {/* Stock */}
          <div className="text-right">
            {isOutOfStock ? (
              <span className="text-red-500 flex items-center text-xs font-bold bg-red-50 px-2 py-1 rounded-md">
                <AlertCircle className="h-3 w-3 mr-1" /> Out of stock
              </span>
            ) : (
              <span className="text-forest-600 flex items-center text-xs font-semibold bg-forest-50 px-2 py-1 rounded-md">
                <Check className="h-3 w-3 mr-1" /> {product.stock} left
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0">
        <button
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock || (user && user.role === 'farmer' && product.farmer_id === user.id)}
          className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm shadow-sm transition-all flex items-center justify-center space-x-1.5 ${
            isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
              : user && user.role === 'farmer' && product.farmer_id === user.id
              ? 'bg-slate-100 text-slate-500 cursor-not-allowed shadow-none'
              : 'bg-forest-500 hover:bg-forest-600 text-white hover:shadow'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>
            {isOutOfStock 
              ? 'Unavailable' 
              : user && user.role === 'farmer' && product.farmer_id === user.id
              ? 'Your Listing' 
              : 'Add to Cart'}
          </span>
        </button>
      </div>
    </div>
  );
}
