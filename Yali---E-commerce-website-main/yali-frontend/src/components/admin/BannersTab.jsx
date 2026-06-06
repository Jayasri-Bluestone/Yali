import { useState } from 'react';
import { FileUploadInput } from './FileUploadInput';
import { Plus, Edit2, Trash2, XCircle } from 'lucide-react';
import { ToggleSwitch } from './ToggleSwitch';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../config';

export function BannersTab({
  filteredBanners,
  banners,
  setBanners,
  token,
  handleToggleStatus
}) {
  const { showToast, showConfirm } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    cta: '',
    discount: '',
    category: '',
    bgImage: '',
    gradient: ''
  });

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        cta: banner.cta || '',
        discount: banner.discount || '',
        category: banner.category || '',
        bgImage: banner.bgImage || banner.bg_image || '',
        gradient: banner.gradient || ''
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        subtitle: '',
        cta: 'Shop Now',
        discount: '',
        category: 'all',
        bgImage: '',
        gradient: 'from-gray-500 to-gray-600'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingBanner
        ? `${API_URL}/banners/${editingBanner.id}`
        : `${API_URL}/banners`;
      
      const method = editingBanner ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save banner');

      if (editingBanner) {
        // Update local state
        setBanners(banners.map(b => b.id === editingBanner.id ? { ...b, ...formData, bg_image: formData.bgImage } : b));
      } else {
        const data = await res.json();
        setBanners([...banners, { id: data.id, ...formData, bg_image: formData.bgImage }]);
      }
      
      setIsModalOpen(false);
      showToast(editingBanner ? 'Banner updated successfully' : 'Banner created successfully', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleDeleteBanner = (id) => {
    showConfirm('Are you sure you want to delete this banner?', async () => {
      try {
        const res = await fetch(`${API_URL}/banners/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete banner');
        
        setBanners(banners.filter(b => b.id !== id));
        showToast('Banner deleted successfully', 'success');
      } catch (e) {
        showToast(e.message, 'error');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-950">Banners</h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-5 h-5" /> Add New Banner
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBanners.map((b) => (
          <div key={b.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            {/* Banner Preview Image/Gradient */}
            <div 
              className={`h-40 w-full bg-gradient-to-br ${b.gradient || 'from-gray-200 to-gray-300'} relative`}
              style={b.bgImage || b.bg_image ? { backgroundImage: `url(${b.bgImage || b.bg_image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
              {b.discount && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded">
                  {b.discount}
                </div>
              )}
            </div>

            <div className="p-5 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">
                  {b.category || 'All Categories'}
                </span>
                <div onClick={(e) => e.stopPropagation()}>
                  <ToggleSwitch 
                    checked={b.status === 'active'}
                    onChange={() => handleToggleStatus('banners', b.id, b.status)}
                  />
                </div>
              </div>
              
              <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{b.title}</h3>
              {b.subtitle && <p className="text-sm text-gray-500 line-clamp-2 mt-1">{b.subtitle}</p>}
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  onClick={() => handleOpenModal(b)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title="Edit Banner"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteBanner(b.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredBanners.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
            No banners found. Click "Add New Banner" to create one.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-xl font-bold text-gray-950">{editingBanner ? 'Edit Banner' : 'New Banner'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Headline Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Sub-headline</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={formData.cta}
                    onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Discount Badge (e.g., 30% OFF)</label>
                  <input
                    type="text"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category Scope</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. real-estate or all"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Gradient Classes</label>
                  <input
                    type="text"
                    value={formData.gradient}
                    onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                    placeholder="from-purple-500 to-indigo-600"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <FileUploadInput
                  label="Banner Background Image URL"
                  type="image"
                  value={formData.bgImage}
                  onChange={(url) => setFormData({ ...formData, bgImage: url })}
                  accept="image/*"
                  token={token}
                />
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md transition-colors cursor-pointer">
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
