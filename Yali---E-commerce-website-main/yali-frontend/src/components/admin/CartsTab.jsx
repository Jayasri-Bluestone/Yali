import { useState, useEffect } from 'react';
import { Trash2, ShoppingCart, Search, RefreshCw, User, Package } from 'lucide-react';
import { API_URL } from '../../config';
import { Pagination } from './Pagination';

export function CartsTab({ token, showToast }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCarts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/carts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch cart data');
      const data = await res.json();
      setCartItems(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCarts(); }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/carts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to remove cart item');
      showToast('Cart item removed', 'success');
      fetchCarts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filtered = cartItems.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      (item.customer_name || '').toLowerCase().includes(term) ||
      (item.customer_email || '').toLowerCase().includes(term) ||
      (item.product_name || '').toLowerCase().includes(term) ||
      (item.unique_id || '').toLowerCase().includes(term)
    );
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Group by user for summary stats
  const uniqueUsers = [...new Set(cartItems.map(i => i.user_id))];
  const totalValue = cartItems.reduce((s, i) => s + (i.price * i.quantity), 0);
  const totalQty = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-900">{cartItems.length}</div>
            <div className="text-xs text-gray-500 font-medium">Total Cart Items</div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-900">{uniqueUsers.length}</div>
            <div className="text-xs text-gray-500 font-medium">Users with Active Carts</div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-900">₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div className="text-xs text-gray-500 font-medium">Total Cart Value ({totalQty} units)</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">All User Carts</h2>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customer, product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 w-64"
              />
            </div>
            <button
              onClick={fetchCarts}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading cart data...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {searchTerm ? 'No matching cart items found.' : 'No items in any user carts.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Variant</th>
                  <th className="py-3 px-3 text-center">Qty</th>
                  <th className="py-3 px-3 text-right">Subtotal</th>
                  <th className="py-3 px-3">Added</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-3 text-xs text-gray-400 font-mono">#{item.id}</td>
                    <td className="py-3 px-3">
                      <div className="text-sm font-semibold text-gray-800">{item.customer_name}</div>
                      <div className="text-xs text-gray-400">{item.customer_email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                        )}
                        <div>
                          <div className="text-sm font-semibold text-gray-800 max-w-[200px] truncate">{item.product_name}</div>
                          <div className="text-xs text-gray-400">{item.unique_id || `PID-${item.product_id}`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {item.selected_variant ? (
                        <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded">
                          {item.selected_variant}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-gray-800">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-semibold text-gray-800">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-400">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1 cursor-pointer"
                        title="Remove cart item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && filtered.length > 0 && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        )}
      </div>
    </div>
  );
}
