import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Check, 
  Send, 
  AlertCircle, 
  ShieldCheck, 
  ExternalLink,
  ArrowUpRight,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Building2,
  Smartphone,
  Info
} from 'lucide-react';

export default function AdminPayouts({ token, user, setActivePage }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: {
      totalBankInflow: 0,
      totalPlatformCommission: 0,
      totalSettledToFarmers: 0,
      totalPendingToFarmers: 0,
      pendingCount: 0,
      settledCount: 0
    },
    pendingDisbursements: [],
    settledDisbursements: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState('');
  const [settlingItem, setSettlingItem] = useState(null); // The item being settled in modal
  const [utrInput, setUtrInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'settled'

  const fetchPayoutsData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/payouts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (e) {
      console.error('Failed to fetch admin payouts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayoutsData();
  }, [token]);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2500);
  };

  const handleOpenSettleModal = (item) => {
    setSettlingItem(item);
    setUtrInput(`UTR${Date.now().toString().slice(-9)}`);
    setNotesInput('Transferred via UPI/IMPS');
    setActionError('');
    setActionSuccess('');
  };

  const handleConfirmSettle = async (e) => {
    e.preventDefault();
    if (!settlingItem) return;

    setActionLoading(true);
    setActionError('');

    try {
      const res = await fetch('/api/admin/payouts/settle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: settlingItem.orderId,
          farmerId: settlingItem.farmerId,
          payoutRef: utrInput.trim(),
          payoutNotes: notesInput.trim()
        })
      });

      const resData = await res.json();
      if (res.ok) {
        setActionSuccess(`Disbursed ₹${settlingItem.netPayout.toFixed(2)} to ${settlingItem.farmerName}!`);
        setTimeout(() => {
          setSettlingItem(null);
          setActionSuccess('');
          fetchPayoutsData();
        }, 1200);
      } else {
        setActionError(resData.error || 'Settlement failed');
      }
    } catch (err) {
      setActionError('Network error while processing settlement');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter disbursements based on search
  const filteredPending = (data.pendingDisbursements || []).filter(item => {
    const q = searchTerm.toLowerCase();
    return (
      item.farmerName.toLowerCase().includes(q) ||
      (item.payoutDetails?.upi_id || '').toLowerCase().includes(q) ||
      item.orderId.toLowerCase().includes(q)
    );
  });

  const filteredSettled = (data.settledDisbursements || []).filter(item => {
    const q = searchTerm.toLowerCase();
    return (
      item.farmerName.toLowerCase().includes(q) ||
      (item.payoutRef || '').toLowerCase().includes(q) ||
      item.orderId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-forest-50 text-forest-600 border border-forest-100">
              <Landmark className="h-6 w-6" />
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Marketplace Settlement Hub</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1.5 max-w-3xl">
            Customer payments land <strong>100% in your bank via Razorpay</strong> first. Review the automatically calculated proportion due to each farmer, copy their UPI/Bank details with one click, and record settlement transfers with your UTR reference numbers.
          </p>
        </div>

        <button
          onClick={fetchPayoutsData}
          className="self-start md:self-auto flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-all"
        >
          <RefreshCw className={`h-4 w-4 text-forest-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Escrow Rule Banner */}
      <div className="bg-gradient-to-r from-forest-600 via-forest-700 to-forest-800 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-white/10 backdrop-blur rounded-xl">
            <ShieldCheck className="h-6 w-6 text-emerald-300" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-wide flex items-center space-x-2">
              <span>Automatic 95% Farmer Proportion / 5% Commission Engine</span>
              <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                Active & Compliant
              </span>
            </h3>
            <p className="text-xs text-forest-100 mt-1 max-w-2xl leading-relaxed">
              When a buyer purchases fresh produce or inputs, the entire gross payment settles into the platform merchant account. The platform automatically sets aside <strong>5% as marketplace revenue</strong> and reserves <strong>95% net payout</strong> for the grower.
            </p>
          </div>
        </div>

        <div className="bg-black/20 backdrop-blur px-4 py-3 rounded-xl border border-white/10 text-right">
          <div className="text-[11px] text-forest-200 font-semibold uppercase tracking-wider">Settlement Model</div>
          <div className="text-sm font-black text-white">Central Escrow & Direct Payout</div>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Inflow */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Bank Inflow</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              ₹{data.summary.totalBankInflow.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">100% captured via Razorpay</p>
          </div>
        </div>

        {/* Platform Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Platform Profit (5%)</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600">
              ₹{data.summary.totalPlatformCommission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Retained marketplace revenue</p>
          </div>
        </div>

        {/* Pending Farmer Payouts */}
        <div className="bg-white p-6 rounded-2xl border border-amber-100 bg-amber-50/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-700 font-bold uppercase tracking-wider">Pending Farmer Splits</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-700">
              ₹{data.summary.totalPendingToFarmers.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-amber-800/80 mt-1">{data.summary.pendingCount} transfer(s) awaiting payout</p>
          </div>
        </div>

        {/* Settled Farmer Payouts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Disbursed to Farmers</span>
            <div className="p-2 bg-forest-50 text-forest-600 rounded-xl">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              ₹{data.summary.totalSettledToFarmers.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{data.summary.settledCount} settlement(s) completed</p>
          </div>
        </div>

      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
                activeTab === 'pending'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Pending Disbursements ({data.pendingDisbursements.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settled')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
                activeTab === 'settled'
                  ? 'bg-forest-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Settled History ({data.settledDisbursements.length})</span>
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search farmer name, UPI, or Order ID..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white transition-all"
            />
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* 1. Pending Disbursements Tab */}
        {activeTab === 'pending' && (
          <div>
            {loading ? (
              <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="h-6 w-6 animate-spin text-forest-500" />
                <span>Loading pending disbursements...</span>
              </div>
            ) : filteredPending.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-800">All Farmer Settlements Up to Date!</h4>
                <p className="text-xs text-slate-400">There are no pending payouts waiting for disbursement.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-5">Farmer & Contact</th>
                      <th className="py-3 px-4">Order ID & Date</th>
                      <th className="py-3 px-4">Payout Account / UPI</th>
                      <th className="py-3 px-4 text-right">Gross Sold</th>
                      <th className="py-3 px-4 text-right">5% Platform Fee</th>
                      <th className="py-3 px-4 text-right">Net To Send (95%)</th>
                      <th className="py-3 px-5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPending.map((item, idx) => {
                      const upi = item.payoutDetails?.upi_id || 'Not Provided';
                      const bankInfo = item.payoutDetails?.account_number 
                        ? `${item.payoutDetails.bank_name || 'Bank'}: ${item.payoutDetails.account_number} (${item.payoutDetails.ifsc_code || 'IFSC'})` 
                        : null;

                      return (
                        <tr key={`${item.orderId}-${idx}`} className="hover:bg-slate-50/60 transition-colors">
                          {/* Farmer Details */}
                          <td className="py-4 px-5">
                            <div className="font-bold text-slate-900 text-sm">{item.farmerName}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{item.farmerPhone} • {item.farmerEmail}</div>
                          </td>

                          {/* Order Reference */}
                          <td className="py-4 px-4">
                            <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              #{item.orderId.slice(-8)}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {new Date(item.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="text-[10px] text-slate-500">Buyer: {item.customerName}</div>
                          </td>

                          {/* Payout Details with 1-click Copy */}
                          <td className="py-4 px-4">
                            {/* UPI Button */}
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-slate-800 text-[11px] flex items-center space-x-1">
                                <Smartphone className="h-3.5 w-3.5 text-forest-500" />
                                <span>{upi}</span>
                              </span>
                              {upi !== 'Not Provided' && (
                                <button
                                  onClick={() => copyToClipboard(upi, `upi-${item.orderId}-${idx}`)}
                                  className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors"
                                  title="Copy UPI ID"
                                >
                                  {copiedKey === `upi-${item.orderId}-${idx}` ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              )}
                            </div>

                            {/* Bank Details */}
                            {bankInfo && (
                              <div className="flex items-center space-x-2 mt-1 text-[10px] text-slate-500">
                                <Building2 className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                <span className="truncate max-w-[180px]">{bankInfo}</span>
                                <button
                                  onClick={() => copyToClipboard(
                                    `A/C: ${item.payoutDetails.account_number}, IFSC: ${item.payoutDetails.ifsc_code}, Bank: ${item.payoutDetails.bank_name}, Holder: ${item.payoutDetails.account_holder_name}`,
                                    `bank-${item.orderId}-${idx}`
                                  )}
                                  className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors"
                                  title="Copy Full Bank Details"
                                >
                                  {copiedKey === `bank-${item.orderId}-${idx}` ? (
                                    <Check className="h-3 w-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Gross Amount */}
                          <td className="py-4 px-4 text-right font-semibold text-slate-600">
                            ₹{item.itemsAmount.toFixed(2)}
                          </td>

                          {/* 5% Commission */}
                          <td className="py-4 px-4 text-right font-semibold text-emerald-600">
                            ₹{item.commissionAmount.toFixed(2)}
                          </td>

                          {/* Net Payout */}
                          <td className="py-4 px-4 text-right font-black text-slate-900 text-sm">
                            <span className="text-forest-650 bg-forest-50 px-2 py-1 rounded-lg">
                              ₹{item.netPayout.toFixed(2)}
                            </span>
                          </td>

                          {/* Action Button */}
                          <td className="py-4 px-5 text-center">
                            <button
                              onClick={() => handleOpenSettleModal(item)}
                              className="px-3 py-1.5 rounded-xl font-extrabold text-xs bg-forest-600 hover:bg-forest-700 text-white shadow-sm hover:shadow transition-all flex items-center space-x-1 mx-auto"
                            >
                              <Send className="h-3.5 w-3.5" />
                              <span>Disburse & Settle</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 2. Settled History Tab */}
        {activeTab === 'settled' && (
          <div>
            {loading ? (
              <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="h-6 w-6 animate-spin text-forest-500" />
                <span>Loading settled history...</span>
              </div>
            ) : filteredSettled.length === 0 ? (
              <div className="py-16 text-center space-y-2 text-slate-400 text-xs">
                <p>No historical settlements found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-5">Farmer</th>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Settlement Reference (UTR)</th>
                      <th className="py-3 px-4">Settled At</th>
                      <th className="py-3 px-4 text-right">Disbursed (95%)</th>
                      <th className="py-3 px-5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSettled.map((item, idx) => (
                      <tr key={`${item.orderId}-${idx}`} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-5 font-bold text-slate-800">
                          {item.farmerName}
                          <div className="text-[10px] text-slate-400 font-normal">{item.farmerPhone}</div>
                        </td>
                        <td className="py-4 px-4 font-mono text-slate-600">#{item.orderId.slice(-8)}</td>
                        <td className="py-4 px-4">
                          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {item.payoutRef || 'Direct Transfer'}
                          </span>
                          {item.payoutNotes && (
                            <div className="text-[10px] text-slate-400 mt-0.5">{item.payoutNotes}</div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-slate-500 text-[11px]">
                          {item.settledAt ? new Date(item.settledAt).toLocaleString('en-IN') : 'Just now'}
                        </td>
                        <td className="py-4 px-4 text-right font-black text-emerald-600 text-sm">
                          ₹{item.netPayout.toFixed(2)}
                        </td>
                        <td className="py-4 px-5 text-center">
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2 py-1 rounded-full border border-emerald-200 flex items-center justify-center space-x-1 w-fit mx-auto">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Settled</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Settle Modal */}
      {settlingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-forest-50 text-forest-600 rounded-xl">
                  <Send className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Confirm Farmer Settlement</h3>
              </div>
              <button
                onClick={() => setSettlingItem(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {actionSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Transfer Summary Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Beneficiary Farmer:</span>
                <span className="font-bold text-slate-800">{settlingItem.farmerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Farmer UPI ID:</span>
                <span className="font-mono font-bold text-slate-800">{settlingItem.payoutDetails?.upi_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Order Reference:</span>
                <span className="font-mono text-slate-600">#{settlingItem.orderId.slice(-8)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
                <span className="font-bold text-slate-700">Net Proportion To Send:</span>
                <span className="font-black text-forest-650">₹{settlingItem.netPayout.toFixed(2)}</span>
              </div>
            </div>

            {/* Settle Form */}
            <form onSubmit={handleConfirmSettle} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Bank UTR / Transaction Reference Number
                </label>
                <input
                  type="text"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  placeholder="e.g. UTR1238910482"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white transition-all"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Enter the confirmation UTR from your GPay, PhonePe, or Netbanking transfer.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Payment Method / Notes
                </label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g. Sent via PhonePe to UPI ID"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSettlingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-forest-600 hover:bg-forest-700 disabled:bg-slate-300 text-white shadow-sm hover:shadow transition-all flex items-center space-x-1.5"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Confirm Settlement</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
