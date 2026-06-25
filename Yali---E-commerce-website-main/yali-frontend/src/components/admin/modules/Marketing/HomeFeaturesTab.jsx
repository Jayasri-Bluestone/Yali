import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, XCircle, Download } from 'lucide-react';
import { exportToCSV } from "../../../../utils/csvExport";
import { ToggleSwitch } from "../../ToggleSwitch";
import { useToast } from "../../../../context/ToastContext";
import { API_URL } from "../../../../config";
import * as LucideIcons from 'lucide-react';

export function HomeFeaturesTab({ token }) {
  const { showToast, showConfirm } = useToast();
  const [features, setFeatures] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  
  const [formData, setFormData] = useState({
    icon_name: '',
    title: '',
    description: '',
    color_hex: '',
    display_order: 0,
    status: 'active'
  });

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const res = await fetch(`${API_URL}/home-features`);
      if (res.ok) {
        const data = await res.json();
        setFeatures(data);
      }
    } catch (e) {
      console.error('Failed to fetch home features', e);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const feature = features.find(f => f.id === id);
      if (!feature) return;

      const res = await fetch(`${API_URL}/admin/home-features/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...feature, status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');
      await fetchFeatures();
      showToast('Status updated', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleOpenModal = (feature = null) => {
    if (feature) {
      setEditingFeature(feature);
      setFormData({
        icon_name: feature.icon_name || '',
        title: feature.title || '',
        description: feature.description || '',
        color_hex: feature.color_hex || '',
        display_order: feature.display_order || 0,
        status: feature.status || 'active'
      });
    } else {
      setEditingFeature(null);
      setFormData({
        icon_name: '',
        title: '',
        description: '',
        color_hex: '',
        display_order: 0,
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingFeature
        ? `${API_URL}/admin/home-features/${editingFeature.id}`
        : `${API_URL}/admin/home-features`;
      
      const method = editingFeature ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save home feature');

      await fetchFeatures();
      setIsModalOpen(false);
      showToast(editingFeature ? 'Feature updated successfully' : 'Feature created successfully', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleDelete = (id) => {
    showConfirm('Are you sure you want to delete this feature?', async () => {
      try {
        const res = await fetch(`${API_URL}/admin/home-features/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete feature');
        
        await fetchFeatures();
        showToast('Feature deleted successfully', 'success');
      } catch (e) {
        showToast(e.message, 'error');
      }
    });
  };

  const renderIcon = (iconName, color) => {
    const IconComponent = LucideIcons[iconName] || LucideIcons.HelpCircle;
    return <IconComponent className="w-8 h-8" style={{ color: color || '#64748b' }} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-950">Home Features Bar</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-5 h-5" /> Add Feature
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <div key={feature.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow p-5">
            <div className="flex justify-between items-start mb-4">
              <div onClick={(e) => e.stopPropagation()}>
                <ToggleSwitch 
                  checked={feature.status === 'active'}
                  onChange={() => handleToggleStatus(feature.id, feature.status)}
                />
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-4 mb-4 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gray-50 border border-gray-100">
                {renderIcon(feature.icon_name, feature.color_hex)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{feature.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                <p className="text-xs text-gray-500 mt-2">Icon: <span className="font-semibold text-gray-700">{feature.icon_name}</span></p>
                <p className="text-xs text-gray-500 mt-0.5">Order: {feature.display_order}</p>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => handleOpenModal(feature)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Edit Feature"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(feature.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Delete Feature"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {features.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
            No home features found. Click "Add Feature" to create one.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-xl font-bold text-gray-950">{editingFeature ? 'Edit Feature' : 'New Feature'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                    placeholder="e.g. Trusted & Secure"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Lucide Icon Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.icon_name}
                    onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                    placeholder="e.g. ShieldCheck"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  placeholder="e.g. Best in class safety"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Color (Hex)</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color_hex || '#000000'}
                      onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
                      className="w-12 h-10 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color_hex}
                      onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                      placeholder="e.g. #22c55e"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-colors cursor-pointer">
                  {editingFeature ? 'Update Feature' : 'Create Feature'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
