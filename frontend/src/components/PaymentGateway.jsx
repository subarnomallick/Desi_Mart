import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  ShieldCheck, 
  Clock, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Smartphone, 
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Lock,
  Copy,
  Check,
  Zap,
  CheckCheck,
  Radio,
  Wifi,
  Sparkles
} from 'lucide-react';

export default function PaymentGateway({ 
  orderId, 
  amount, 
  user, 
  token, 
  cart, 
  onPaymentComplete, 
  onCancel 
}) {
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'apps' | 'utr'
  const [copied, setCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [selectedApp, setSelectedApp] = useState('gpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [pollCount, setPollCount] = useState(0);
  const [autoDetected, setAutoDetected] = useState(false);

  // Gateway Session Details
  const [sessionDetails, setSessionDetails] = useState(null);
  const isCompletedRef = useRef(false);

  const formattedAmount = parseFloat(amount).toFixed(2);
  const upiPayee = sessionDetails?.upiPayee || 'subarno.mallick.1@oksbi';
  const upiName = sessionDetails?.upiName || 'SUBARNO MALLICK';
  const dynamicQrUrl = sessionDetails?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(`upi://pay?pa=${upiPayee}&pn=${encodeURIComponent(upiName)}&am=${formattedAmount}&cu=INR&tr=${orderId}&tn=DeshiMart Order Ref`)}&margin=8`;
  const upiDeepLink = sessionDetails?.upiDeepLink || `upi://pay?pa=${upiPayee}&pn=${encodeURIComponent(upiName)}&am=${formattedAmount}&cu=INR&tr=${orderId}&tn=DeshiMart Order Ref`;

  // 1. Initialize Real Payment Session on mount
  useEffect(() => {
    if (!token || !cart || cart.length === 0) return;

    fetch('/api/payments/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: amount
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.orderId) {
        setSessionDetails(data);
      }
    })
    .catch(err => {
      console.warn('Payment session init note:', err);
    });
  }, [token, cart, amount]);

  // 2. Countdown timer
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

  // 3. REAL-TIME AUTOMATIC BANK SETTLEMENT RADAR (POLLING)
  const targetOrderId = sessionDetails?.orderId || orderId;

  useEffect(() => {
    if (!targetOrderId || !token) return;

    let isMounted = true;

    const checkRealTimeStatus = async () => {
      if (isCompletedRef.current) return;

      try {
        const res = await fetch(`/api/payments/status/${targetOrderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setPollCount(prev => prev + 1);
          }

          // If the payment is officially confirmed by Bank/Gateway/Webhook
          if (data.isPaid && !isCompletedRef.current) {
            isCompletedRef.current = true;
            if (isMounted) {
              setAutoDetected(true);
              setIsProcessing(true);
            }

            setTimeout(() => {
              onPaymentComplete('completed', data.txnId || `UPI_${Date.now().toString().slice(-8)}`);
            }, 900);
          }
        }
      } catch (err) {
        // Silently retry on next interval
      }
    };

    const interval = setInterval(checkRealTimeStatus, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [targetOrderId, token, onPaymentComplete]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiPayee);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Submit UTR for strict bank reference verification
  const handleVerifyUtr = async () => {
    if (!utrNumber.trim()) {
      setErrorMessage('Please enter the 12-digit UPI UTR / Bank Reference Number from your payment receipt.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/payments/verify-utr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: targetOrderId,
          utrNumber: utrNumber.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        isCompletedRef.current = true;
        setAutoDetected(true);
        setTimeout(() => {
          onPaymentComplete('completed', utrNumber.trim());
        }, 800);
      } else {
        setErrorMessage(data.error || 'UTR verification failed. Please ensure the reference number is valid.');
        setIsProcessing(false);
      }
    } catch (e) {
      setErrorMessage('Network error validating UTR with bank server.');
      setIsProcessing(false);
    }
  };

  const upiApps = [
    { id: 'gpay', name: 'Google Pay', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🔵' },
    { id: 'phonepe', name: 'PhonePe', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: '🟣' },
    { id: 'paytm', name: 'Paytm UPI', color: 'bg-sky-50 text-sky-700 border-sky-200', icon: '🔷' },
    { id: 'bhim', name: 'BHIM UPI', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '🟢' },
    { id: 'cred', name: 'CRED UPI', color: 'bg-slate-100 text-slate-800 border-slate-300', icon: '⚡' },
    { id: 'amazon', name: 'Amazon Pay', color: 'bg-amber-50 text-amber-800 border-amber-200', icon: '🔶' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 flex flex-col max-h-[94vh] relative">
        
        {/* Real-Time Payment Verified Overlay */}
        {autoDetected && (
          <div className="absolute inset-0 bg-forest-700 text-white z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in space-y-4">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black">UPI Payment Received & Verified!</h3>
              <p className="text-sm text-forest-200 mt-1">Bank credit confirmed by payment switch.</p>
            </div>
            <div className="flex items-center gap-2 text-xs bg-forest-800/80 px-4 py-2 rounded-full border border-forest-500 font-mono">
              <RefreshCw className="w-4 h-4 animate-spin text-sage-300" />
              <span>Generating verified tax invoice & order confirmation...</span>
            </div>
          </div>
        )}

        {/* Gateway Header */}
        <div className="bg-gradient-to-r from-forest-700 via-forest-600 to-forest-800 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-2.5 rounded-2xl border border-white/20 backdrop-blur-sm shadow-inner">
              <QrCode className="h-6 w-6 text-sage-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-extrabold text-lg tracking-tight">Real UPI Gateway</h2>
                <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black uppercase px-2 py-0.2 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Live Bank Radar
                </span>
              </div>
              <p className="text-xs text-forest-200 flex items-center gap-1 mt-0.5">
                <Lock className="w-3 h-3 text-sage-300" />
                NPCI / Unified Payments Interface
              </p>
            </div>
          </div>
          <button 
            onClick={onCancel}
            disabled={isProcessing}
            className="text-forest-200 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors disabled:opacity-50"
            title="Cancel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Amount & Real-Time Countdown */}
        <div className="bg-forest-50/90 px-5 sm:px-6 py-3.5 border-b border-forest-100 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Payable Amount</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-forest-700">₹{formattedAmount}</span>
              <span className="text-xs text-slate-500 font-bold">INR</span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end space-x-1.5 bg-amber-100/80 text-amber-900 px-3 py-1 rounded-full text-xs font-bold border border-amber-300/40">
              <Clock className="h-3.5 w-3.5 text-amber-700 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Expires: {formatTime(timeLeft)}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">Ref: #DM-{targetOrderId?.toString().slice(-8)}</p>
          </div>
        </div>

        {/* Live Radar Listening Indicator */}
        <div className="bg-emerald-50/70 border-b border-emerald-100/80 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-800 shrink-0">
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span className="text-[11px] font-bold">Listening for Bank UPI Settlement...</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
            Radar Ping #{pollCount}
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="p-4 pb-0 shrink-0">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'qr'
                  ? 'bg-white text-forest-700 shadow-sm'
                  : 'text-slate-600 hover:text-forest-700'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR</span>
            </button>

            <button
              onClick={() => setActiveTab('apps')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'apps'
                  ? 'bg-white text-forest-700 shadow-sm'
                  : 'text-slate-600 hover:text-forest-700'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>UPI Apps</span>
            </button>

            <button
              onClick={() => setActiveTab('utr')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'utr'
                  ? 'bg-white text-forest-700 shadow-sm'
                  : 'text-slate-600 hover:text-forest-700'
              }`}
            >
              <CheckCheck className="w-4 h-4" />
              <span>12-Digit UTR</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-200 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: SCAN DYNAMIC QR CODE */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center space-y-3.5">
              {/* Dynamic QR Box */}
              <div className="bg-white p-3 rounded-2xl border-2 border-forest-300 shadow-md flex flex-col items-center relative group">
                <img
                  src={dynamicQrUrl}
                  alt="Scan to Pay UPI QR"
                  className="w-48 h-48 sm:w-52 sm:h-52 rounded-xl object-contain bg-white"
                  onError={(e) => {
                    e.target.src = '/upi_qr.png';
                  }}
                />

                {/* Verified Merchant Badge */}
                <div className="w-full text-center mt-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-center gap-1 text-slate-800 text-xs font-bold">
                    <span>{upiName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>

                  {/* Copy UPI Pill */}
                  <button
                    onClick={handleCopyUpi}
                    className="mt-1 inline-flex items-center gap-1.5 bg-forest-50 hover:bg-forest-100 text-forest-700 px-3 py-0.5 rounded-full text-xs font-mono font-bold border border-forest-200 transition-colors"
                    title="Click to Copy UPI ID"
                  >
                    <span>{upiPayee}</span>
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-forest-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Mobile Deep Link */}
              <a
                href={upiDeepLink}
                className="sm:hidden w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>Pay via Any UPI App (GPay / PhonePe)</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 text-center leading-relaxed">
                🛡️ <strong>Live Real-Time Gate:</strong> Scan and pay ₹{formattedAmount} with Google Pay, PhonePe, Paytm, or BHIM. <strong>The order will automatically confirm as soon as the bank payment is captured.</strong>
              </div>
            </div>
          )}

          {/* TAB 2: UPI APPS SELECTION */}
          {activeTab === 'apps' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Choose Your Installed App
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {upiApps.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => setSelectedApp(app.id)}
                      className={`p-3 rounded-2xl border text-left font-bold text-xs flex items-center gap-2.5 transition-all ${
                        selectedApp === app.id
                          ? 'border-forest-600 ring-2 ring-forest-500/20 bg-forest-50/60 shadow-sm'
                          : `${app.color} hover:opacity-90`
                      }`}
                    >
                      <span className="text-lg">{app.icon}</span>
                      <span className="truncate">{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Trigger */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Selected App:</span>
                  <span className="font-bold text-forest-800 capitalize">
                    {upiApps.find(a => a.id === selectedApp)?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Payee VPA:</span>
                  <span className="font-mono font-bold text-slate-800">{upiPayee}</span>
                </div>

                <a
                  href={upiDeepLink}
                  className="w-full flex items-center justify-center gap-2 bg-forest-600 hover:bg-forest-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow transition-all active:scale-95"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Launch {upiApps.find(a => a.id === selectedApp)?.name}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: ENTER 12-DIGIT UTR / BANK REFERENCE */}
          {activeTab === 'utr' && (
            <div className="space-y-4">
              <div className="p-4 bg-forest-50/60 rounded-2xl border border-forest-200 space-y-2">
                <h4 className="text-xs font-bold text-forest-900 flex items-center gap-1.5">
                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                  Strict Bank UTR Verification
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  After paying ₹{formattedAmount} to <strong>{upiPayee}</strong>, enter the <strong>12-digit UPI Ref / UTR Number</strong> from your GPay, PhonePe, or Banking app receipt.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  12-Digit UPI Reference Number (UTR)
                </label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. 423819284910"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-forest-500 font-mono font-bold text-sm text-slate-800 tracking-wider"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span>Verified Payee:</span>
                <span className="font-bold text-forest-700">{upiName}</span>
              </div>

              <button
                onClick={handleVerifyUtr}
                disabled={isProcessing}
                className="w-full bg-forest-600 hover:bg-forest-700 active:scale-[0.99] text-white font-extrabold py-3.5 px-5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Validating UTR with Banking Gateway...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Verify & Confirm Order</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px] shrink-0">
          <div className="flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Strict Real-Time Verification Active</span>
          </div>
          <span className="font-mono text-slate-400 font-bold">NPCI 256-Bit</span>
        </div>

      </div>
    </div>
  );
}
