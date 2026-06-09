import { useState, useEffect } from 'react';
import { Plus, GripVertical, Settings, Trash2, Edit, ChevronUp, ChevronDown, CheckCircle, Save, XCircle, Layers } from 'lucide-react';
import { API_URL } from '../../config';
import { useToast } from '../../context/ToastContext';
import { FileUploadInput } from './FileUploadInput';

const AVAILABLE_PAGES = [
  { id: 'home', label: 'Home Page' },
  { id: 'category:real-estate', label: 'Real Estate' },
  { id: 'category:properties', label: 'Properties' },
  { id: 'category:car-accessories', label: 'Car Accessories' },
  { id: 'category:bike-accessories', label: 'Bike Accessories' },
  { id: 'category:organic-groceries', label: 'Organic Groceries' },
];

const SECTION_TYPES = [
  { id: 'hero_banner', label: 'Hero Banner Slider' },
  { id: 'trust_cards', label: 'Trust Strip (Ticker)' },
  { id: 'categories_grid', label: 'Shop by Category Grid' },
  { id: 'flash_deals', label: 'Flash Deals (Countdown)' },
  { id: 'deal_of_the_day', label: 'Deal of the Day' },
  { id: 'video_showcase', label: 'Video Showcase (Reels)' },
  { id: 'product_carousel', label: 'Product Carousel (Horizontal)' },
  { id: 'top_picks', label: 'Top Picks For You' },
  { id: 'promo_banner', label: 'Promo Banner (Mid-page)' },
  { id: 'budget_filter', label: 'Shop by Budget' },
  { id: 'new_arrivals', label: 'New Arrivals Grid' },
  { id: 'brand_showcase', label: 'Brand/Category Showcase' },
  { id: 'why_shop', label: 'Why Shop with Us (Trust Cards)' },
  { id: 'custom_section', label: 'Custom HTML Section' },
];

