import React, { useState, useEffect } from 'react';
import { XCircle, Upload, Save, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { API_URL } from '../../../../config';

export function CategoryProductModal({ 
  isOpen, 
  onClose, 
  onSave, 
  category, 
  subCategory, 
  schema = [], 
  initialData = null,
  token 
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    stock: '',
    badge: '',
    status: 'active',
    metadata: {}
  });

  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || '',
        original_price: initialData.original_price || '',
        stock: initialData.stock || '',
        badge: initialData.badge || '',
        status: initialData.status || 'active',
        cta_action: initialData.cta_action || (
          ['Real Estate', 'real-estate', 'properties', 'residential', 'commercial', 'agricultural-land', 'villas-apartments', 'rentals'].includes(category) 
            ? 'schedule_visit' 
            : ['Automobiles', 'vehicles', 'bikes', 'scooters', 'cars', 'suvs', 'commercial-vehicles'].includes(category)
            ? 'test_drive'
            : 'buy_now'
        ),
        metadata: initialData.metadata || {}
      });
      // images can arrive as a JSON string from the DB, a comma-separated string, or already an array
      const rawImages = initialData.images;
      let parsedImages = [];
      if (Array.isArray(rawImages)) {
        parsedImages = rawImages;
      } else if (typeof rawImages === 'string' && rawImages.trim()) {
        try {
          const p = JSON.parse(rawImages);
          parsedImages = Array.isArray(p) ? p : [rawImages];
        } catch {
          parsedImages = rawImages.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      setImages(parsedImages);
    } else {
      setFormData({
        name: '', description: '', price: '', original_price: '', stock: '', badge: '', status: 'active', 
        cta_action: (
          ['Real Estate', 'real-estate', 'properties', 'residential', 'commercial', 'agricultural-land', 'villas-apartments', 'rentals'].includes(category) 
            ? 'schedule_visit' 
            : ['Automobiles', 'vehicles', 'bikes', 'scooters', 'cars', 'suvs', 'commercial-vehicles'].includes(category)
            ? 'test_drive'
            : 'buy_now'
        ), 
        metadata: {}
      });
      setImages([]);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMetadataChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    setError(null);

    const uploadedUrls = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const authToken = token || localStorage.getItem('yali_token');
        const res = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
          body: formData
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Upload failed (${res.status})`);
        }
        const data = await res.json();
        uploadedUrls.push(data.url);
      } catch (err) {
        console.error('Upload error:', err);
        setError('Failed to upload image: ' + err.message);
      }
    }

    setImages(prev => [...prev, ...uploadedUrls]);
    setIsUploading(false);
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload = {
      ...formData,
      category,
      sub_category: subCategory,
      images,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      stock: parseInt(formData.stock) || 0,
      cta_action: formData.cta_action || 'buy_now',
    };

    try {
      const url = initialData 
        ? `${API_URL}/products/${initialData.id}` 
        : `${API_URL}/products`;
      
      const res = await fetch(url, {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      onSave();
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl animate-scale-in flex flex-col max-h-full">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-black text-gray-900">
              {initialData ? `Edit ${subCategory}` : `Add New ${subCategory}`}
            </h3>
            <p className="text-sm text-gray-500 font-medium">Category: {category}</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
            <XCircle className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold border border-red-100">
              {error}
            </div>
          )}

          <form id="categoryForm" onSubmit={handleSubmit} className="space-y-8">
            
            {/* --- Basic Information --- */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-gray-500 mb-4 pb-2 border-b border-gray-100">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Title / Name *</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleBasicChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] font-medium"
                    placeholder="e.g., Luxury 4BHK Villa" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Price *</label>
                  <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleBasicChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] font-medium" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Original Price (Strike-through)</label>
                  <input type="number" step="0.01" name="original_price" value={formData.original_price} onChange={handleBasicChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] font-medium" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Stock Available</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleBasicChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] font-medium" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Status</label>
                  <select name="status" value={formData.status} onChange={handleBasicChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] font-medium">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Action Button (CTA)</label>
                  <select name="cta_action" value={formData.cta_action || 'buy_now'} onChange={handleBasicChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] font-medium">
                    {['Real Estate', 'real-estate', 'properties', 'residential', 'commercial', 'agricultural-land', 'villas-apartments', 'rentals'].includes(category) ? (
                      <>
                        <option value="schedule_visit">Schedule a Visit</option>
                        <option value="enquiry">Enquiry Now</option>
                        <option value="pre_booking">Pre-booking</option>
                      </>
                    ) : ['Automobiles', 'vehicles', 'bikes', 'scooters', 'cars', 'suvs', 'commercial-vehicles'].includes(category) ? (
                      <>
                        <option value="test_drive">Demo Test Drive</option>
                        <option value="pre_booking">Pre-booking</option>
                        <option value="enquiry">Enquiry Now</option>
                        <option value="quotation">Get Quotation</option>
                      </>
                    ) : (
                      <>
                        <option value="buy_now">Buy Now</option>
                        <option value="enquiry">Enquiry Now</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleBasicChange} rows="3"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] font-medium resize-none" />
                </div>
              </div>
            </div>

            {/* --- Dynamic Metadata Fields --- */}
            {schema.length > 0 && (
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-gray-500 mb-4 pb-2 border-b border-gray-100">{subCategory} Specific Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  {schema.map(field => (
                    <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        {field.label} {field.required && '*'}
                      </label>
                      
                      {field.type === 'select' ? (
                        <select
                          name={field.name}
                          required={field.required}
                          value={formData.metadata[field.name] || ''}
                          onChange={handleMetadataChange}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] font-medium"
                        >
                          <option value="">Select...</option>
                          {field.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          name={field.name}
                          required={field.required}
                          value={formData.metadata[field.name] || ''}
                          onChange={handleMetadataChange}
                          rows="3"
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] font-medium resize-none"
                        />
                      ) : (
                        <input
                          type={field.type || 'text'}
                          name={field.name}
                          required={field.required}
                          value={formData.metadata[field.name] || ''}
                          onChange={handleMetadataChange}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] font-medium"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- Images --- */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-gray-500 mb-4 pb-2 border-b border-gray-100">Media</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {images.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200">
                    <img src={url} alt={`Upload ${idx+1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => removeImage(idx)} className="w-8 h-8 bg-white text-red-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group">
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 text-[#0066cc] animate-spin" />
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-[#0066cc]/10 transition-colors">
                        <Upload className="w-5 h-5 text-gray-400 group-hover:text-[#0066cc]" />
                      </div>
                      <span className="text-xs font-bold text-gray-500">Upload Images</span>
                    </>
                  )}
                </label>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button 
            type="submit" 
            form="categoryForm" 
            disabled={isSaving || isUploading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0066cc] text-white text-sm font-bold rounded-xl hover:bg-[#0052a3] transition-colors disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving...' : 'Save Product'}
          </button>
        </div>

      </div>
    </div>
  );
}
