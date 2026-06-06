import { useState, useEffect } from 'react';
import { Trash2, Heart, Search, RefreshCw, User, TrendingUp } from 'lucide-react';
import { API_URL } from '../../config';

export function WishlistsTab({ token, showToast }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchWishlists = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/wishlists`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch wishlist data');
      const data = await res.json();
      setWishlistItems(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWishlists(); }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/wishlists/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to remove wishlist item');
      showToast('Wishlist item removed', 'success');
      fetchWishlists();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filtered = wishlistItems.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      (item.customer_name || '').toLowerCase().includes(term) ||
      (item.customer_email || '').toLowerCase().includes(term) ||
      (item.product_name || '').toLowerCase().includes(term) ||
      (item.unique_id || '').toLowerCase().includes(term) ||
      (item.category || '').toLowerCase().includes(term)
    );
  });

  // Analytics
  const uniqueUsers = [...new Set(wishlistItems.map(i => i.user_id))];

  // Most wishlisted products
  const productCounts = {};
  wishlistItems.forEach(item => {
    const key = item.product_id;
    if (!productCounts[key]) {
      productCounts[key] = { name: item.product_name, image: item.image, count: 0, price: item.price, unique_id: item.unique_id };
    }
    productCounts[key].count++;
  });
  const topProducts = Object.values(productCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-900">{wishlistItems.length}</div>
            <div className="text-xs text-gray-500 font-medium">Total Wishlisted Items</div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-900">{uniqueUsers.length}</div>
            <div className="text-xs text-gray-500 font-medium">Users with Wishlists</div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-900">{Object.keys(productCounts).length}</div>
            <div className="text-xs text-gray-500 font-medium">Unique Products Wishlisted</div>
          </div>
        </div>
      </div>

      {/* Most Wishlisted Products */}
      {topProducts.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900">🔥 Most Wishlisted Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {topProducts.map((prod, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                {prod.image && (
                  <img src={prod.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate">{prod.name}</div>
                  <div className="text-xs text-gray-400">{prod.count} wishlist{prod.count !== 1 ? 's' : ''} · ₹{prod.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">All User Wishlists</h2>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customer, product, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 w-72"
              />
            </div>
            <button
              onClick={fetchWishlists}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading wishlist data...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {searchTerm ? 'No matching wishlist items found.' : 'No items in any user wishlists.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Price</th>
                  <th className="py-3 px-3">Added</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
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
                      <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded capitalize">
                        {item.category || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-gray-800">
                      ₹{Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-400">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1 cursor-pointer"
                        title="Remove wishlist item"
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
      </div>
    </div>
  );
}
