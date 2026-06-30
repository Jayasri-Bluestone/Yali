import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Briefcase, Square, Plus, Filter, Edit, Trash2, Search, Download } from 'lucide-react';
import { exportToCSV } from '../../../../utils/csvExport';
import { Pagination } from '../../Pagination';
import { CategoryProductModal } from '../Shared/CategoryProductModal';
import { API_URL } from '../../../../config';

const commercialSchema = [
  { name: 'location', label: 'Location / Area', type: 'text', required: true },
  { name: 'propertyType', label: 'Property Type (Office/Retail/Warehouse)', type: 'text', required: true },
  { name: 'sqft', label: 'Square Footage (sqft)', type: 'number', required: true },
  { name: 'parkingSpots', label: 'Parking Spots', type: 'number', required: true },
  { name: 'agent', label: 'Listing Agent Name', type: 'text', required: true }
];

export function CommercialTab() {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  const token = localStorage.getItem('yali_token');

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/products?category=RealEstate&sub_category=Commercial&all=true`);
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

  const filteredProperties = properties.filter(p => {
    const matchesFilter = filter === 'All' || p.status.toLowerCase() === filter.toLowerCase();
    const searchStr = `${p.name || ''} ${p.metadata?.location || ''}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = filteredProperties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => setCurrentPage(1), [searchTerm, filter]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Commercial Properties</h2>
          <p className="text-gray-500 font-medium mt-1">Manage offices, retail shops, and warehouses</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search properties..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] transition-all bg-gray-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => exportToCSV(filteredProperties, 'commercial_properties')}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-[#0066cc] rounded-lg border border-gray-200 transition-colors text-sm font-bold"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => handleOpenModal()} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-cyan-600 text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all">
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
              filter === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab} Listings
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
                {paginatedProperties.map(property => {
                  const meta = property.metadata || {};
                  const displayImage = (property.images && property.images.length > 0) 
                    ? property.images[0] 
                    : 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80';

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
                                {meta.propertyType || 'Commercial'}
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
                           <div className="flex items-center gap-1 text-xs text-gray-600">
                             <Square className="w-3 h-3 text-blue-500" /> <span className="font-medium">{meta.sqft || 0} sqft</span>
                           </div>
                           <div className="flex items-center gap-1 text-xs text-gray-600">
                             <Briefcase className="w-3 h-3 text-indigo-500" /> <span className="font-medium">{meta.parkingSpots || 0} Parking Spots</span>
                           </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                          property.approval_status === 'pending' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                          property.approval_status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' :
                          property.status === 'active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {property.approval_status === 'pending' ? 'PENDING' : property.approval_status === 'rejected' ? 'REJECTED' : property.status.toUpperCase()}
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

          {filteredProperties.length > 0 && (
            <div className="border-t border-gray-200 p-2">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
                itemsPerPage={itemsPerPage} 
                onItemsPerPageChange={setItemsPerPage} 
              />
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProperties.length === 0 && (
        <div className="py-20 text-center bg-white rounded-2xl border border-gray-200 shadow-sm mt-6">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">No properties found</h3>
          <p className="text-gray-500 mt-2">Get started by creating a new commercial listing.</p>
        </div>
      )}

      {/* CRUD Modal */}
      <CategoryProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        category="RealEstate"
        subCategory="Commercial"
        schema={commercialSchema}
        initialData={editingProperty}
        token={token}
      />

    </div>
  );
}
