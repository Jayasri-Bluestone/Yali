import { useState } from 'react';
import { X, Wallet, Plus, ArrowDownLeft, TrendingUp, Upload } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import { API_URL } from '../config';

export function WalletDisplay({ isOpen, onClose, balance, onAddMoney, transactions, token }) {
  const { showToast } = useToast();
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [transactionHash, setTransactionHash] = useState('');
  const [transactionScreenshot, setTransactionScreenshot] = useState('');

  if (!isOpen) return null;

  const handleAddMoney = async () => {
    const value = parseFloat(amount);
    if (value > 0) {
      if (paymentMethod === 'usdt') {
        if (!transactionHash || !transactionScreenshot) {
          showToast('Please provide both Transaction Hash and Screenshot', 'warning');
          return;
        }
        await onAddMoney(value, paymentMethod, transactionHash, transactionScreenshot);
      } else {
        await onAddMoney(value, paymentMethod);
      }
      setAmount('');
      setTransactionHash('');
      setTransactionScreenshot('');
      setShowAddMoney(false);
    }
  };

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      showToast('Uploading screenshot...', 'info');
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setTransactionScreenshot(data.url);
      showToast('Screenshot uploaded successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl z-50 overflow-hidden shadow-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-[#1873e8] border-b-4 border-[#10b981] text-white">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6" />
            <h2 className="text-2xl font-bold">My Wallet</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Balance Card */}
          <div className="bg-[#1873e8] border-l-4 border-[#10b981] rounded-xl p-6 text-white mb-6 shadow-lg">
            <div className="text-sm opacity-90 mb-2">Available Balance</div>
            <div className="text-4xl font-bold mb-4">{formatINR(balance)}</div>
            <button
              onClick={() => setShowAddMoney(!showAddMoney)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Money
            </button>
          </div>

          {/* Add Money Section */}
          {showAddMoney && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
              <h3 className="font-semibold mb-3">Add Money to Wallet</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                />
                <button
                  onClick={handleAddMoney}
                  className="px-6 py-2 bg-[#0066cc] text-white rounded-lg font-medium hover:bg-[#0055aa] transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex gap-2 mt-3 mb-4">
                {[10, 50, 100, 500].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val.toString())}
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:border-[#0066cc] hover:text-[#0066cc] transition-colors"
                  >
                    ₹{val}
                  </button>
                ))}
              </div>

              {/* Payment Method Selection */}
              {amount && parseFloat(amount) > 0 && (
                <div className="space-y-3 animate-fade-in">
                  <h4 className="text-sm font-medium text-gray-700">Payment Method</h4>
                  <div className="flex gap-3">
                    <label className={`flex-1 flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-[#0066cc] bg-blue-50' : 'border-gray-200 hover:border-[#0066cc]/50 bg-white'}`}>
                      <input type="radio" className="sr-only" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} />
                      <span className="text-xl mb-1">💳</span>
                      <span className="text-xs font-semibold">Online Payment</span>
                    </label>
                    <label className={`flex-1 flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'usdt' ? 'border-[#0066cc] bg-blue-50' : 'border-gray-200 hover:border-[#0066cc]/50 bg-white'}`}>
                      <input type="radio" className="sr-only" checked={paymentMethod === 'usdt'} onChange={() => setPaymentMethod('usdt')} />
                      <span className="text-xl mb-1">🪙</span>
                      <span className="text-xs font-semibold">USDT Crypto</span>
                    </label>
                  </div>

                  {paymentMethod === 'usdt' && (
                    <div className="mt-4 bg-white border border-emerald-100 rounded-xl p-4 shadow-sm space-y-4">
                      <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-xs border border-emerald-100">
                        <p className="font-bold mb-1">Send your USDT to the address below:</p>
                        <p className="font-mono bg-white px-2 py-1 rounded border border-emerald-200 break-all select-all">
                          {import.meta.env.VITE_USDT_WALLET_ADDRESS || '0xPlaceholderAddressForUSDTWallet'}
                        </p>
                        <p className="mt-2 opacity-80">Network: TRC20 / ERC20</p>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Transaction Hash (TxID) *</label>
                        <input
                          type="text"
                          value={transactionHash}
                          onChange={(e) => setTransactionHash(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                          placeholder="e.g. 0x123abc..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Screenshot *</label>
                        {transactionScreenshot ? (
                          <div className="relative inline-block mt-1">
                            <img src={transactionScreenshot} alt="Screenshot" className="h-20 w-auto rounded border border-gray-200" />
                            <button 
                              type="button" 
                              onClick={() => setTransactionScreenshot('')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleScreenshotUpload}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleAddMoney}
                    disabled={!amount || parseFloat(amount) <= 0 || (paymentMethod === 'usdt' && (!transactionHash || !transactionScreenshot))}
                    className="w-full py-2.5 mt-2 bg-[#0066cc] text-white rounded-xl font-semibold hover:bg-[#0055aa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Proceed with Top-up
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Transactions */}
          <div>
            <h3 className="font-semibold mb-3">Recent Transactions</h3>
            {transactions.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        txn.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <ArrowDownLeft className={`w-5 h-5 ${
                          txn.type === 'credit' ? 'text-green-600 rotate-180' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{txn.description}</div>
                        <div className="text-xs text-gray-500">{txn.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {txn.type === 'credit' ? '+' : '-'}{formatINR(txn.amount)}
                      </div>
                      {txn.status === 'pending' && (
                        <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Pending</span>
                      )}
                      {txn.status === 'rejected' && (
                        <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">Rejected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Wallet className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No transactions yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
