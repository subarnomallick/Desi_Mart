import React, { useState, useEffect } from 'react';
import { QrCode, ShieldCheck, Clock, X, AlertCircle } from 'lucide-react';

export default function UPIGateway({ orderId, amount, onPaymentComplete, onCancel }) {
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      onCancel();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSimulatePayment = async (status) => {
    setIsProcessing(true);
    setErrorMessage('');
    
    // Simulate short network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockTxnId = 'TXN' + Math.floor(100000000000 + Math.random() * 900000000000);
    
    setIsProcessing(false);
    onPaymentComplete(status, mockTxnId);
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-forest-500 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode className="h-6 w-6 text-sage-400" />
            <div>
              <h2 className="font-extrabold text-lg">UPI Payment Portal</h2>
              <p className="text-xs text-forest-100">Secured by DeshiPay Gateway</p>
            </div>
          </div>
          <button 
            onClick={onCancel}
            disabled={isProcessing}
            className="text-forest-200 hover:text-white hover:bg-forest-600 p-1.5 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center">
          
          {/* Order Details */}
          <div className="text-center mb-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Amount to Pay</p>
            <p className="text-3xl font-extrabold text-forest-500">₹{parseFloat(amount).toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">Order Ref: #DM-{orderId}</p>
          </div>

          {/* User-Uploaded Real UPI QR Code */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 relative group flex flex-col items-center justify-center w-60 h-72 mb-4">
            <img 
              src="/upi_qr.png" 
              alt="UPI QR Code" 
              className="w-48 h-auto object-contain bg-white p-2 rounded-lg border border-slate-200 shadow-sm"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <p className="text-[10px] font-bold text-slate-700 mt-2">Payee: SUBARNO MALLICK</p>
            <p className="text-[10px] text-forest-600 font-semibold select-all bg-forest-50 px-2 py-0.5 rounded border border-forest-100 mt-1">
              UPI ID: subarno.mallick.1@oksbi
            </p>
            
            {/* Scan Overlay message */}
            <div className="absolute inset-0 bg-forest-600 bg-opacity-95 flex flex-col items-center justify-center text-white text-center p-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <QrCode className="h-10 w-10 mb-2 text-sage-300 animate-pulse" />
              <p className="text-xs font-bold">SUBARNO MALLICK</p>
              <p className="text-[10px] text-forest-100 font-mono mt-1">subarno.mallick.1@oksbi</p>
              <p className="text-[9px] text-sage-300 mt-2">Scan or copy UPI details above</p>
            </div>
          </div>

          {/* Countdown & Instructions */}
          <div className="flex items-center space-x-1.5 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-full text-xs font-semibold mb-6">
            <Clock className="h-4 w-4 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
            <span>QR expires in: <strong className="font-bold text-amber-900">{formatTime(timeLeft)}</strong></span>
          </div>

          {/* Payment Simulation Section */}
          <div className="w-full border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-500 font-semibold mb-3 text-center">
              SIMULATE MOCK TRANSACTION
            </p>
            
            {isProcessing ? (
              <div className="flex flex-col items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-500 mb-2"></div>
                <p className="text-sm text-slate-600 font-medium">Processing payment authentication...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleSimulatePayment('completed')}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm hover:shadow transition-all text-sm flex items-center justify-center space-x-1"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Success</span>
                </button>
                <button
                  onClick={() => handleSimulatePayment('failed')}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm hover:shadow transition-all text-sm flex items-center justify-center space-x-1"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>Fail</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security Footer */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-center border-t border-slate-100 space-x-2 text-slate-400">
          <ShieldCheck className="h-4 w-4 text-slate-400" />
          <span className="text-[10px] font-semibold tracking-wide uppercase">
            100% Secure Encrypted UPI Payment
          </span>
        </div>

      </div>
    </div>
  );
}
