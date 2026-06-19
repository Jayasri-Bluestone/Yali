import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit2, Trash2, Globe, MapPin, Package, AlertCircle } from 'lucide-react';

import { API_URL } from '../../config';

const VendorRoutingTab = ({ token }) => {
  const [rules, setRules] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  
  const [formData, setFormData] = useState({
    vendor_id: '',
    rule_type: 'region',
    target_value: '',
    priority_score: 1,
    is_active: true
  });

  useEffect(() => {
    fetchRules();
    fetchVendors();
  }, [token]);

  const fetchRules = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/vendor-routing`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch rules');
      setRules(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setVendors(data.filter(u => u.role === 'vendor' && (u.status === 'active' || u.status === 'approved')));
      } else if (response.ok && data.users) {
        setVendors(data.users.filter(u => u.role === 'vendor' && (u.status === 'active' || u.status === 'approved')));
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingRule ? 'PUT' : 'POST';
      const url = editingRule 
        ? `${API_URL}/admin/vendor-routing/${editingRule.id}` 
        : `${API_URL}/admin/vendor-routing`;
        
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          priority_score: parseInt(formData.priority_score),
          vendor_id: parseInt(formData.vendor_id)
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save rule');
      }
      
      setShowModal(false);
      setEditingRule(null);
      fetchRules();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this routing rule?')) return;
    try {
      const response = await fetch(`${API_URL}/admin/vendor-routing/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete rule');
      fetchRules();
    } catch (err) {
      alert(err.message);
    }
  };

  const openModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        vendor_id: rule.vendor_id,
        rule_type: rule.rule_type,
        target_value: rule.target_value || '',
        priority_score: rule.priority_score,
        is_active: !!rule.is_active
      });
    } else {
      setEditingRule(null);
      setFormData({
        vendor_id: vendors.length > 0 ? vendors[0].id : '',
        rule_type: 'region',
        target_value: '',
        priority_score: 1,
        is_active: true
      });
    }
    setShowModal(true);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Auto-Routing Engine...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-600" />
            Vendor Auto-Routing Engine
          </h2>
          <p className="text-gray-500 mt-1">Automatically assign orders to specific vendors based on priority rules.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Priority Rule
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3 text-yellow-800">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">How routing works:</h4>
          <p className="text-sm mt-1">When an order is placed, the engine evaluates active rules in ascending order of Priority Score (1 is highest priority). It checks for a matching Product ID, then a matching Region keyword in the shipping address, and falls back to a Global rule.</p>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 text-sm">
                <th className="p-4 font-semibold">Priority</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Target Match</th>
                <th className="p-4 font-semibold">Assigned Vendor</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rules.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No routing rules defined. Orders will wait for manual vendor assignment.
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                        {rule.priority_score}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-2 text-sm font-medium capitalize">
                        {rule.rule_type === 'global' && <Globe className="w-4 h-4 text-blue-500" />}
                        {rule.rule_type === 'region' && <MapPin className="w-4 h-4 text-green-500" />}
                        {rule.rule_type === 'product' && <Package className="w-4 h-4 text-orange-500" />}
                        {rule.rule_type}
                      </span>
                    </td>
                    <td className="p-4">
                      {rule.rule_type === 'global' ? (
                        <span className="text-gray-400 italic text-sm">Applies to all</span>
                      ) : (
                        <span className="text-gray-800 font-medium text-sm">"{rule.target_value}"</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-gray-900">{rule.company_name || rule.vendor_name}</div>
                        <div className="text-xs text-gray-500">ID: {rule.vendor_id}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openModal(rule)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(rule.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {editingRule ? 'Edit Routing Rule' : 'New Priority Rule'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Vendor</label>
                <select
                  required
                  value={formData.vendor_id}
                  onChange={(e) => setFormData({...formData, vendor_id: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="" disabled>Select a vendor</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.company_name || v.name} (ID: {v.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rule Type</label>
                <select
                  value={formData.rule_type}
                  onChange={(e) => setFormData({...formData, rule_type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="region">Region / State Match</option>
                  <option value="product">Specific Product ID</option>
                  <option value="global">Global Fallback (Any)</option>
                </select>
              </div>

              {formData.rule_type !== 'global' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.rule_type === 'region' ? 'Region Keyword (e.g., Tamil Nadu)' : 'Product ID (e.g., 102)'}
                  </label>
                  <input
                    type={formData.rule_type === 'product' ? 'number' : 'text'}
                    required
                    value={formData.target_value}
                    onChange={(e) => setFormData({...formData, target_value: e.target.value})}
                    placeholder={formData.rule_type === 'region' ? 'Enter state or city name' : 'Enter Product ID'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.rule_type === 'region' 
                      ? 'Checks if the shipping address contains this keyword.' 
                      : 'Exact match with the product ID in cart.'}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority Score</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.priority_score}
                    onChange={(e) => setFormData({...formData, priority_score: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">1 is highest priority.</p>
                </div>
                
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Rule Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingRule ? 'Save Changes' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorRoutingTab;
