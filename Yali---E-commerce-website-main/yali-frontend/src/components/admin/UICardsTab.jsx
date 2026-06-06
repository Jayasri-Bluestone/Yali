import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, XCircle } from 'lucide-react';
import { ToggleSwitch } from './ToggleSwitch';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../config';

export function UICardsTab({ token, uiCards: initialUiCards, handleToggleStatus }) {
  const { showToast, showConfirm } = useToast();
  const [uiCards, setUiCards] = useState(initialUiCards || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [filterSection, setFilterSection] = useState('all');

  useEffect(() => {
    if (initialUiCards && initialUiCards.length > 0) {
      setUiCards(initialUiCards);
    }
  }, [initialUiCards]);

  const [formData, setFormData] = useState({
    section: 'category_card',
    title: '',
    subtitle: '',
    icon: '',
    image_url: '',
    link_url: '',
    color_gradient: '',
    status: 'active'
  });

  const fetchCards = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/ui-cards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUiCards(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.section) {
      showToast('Title and Section are required', 'warning');
      return;
    }

    try {
      const url = editingCard
        ? `${API_URL}/ui-cards/${editingCard.id}`
        : `${API_URL}/ui-cards`;
      
      const method = editingCard ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save UI Card');
      showToast(`UI Card ${editingCard ? 'updated' : 'created'} successfully!`, 'success');
      setIsModalOpen(false);
      fetchCards();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      section: card.section,
      title: card.title,
      subtitle: card.subtitle || '',
      icon: card.icon || '',
      image_url: card.image_url || '',
      link_url: card.link_url || '',
      color_gradient: card.color_gradient || '',
      status: card.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    showConfirm('Delete this UI Card?', async () => {
      try {
        const res = await fetch(`${API_URL}/ui-cards/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete');
        showToast('UI Card deleted!', 'success');
        fetchCards();
      } catch (e) {
        showToast(e.message, 'error');
      }
    });
  };

  const filteredCards = filterSection === 'all' 
    ? uiCards 
    : uiCards.filter(c => c.section === filterSection);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex gap-2">
          {['all', 'category_card', 'trust_card', 'promo_card'].map(sec => (
            <button
              key={sec}
              onClick={() => setFilterSection(sec)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                filterSection === sec
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {sec.replace('_', ' ')}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setEditingCard(null);
            setFormData({
              section: 'category_card', title: '', subtitle: '', icon: '', image_url: '', link_url: '', color_gradient: '', status: 'active'
            });
            setIsModalOpen(true);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" /> Add New Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map(card => (
          <div key={card.id} className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                {card.section.replace('_', ' ')}
              </span>
              <div onClick={(e) => e.stopPropagation()}>
                <ToggleSwitch 
                  checked={card.status === 'active'}
                  onChange={() => handleToggleStatus('ui-cards', card.id, card.status)}
                />
              </div>
            </div>
            
            {card.image_url && (
              <img src={card.image_url} alt="" className="w-full h-32 object-cover rounded-xl mt-2" />
            )}
            
            <div className="flex items-center gap-3 mt-2">
              {card.icon && <div className="text-2xl">{card.icon}</div>}
              <div>
                <h4 className="font-bold text-gray-900">{card.title}</h4>
                {card.subtitle && <p className="text-xs text-gray-500 line-clamp-1">{card.subtitle}</p>}
              </div>
            </div>

            {card.link_url && <div className="text-xs text-blue-500 font-medium truncate mt-1">Link: {card.link_url}</div>}

            <div className="flex justify-end gap-2 mt-auto pt-3 border-t border-gray-100">
              <button onClick={() => handleEdit(card)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(card.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {filteredCards.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No UI cards found for this section.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-xl font-bold text-gray-950">{editingCard ? 'Edit UI Card' : 'New UI Card'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="category_card">Category Card</option>
                    <option value="trust_card">Trust Card</option>
                    <option value="promo_card">Promo Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <ToggleSwitch 
                    checked={formData.status === 'active'}
                    onChange={(checked) => setFormData({ ...formData, status: checked ? 'active' : 'inactive' })}
                    activeLabel="Active"
                    inactiveLabel="Inactive"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Icon (Emoji or Lucide Name)</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Link URL</label>
                  <input
                    type="text"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Gradient Classes</label>
                <input
                  type="text"
                  placeholder="from-blue-500 to-cyan-400"
                  value={formData.color_gradient}
                  onChange={(e) => setFormData({ ...formData, color_gradient: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md transition-colors cursor-pointer">
                  {editingCard ? 'Update Card' : 'Create Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
