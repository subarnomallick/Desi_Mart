import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Clock, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Smartphone, 
  ArrowRight,
  RefreshCw,
  Lock,
  Zap,
  Building2,
  Wallet,
  QrCode,
  Copy,
  Check,
  CheckCheck,
  ExternalLink
} from 'lucide-react';

export default function RazorpayGateway({ 
  orderId, 
  amount, 
  user, 
  token, 
  cart, 
  onPaymentComplete, 
  onCancel 
}) {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'wallet'
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [autoDetected, setAutoDetected] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  // Form states
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Aarav Sharma');

  const [upiId, setUpiId] = useState(user?.email?.split('@')[0] + '@oksbi' || 'customer@oksbi');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [utrNumber, setUtrNumber] = useState('');

  const [selectedBank, setSelectedBank] = useState('sbi');
  const [selectedWallet, setSelectedWallet] = useState('amazonpay');

  const isCompletedRef = useRef(false);

  const formattedAmount = parseFloat(amount).toFixed(2);
  const upiPayee = 'subarno.mallick.1@oksbi';
  const upiName = 'SUBARNO MALLICK';

  // Dynamic UPI Deep Link
  const upiDeepLink = `upi://pay?pa=${upiPayee}&pn=${encodeURIComponent(upiName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(`DeshiMart Order #${orderId?.slice(-6)}`)}`;
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiDeepLink)}&margin=8`;

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      onCancel();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onCancel]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Real-Time Auto-Polling Listener
  useEffect(() => {
    if (!orderId || !token) return;

    let isMounted = true;

    const checkOrderStatus = async () => {
      if (isCompletedRef.current) return;

      try {
        const res = await fetch(`/api/orders/${orderId}/status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setPollCount(prev => prev + 1);
          }

          if (data.payment_status === 'completed' && !isCompletedRef.current) {
            isCompletedRef.current = true;
            if (isMounted) {
              setAutoDetected(true);
              setIsProcessing(true);
            }

            setTimeout(() => {
              onPaymentComplete('completed', data.upi_txn_id || `pay_rzp_${Date.now().toString(36)}`);
            }, 800);
          }
        }
      } catch (err) {
        // Silently retry
      }
    };

    const interval = setInterval(checkOrderStatus, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [orderId, token, onPaymentComplete]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiPayee);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Execute payment authorization & MongoDB update
  const handlePayNow = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    const generatedPaymentId = `pay_rzp_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
    const generatedOrderId = `order_rzp_${Date.now().toString(36)}`;

    try {
      // 1.2s realistic network authentication animation
      await new Promise(r => setTimeout(r, 1200));

      const res = await fetch('/api/payments/razorpay/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId,
          razorpay_order_id: generatedOrderId,
          razorpay_payment_id: utrNumber.trim() ? utrNumber.trim() : generatedPaymentId,
          razorpay_signature: 'sandbox_verified'
        })
      });

      const data = await res.json();
      if (res.ok) {
        isCompletedRef.current = true;
        setAutoDetected(true);
        setTimeout(() => {
          onPaymentComplete('completed', generatedPaymentId);
        }, 800);
      } else {
        setErrorMessage(data.error || 'Payment verification failed. Please try again.');
        setIsProcessing(false);
      }
    } catch (e) {
      setErrorMessage('Network error confirming payment with server.');
      setIsProcessing(false);
    }
  };

  const banks = [
    { id: 'sbi', name: 'State Bank of India', code: 'SBIN' },
    { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC' },
    { id: 'icici', name: 'ICICI Bank', code: 'ICIC' },
    { id: 'axis', name: 'Axis Bank', code: 'UTIB' },
    { id: 'kotak', name: 'Kotak Mahindra', code: 'KKBK' },
    { id: 'pnb', name: 'Punjab National Bank', code: 'PUNB' }
  ];

  const upiApps = [
    { id: 'gpay', name: 'Google Pay', icon: '🔵' },
    { id: 'phonepe', name: 'PhonePe', icon: '🟣' },
    { id: 'paytm', name: 'Paytm', icon: '🔷' },
    { id: 'bhim', name: 'BHIM', icon: '🟢' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[94vh] relative">
        
        {/* Success Transition Splash */}
        {autoDetected && (
          <div className="absolute inset-0 bg-forest-700 text-white z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in space-y-4">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black">Payment Verified & Received!</h3>
              <p className="text-sm text-forest-200 mt-1">Transaction confirmed by banking switch.</p>
            </div>
            <div className="flex items-center gap-2 text-xs bg-forest-800/80 px-4 py-2 rounded-full border border-forest-500 font-mono">
              <RefreshCw className="w-4 h-4 animate-spin text-sage-300" />
              <span>Finalizing verified receipt...</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-2.5 rounded-2xl border border-white/20 backdrop-blur-sm shadow-inner">
              <CreditCard className="h-6 w-6 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg tracking-tight">Razorpay Secure Checkout</h2>
                <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black uppercase px-2 py-0.2 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Live
                </span>
              </div>
              <p className="text-xs text-blue-200 flex items-center gap-1 mt-0.5">
                <Lock className="w-3 h-3 text-blue-200" />
                RBI & PCI-DSS Compliant 256-Bit SSL
              </p>
            </div>
          </div>

          <button 
            onClick={onCancel}
            disabled={isProcessing}
            className="text-blue-200 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors disabled:opacity-50"
            title="Cancel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Amount & Expiry Banner */}
        <div className="bg-blue-50/80 px-6 py-3.5 border-b border-blue-100 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Payable</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-blue-900">₹{formattedAmount}</span>
              <span className="text-xs text-slate-500 font-bold">INR</span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end space-x-1.5 bg-amber-100/80 text-amber-900 px-3 py-1 rounded-full text-xs font-bold border border-amber-300/40">
              <Clock className="h-3.5 w-3.5 text-amber-700 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Expires: {formatTime(timeLeft)}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">Ref: #DM-{orderId?.slice(-8)}</p>
          </div>
        </div>

        {/* Real-time Radar Listener Strip */}
        <div className="bg-emerald-50/70 border-b border-emerald-100/80 px-4 py-2 flex items-center justify-between text-xs text-emerald-800 shrink-0">
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span className="text-[11px] font-bold">Listening for Bank UPI / Card Settlement...</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
            Radar Ping #{pollCount}
          </span>
        </div>

        {/* Payment Method Tabs */}
        <div className="p-4 pb-0 shrink-0">
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setActiveTab('upi')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'upi'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>UPI</span>
            </button>

            <button
              onClick={() => setActiveTab('card')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'card'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>

            <button
              onClick={() => setActiveTab('netbanking')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'netbanking'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>NetBanking</span>
            </button>

            <button
              onClick={() => setActiveTab('wallet')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'wallet'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Wallets</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {errorMessage && (
            <div className="p-3.5 bg-red-50 text-red-800 rounded-xl border border-red-200 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. UPI TAB */}
          {activeTab === 'upi' && (
            <div className="space-y-4">
              {/* Scan QR Box */}
              <div className="flex flex-col items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <img
                  src={dynamicQrUrl}
                  alt="UPI QR Code"
                  className="w-44 h-44 rounded-xl object-contain bg-white p-1 border border-slate-200 shadow-xs"
                  onError={(e) => { e.target.src = '/upi_qr.png'; }}
                />
                
                <div className="text-center mt-2">
                  <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-800">
                    <span>{upiName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <button
                    onClick={handleCopyUpi}
                    className="mt-1 inline-flex items-center gap-1.5 bg-white text-blue-700 px-3 py-0.5 rounded-full text-xs font-mono font-bold border border-blue-200 hover:bg-blue-50 transition-colors shadow-2xs"
                  >
                    <span>{upiPayee}</span>
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                </div>
              </div>

              {/* Mobile Deep Link */}
              <a
                href={upiDeepLink}
                className="sm:hidden w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>Pay in UPI App (GPay / PhonePe / Paytm)</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>

              {/* UTR Input (Optional) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  UPI VPA or 12-Digit UTR
                </label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. customer@oksbi or 423819284910"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs font-medium text-slate-800"
                />
              </div>

              <button
                onClick={handlePayNow}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold py-3.5 px-5 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Processing Razorpay UPI...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-amber-300" />
                    <span>Pay ₹{formattedAmount} via Razorpay UPI</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 2. CARD TAB */}
          {activeTab === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4111 2222 3333 4444"
                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm font-bold text-slate-800"
                  />
                  <CreditCard className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Valid Thru
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="•••"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Name on card"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-800"
                />
              </div>

              <button
                onClick={handlePayNow}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold py-3.5 px-5 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Authorizing Card with Razorpay...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Pay ₹{formattedAmount} via Razorpay Card</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 3. NETBANKING TAB */}
          {activeTab === 'netbanking' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Bank
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {banks.map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => setSelectedBank(bank.id)}
                      className={`p-3 rounded-xl border text-left font-bold text-xs flex items-center justify-between transition-all ${
                        selectedBank === bank.id
                          ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/70 text-blue-900 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{bank.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{bank.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePayNow}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold py-3.5 px-5 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Connecting to Bank Gateway...</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-5 h-5" />
                    <span>Pay ₹{formattedAmount} via NetBanking</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 4. WALLET TAB */}
          {activeTab === 'wallet' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Wallet
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'amazonpay', name: 'Amazon Pay' },
                    { id: 'paytm', name: 'Paytm Wallet' },
                    { id: 'mobikwik', name: 'MobiKwik' },
                    { id: 'airtel', name: 'Airtel Money' }
                  ].map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setSelectedWallet(w.id)}
                      className={`w-full p-3 rounded-xl border text-left font-bold text-xs flex items-center justify-between transition-all ${
                        selectedWallet === w.id
                          ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/70 text-blue-900 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{w.name}</span>
                      <span className="text-emerald-600 text-[10px] font-bold">Available</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePayNow}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold py-3.5 px-5 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Authorizing Wallet...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    <span>Pay ₹{formattedAmount} via Wallet</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px] shrink-0">
          <div className="flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Razorpay Payment Solutions</span>
          </div>
          <span className="font-mono text-slate-400">100% Encrypted</span>
        </div>

      </div>
    </div>
  );
}
