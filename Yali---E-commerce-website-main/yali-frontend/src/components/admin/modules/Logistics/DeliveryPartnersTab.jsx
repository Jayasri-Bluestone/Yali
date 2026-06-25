import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, UserCircle, Edit, Trash2, Loader2, XCircle } from 'lucide-react';
import { useToast } from '../../../../context/ToastContext';
import { API_URL } from '../../../../config';

export function DeliveryPartnersTab() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicle_type: 'Bike',
    vehicle_number: '',
    status: 'active'
  });
  
  const { showToast } = useToast();
  const token = localStorage.getItem('yali_token');

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/delivery-partners`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPartners(data);
      } else {
        showToast('Failed to fetch partners', 'error');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingPartner(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      vehicle_type: 'Bike',
      vehicle_number: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      phone: partner.phone || '',
      email: partner.email || '',
      vehicle_type: partner.vehicle_type || 'Bike',
      vehicle_number: partner.vehicle_number || '',
      status: partner.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingPartner 
        ? `${API_URL}/delivery-partners/${editingPartner.id}`
        : `${API_URL}/delivery-partners`;
      
      const method = editingPartner ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showToast(editingPartner ? 'Partner updated' : 'Partner added', 'success');
        setIsModalOpen(false);
        fetchPartners();
      } else {
        const errorData = await response.json();
        showToast(errorData.error || 'Failed to save', 'error');
      }
    } catch (error) {
      console.error('Submit error:', error);
      showToast('Error saving partner', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this partner?')) return;
    try {
      const response = await fetch(`${API_URL}/delivery-partners/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showToast('Partner deleted', 'success');
        fetchPartners();
      } else {
        showToast('Failed to delete', 'error');
      }
    } catch (error) {
      showToast('Error deleting', 'error');
    }
  };

  const filteredPartners = partners.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm) ||
    p.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-900">Delivery Partners</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Register and manage delivery personnel and riders.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-transparent transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <button onClick={handleAddClick} className="flex items-center gap-2 px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white rounded-xl font-bold text-sm transition-all shadow-sm flex-shrink-0">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Partner</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-[#0066cc]" />
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <UserCircle className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Partners Registered</h3>
            <p className="text-gray-500 max-w-md mb-6">You haven't added any delivery riders or partners yet.</p>
            <button onClick={handleAddClick} className="px-6 py-2.5 bg-[#0066cc] text-white rounded-xl font-bold hover:bg-[#0052a3] transition-colors shadow-sm">
              Add First Partner
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Partner Info</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Contact</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Vehicle</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPartners.map(partner => (
                  <tr key={partner.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{partner.name}</div>
                      <div className="text-xs text-gray-500 mt-1">Added: {new Date(partner.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-gray-700">{partner.phone || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{partner.email || ''}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold border border-blue-100">
                          {partner.vehicle_type || 'Unknown'}
                        </span>
                        <span className="text-sm font-medium text-gray-600">{partner.vehicle_number}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                        partner.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                        partner.status === 'offline' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                        'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {(partner.status || 'active').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditClick(partner)} className="p-2 text-gray-400 hover:text-[#0066cc] hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(partner.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingPartner ? 'Edit Delivery Partner' : 'Add Delivery Partner'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Partner Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Vehicle Type</label>
                  <select
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                  >
                    <option value="Bike">Bike</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    value={formData.vehicle_number}
                    onChange={(e) => setFormData({...formData, vehicle_number: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                >
                  <option value="active">Active (Available)</option>
                  <option value="offline">Offline</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  {editingPartner ? 'Save Changes' : 'Add Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
