import React, { useState, useEffect } from 'react';
import { Bike, Fuel, Settings2, Calendar, MapPin, MoreVertical, Plus, Filter, Gauge, Zap, Edit, Trash2 } from 'lucide-react';
import { CategoryProductModal } from '../Shared/CategoryProductModal';
import { API_URL } from '../../../../config';

const bikeSchema = [
  { name: 'location', label: 'Location / City', type: 'text', required: true },
  { name: 'year', label: 'Manufacturing Year', type: 'number', required: true },
  { name: 'km', label: 'Kilometers Driven', type: 'number', required: true },
  { name: 'fuel', label: 'Fuel Type', type: 'select', options: ['Petrol', 'Electric'], required: true },
  { name: 'type', label: 'Bike Type', type: 'select', options: ['Cruiser', 'Naked Sports', 'Scooter', 'Sports', 'Commuter'], required: true },
  { name: 'cc', label: 'Engine Capacity (CC) / Motor Power', type: 'text', required: true },
  { name: 'dealer', label: 'Dealer / Seller Name', type: 'text', required: true }
];

export function BikesTab() {
  const [filter, setFilter] = useState('All');
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBike, setEditingBike] = useState(null);

  const token = localStorage.getItem('yali_token');

  const fetchBikes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/products?category=Automobiles&sub_category=Bikes&all=true`);
      const data = await res.json();
      if (res.ok) setBikes(data);
    } catch (err) {
      console.error('Failed to fetch bikes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBikes();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bike?')) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchBikes();
    } catch (err) {
      console.error('Failed to delete bike:', err);
    }
  };

  const handleOpenModal = (bike = null) => {
    setEditingBike(bike);
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    setIsModalOpen(false);
    fetchBikes();
  };

  const filteredBikes = bikes.filter(b => filter === 'All' || b.status.toLowerCase() === filter.toLowerCase());

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Bikes & Scooters</h2>
          <p className="text-gray-500 font-medium mt-1">Manage all two-wheeler listings</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all">
            <Filter className="w-4 h-4" /> Filters
          </button>
          <button onClick={() => handleOpenModal()} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all">
            <Plus className="w-4 h-4" /> Add Bike
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200">
        {['All', 'Active', 'Inactive'].map(tab => (
          <button 
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-3 font-bold text-sm transition-all border-b-2 ${
              filter === tab ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Vehicle Table */}
      {!loading && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Vehicle Details</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Price & Specs</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Engagement</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBikes.map(bike => {
                  const meta = bike.metadata || {};
                  const displayImage = (bike.images && bike.images.length > 0) 
                    ? bike.images[0] 
                    : 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&q=80';

                  return (
                    <tr key={bike.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={displayImage} 
                            alt={bike.name} 
                            className="w-16 h-12 rounded-lg object-cover border border-gray-200 shadow-sm"
                          />
                          <div>
                            <div className="font-bold text-gray-900">{bike.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                {meta.type || 'Standard'}
                              </span>
                              <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {meta.location || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-black text-gray-900">₹{parseFloat(bike.price).toLocaleString()}</div>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mt-1">
                          <span className="flex items-center gap-1"><Gauge className="w-3 h-3 text-gray-400" /> {meta.km ? `${meta.km.toLocaleString()} km` : 'N/A'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-gray-400" /> {meta.cc || meta.fuel || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-sm font-bold text-gray-900">1.2k</div>
                            <div className="text-xs text-gray-500">Views</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-gray-900">34</div>
                            <div className="text-xs text-gray-500">Leads</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                          bike.status === 'active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {bike.status.toUpperCase()}
                        </span>
                        {meta.year && (
                          <div className="text-xs font-bold text-gray-500 mt-1">Model: {meta.year}</div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(bike)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(bike.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredBikes.length === 0 && (
        <div className="py-20 text-center bg-white rounded-2xl border border-gray-200 shadow-sm mt-6">
          <Bike className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">No bikes found</h3>
          <p className="text-gray-500 mt-2">Get started by creating a new listing.</p>
        </div>
      )}

      {/* CRUD Modal */}
      <CategoryProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        category="Automobiles"
        subCategory="Bikes"
        schema={bikeSchema}
        initialData={editingBike}
        token={token}
      />

    </div>
  );
}
