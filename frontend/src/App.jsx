import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import FarmerDashboard from './pages/FarmerDashboard';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import TermsConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import ShippingPolicy from './pages/ShippingPolicy';
import Footer from './components/Footer';
import AIChat from './components/AIChat';

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
      case 'about-us':
        return <AboutUs setActivePage={setActivePage} />;
      case 'contact-us':
        return <ContactUs />;
      case 'terms-conditions':
        return <TermsConditions />;
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'refund-policy':
        return <RefundPolicy />;
      case 'shipping-policy':
        return <ShippingPolicy />;
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

      {/* Compliance & Legal Footer */}
      <Footer setActivePage={setActivePage} />

      {/* Floating AI Chat Assistant */}
      <AIChat />
    </div>
  );
}