export function PageBuilderTab({ token }) {
  const { showToast, showConfirm } = useToast();
  const [selectedPage, setSelectedPage] = useState('home');
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  
  const [form, setForm] = useState({
    section_type: 'product_carousel',
    title: '',
    subtitle: '',
    status: 'active',
    content: ''
  });

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/page-sections/${selectedPage}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSections(data);
      }
    } catch (err) {
      showToast('Failed to load page sections', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, [selectedPage]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let contentObj = {};
      if (form.content) {
        try {
          contentObj = JSON.parse(form.content);
        } catch(e) {
          showToast('Content must be valid JSON format', 'error');
          return;
        }
      }

      const payload = {
        page_id: selectedPage,
        section_type: form.section_type,
        title: form.title,
        subtitle: form.subtitle,
        content: contentObj,
        status: form.status,
        display_order: editingSection ? editingSection.display_order : sections.length
      };

      const url = editingSection 
        ? `${API_URL}/page-sections/${editingSection.id}` 
        : `${API_URL}/page-sections`;
        
      const method = editingSection ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save section');
      
      showToast(editingSection ? 'Section updated' : 'Section added', 'success');
      setIsModalOpen(false);
      setEditingSection(null);
      fetchSections();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEdit = (sec) => {
    setEditingSection(sec);
    setForm({
      section_type: sec.section_type,
      title: sec.title || '',
      subtitle: sec.subtitle || '',
      status: sec.status,
      content: sec.content ? JSON.stringify(sec.content, null, 2) : '{\n  "filter": "latest",\n  "limit": 8\n}'
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    showConfirm('Delete this section permanently?', async () => {
      try {
        await fetch(`${API_URL}/page-sections/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        showToast('Section deleted', 'success');
        fetchSections();
      } catch (err) {
        showToast('Failed to delete section', 'error');
      }
    });
  };

  const moveSection = async (index, direction) => {
    if ((index === 0 && direction === -1) || (index === sections.length - 1 && direction === 1)) return;
    
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + direction];
    newSections[index + direction] = temp;
    
    // Update display orders
    const updates = newSections.map((sec, i) => ({ id: sec.id, display_order: i }));
    setSections(newSections); // Optimistic UI update

    try {
      await fetch(`${API_URL}/page-sections/reorder/batch`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ updates })
      });
    } catch (err) {
      showToast('Failed to save order', 'error');
      fetchSections(); // Revert on fail
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 border border-gray-200 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-900">Dynamic Page Builder</h2>
          <p className="text-sm text-gray-500 font-medium">Design and reorder sections for your pages.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-2">
            <select 
              value={selectedPage} 
              onChange={(e) => {
                if (e.target.value === 'ADD_CUSTOM') {
                  const p = prompt('Enter Custom Page ID (e.g. "about-us", "page:contact"):');
                  if (p) setSelectedPage(p);
                } else {
                  setSelectedPage(e.target.value);
                }
              }}
              className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-700 cursor-pointer"
            >
              {AVAILABLE_PAGES.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
              {!AVAILABLE_PAGES.find(p => p.id === selectedPage) && selectedPage !== 'ADD_CUSTOM' && (
                <option value={selectedPage}>Custom: {selectedPage}</option>
              )}
              <option value="ADD_CUSTOM">+ Add Custom Page</option>
            </select>
          </div>
          <button 
            onClick={() => {
              setEditingSection(null);
              setForm({ section_type: 'product_carousel', title: '', subtitle: '', status: 'active', content: '{\n  "filter": "latest",\n  "limit": 8\n}' });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-[#0066cc] to-[#10b981] text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Section
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 min-h-[400px]">
        {loading ? (
          <div className="flex justify-center py-20 text-gray-400">Loading layout...</div>
        ) : sections.length === 0 ? (
          <div className="text-center py-20">
            <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-bold text-gray-700">No dynamic sections found.</p>
            <p className="text-sm text-gray-500 mb-6">This page is currently using the hardcoded default layout. Add a section to override it.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((sec, index) => (
              <div key={sec.id} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex flex-col gap-1 text-gray-300">
                  <button onClick={() => moveSection(index, -1)} disabled={index === 0} className="hover:text-blue-500 disabled:opacity-30 cursor-pointer">
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <button onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1} className="hover:text-blue-500 disabled:opacity-30 cursor-pointer">
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {sec.section_type.replace(/_/g, ' ')}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sec.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {sec.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 truncate">{sec.title || '(No Title)'}</h4>
                  <p className="text-xs text-gray-500 truncate">{sec.subtitle || 'No subtitle'}</p>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(sec)} className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(sec.id)} className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">{editingSection ? 'Edit Section' : 'Add Section'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 cursor-pointer">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Section Type</label>
                <select 
                  value={form.section_type}
                  onChange={(e) => setForm({...form, section_type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  disabled={!!editingSection}
                >
                  {SECTION_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title (Optional)</label>
                  <input 
                    type="text" 
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    placeholder="e.g. Trending Now"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Subtitle (Optional)</label>
                  <input 
                    type="text" 
                    value={form.subtitle}
                    onChange={e => setForm({...form, subtitle: e.target.value})}
                    placeholder="e.g. Best selling products"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select 
                  value={form.status}
                  onChange={e => setForm({...form, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Custom Content Config (JSON format)</label>
                <p className="text-xs text-gray-500 mb-2">Configure filters, custom image URLs, or arrays depending on the section type.</p>
                <textarea 
                  value={form.content}
                  onChange={e => setForm({...form, content: e.target.value})}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm bg-gray-900 text-green-400"
                  placeholder='{\n  "filter": "latest"\n}'
                />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <label className="block text-sm font-bold text-blue-900 mb-1">Image Upload Helper</label>
                <p className="text-xs text-blue-700 mb-3">Upload an image to automatically inject its Base64 URL into the JSON config.</p>
                <FileUploadInput 
                  label="Select Image"
                  value=""
                  onChange={(base64) => {
                    try {
                      const parsed = JSON.parse(form.content || '{}');
                      // Auto inject based on type
                      if (form.section_type === 'hero_banner') {
                        if (!parsed.banners) parsed.banners = [];
                        parsed.banners.push({ image: base64, title: 'New Banner', link_url: '' });
                      } else if (form.section_type === 'promo_banner') {
                        if (!parsed.promoBanners) parsed.promoBanners = [];
                        parsed.promoBanners.push({ id: Date.now().toString(), image: base64, headline: 'Promo', sub: '', tag: 'NEW' });
                      } else {
                        parsed.image = base64;
                      }
                      setForm({...form, content: JSON.stringify(parsed, null, 2)});
                      showToast('Image successfully injected into JSON!', 'success');
                    } catch (e) {
                      setForm({...form, content: form.content + `\n// Base64 Image injected:\n"${base64}"`});
                      showToast('Appended to JSON. Please format manually.', 'success');
                    }
                  }}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 py-3 bg-[#0066cc] hover:bg-[#0052a3] text-white font-bold rounded-xl shadow-md cursor-pointer">
                  {editingSection ? 'Save Changes' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
