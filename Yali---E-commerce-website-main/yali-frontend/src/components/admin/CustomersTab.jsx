import { useState, useEffect } from 'react';
import { ToggleSwitch } from './ToggleSwitch';
import { API_URL } from '../../config';
import { ShoppingCart, Heart, XCircle, Eye, Bookmark } from 'lucide-react';
import { Pagination } from './Pagination';

export function CustomersTab({
  users,
  categoriesList,
  handleToggleUserStatus,
  handleUserRoleChange,
  token,
  showToast
}) {
  const [carts, setCarts] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const filteredUsers = users.filter(u => u.role === 'customer');
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const currentItems = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/admin/carts`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setCarts(data))
      .catch(err => console.error(err));
      
    fetch(`${API_URL}/admin/wishlists`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setWishlists(data))
      .catch(err => console.error(err));
  }, [token]);
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-950">Registered Customer Directory</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 font-semibold bg-gray-50">
              <th className="p-4 rounded-l-lg">User Name</th>
              <th className="p-4">Contact Email & Phone</th>
              <th className="p-4">Wallet Balance</th>
              <th className="p-4">Access Status</th>
              <th className="p-4">Admin Category Lock</th>
              <th className="p-4 text-center">Activity</th>
              <th className="p-4 text-right rounded-r-lg">Actions / Role</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(u => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-950">{u.name}</div>
                    <span className="inline-block font-semibold px-2 py-0.5 rounded text-[10px] uppercase bg-blue-100 text-blue-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div>{u.email}</div>
                    <div className="text-xs text-gray-500">{u.phone || 'No phone'}</div>
                  </td>
                  <td className="p-4 font-semibold text-gray-950">₹{(u.wallet || 0).toFixed(2)}</td>
                  <td className="p-4">
                    <ToggleSwitch 
                      checked={u.status === 'active'}
                      onChange={() => handleToggleUserStatus(u.id, u.status)}
                      activeLabel="Active"
                      inactiveLabel="Disabled"
                    />
                  </td>
                  <td className="p-4">
                    <select
                      value={u.managed_category || 'all'}
                      onChange={(e) => handleUserRoleChange(u.id, u.role, e.target.value === 'all' ? null : e.target.value)}
                      disabled={u.role !== 'admin'}
                      className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="all">Full Access (All)</option>
                      {categoriesList.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Lists
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <select
                      value={u.role || 'customer'}
                      onChange={(e) => handleUserRoleChange(u.id, e.target.value, u.managed_category)}
                      className="px-2 py-1 bg-white border border-gray-300 rounded text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="customer">Customer</option>
                      <option value="vendor">Vendor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />

      {/* User Activity Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}'s Activity</h3>
                <p className="text-xs text-gray-500 mt-0.5">{selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-white cursor-pointer">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Cart Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-purple-100 p-1.5 rounded-lg"><ShoppingCart className="w-4 h-4 text-purple-600" /></div>
                  <h4 className="text-lg font-bold text-gray-800">Shopping Cart</h4>
                </div>
                {carts.filter(c => c.user_id === selectedUser.id && c.status !== 'saved').length === 0 ? (
                  <div className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center border border-gray-100">Cart is empty</div>
                ) : (
                  <div className="space-y-3">
                    {carts.filter(c => c.user_id === selectedUser.id && c.status !== 'saved').map(item => (
                      <div key={item.id} className="flex items-center gap-4 bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                        {item.image ? (
                          <img src={item.image} className="w-12 h-12 object-cover rounded-lg border border-gray-100" alt={item.product_name} />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200"><ShoppingCart className="w-5 h-5 text-gray-300"/></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm truncate">{item.product_name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            ₹{item.price} × {item.quantity} {item.selected_variant ? `(${item.selected_variant})` : ''}
                          </div>
                        </div>
                        <div className="text-right font-bold text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Saved Items Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-indigo-100 p-1.5 rounded-lg"><Bookmark className="w-4 h-4 text-indigo-600" /></div>
                  <h4 className="text-lg font-bold text-gray-800">Saved Items</h4>
                </div>
                {carts.filter(c => c.user_id === selectedUser.id && c.status === 'saved').length === 0 ? (
                  <div className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center border border-gray-100">No saved items</div>
                ) : (
                  <div className="space-y-3">
                    {carts.filter(c => c.user_id === selectedUser.id && c.status === 'saved').map(item => (
                      <div key={item.id} className="flex items-center gap-4 bg-white border border-gray-200 p-3 rounded-xl shadow-sm opacity-80">
                        {item.image ? (
                          <img src={item.image} className="w-10 h-10 object-cover rounded-lg border border-gray-100 grayscale" alt={item.product_name} />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200"><Bookmark className="w-4 h-4 text-gray-300"/></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm truncate">{item.product_name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">₹{item.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Wishlist Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-rose-100 p-1.5 rounded-lg"><Heart className="w-4 h-4 text-rose-600" /></div>
                  <h4 className="text-lg font-bold text-gray-800">Wishlist</h4>
                </div>
                {wishlists.filter(w => w.user_id === selectedUser.id).length === 0 ? (
                  <div className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center border border-gray-100">Wishlist is empty</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {wishlists.filter(w => w.user_id === selectedUser.id).map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                        {item.image ? (
                          <img src={item.image} className="w-10 h-10 object-cover rounded-lg border border-gray-100" alt={item.product_name} />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200"><Heart className="w-4 h-4 text-gray-300"/></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm truncate">{item.product_name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">₹{item.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
