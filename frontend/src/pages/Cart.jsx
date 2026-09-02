import React, { useState } from 'react';
import { 
  Trash2, 
  ShoppingCart, 
  Plus, 
  Minus, 
  ArrowLeft, 
  ShieldCheck, 
  ChevronRight, 
  CheckCircle2, 
  QrCode, 
  ArrowRight,
  Tag,
  Sparkles,
  X,
  Check,
  Percent
} from 'lucide-react';
import PaymentGateway from '../components/PaymentGateway';
import confetti from 'canvas-confetti';

export default function Cart({ cart, setCart, user, token, setActivePage }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccessMsg, setCouponSuccessMsg] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const basePackagingFee = subtotal > 0 ? 20 : 0;
  const packagingDiscount = (appliedCoupon && basePackagingFee > 0) ? basePackagingFee : 0;
  const finalPackagingFee = basePackagingFee - packagingDiscount;
  const total = subtotal + finalPackagingFee;

  const validPackagingCoupons = ['FREEPACK', 'FREEPKG', 'DESHIFARM', 'DESHIKISAN', 'KISAN20', 'DESHI20', 'PACKFREE'];

  const handleApplyCoupon = (codeToApply = null) => {
    setCouponError('');
    setCouponSuccessMsg('');
    const code = (codeToApply || couponCode).trim().toUpperCase();

    if (!code) {
      setCouponError('Please enter a valid coupon code');
      return;
    }

    if (validPackagingCoupons.includes(code)) {
      setAppliedCoupon({
        code,
        discountAmount: 20,
        description: 'Direct Farmer Packaging Fee Waived (100% OFF)'
      });
      setCouponSuccessMsg(`🎉 Coupon "${code}" applied! Direct Farmer Packaging is now FREE.`);
      setCouponCode('');

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    } else {
      setCouponError(`Coupon code "${code}" is invalid. Try "FREEPACK" or "DESHIKISAN"`);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccessMsg('');
    setCouponError('');
  };

  const updateQuantity = (productId, change) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + change;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeItem = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const handleCheckout = async () => {
    setCheckoutError('');
    if (!user) {
      setActivePage('login');
      return;
    }
    if (cart.length === 0) return;

    try {
      const orderItems = cart.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      // 1. Create order on server
      const res = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: orderItems,
          totalAmount: total,
          coupon: appliedCoupon ? appliedCoupon.code : null
        })
      });

      const data = await res.json();
      if (res.ok) {
        setCreatedOrderId(data.orderId);
        setShowPaymentModal(true);
      } else {
        setCheckoutError(data.error || 'Failed to initialize UPI checkout session');
      }
    } catch (e) {
      setCheckoutError('Network error connecting to payment gateway server.');
    }
  };

  const handlePaymentComplete = async (status, txnId) => {
    if (status === 'completed') {
      setShowPaymentModal(false);
      setOrderSuccess(true);
      setSuccessDetails({ 
        orderId: createdOrderId, 
        txnId, 
        amount: total,
        packagingDiscount: packagingDiscount 
      });
      setCart([]); // Clear cart
      
      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 180,
          spread: 85,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } else {
      setShowPaymentModal(false);
      alert('Payment was not completed.');
    }
  };

  if (orderSuccess && successDetails) {
    return (
      <div className="max-w-xl mx-auto my-8 bg-white rounded-3xl shadow-xl p-8 border border-emerald-100 text-center animate-fade-in space-y-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase px-3 py-1 rounded-full border border-emerald-300">
            Real UPI Bank Settlement Verified
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2">Order Confirmed Successfully!</h2>
          <p className="text-xs text-slate-500 mt-1">Payment verified directly with NPCI Banking switch.</p>
        </div>

        {/* Receipt Box */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3 font-medium text-xs">
          <div className="flex justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500">Order Reference:</span>
            <span className="font-mono font-bold text-slate-800">#DM-{successDetails.orderId?.slice(-8)}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500">Bank UTR / Txn Ref:</span>
            <span className="font-mono font-bold text-emerald-700">{successDetails.txnId}</span>
          </div>
          {successDetails.packagingDiscount > 0 && (
            <div className="flex justify-between pb-2 border-b border-slate-200 text-emerald-700">
              <span>Packaging Savings:</span>
              <span className="font-bold">-₹{successDetails.packagingDiscount.toFixed(2)} (FREEPACK Coupon)</span>
            </div>
          )}
          <div className="flex justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500">Total Paid Amount:</span>
            <span className="font-bold text-slate-900 text-sm">₹{parseFloat(successDetails.amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Delivery Status:</span>
            <span className="text-emerald-700 font-bold">🌾 Direct Farm Dispatch Scheduled</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => setActivePage('profile')}
            className="flex-1 bg-forest-600 hover:bg-forest-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md active:scale-95"
          >
            View in Profile & Orders
          </button>
          <button
            onClick={() => {
              setOrderSuccess(false);
              setActivePage('catalog');
            }}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition-all active:scale-95"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800">Shopping Cart</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {cart.length === 0 ? 'Your basket is empty' : `Reviewing ${cart.length} item(s) direct from farmers`}
          </p>
        </div>
        <button
          onClick={() => setActivePage('catalog')}
          className="flex items-center space-x-1.5 text-xs font-bold text-forest-700 hover:text-forest-800 bg-forest-50 hover:bg-forest-100 px-3 py-2 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>
      </div>

      {checkoutError && (
        <div className="p-4 bg-red-50 text-red-800 rounded-2xl border border-red-200 text-sm font-semibold">
          {checkoutError}
        </div>
      )}

      {cart.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-forest-50 text-forest-600 flex items-center justify-center mx-auto">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">Your basket is currently empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our agricultural catalog to buy organic crops, fertilizers, hybrid seeds, and tools directly from verified farmers.
          </p>
          <button
            onClick={() => setActivePage('catalog')}
            className="bg-forest-600 hover:bg-forest-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md"
          >
            Explore Market Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-forest-300 transition-colors shadow-sm flex items-center gap-4"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover bg-slate-100 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 truncate">{item.name}</h4>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {item.category} • Farmer: {item.farmer_name || 'Verified Producer'}
                      </span>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity controls */}
                    <div className="flex items-center space-x-2 bg-slate-100 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-2xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold px-2">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-medium">₹{item.price} each</p>
                      <p className="text-sm font-black text-forest-700">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* PROMO / COUPON CODE CARD */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800">Farmer Coupons & Promos</h4>
                    <p className="text-[11px] text-slate-400">Apply coupon to get 100% Free Farmer Packaging</p>
                  </div>
                </div>

                {appliedCoupon && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Coupon Active
                  </span>
                )}
              </div>

              {/* Input Form */}
              {!appliedCoupon ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon(); }}
                        placeholder="Enter coupon (e.g. FREEPACK)"
                        className="w-full pl-3.5 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-forest-500 font-mono text-xs font-bold text-slate-800 uppercase tracking-wider placeholder:normal-case placeholder:font-normal"
                      />
                    </div>
                    <button
                      onClick={() => handleApplyCoupon()}
                      className="bg-forest-600 hover:bg-forest-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-xs shrink-0"
                    >
                      Apply Code
                    </button>
                  </div>

                  {/* Available Coupon Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Popular:</span>
                    <button
                      onClick={() => handleApplyCoupon('FREEPACK')}
                      className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-dashed border-amber-300 px-2.5 py-1 rounded-lg text-[11px] font-mono font-extrabold transition-colors"
                      title="Click to apply FREEPACK"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>FREEPACK</span>
                      <span className="text-[10px] text-amber-700 font-semibold">(Free ₹20 Pkg)</span>
                    </button>

                    <button
                      onClick={() => handleApplyCoupon('DESHIKISAN')}
                      className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-dashed border-emerald-300 px-2.5 py-1 rounded-lg text-[11px] font-mono font-extrabold transition-colors"
                      title="Click to apply DESHIKISAN"
                    >
                      <span>DESHIKISAN</span>
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-xs font-semibold text-red-600 animate-fade-in">{couponError}</p>
                  )}
                </div>
              ) : (
                /* Applied Coupon State */
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-black text-xs">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-xs text-emerald-900">{appliedCoupon.code}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-200/60 px-1.5 py-0.2 rounded">100% OFF</span>
                      </div>
                      <p className="text-[11px] text-emerald-800">{appliedCoupon.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleRemoveCoupon}
                    className="text-emerald-700 hover:text-red-600 p-1.5 rounded-lg hover:bg-emerald-100/60 transition-colors"
                    title="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {couponSuccessMsg && (
                <p className="text-xs font-bold text-emerald-700 animate-fade-in">{couponSuccessMsg}</p>
              )}
            </div>
          </div>

          {/* Checkout Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm h-fit space-y-5">
            <h3 className="font-bold text-base text-slate-800 border-b border-slate-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-bold text-slate-800">₹{subtotal.toFixed(2)}</span>
              </div>

              {/* Direct Farmer Packaging with Coupon Discount */}
              <div className="flex justify-between items-center">
                <span>Direct Farmer Packaging:</span>
                <div className="text-right">
                  {appliedCoupon ? (
                    <div className="flex items-center gap-1.5">
                      <span className="line-through text-slate-400 font-medium">₹{basePackagingFee.toFixed(2)}</span>
                      <span className="font-extrabold text-emerald-600">FREE</span>
                    </div>
                  ) : (
                    <span className="font-bold text-slate-800">₹{basePackagingFee.toFixed(2)}</span>
                  )}
                </div>
              </div>

              {/* Coupon Savings line if applied */}
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon ({appliedCoupon.code}):</span>
                  </span>
                  <span>-₹{packagingDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Logistics & Delivery:</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>

              <div className="border-t border-slate-200 my-2 pt-2 flex justify-between text-base font-black text-slate-900">
                <span>Total Payable:</span>
                <span className="text-forest-700">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-forest-600 hover:bg-forest-700 active:scale-[0.99] text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-md shadow-forest-600/20 transition-all flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>{user ? `Proceed to Pay (₹${total.toFixed(2)})` : 'Login to Checkout'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] font-semibold uppercase tracking-wider pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Direct Bank UPI Escrow Protected</span>
            </div>
          </div>
        </div>
      )}

      {/* REAL UPI PAYMENT GATEWAY MODAL */}
      {showPaymentModal && createdOrderId && (
        <PaymentGateway
          orderId={createdOrderId}
          amount={total}
          user={user}
          token={token}
          cart={cart}
          onPaymentComplete={handlePaymentComplete}
          onCancel={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}
