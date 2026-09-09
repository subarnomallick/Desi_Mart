import React from 'react';
import { ShoppingCart, LogOut, User, Leaf, LayoutDashboard, UserCheck } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, cart, user, onLogout }) {
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-forest-500 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div 
            onClick={() => setActivePage('home')} 
            className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Leaf className="h-8 w-8 text-sage-500 fill-sage-500" />
            <span className="font-extrabold text-2xl tracking-tight">Deshi<span className="text-sage-300">Mart</span></span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-4 lg:space-x-6 items-center">
            <button 
              onClick={() => setActivePage('home')}
              className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                activePage === 'home' ? 'bg-forest-600 text-white' : 'text-forest-100 hover:text-white hover:bg-forest-600'
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => setActivePage('catalog')}
              className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                activePage === 'catalog' ? 'bg-forest-600 text-white' : 'text-forest-100 hover:text-white hover:bg-forest-600'
              }`}
            >
              Market Catalog
            </button>
            
            {user && user.role === 'farmer' && (
              <button 
                onClick={() => setActivePage('farmer-dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-semibold flex items-center space-x-1.5 transition-colors ${
                  activePage === 'farmer-dashboard' ? 'bg-forest-600 text-white' : 'text-forest-100 hover:text-white hover:bg-forest-600'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Farmer Panel</span>
              </button>
            )}

            {user && (
              <button 
                onClick={() => setActivePage('profile')}
                className={`px-3 py-2 rounded-md text-sm font-semibold flex items-center space-x-1.5 transition-colors ${
                  activePage === 'profile' ? 'bg-forest-600 text-white' : 'text-forest-100 hover:text-white hover:bg-forest-600'
                }`}
              >
                <UserCheck className="h-4 w-4" />
                <span>My Profile</span>
              </button>
            )}

            <button 
              onClick={() => setActivePage('about-us')}
              className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                activePage === 'about-us' ? 'bg-forest-600 text-white' : 'text-forest-100 hover:text-white hover:bg-forest-600'
              }`}
            >
              About
            </button>

            <button 
              onClick={() => setActivePage('contact-us')}
              className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                activePage === 'contact-us' ? 'bg-forest-600 text-white' : 'text-forest-100 hover:text-white hover:bg-forest-600'
              }`}
            >
              Contact
            </button>
          </div>

          {/* User & Cart Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Cart Button */}
            <button 
              onClick={() => setActivePage('cart')}
              className={`relative p-2 rounded-full hover:bg-forest-600 transition-colors ${
                activePage === 'cart' ? 'bg-forest-600' : ''
              }`}
              title="View Cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-terracotta-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-forest-500 animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile / Login */}
            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={() => setActivePage('profile')}
                  className={`flex items-center space-x-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full sm:rounded-xl transition-all border ${
                    activePage === 'profile'
                      ? 'bg-forest-600 border-sage-400 shadow-inner'
                      : 'hover:bg-forest-600 border-transparent'
                  }`}
                  title="Manage Profile"
                >
                  <div className="bg-forest-700 p-1.5 rounded-full border border-forest-400">
                    <User className="h-4 w-4 text-sage-200" />
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold leading-tight truncate max-w-[120px]">{user.name}</span>
                    <span className="text-[10px] text-sage-300 capitalize leading-tight">{user.role}</span>
                  </div>
                </button>

                <button 
                  onClick={onLogout}
                  className="p-2 rounded-full hover:bg-forest-600 text-red-300 hover:text-red-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setActivePage('login')}
                className="bg-sage-500 hover:bg-sage-600 text-white px-4 py-2 rounded-md text-sm font-bold shadow transition-colors flex items-center space-x-1"
              >
                <span>Login / Register</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden flex justify-around space-x-2 py-2 border-t border-forest-400">
          <button 
            onClick={() => setActivePage('home')}
            className={`text-xs font-semibold px-2 py-1 rounded ${activePage === 'home' ? 'bg-forest-600' : ''}`}
          >
            Home
          </button>
          <button 
            onClick={() => setActivePage('catalog')}
            className={`text-xs font-semibold px-2 py-1 rounded ${activePage === 'catalog' ? 'bg-forest-600' : ''}`}
          >
            Market
          </button>
          {user && user.role === 'farmer' && (
            <button 
              onClick={() => setActivePage('farmer-dashboard')}
              className={`text-xs font-semibold px-2 py-1 rounded ${activePage === 'farmer-dashboard' ? 'bg-forest-600' : ''}`}
            >
              Farmer Panel
            </button>
          )}
          {user && (
            <button 
              onClick={() => setActivePage('profile')}
              className={`text-xs font-semibold px-2 py-1 rounded ${activePage === 'profile' ? 'bg-forest-600' : ''}`}
            >
              Profile
            </button>
          )}
          <button 
            onClick={() => setActivePage('about-us')}
            className={`text-xs font-semibold px-2 py-1 rounded ${activePage === 'about-us' ? 'bg-forest-600' : ''}`}
          >
            About
          </button>
          <button 
            onClick={() => setActivePage('contact-us')}
            className={`text-xs font-semibold px-2 py-1 rounded ${activePage === 'contact-us' ? 'bg-forest-600' : ''}`}
          >
            Contact
          </button>
        </div>
      </div>
    </nav>
  );
}
