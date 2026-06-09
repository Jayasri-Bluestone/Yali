import { useState, useEffect } from 'react';
import { ToggleSwitch } from './ToggleSwitch';
import { Plus, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../config';
import { Pagination } from './Pagination';

export function VendorsTab({
  users,
  handleToggleUserStatus,
  refreshUsers,
  token,
  categoriesList = [],
  handleUserRoleChange
}) {
  const { showToast } = useToast();
  const vendors = users.filter(u => u.role === 'vendor');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const totalPages = Math.ceil(vendors.length / ITEMS_PER_PAGE);
  const currentItems = vendors.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    companyName: '',
    taxId: '',
    storeDescription: ''
  });

  const handleRegisterVendor = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...formData,
          role: 'vendor'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register vendor');
      
      showToast('Vendor registered successfully!', 'success');
      setIsAdding(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        companyName: '',
        taxId: '',
        storeDescription: ''
      });
      if (refreshUsers) refreshUsers();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-950">Vendor Partners & Application Hub</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-[#2874f0] hover:bg-[#0066cc] text-white px-4 py-2 rounded-lg font-bold transition-colors"
        >
          <Plus className="w-5 h-5" /> Add Vendor
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 font-semibold bg-gray-50">
              <th className="p-4 rounded-l-lg">Company Name</th>
              <th className="p-4">Owner Contact</th>
              <th className="p-4">Tax / GSTIN ID</th>
              <th className="p-4">Store Description</th>
              <th className="p-4">Fulfillment Status</th>
              <th className="p-4">Vendor Category Lock</th>
              <th className="p-4 text-right rounded-r-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(u => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="p-4 font-bold text-gray-950">{u.vendorDetails?.companyName || 'N/A'}</td>
                <td className="p-4">
                  <div className="font-semibold text-gray-900">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                  <div className="text-xs text-gray-500">{u.phone || 'No phone'}</div>
                </td>
                <td className="p-4 font-mono text-xs">{u.vendorDetails?.taxId || 'N/A'}</td>
                <td className="p-4 text-xs text-gray-600 max-w-[200px] truncate" title={u.vendorDetails?.storeDescription}>
                  {u.vendorDetails?.storeDescription || 'No description provided'}
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    u.status === 'active'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : (u.status === 'pending_approval' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' : 'bg-red-50 text-red-700 border border-red-200')
                  }`}>
                    {u.status === 'active' ? 'Approved' : (u.status === 'pending_approval' ? 'Pending Approval' : 'Disabled / Rejected')}
                  </span>
                </td>
                <td className="p-4">
                  <select
                    value={u.managed_category || 'all'}
                    onChange={(e) => handleUserRoleChange(u.id, u.role, e.target.value === 'all' ? null : e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="all">Full Access (All)</option>
                    {categoriesList.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </td>
                <td className="p-4 text-right">
                  <ToggleSwitch 
                    checked={u.status === 'active'}
                    onChange={() => handleToggleUserStatus(u.id, u.status)}
                    activeLabel="Approved"
                    inactiveLabel="Disabled"
                  />
                </td>
              </tr>
            ))}
            {vendors.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">No vendors registered in directory.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">Register New Vendor</h3>
              <button 
                onClick={() => setIsAdding(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleRegisterVendor} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800 border-b pb-2">Owner Details</h4>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#2874f0] focus:border-transparent outline-none"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#2874f0] focus:border-transparent outline-none"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#2874f0] focus:border-transparent outline-none"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Temporary Password</label>
                    <input 
                      type="password" 
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#2874f0] focus:border-transparent outline-none"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800 border-b pb-2">Company Details</h4>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Company / Store Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#2874f0] focus:border-transparent outline-none"
                      value={formData.companyName}
                      onChange={e => setFormData({...formData, companyName: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tax / GSTIN ID</label>
                    <input 
                      type="text" 
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#2874f0] focus:border-transparent outline-none"
                      value={formData.taxId}
                      onChange={e => setFormData({...formData, taxId: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Store Description</label>
                    <textarea 
                      rows="4"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#2874f0] focus:border-transparent outline-none resize-none"
                      value={formData.storeDescription}
                      onChange={e => setFormData({...formData, storeDescription: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#2874f0] hover:bg-[#0066cc] transition-colors shadow-md hover:shadow-lg"
                >
                  Register Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
