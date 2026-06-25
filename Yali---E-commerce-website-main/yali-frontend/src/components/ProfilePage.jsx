import {
  X, User, Mail, Phone, Wallet, Package, Clock, LogOut, ArrowLeft,
  MapPin, Plus, Trash2, Edit2, CheckCircle2, MessageSquare,
  ChevronRight, ShieldCheck, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useToast } from '../context/ToastContext';

const NAV_ITEMS = [
  { key: 'wallet',    label: 'Account & Wallet',  icon: Wallet },
  { key: 'orders',    label: 'My Orders',          icon: Package },
  { key: 'enquiries', label: 'My Enquiries',       icon: MessageSquare },
  { key: 'addresses', label: 'My Addresses',       icon: MapPin },
  { key: 'account',   label: 'Account Info',       icon: User },
];

export function ProfilePage({ user, orders = [], transactions = [], onAddMoney, onLogout }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('wallet');

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    title: 'Home', full_name: '', phone: '', address_line: '', city: '', state: '', pincode: '', is_default: false
  });

  // Wallet state
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [transactionHash, setTransactionHash] = useState('');
  const [transactionScreenshot, setTransactionScreenshot] = useState('');

  // Enquiries state
  const [enquiries, setEnquiries] = useState([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAddresses();
      fetchMyEnquiries();
    }
  }, [user]);

  /* ─── Fetchers ─── */
  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('yali_token');
      if (!token) return;
      const res = await fetch(`${API_URL}/addresses`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setAddresses(await res.json());
    } catch (err) { console.error('Failed to fetch addresses', err); }
  };

  const fetchMyEnquiries = async () => {
    setEnquiriesLoading(true);
    try {
      const token = localStorage.getItem('yali_token');
      if (!token) return;
      const res = await fetch(`${API_URL}/my-enquiries`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setEnquiries(await res.json());
    } catch (err) { console.error('Failed to fetch my enquiries', err); }
    finally { setEnquiriesLoading(false); }
  };

  /* ─── Wallet ─── */
  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      showToast('Uploading screenshot...', 'info');
      const token = localStorage.getItem('yali_token');
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setTransactionScreenshot(data.url);
      showToast('Screenshot uploaded successfully', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleAddMoneySubmit = async (e) => {
    e.preventDefault();
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
      setAmount(''); setTransactionHash(''); setTransactionScreenshot('');
    }
  };

  /* ─── Addresses ─── */
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('yali_token');
      const method = editingAddress ? 'PUT' : 'POST';
      const url = editingAddress ? `${API_URL}/addresses/${editingAddress.id}` : `${API_URL}/addresses`;
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(addressForm)
      });
      if (res.ok) {
        showToast(editingAddress ? 'Address updated' : 'Address added', 'success');
        setIsAddressModalOpen(false); fetchAddresses();
      } else { showToast('Failed to save address', 'error'); }
    } catch (err) { showToast('Error saving address', 'error'); }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const token = localStorage.getItem('yali_token');
      const res = await fetch(`${API_URL}/addresses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { showToast('Address deleted', 'info'); fetchAddresses(); }
    } catch (err) { showToast('Error deleting address', 'error'); }
  };

  const handleSetDefaultAddress = async (addr) => {
    if (addr.is_default) return;
    try {
      const token = localStorage.getItem('yali_token');
      const res = await fetch(`${API_URL}/addresses/${addr.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...addr, is_default: true })
      });
      if (res.ok) fetchAddresses();
    } catch (err) { showToast('Error updating default address', 'error'); }
  };

  if (!user) return null;

  const userOrders = orders.filter(o => o.customer_id === user.id || o.customerEmail === user.email);
  const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  /* ────────────────────────────────── RENDER ─────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={() => { onLogout(); navigate('/'); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl border border-red-200 transition-colors text-sm shadow-sm"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden sticky top-4">
              {/* User avatar */}
              <div className="bg-gradient-to-br from-[#0066cc] to-indigo-600 p-6 text-white">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black mb-3 shadow-inner">
                  {initials}
                </div>
                <p className="font-black text-lg leading-tight">{user.name}</p>
                <p className="text-blue-100 text-xs mt-0.5 truncate">{user.email}</p>
                <div className="mt-3 flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5 w-fit">
                  <Wallet className="w-3.5 h-3.5" />
                  <span className="text-sm font-black">₹{(user.wallet || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Nav items */}
              <nav className="p-3">
                {NAV_ITEMS.map(item => {
                  const Icon = item.icon;
                  const active = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-semibold transition-all text-left
                        ${active
                          ? 'bg-[#0066cc] text-white shadow-md shadow-blue-200'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
                      <span className="flex-1">{item.label}</span>
                      {!active && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* ── RIGHT CONTENT ── */}
          <main className="flex-1 min-w-0">

            {/* ═══ WALLET TAB ═══ */}
            {activeTab === 'wallet' && (
              <div className="space-y-5">
                <SectionHeader icon={Wallet} title="Account & Wallet" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Balance + top-up */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Wallet Balance</h4>
                      <Wallet className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="text-4xl font-black text-gray-950 mb-1">₹{(user.wallet || 0).toFixed(2)}</div>
                    <p className="text-[11px] text-gray-400">Top up using the form below.</p>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <form onSubmit={handleAddMoneySubmit} className="flex flex-col gap-3">
                        <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
                          placeholder="Amount (e.g. 2500)" required
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc]/30"
                        />
                        {amount && parseFloat(amount) > 0 && (
                          <div className="space-y-3 animate-fade-in">
                            <p className="text-[11px] font-bold text-gray-600 uppercase">Payment Method</p>
                            <div className="flex gap-2">
                              {[['online', '💳', 'Online'], ['usdt', '🪙', 'USDT']].map(([val, em, lbl]) => (
                                <label key={val} className={`flex-1 flex flex-col items-center p-2 border rounded-xl cursor-pointer transition-colors text-[11px] font-semibold
                                  ${paymentMethod === val ? 'border-[#0066cc] bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                  <input type="radio" className="sr-only" checked={paymentMethod === val} onChange={() => setPaymentMethod(val)} />
                                  <span className="text-lg mb-0.5">{em}</span>{lbl}
                                </label>
                              ))}
                            </div>
                            {paymentMethod === 'usdt' && (
                              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 space-y-2">
                                <p className="text-[10px] font-bold text-emerald-700">USDT Wallet Address:</p>
                                <p className="font-mono text-[10px] bg-white px-2 py-1 rounded border border-emerald-200 break-all">
                                  {import.meta.env.VITE_USDT_WALLET_ADDRESS || '0xPlaceholderAddress'}
                                </p>
                                <input type="text" value={transactionHash} onChange={e => setTransactionHash(e.target.value)}
                                  placeholder="Transaction Hash (TxID) *"
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                                />
                                {transactionScreenshot ? (
                                  <div className="relative inline-block">
                                    <img src={transactionScreenshot} alt="Screenshot" className="h-14 rounded border" />
                                    <button type="button" onClick={() => setTransactionScreenshot('')}
                                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5">
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <input type="file" accept="image/*" onChange={handleScreenshotUpload}
                                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 cursor-pointer"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        <button type="submit"
                          disabled={!amount || parseFloat(amount) <= 0 || (paymentMethod === 'usdt' && (!transactionHash || !transactionScreenshot))}
                          className="w-full py-2.5 bg-[#0066cc] text-white rounded-xl text-sm font-bold hover:bg-[#0052a3] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Top Up Wallet
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Transaction log */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Transaction Logs</h4>
                    <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1 flex-1">
                      {transactions.length === 0 ? (
                        <EmptyState text="No transaction logs yet." />
                      ) : transactions.map(t => (
                        <div key={t.id} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                          <div>
                            <span className="font-semibold text-xs text-gray-800 block">{t.description}</span>
                            <span className="text-[10px] text-gray-400">{t.date?.split('T')[0] || t.date}</span>
                          </div>
                          <div className="text-right">
                            <span className={`font-black text-sm ${t.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                              {t.type === 'credit' ? '+' : '-'}₹{t.amount}
                            </span>
                            {(t.status === 'pending' || t.status === 'rejected') && (
                              <span className={`block text-[9px] font-bold uppercase mt-0.5 px-1.5 py-0.5 rounded-full w-fit ml-auto
                                ${t.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                                {t.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ ORDERS TAB ═══ */}
            {activeTab === 'orders' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <SectionHeader icon={Package} title="My Orders" />
                  <button onClick={() => navigate('/orders')} className="text-xs font-bold text-[#0066cc] hover:underline">View All</button>
                </div>
                <div className="space-y-3">
                  {userOrders.length === 0 ? (
                    <EmptyCard text="No orders yet. Start shopping!" />
                  ) : userOrders.map(o => (
                    <div key={o.order_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-sm text-[#0066cc]">{o.order_id}</span>
                          <span className="text-gray-400 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />{o.order_date?.split('T')[0] || o.order_date}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {o.items?.map(it => `${it.name} (x${it.quantity})`).join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <span className="font-black text-gray-900">₹{(o.total || 0).toFixed(2)}</span>
                        <StatusBadge status={o.status || 'Pending'} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ ENQUIRIES TAB ═══ */}
            {activeTab === 'enquiries' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <SectionHeader icon={MessageSquare} title="My Enquiries" />
                  <button onClick={fetchMyEnquiries} className="text-xs font-bold text-[#0066cc] hover:underline">Refresh</button>
                </div>
                {enquiriesLoading ? (
                  <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>
                ) : enquiries.length === 0 ? (
                  <EmptyCard text="No enquiries submitted yet." />
                ) : (
                  <div className="space-y-3">
                    {enquiries.map(q => (
                      <div key={q.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                q.type === 'property' ? 'bg-emerald-100 text-emerald-700' :
                                q.type === 'vehicle'  ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-200 text-gray-600'}`}>
                                {q.type === 'property' ? '🏠 Property' : q.type === 'vehicle' ? '🚗 Vehicle' : '📋 General'}
                              </span>
                              {q.cta_action && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 capitalize">
                                  {q.cta_action.replace(/_/g, ' ')}
                                </span>
                              )}
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                q.status === 'resolved'  ? 'bg-green-100 text-green-700' :
                                q.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'}`}>
                                {q.status || 'pending'}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-gray-900 mb-0.5">
                              {q.product_name || q.category || `Enquiry #${q.id}`}
                            </p>
                            {q.message && <p className="text-xs text-gray-500 line-clamp-2">{q.message}</p>}
                          </div>
                          <div className="text-right text-[11px] text-gray-400 shrink-0">
                            {q.preferred_date && (
                              <p className="mb-0.5">📅 {new Date(q.preferred_date).toLocaleDateString()}</p>
                            )}
                            <p>{new Date(q.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ═══ ADDRESSES TAB ═══ */}
            {activeTab === 'addresses' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <SectionHeader icon={MapPin} title="My Addresses" />
                  <button
                    onClick={() => {
                      setEditingAddress(null);
                      setAddressForm({ title: 'Home', full_name: user.name, phone: user.phone || '', address_line: '', city: '', state: '', pincode: '', is_default: false });
                      setIsAddressModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#0066cc] border border-blue-100 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New
                  </button>
                </div>
                {addresses.length === 0 ? (
                  <EmptyCard text="No saved addresses. Add one to checkout faster!" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                      <div key={addr.id} className={`bg-white rounded-2xl border shadow-sm p-4 relative flex flex-col justify-between
                        ${addr.is_default ? 'border-[#0066cc] ring-1 ring-[#0066cc]/20' : 'border-gray-100'}`}>
                        {addr.is_default && (
                          <div className="absolute top-0 right-0 bg-[#0066cc] text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-xl rounded-tr-2xl flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Default
                          </div>
                        )}
                        <div className="mb-4 mt-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-gray-100 text-gray-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded">{addr.title}</span>
                            <span className="font-bold text-sm">{addr.full_name}</span>
                          </div>
                          <p className="text-xs text-gray-600">{addr.address_line}</p>
                          <p className="text-xs text-gray-600">{addr.city}, {addr.state} {addr.pincode}</p>
                          <p className="text-xs text-gray-700 font-medium mt-1.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />{addr.phone}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                          {!addr.is_default && (
                            <button onClick={() => handleSetDefaultAddress(addr)}
                              className="text-[11px] font-bold text-[#0066cc] hover:underline">Set Default</button>
                          )}
                          <div className="ml-auto flex items-center gap-2">
                            <button onClick={() => { setEditingAddress(addr); setAddressForm(addr); setIsAddressModalOpen(true); }}
                              className="p-1.5 text-gray-400 hover:text-[#0066cc] hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteAddress(addr.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ═══ ACCOUNT INFO TAB ═══ */}
            {activeTab === 'account' && (
              <div className="space-y-5">
                <SectionHeader icon={User} title="Account Info" />
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      { icon: User,        color: 'bg-blue-100 text-[#0066cc]',    label: 'Full Name',   val: user.name },
                      { icon: Mail,        color: 'bg-green-100 text-green-600',   label: 'Email',       val: user.email },
                      { icon: Phone,       color: 'bg-purple-100 text-purple-600', label: 'Phone',       val: user.phone || 'Not provided' },
                      { icon: ShieldCheck, color: 'bg-amber-100 text-amber-600',   label: 'Role',        val: user.role || 'customer' },
                      { icon: Wallet,      color: 'bg-indigo-100 text-indigo-600', label: 'Currency',    val: 'INR (₹)' },
                    ].map(({ icon: Icon, color, label, val }) => (
                      <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase font-bold">{label}</span>
                          <span className="font-semibold text-gray-900 text-sm">{val}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ── Address Modal ── */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAddressModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black text-gray-900 mb-5">{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Save As</label>
                  <select value={addressForm.title} onChange={e => setAddressForm({ ...addressForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0066cc]">
                    <option>Home</option><option>Work</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                  <input type="text" required value={addressForm.full_name}
                    onChange={e => setAddressForm({ ...addressForm, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0066cc]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone *</label>
                <input type="tel" required value={addressForm.phone}
                  onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0066cc]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Street Address *</label>
                <textarea required rows="2" value={addressForm.address_line}
                  onChange={e => setAddressForm({ ...addressForm, address_line: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0066cc]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
                  <input type="text" required value={addressForm.city}
                    onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0066cc]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                  <input type="text" required value={addressForm.state}
                    onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0066cc]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">PIN Code *</label>
                <input type="text" required value={addressForm.pincode}
                  onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0066cc]" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_default" checked={addressForm.is_default}
                  onChange={e => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                  className="w-4 h-4 text-[#0066cc] rounded" />
                <label htmlFor="is_default" className="text-sm font-medium text-gray-700 cursor-pointer">Make this my default address</label>
              </div>
              <button type="submit"
                className="w-full py-3 bg-[#0066cc] hover:bg-[#0052a3] text-white rounded-xl font-bold transition-colors shadow-sm">
                {editingAddress ? 'Update Address' : 'Save Address'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Small helper components ── */
function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <div className="w-8 h-8 rounded-xl bg-[#0066cc]/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-[#0066cc]" />
      </div>
      <h2 className="text-lg font-black text-gray-900">{title}</h2>
    </div>
  );
}

function EmptyState({ text }) {
  return <p className="text-center py-8 text-gray-400 text-xs">{text}</p>;
}

function EmptyCard({ text }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-400 text-sm">
      {text}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Delivered: 'bg-green-50 text-green-600 border-green-100',
    Cancelled: 'bg-red-50 text-red-500 border-red-100',
  };
  const cls = map[status] || 'bg-amber-50 text-amber-600 border-amber-100';
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${cls}`}>{status}</span>;
}
