import { useState, useEffect } from 'react';
import { Plus, Trash2, Truck, Activity, XCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../config';

export function DeliveryPartnersTab() {
  const { showToast, showConfirm } = useToast();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', status: 'active' });
  const token = localStorage.getItem('yali_token');

  const fetchPartners = async () => {
    try {
      const res = await fetch(`${API_URL}/delivery-partners`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setPartners(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return showToast('Name is required', 'warning');
    try {
      const res = await fetch(`${API_URL}/delivery-partners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add partner');
      
      showToast(data.message, 'success');
      setIsModalOpen(false);
      setForm({ name: '', status: 'active' });
      fetchPartners();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = (id) => {
    showConfirm('Are you sure you want to delete this delivery partner?', async () => {
      try {
        const res = await fetch(`${API_URL}/delivery-partners/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete');
        
        showToast(data.message, 'success');
        fetchPartners();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading Delivery Partners...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Truck className="w-7 h-7 text-[#0066cc]" />
            Delivery Partners
          </h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">Manage integrated courier and delivery services.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#0066cc] text-white font-bold rounded-xl hover:bg-[#0052a3] transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Add Partner
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {partners.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-bold">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No delivery partners found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-bold">ID</th>
                  <th className="p-4 font-bold">Partner Name</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Added On</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {partners.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-gray-600">{p.id}</td>
                    <td className="p-4 font-bold text-gray-900">{p.name}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500 font-medium">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Truck className="w-6 h-6 text-[#0066cc]" />
                Add Delivery Partner
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Partner Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. FedEx, BlueDart, Delhivery"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0066cc] focus:border-transparent transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0066cc] focus:border-transparent outline-none font-medium text-gray-700 cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#0066cc] text-white font-bold rounded-xl hover:bg-[#0052a3] transition-colors cursor-pointer"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
