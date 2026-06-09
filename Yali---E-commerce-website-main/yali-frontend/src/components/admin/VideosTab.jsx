import { Plus, Trash2, Edit2, Video, Play, Clock, XCircle, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FileUploadInput } from './FileUploadInput';
import { ToggleSwitch } from './ToggleSwitch';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../config';
import { Pagination } from './Pagination';

export function VideosTab({
  videos = [],
  categoriesList = [],
  isCategoryAdmin,
  adminCategory,
  token,
  refreshVideos,
  showToast,
  handleToggleStatus
}) {
  const { showConfirm } = useToast();


  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  
  // Form state
  const [form, setForm] = useState({
    title: '',
    shortTitle: '',
    desc: '',
    url: '',
    duration: '0:15',
    category: isCategoryAdmin ? adminCategory : 'real-estate'
  });

  const filteredVideos = videos.filter((v) => {
    if (isCategoryAdmin) return v.category === adminCategory;
    return true;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const totalPages = Math.ceil(filteredVideos.length / ITEMS_PER_PAGE);
  const currentItems = filteredVideos.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleOpenAddModal = () => {
    setEditingVideo(null);
    setForm({
      title: '',
      shortTitle: '',
      desc: '',
      url: '',
      duration: '0:15',
      category: isCategoryAdmin ? adminCategory : 'real-estate'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vid) => {
    setEditingVideo(vid);
    setForm({
      title: vid.title,
      shortTitle: vid.shortTitle,
      desc: vid.desc || '',
      url: vid.url,
      duration: vid.duration || '0:15',
      category: vid.category
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.shortTitle || !form.url || !form.category) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    const payload = {
      title: form.title,
      shortTitle: form.shortTitle,
      desc: form.desc,
      url: form.url,
      duration: form.duration,
      category: form.category
    };

    try {
      let res;
      if (editingVideo) {
        res = await fetch(`${API_URL}/videos/${editingVideo.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_URL}/videos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save video');

      showToast(data.message || 'Video spotlight saved successfully!', 'success');
      setIsModalOpen(false);
      refreshVideos();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = (id) => {
    showConfirm('Are you sure you want to delete this video spotlight?', async () => {
      try {
        const res = await fetch(`${API_URL}/videos/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete video');

        showToast(data.message || 'Video deleted', 'success');
        refreshVideos();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Spotlight Videos Directory</h2>
          <p className="text-xs text-gray-500 mt-1">Manage videos that are showcased in the Category landing pages.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-bold rounded-xl text-xs hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Spotlight Video
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 font-semibold bg-gray-50">
              <th className="p-4 rounded-l-lg">Title & Card Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Video Link</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Visibility</th>
              <th className="p-4 text-right rounded-r-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((vid) => (
              <tr key={vid.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-gray-900 flex items-center gap-2">
                    <Video className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    {vid.title}
                  </div>
                  <span className="text-xs text-purple-600 font-bold bg-purple-55 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 inline-block mt-1">
                    Card Text: {vid.shortTitle}
                  </span>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-sm">{vid.desc}</div>
                </td>
                <td className="p-4 capitalize">
                  <span className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold">
                    {vid.category.replace('-', ' ')}
                  </span>
                </td>
                <td className="p-4">
                  <a
                    href={vid.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0066cc] hover:underline text-xs flex items-center gap-1 font-semibold truncate max-w-xs"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Play Stream URL
                  </a>
                </td>
                <td className="p-4 font-mono font-bold text-xs text-gray-700">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {vid.duration || '0:15'}
                  </span>
                </td>
                <td className="p-4">
                  <ToggleSwitch 
                    checked={vid.status === 'active'}
                    onChange={() => handleToggleStatus('videos', vid.id, vid.status)}
                    activeLabel=""
                    inactiveLabel=""
                  />
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditModal(vid)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-purple-600 transition-colors cursor-pointer"
                      title="Edit video parameters"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(vid.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete video spotlight"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredVideos.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  No video spotlights registered for this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-lg font-bold text-gray-950">
                {editingVideo ? 'Modify Video Spotlight' : 'Register Video Spotlight'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Video Expanded Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Luxury Modern Villa Tour"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Card Short Title
                  </label>
                  <input
                    type="text"
                    value={form.shortTitle}
                    onChange={(e) => setForm({ ...form, shortTitle: e.target.value })}
                    placeholder="e.g. Luxury Villa"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="e.g. 0:15"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  disabled={isCategoryAdmin}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm cursor-pointer"
                >
                  {categoriesList.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <FileUploadInput
                label="Video File or Stream URL"
                type="video"
                value={form.url}
                onChange={(url) => setForm({ ...form, url })}
                accept="video/*"
                placeholder="https://assets.mixkit.co/videos/preview/..."
                token={token}
              />

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  rows={2}
                  placeholder="Add a brief description shown when expanded..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-purple-700 to-indigo-650 text-white font-bold rounded-xl hover:shadow-lg transition-all text-xs cursor-pointer"
                >
                  {editingVideo ? 'Save Changes' : 'Register Video'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
