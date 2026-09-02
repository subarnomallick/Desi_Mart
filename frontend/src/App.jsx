import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import FarmerDashboard from './pages/FarmerDashboard';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AIChat from './components/AIChat';
import { Leaf, Info, ShieldCheck, Mail } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [cart, setCart] = useState([]);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Restore session and cart on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('deshimart_token');
    const savedUser = localStorage.getItem('deshimart_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing stored user data:', e);
      }
    }

    const savedCart = localStorage.getItem('deshimart_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save cart to localstorage whenever it updates
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('deshimart_cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('deshimart_cart');
    }
  }, [cart]);

  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    // Auto show user the cart page
    setActivePage('cart');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setCart([]);
    localStorage.removeItem('deshimart_token');
    localStorage.removeItem('deshimart_user');
    localStorage.removeItem('deshimart_cart');
    setActivePage('home');
  };

  // Switch Navigation Router
  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Home setActivePage={setActivePage} user={user} />;
      case 'catalog':
        return <Catalog onAddToCart={handleAddToCart} user={user} />;
      case 'farmer-dashboard':
        return user && user.role === 'farmer' 
          ? <FarmerDashboard token={token} user={user} /> 
          : <Home setActivePage={setActivePage} user={user} />;
      case 'profile':
        return user ? (
          <Profile 
            user={user} 
            setUser={setUser} 
            token={token} 
            setActivePage={setActivePage} 
            onLogout={handleLogout} 
          />
        ) : (
          <Login setToken={setToken} setUser={setUser} setActivePage={setActivePage} />
        );
      case 'cart':
        return (
          <Cart 
            cart={cart} 
            setCart={setCart} 
            user={user} 
            token={token} 
            setActivePage={setActivePage} 
          />
        );
      case 'login':
        return <Login setToken={setToken} setUser={setUser} setActivePage={setActivePage} />;
      default:
        return <Home setActivePage={setActivePage} user={user} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-forest-50/20 text-slate-800 selection:bg-forest-500 selection:text-white">
      {/* Navbar header */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        cart={cart} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Main content slot */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="bg-forest-900 text-forest-100 border-t border-forest-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Leaf className="h-6 w-6 text-sage-500 fill-sage-500" />
                <span className="font-extrabold text-xl text-white">Deshi<span className="text-sage-400">Mart</span></span>
              </div>
              <p className="text-xs text-forest-200 leading-relaxed">
                Empowering farmers by bridging the gap to consumers. Direct organic crop sales, high quality agricultural seed, specialized tools and fertilizers, protected under secure payments.
              </p>
            </div>
            
            <div className="space-y-2.5">
              <h4 className="font-bold text-sm text-white flex items-center space-x-1">
                <Info className="h-4.5 w-4.5 text-sage-400" />
                <span>Agricultural Trust</span>
              </h4>
              <p className="text-xs text-forest-200 leading-relaxed">
                We ensure that farmers get direct access to consumers. Our mock UPI checkout facilitates testing transaction logs seamlessly.
              </p>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-sm text-white flex items-center space-x-1">
                <Mail className="h-4.5 w-4.5 text-sage-400" />
                <span>Market Info</span>
              </h4>
              <p className="text-xs text-forest-200">
                Helpline: support@deshimart.org<br />
                Available 24/7 in local dialects via our AI Farming Assistant widget.
              </p>
            </div>
          </div>
          
          <div className="border-t border-forest-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-forest-300">
            <p>© {new Date().getFullYear()} DeshiMart Agricultural Solutions. All rights reserved.</p>
            <div className="flex items-center space-x-1.5 mt-2 sm:mt-0 font-semibold uppercase tracking-wider">
              <ShieldCheck className="h-4.5 w-4.5 text-sage-500" />
              <span>Direct Farm-to-Consumer Platform</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating AI Chat Assistant */}
      <AIChat />
    </div>
  );
}
