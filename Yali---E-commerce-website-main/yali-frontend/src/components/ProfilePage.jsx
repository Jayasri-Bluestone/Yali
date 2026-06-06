import { X, User, Mail, Phone, Wallet, Package, Clock, LogOut, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProfilePage({
  user,
  orders = [],
  transactions = [],
  onAddMoney,
  onLogout
}) {
  const navigate = useNavigate();

  if (!user) return null;

  // Filter orders for this specific customer
  const userOrders = orders.filter(o => o.customer_id === user.id || o.customerEmail === user.email);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <User className="w-8 h-8 text-[#0066cc]" />
            <h1 className="text-3xl font-black text-gray-900">My Personal Profile</h1>
          </div>
          <button
            onClick={() => {
              onLogout();
              navigate('/');
            }}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-750 font-bold rounded-xl border border-red-200 transition-colors flex items-center gap-2 text-sm cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-6 space-y-8">
          {/* User Details Grid */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Account Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-[#0066cc]">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Full Name</span>
                  <span className="font-semibold text-gray-850">{user.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Email Address</span>
                  <span className="font-semibold text-gray-850 truncate max-w-[200px] block" title={user.email}>{user.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Phone Contact</span>
                  <span className="font-semibold text-gray-850">{user.phone || 'Not provided'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Wallet Currency</span>
                  <span className="font-semibold text-gray-850">USD ($)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Dashboard Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-250 p-5 rounded-2xl bg-white flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Account Wallet</h4>
                  <Wallet className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-3xl font-black text-gray-950">${(user.wallet || 0).toFixed(2)}</div>
                <p className="text-[11px] text-gray-400 mt-1">Add money using the instant gateway below.</p>
              </div>

              {/* Deposit funds */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const amt = parseFloat(e.target.amount.value);
                    if (amt > 0) {
                      onAddMoney(amt);
                      e.target.reset();
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    placeholder="$25.00"
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0066cc] text-white rounded-lg text-xs font-bold hover:bg-[#0052a3] transition-colors cursor-pointer"
                  >
                    Deposit
                  </button>
                </form>
              </div>
            </div>

            {/* Wallet logs list */}
            <div className="border border-gray-250 p-5 rounded-2xl bg-white flex flex-col">
              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">Transaction Logs</h4>
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[140px] pr-1 scrollbar-hide text-xs">
                {transactions.map(t => (
                  <div key={t.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-150">
                    <div>
                      <span className="font-semibold text-gray-800 block truncate max-w-[150px]">{t.description}</span>
                      <span className="text-[9px] text-gray-400 block">{t.date?.split('T')[0] || t.date}</span>
                    </div>
                    <span className={`font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                      {t.type === 'credit' ? '+' : '-'}${t.amount}
                    </span>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-center py-6 text-gray-400">No transaction logs registered.</p>
                )}
              </div>
            </div>
          </div>

          {/* Orders History section */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-gray-400" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Purchase History</h3>
            </div>
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {userOrders.map(o => (
                <div key={o.order_id} className="p-4 bg-gray-50 border border-gray-150 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0066cc]">{o.order_id}</span>
                      <span className="text-gray-400 text-xs font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {o.order_date?.split('T')[0] || o.order_date}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">Items: {o.items?.map(it => `${it.name} (x${it.quantity})`).join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <span className="font-bold text-gray-850 text-sm">${(o.total || 0).toFixed(2)}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      o.status === 'Delivered' 
                        ? 'bg-green-50 text-green-600 border border-green-150' 
                        : (o.status === 'Cancelled' ? 'bg-red-50 text-red-500 border border-red-150' : 'bg-amber-50 text-amber-600 border border-amber-150')
                    }`}>
                      {o.status || 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
              {userOrders.length === 0 && (
                <p className="text-center py-8 text-gray-450 text-xs">No products purchased yet.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
