import { useState } from 'react';
import { X, Wallet, Plus, ArrowDownLeft, TrendingUp } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';

export function WalletDisplay({ isOpen, onClose, balance, onAddMoney, transactions }) {
  const { showToast } = useToast();
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const handleAddMoney = () => {
    const value = parseFloat(amount);
    if (value > 0) {
      onAddMoney(value);
      setAmount('');
      setShowAddMoney(false);
      showToast(`₹${value} added to your wallet successfully!`, 'success');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl z-50 overflow-hidden shadow-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[#0066cc] to-[#10b981] text-white">
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
          <div className="bg-gradient-to-br from-[#0066cc] to-[#10b981] rounded-xl p-6 text-white mb-6 shadow-lg">
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
              <div className="flex gap-2 mt-3">
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
                    <div className={`font-semibold ${
                      txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {txn.type === 'credit' ? '+' : '-'}{formatINR(txn.amount)}
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
