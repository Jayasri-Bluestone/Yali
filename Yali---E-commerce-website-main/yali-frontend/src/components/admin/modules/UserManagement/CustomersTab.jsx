import { useState, useEffect } from 'react';
import { ToggleSwitch } from "../../ToggleSwitch";
import { API_URL } from "../../../../config";
import { ShoppingCart, Heart, XCircle, Eye, EyeOff, Bookmark, Download, Search, Filter } from 'lucide-react';
import { exportToCSV } from "../../../../utils/csvExport";
import { Pagination } from "../../Pagination";

const PasswordDisplay = ({ password }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono mt-1 bg-gray-50 p-1 rounded border border-gray-100 max-w-[180px]">
      <span className="truncate mr-2">
        PWD: {show ? password : '••••••••••••••••'}
      </span>
      <button onClick={() => setShow(!show)} className="hover:text-gray-600 focus:outline-none" title={show ? "Hide Password" : "Show Password"}>
        {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};

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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const filteredUsers = users.filter(u => {
    if (u.role !== 'customer') return false;
    const searchString = `${u.name || ''} ${u.email || ''} ${u.phone || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || 
                          (statusFilter === 'Active' && u.status === 'active') ||
                          (statusFilter === 'Inactive' && u.status !== 'active');
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentItems = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-950">Registered Customer Directory</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] transition-all bg-gray-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] transition-all bg-gray-50 appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <button
            onClick={() => exportToCSV(filteredUsers, 'customers')}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-white text-[#0066cc] hover:bg-blue-50 rounded-xl border border-blue-200 transition-colors text-sm font-bold"
            title="Export Customers to CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>
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
                    <div className="flex items-center justify-between mt-0.5">
                      <div className="text-xs text-gray-500">{u.phone || 'No phone'}</div>
                      {u.date_of_birth && (
                        <div className="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                          DOB: {new Date(u.date_of_birth).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    {u.password && <PasswordDisplay password={u.password} />}
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
                    {(() => {
                      let currentCats = [];
                      if (!u.managed_category || u.managed_category === 'all') {
                        currentCats = ['all'];
                      } else {
                        try {
                          currentCats = JSON.parse(u.managed_category);
                          if (!Array.isArray(currentCats)) currentCats = [u.managed_category];
                        } catch(e) {
                          currentCats = [u.managed_category];
                        }
                      }
                      
                      const isDisabled = u.role !== 'admin';
                      
                      return (
                        <div className={`flex flex-col gap-1 w-full max-w-[220px] ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                          <div className="flex flex-wrap gap-1 mb-1">
                            {currentCats.includes('all') ? (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded font-bold">Full Access</span>
                            ) : (
                              currentCats.map(cat => (
                                <span key={cat} className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-700 text-[10px] rounded font-medium">
                                  {categoriesList.find(c => c.value === cat)?.label || cat}
                                  <button 
                                    onClick={() => {
                                      if (isDisabled) return;
                                      const newCats = currentCats.filter(c => c !== cat);
                                      handleUserRoleChange(u.id, u.role, newCats.length === 0 ? null : JSON.stringify(newCats));
                                    }}
                                    className="text-gray-400 hover:text-red-500 font-bold ml-0.5"
                                  >×</button>
                                </span>
                              ))
                            )}
                          </div>
                          <select
                            value=""
                            disabled={isDisabled}
                            onChange={(e) => {
                              if (isDisabled) return;
                              const val = e.target.value;
                              if (!val) return;
                              if (val === 'all') {
                                handleUserRoleChange(u.id, u.role, null);
                              } else {
                                let newCats = [...currentCats.filter(c => c !== 'all')];
                                if (!newCats.includes(val)) newCats.push(val);
                                handleUserRoleChange(u.id, u.role, JSON.stringify(newCats));
                              }
                            }}
                            className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0066cc] cursor-pointer bg-white"
                          >
                            <option value="">+ Add Access</option>
                            <option value="all">Full Access (All)</option>
                            {categoriesList.filter(c => !currentCats.includes(c.value) && !currentCats.includes('all')).map(c => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })()}
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

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={setItemsPerPage} />

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
