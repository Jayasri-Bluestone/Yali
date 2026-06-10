import { X, User, Mail, Phone, Wallet, Package, Clock, LogOut, ArrowLeft, MapPin, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useToast } from '../context/ToastContext';

export function ProfilePage({
  user,
  orders = [],
  transactions = [],
  onAddMoney,
  onLogout
}) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    title: 'Home', full_name: '', phone: '', address_line: '', city: '', state: '', pincode: '', is_default: false
  });

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('yali_token');
      if (!token) return;
      const res = await fetch(`${API_URL}/addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('yali_token');
      const method = editingAddress ? 'PUT' : 'POST';
      const url = editingAddress ? `${API_URL}/addresses/${editingAddress.id}` : `${API_URL}/addresses`;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(addressForm)
      });
      
      if (res.ok) {
        showToast(editingAddress ? 'Address updated' : 'Address added', 'success');
        setIsAddressModalOpen(false);
        fetchAddresses();
      } else {
        showToast('Failed to save address', 'error');
      }
    } catch (err) {
      showToast('Error saving address', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const token = localStorage.getItem('yali_token');
      const res = await fetch(`${API_URL}/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Address deleted', 'info');
        fetchAddresses();
      }
    } catch (err) {
      showToast('Error deleting address', 'error');
    }
  };

  const handleSetDefaultAddress = async (addr) => {
    if (addr.is_default) return;
    try {
      const token = localStorage.getItem('yali_token');
      const res = await fetch(`${API_URL}/addresses/${addr.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...addr, is_default: true })
      });
      if (res.ok) fetchAddresses();
    } catch (err) {
      showToast('Error updating default address', 'error');
    }
  };

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
                  <span className="font-semibold text-gray-850">INR (₹)</span>
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
                <div className="text-3xl font-black text-gray-950">₹{(user.wallet || 0).toFixed(2)}</div>
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
                    placeholder="₹2500"
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
                      {t.type === 'credit' ? '+' : '-'}₹{t.amount}
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-400" />
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Recent Orders</h3>
              </div>
              <button 
                onClick={() => navigate('/orders')}
                className="text-xs font-bold text-[#0066cc] hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {userOrders.slice(0, 3).map(o => (
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
                    <span className="font-bold text-gray-850 text-sm">₹{(o.total || 0).toFixed(2)}</span>
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

          {/* Address Book Section */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Address Book</h3>
              </div>
              <button 
                onClick={() => {
                  setEditingAddress(null);
                  setAddressForm({ title: 'Home', full_name: user.name, phone: user.phone || '', address_line: '', city: '', state: '', pincode: '', is_default: false });
                  setIsAddressModalOpen(true);
                }}
                className="text-xs font-bold text-[#0066cc] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-blue-100"
              >
                <Plus className="w-3.5 h-3.5" /> Add New
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map(addr => (
                <div key={addr.id} className={`p-4 border rounded-xl relative flex flex-col justify-between ${addr.is_default ? 'border-[#0066cc] bg-blue-50/30' : 'border-gray-200 bg-gray-50'}`}>
                  {addr.is_default && (
                    <div className="absolute top-0 right-0 bg-[#0066cc] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Default
                    </div>
                  )}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2 mt-1">
                      <span className="bg-gray-200 text-gray-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded">{addr.title}</span>
                      <span className="font-bold text-sm text-gray-900">{addr.full_name}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{addr.address_line}</p>
                    <p className="text-xs text-gray-600 mb-1">{addr.city}, {addr.state} {addr.pincode}</p>
                    <p className="text-xs font-medium text-gray-800 flex items-center gap-1 mt-2">
                      <Phone className="w-3 h-3 text-gray-400" /> {addr.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                    {!addr.is_default && (
                      <button 
                        onClick={() => handleSetDefaultAddress(addr)}
                        className="text-[11px] font-bold text-[#0066cc] hover:underline cursor-pointer"
                      >
                        Set as Default
                      </button>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setEditingAddress(addr);
                          setAddressForm(addr);
                          setIsAddressModalOpen(true);
                        }}
                        className="p-1.5 text-gray-500 hover:text-[#0066cc] hover:bg-blue-50 rounded transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {addresses.length === 0 && (
                <div className="col-span-1 md:col-span-2 text-center py-8 text-gray-450 text-xs border border-dashed border-gray-300 rounded-xl">
                  No saved addresses. Add one to checkout faster!
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black text-gray-900 mb-6">{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
            
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Save As</label>
                  <select 
                    value={addressForm.title}
                    onChange={e => setAddressForm({...addressForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0066cc] text-sm"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                  <input 
                    type="text" required
                    value={addressForm.full_name}
                    onChange={e => setAddressForm({...addressForm, full_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0066cc] text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                <input 
                  type="tel" required
                  value={addressForm.phone}
                  onChange={e => setAddressForm({...addressForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0066cc] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Street Address *</label>
                <textarea 
                  required rows="2"
                  value={addressForm.address_line}
                  onChange={e => setAddressForm({...addressForm, address_line: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0066cc] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
                  <input 
                    type="text" required
                    value={addressForm.city}
                    onChange={e => setAddressForm({...addressForm, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0066cc] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                  <input 
                    type="text" required
                    value={addressForm.state}
                    onChange={e => setAddressForm({...addressForm, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0066cc] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">PIN Code *</label>
                <input 
                  type="text" required
                  value={addressForm.pincode}
                  onChange={e => setAddressForm({...addressForm, pincode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0066cc] text-sm"
                />
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="is_default"
                  checked={addressForm.is_default}
                  onChange={e => setAddressForm({...addressForm, is_default: e.target.checked})}
                  className="w-4 h-4 text-[#0066cc] border-gray-300 rounded focus:ring-[#0066cc]"
                />
                <label htmlFor="is_default" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Make this my default address
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button 
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#0066cc] to-[#10b981] text-white rounded-xl font-bold hover:shadow-lg transition-all cursor-pointer"
                >
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
