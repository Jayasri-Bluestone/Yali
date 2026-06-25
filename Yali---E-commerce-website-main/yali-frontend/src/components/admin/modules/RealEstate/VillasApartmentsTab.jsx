import React, { useState, useEffect } from 'react';
import { Home, MapPin, BedDouble, Bath, Square, Plus, Filter, Edit, Trash2 } from 'lucide-react';
import { CategoryProductModal } from '../Shared/CategoryProductModal';
import { API_URL } from '../../../../config';

const villasSchema = [
  { name: 'location', label: 'Location / Area', type: 'text', required: true },
  { name: 'propertyType', label: 'Property Type (Villa/Apartment)', type: 'text', required: true },
  { name: 'beds', label: 'Number of Beds', type: 'number', required: true },
  { name: 'baths', label: 'Number of Baths', type: 'number', required: true },
  { name: 'sqft', label: 'Square Footage (sqft)', type: 'number', required: true },
  { name: 'agent', label: 'Listing Agent Name', type: 'text', required: true }
];

export function VillasApartmentsTab() {
  const [filter, setFilter] = useState('All');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  const token = localStorage.getItem('yali_token');

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/products?category=RealEstate&sub_category=VillasApartments&all=true`);
      const data = await res.json();
      if (res.ok) setProperties(data);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchProperties();
    } catch (err) {
      console.error('Failed to delete property:', err);
    }
  };

  const handleOpenModal = (property = null) => {
    setEditingProperty(property);
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    setIsModalOpen(false);
    fetchProperties();
  };

  const filteredProperties = properties.filter(p => filter === 'All' || p.status.toLowerCase() === filter.toLowerCase());

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Villas & Apartments</h2>
          <p className="text-gray-500 font-medium mt-1">Manage premium villas and luxury apartments</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all">
            <Filter className="w-4 h-4" /> Filters
          </button>
          <button onClick={() => handleOpenModal()} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all">
            <Plus className="w-4 h-4" /> Add Property
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
              filter === tab ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab} Listings
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Property Table */}
      {!loading && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Property Details</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Pricing</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Specifications</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProperties.map(property => {
                  const meta = property.metadata || {};
                  const displayImage = (property.images && property.images.length > 0) 
                    ? property.images[0] 
                    : 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80';

                  return (
                    <tr key={property.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={displayImage} 
                            alt={property.name} 
                            className="w-16 h-12 rounded-lg object-cover border border-gray-200 shadow-sm"
                          />
                          <div>
                            <div className="font-bold text-gray-900">{property.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                {meta.propertyType || 'Villa/Apt'}
                              </span>
                              <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {meta.location || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-black text-gray-900">₹{parseFloat(property.price).toLocaleString()}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                           <div className="flex items-center gap-2 text-xs text-gray-600">
                             <Square className="w-3 h-3 text-purple-500" /> <span className="font-medium">{meta.sqft || 0} sqft</span>
                           </div>
                           <div className="flex items-center gap-2 text-xs text-gray-600">
                             <BedDouble className="w-3 h-3 text-indigo-500" /> <span className="font-medium">{meta.beds || 0} Beds</span>
                             <Bath className="w-3 h-3 text-pink-500 ml-2" /> <span className="font-medium">{meta.baths || 0} Baths</span>
                           </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                          property.status === 'active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {property.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(property)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(property.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
      {!loading && filteredProperties.length === 0 && (
        <div className="py-20 text-center bg-white rounded-2xl border border-gray-200 shadow-sm mt-6">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">No properties found</h3>
          <p className="text-gray-500 mt-2">Get started by creating a new listing.</p>
        </div>
      )}

      {/* CRUD Modal */}
      <CategoryProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        category="RealEstate"
        subCategory="VillasApartments"
        schema={villasSchema}
        initialData={editingProperty}
        token={token}
      />

    </div>
  );
}
