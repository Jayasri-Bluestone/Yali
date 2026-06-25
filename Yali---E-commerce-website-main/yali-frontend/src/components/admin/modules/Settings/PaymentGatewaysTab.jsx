import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Circle, Settings2, Plus, Trash2, Key } from 'lucide-react';
import { useToast } from "../../../../context/ToastContext";
import { API_URL } from "../../../../config";

export function PaymentGatewaysTab({ token }) {
  const { showToast } = useToast();
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Forms state
  const [editingGateway, setEditingGateway] = useState(null);
  const [configPairs, setConfigPairs] = useState([]); // [{key: '', value: ''}]
  
  const [newGateway, setNewGateway] = useState({ name: '', display_name: '' });

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/payment-gateways`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch payment gateways');
      setGateways(data);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/payment-gateways/${id}/activate`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to activate gateway');
      
      showToast(data.message, 'success');
      fetchGateways();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment gateway?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/payment-gateways/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete gateway');
      
      showToast(data.message, 'success');
      fetchGateways();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleAddGateway = async (e) => {
    e.preventDefault();
    try {
      const configObj = configPairs.reduce((acc, pair) => {
        if (pair.key.trim()) acc[pair.key.trim()] = pair.value.trim();
        return acc;
      }, {});

      const res = await fetch(`${API_URL}/admin/payment-gateways`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newGateway, config: configObj })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add gateway');
      
      showToast(data.message, 'success');
      setIsAddModalOpen(false);
      setNewGateway({ name: '', display_name: '' });
      setConfigPairs([]);
      fetchGateways();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    try {
      const configObj = configPairs.reduce((acc, pair) => {
        if (pair.key.trim()) acc[pair.key.trim()] = pair.value.trim();
        return acc;
      }, {});

      const res = await fetch(`${API_URL}/admin/payment-gateways/${editingGateway.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ config: configObj })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update gateway');
      
      showToast(data.message, 'success');
      setIsEditModalOpen(false);
      setEditingGateway(null);
      setConfigPairs([]);
      fetchGateways();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const openEditModal = (gw) => {
    setEditingGateway(gw);
    let parsedConfig = {};
    try {
      parsedConfig = typeof gw.config === 'string' ? JSON.parse(gw.config) : gw.config;
    } catch (e) {
      parsedConfig = {};
    }
    const pairs = Object.entries(parsedConfig || {}).map(([k, v]) => ({ key: k, value: v }));
    if (pairs.length === 0) pairs.push({ key: '', value: '' });
    setConfigPairs(pairs);
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">Payment Gateways</h2>
        </div>
        <button
          onClick={() => {
            setNewGateway({ name: '', display_name: '' });
            setConfigPairs([{ key: '', value: '' }]);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Custom Gateway
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gateways.map((gw) => (
          <div key={gw.id} className={`bg-white p-6 rounded-2xl shadow-sm border transition-all ${gw.is_active ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200 hover:border-indigo-300'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${gw.is_active ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-500'}`}>
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{gw.display_name}</h3>
                  <p className="text-sm text-gray-500 font-mono">{gw.name}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                {gw.is_active ? (
                  <span className="flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    <CheckCircle2 className="w-4 h-4" /> Active
                  </span>
                ) : (
                  <button
                    onClick={() => handleActivate(gw.id)}
                    className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                  >
                    <Circle className="w-4 h-4" /> Set Active
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between">
              <button
                onClick={() => openEditModal(gw)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <Settings2 className="w-4 h-4" /> Configure Keys
              </button>
              
              {!['stripe', 'razorpay'].includes(gw.name.toLowerCase()) && !gw.is_active && (
                <button
                  onClick={() => handleDelete(gw.id)}
                  className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Config Modal */}
      {isEditModalOpen && editingGateway && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                Configure {editingGateway.display_name}
              </h3>
            </div>
            
            <form onSubmit={handleUpdateConfig} className="p-6 space-y-4">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">API Keys (JSON configuration)</label>
                {configPairs.map((pair, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Key (e.g. publishableKey)"
                      value={pair.key}
                      onChange={(e) => {
                        const newPairs = [...configPairs];
                        newPairs[index].key = e.target.value;
                        setConfigPairs(newPairs);
                      }}
                      className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={pair.value}
                      onChange={(e) => {
                        const newPairs = [...configPairs];
                        newPairs[index].value = e.target.value;
                        setConfigPairs(newPairs);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setConfigPairs(configPairs.filter((_, i) => i !== index))}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setConfigPairs([...configPairs, { key: '', value: '' }])}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Key
                </button>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Gateway Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Add Custom Gateway
              </h3>
            </div>
            
            <form onSubmit={handleAddGateway} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Gateway ID / Name (Internal)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. paypal, payu"
                  value={newGateway.name}
                  onChange={(e) => setNewGateway({ ...newGateway, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Display Name (Public)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PayPal Checkout"
                  value={newGateway.display_name}
                  onChange={(e) => setNewGateway({ ...newGateway, display_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="block text-sm font-semibold text-gray-700">API Keys (JSON configuration)</label>
                {configPairs.map((pair, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Key (e.g. clientId)"
                      value={pair.key}
                      onChange={(e) => {
                        const newPairs = [...configPairs];
                        newPairs[index].key = e.target.value;
                        setConfigPairs(newPairs);
                      }}
                      className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={pair.value}
                      onChange={(e) => {
                        const newPairs = [...configPairs];
                        newPairs[index].value = e.target.value;
                        setConfigPairs(newPairs);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setConfigPairs(configPairs.filter((_, i) => i !== index))}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setConfigPairs([...configPairs, { key: '', value: '' }])}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Key
                </button>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700"
                >
                  Create Gateway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
