import { useState, useEffect } from 'react';
import { Wallet, Settings, TrendingUp, TrendingDown, ArrowUpCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../config';

export function AdminWalletTab({ token }) {
  const { showToast } = useToast();
  
  const [wallet, setWallet] = useState({ balance: 0, low_balance_threshold: 100 });
  const [loading, setLoading] = useState(true);
  
  const [topupAmount, setTopupAmount] = useState('');
  const [thresholdInput, setThresholdInput] = useState('');
  const [isUpdatingThreshold, setIsUpdatingThreshold] = useState(false);
  const [isToppingUp, setIsToppingUp] = useState(false);

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const fetchWalletDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/wallet`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch wallet');
      
      setWallet(data);
      setThresholdInput(data.low_balance_threshold);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateThreshold = async (e) => {
    e.preventDefault();
    if (!thresholdInput || isNaN(parseFloat(thresholdInput))) {
      showToast("Please enter a valid threshold amount", "warning");
      return;
    }
    
    setIsUpdatingThreshold(true);
    try {
      const res = await fetch(`${API_URL}/admin/wallet/threshold`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ threshold: parseFloat(thresholdInput) })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update threshold');
      
      showToast(data.message, 'success');
      await fetchWalletDetails();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsUpdatingThreshold(false);
    }
  };

  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!topupAmount || isNaN(parseFloat(topupAmount)) || parseFloat(topupAmount) <= 0) {
      showToast("Please enter a valid top-up amount", "warning");
      return;
    }

    setIsToppingUp(true);
    try {
      const res = await fetch(`${API_URL}/admin/wallet/topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: parseFloat(topupAmount) })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to top up wallet');

      showToast(data.message, 'success');
      setTopupAmount('');
      await fetchWalletDetails();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsToppingUp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isLowBalance = parseFloat(wallet.balance) < parseFloat(wallet.low_balance_threshold);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="w-8 h-8 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-900">Admin Wallet Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Wallet Balance Card */}
        <div className={`bg-white p-6 rounded-2xl shadow-sm border ${isLowBalance ? 'border-red-300' : 'border-gray-200'}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Current Balance</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-black text-gray-900">₹{(parseFloat(wallet.balance) || 0).toFixed(2)}</span>
              </div>
            </div>
            <div className={`p-3 rounded-xl ${isLowBalance ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {isLowBalance ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
            </div>
          </div>
          
          {isLowBalance && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
              <span className="font-bold">⚠️ Warning:</span> Balance is below the configured threshold (₹{wallet.low_balance_threshold}). Please top up to avoid refund failures.
            </div>
          )}
        </div>

        {/* Top Up Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpCircle className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-gray-900">Top Up Wallet</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Add funds to the admin wallet to process customer refunds and cashbacks.</p>
          
          <form onSubmit={handleTopUp} className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
              <input
                type="number"
                min="1"
                step="0.01"
                required
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="Amount to add"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isToppingUp}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-sm"
            >
              {isToppingUp ? 'Processing...' : 'Top Up'}
            </button>
          </form>
        </div>

        {/* Settings Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">Wallet Settings</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Low Balance Threshold</h4>
              <p className="text-xs text-gray-500 mb-4">Receive email warnings when the wallet balance drops below this amount.</p>
              
              <form onSubmit={handleUpdateThreshold} className="flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={thresholdInput}
                    onChange={(e) => setThresholdInput(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingThreshold}
                  className="px-6 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-sm"
                >
                  {isUpdatingThreshold ? 'Saving...' : 'Save'}
                </button>
              </form>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600 space-y-2">
              <p><strong className="text-gray-900">How it works:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>When an order is returned or cancelled, the refund amount is deducted from this Admin Wallet.</li>
                <li>The refunded amount is automatically credited to the customer's wallet.</li>
                <li>If this Admin Wallet balance drops below your configured threshold, a warning email is dispatched to the system administrator.</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
