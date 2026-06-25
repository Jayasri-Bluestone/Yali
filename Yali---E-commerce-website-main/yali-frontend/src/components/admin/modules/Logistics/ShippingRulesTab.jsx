import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Search, Edit, Trash2, Loader2, XCircle } from 'lucide-react';
import { useToast } from '../../../../context/ToastContext';
import { API_URL } from '../../../../config';

export function ShippingRulesTab() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    zone_name: '',
    base_cost: 0,
    per_kg_cost: 0,
    estimated_days: '',
    status: 'active'
  });
  
  const { showToast } = useToast();
  const token = localStorage.getItem('yali_token');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/shipping-rules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      } else {
        showToast('Failed to fetch shipping rules', 'error');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingRule(null);
    setFormData({
      zone_name: '',
      base_cost: 0,
      per_kg_cost: 0,
      estimated_days: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (rule) => {
    setEditingRule(rule);
    setFormData({
      zone_name: rule.zone_name,
      base_cost: rule.base_cost || 0,
      per_kg_cost: rule.per_kg_cost || 0,
      estimated_days: rule.estimated_days || '',
      status: rule.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingRule 
        ? `${API_URL}/shipping-rules/${editingRule.id}`
        : `${API_URL}/shipping-rules`;
      
      const method = editingRule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showToast(editingRule ? 'Shipping rule updated' : 'Shipping rule added', 'success');
        setIsModalOpen(false);
        fetchRules();
      } else {
        const errorData = await response.json();
        showToast(errorData.error || 'Failed to save', 'error');
      }
    } catch (error) {
      console.error('Submit error:', error);
      showToast('Error saving shipping rule', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shipping rule?')) return;
    try {
      const response = await fetch(`${API_URL}/shipping-rules/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showToast('Shipping rule deleted', 'success');
        fetchRules();
      } else {
        showToast('Failed to delete', 'error');
      }
    } catch (error) {
      showToast('Error deleting', 'error');
    }
  };

  const filteredRules = rules.filter(r => 
    r.zone_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-900">Shipping Rules & Zones</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Configure shipping costs based on distance and weight.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search zones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-transparent transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <button onClick={handleAddClick} className="flex items-center gap-2 px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white rounded-xl font-bold text-sm transition-all shadow-sm flex-shrink-0">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Rule</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-[#0066cc]" />
        </div>
      ) : rules.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <MapPin className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Shipping Rules Configured</h3>
            <p className="text-gray-500 max-w-md mb-6">Create your first shipping zone and pricing rule to get started.</p>
            <button onClick={handleAddClick} className="px-6 py-2.5 bg-[#0066cc] text-white rounded-xl font-bold hover:bg-[#0052a3] transition-colors shadow-sm">
              Create Shipping Rule
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Zone Name</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Base Cost</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Per Kg Cost</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Est. Delivery</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRules.map(rule => (
                  <tr key={rule.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{rule.zone_name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-black text-gray-900">₹{parseFloat(rule.base_cost).toLocaleString()}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-700">₹{parseFloat(rule.per_kg_cost).toLocaleString()}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600">{rule.estimated_days || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                        rule.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {(rule.status || 'active').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditClick(rule)} className="p-2 text-gray-400 hover:text-[#0066cc] hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(rule.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
                {editingRule ? 'Edit Shipping Rule' : 'Add Shipping Rule'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Zone Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Local City, National, or Pincode 600001"
                  value={formData.zone_name}
                  onChange={(e) => setFormData({...formData, zone_name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Base Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.base_cost}
                    onChange={(e) => setFormData({...formData, base_cost: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Per Kg Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.per_kg_cost}
                    onChange={(e) => setFormData({...formData, per_kg_cost: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Estimated Delivery Time</label>
                <input
                  type="text"
                  placeholder="e.g. 2-3 Business Days"
                  value={formData.estimated_days}
                  onChange={(e) => setFormData({...formData, estimated_days: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
                  {editingRule ? 'Save Changes' : 'Add Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
