import { useState, useEffect } from 'react';
import { FileUploadInput } from './FileUploadInput';
import { Plus, Edit2, Trash2, XCircle } from 'lucide-react';
import { ToggleSwitch } from './ToggleSwitch';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../config';

export function SubCategoriesTab({
  categoriesList,
  token,
  handleToggleStatus
}) {
  const { showToast, showConfirm } = useToast();
  const [subCategories, setSubCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    category_value: '',
    label: '',
    emoji: '',
    image_url: '',
    filter_tag: '',
    display_order: 0
  });

  useEffect(() => {
    fetchSubCategories();
  }, []);

  const fetchSubCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/sub-categories?all=true`);
      if (res.ok) {
        const data = await res.json();
        setSubCategories(data);
      }
    } catch (e) {
      console.error('Failed to fetch sub-categories', e);
    }
  };

  const handleOpenModal = (subCat = null) => {
    if (subCat) {
      setEditingSubCategory(subCat);
      setFormData({
        category_value: subCat.category_value || '',
        label: subCat.label || '',
        emoji: subCat.emoji || '',
        image_url: subCat.image_url || '',
        filter_tag: subCat.filter_tag || '',
        display_order: subCat.display_order || 0
      });
    } else {
      setEditingSubCategory(null);
      setFormData({
        category_value: categoriesList.length > 0 ? categoriesList[0].value : '',
        label: '',
        emoji: '',
        image_url: '',
        filter_tag: '',
        display_order: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingSubCategory
        ? `${API_URL}/admin/sub-categories/${editingSubCategory.id}`
        : `${API_URL}/admin/sub-categories`;
      
      const method = editingSubCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save sub-category');

      await fetchSubCategories();
      setIsModalOpen(false);
      showToast(editingSubCategory ? 'Sub-Category updated successfully' : 'Sub-Category created successfully', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleDelete = (id) => {
    showConfirm('Are you sure you want to delete this sub-category?', async () => {
      try {
        const res = await fetch(`${API_URL}/admin/sub-categories/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete sub-category');
        
        await fetchSubCategories();
        showToast('Sub-Category deleted successfully', 'success');
      } catch (e) {
        showToast(e.message, 'error');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-950">Sub-Categories</h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-5 h-5" /> Add Sub-Category
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subCategories.map((sc) => (
          <div key={sc.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
                {sc.category_value}
              </span>
              <div onClick={(e) => e.stopPropagation()}>
                <ToggleSwitch 
                  checked={sc.status === 'active'}
                  onChange={() => handleToggleStatus('sub_categories', sc.id, sc.status)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              {sc.image_url ? (
                <img src={sc.image_url} alt={sc.label} className="w-16 h-16 object-cover rounded-xl shadow-sm" />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-3xl shadow-sm">
                  {sc.emoji || '📦'}
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{sc.label}</h3>
                <p className="text-xs text-gray-500 mt-1">Filter: <span className="font-semibold text-gray-700">{sc.filter_tag}</span></p>
                <p className="text-xs text-gray-500 mt-0.5">Order: {sc.display_order}</p>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => handleOpenModal(sc)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Edit Sub-Category"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(sc.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Delete Sub-Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {subCategories.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
            No sub-categories found. Click "Add Sub-Category" to create one.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-xl font-bold text-gray-950">{editingSubCategory ? 'Edit Sub-Category' : 'New Sub-Category'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Label *</label>
                  <input
                    type="text"
                    required
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                    placeholder="e.g. Seat Covers"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Parent Category *</label>
                  <select
                    required
                    value={formData.category_value}
                    onChange={(e) => setFormData({ ...formData, category_value: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="" disabled>Select a category</option>
                    {categoriesList.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Emoji (Fallback)</label>
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                    placeholder="e.g. 💺"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Filter Tag *</label>
                  <input
                    type="text"
                    required
                    value={formData.filter_tag}
                    onChange={(e) => setFormData({ ...formData, filter_tag: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                    placeholder="e.g. Seat Covers"
                  />
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

              <div className="pt-2">
                <FileUploadInput
                  label="Thumbnail Image URL (Optional)"
                  type="image"
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  accept="image/*"
                  token={token}
                />
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-colors cursor-pointer">
                  {editingSubCategory ? 'Update Sub-Category' : 'Create Sub-Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
