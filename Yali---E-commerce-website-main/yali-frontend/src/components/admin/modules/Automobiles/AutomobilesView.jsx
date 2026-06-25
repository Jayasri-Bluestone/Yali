import React, { useState, useEffect } from 'react';
import { GenericDataTableTab } from '../../GenericDataTableTab';
import { CategoryProductModal } from '../Shared/CategoryProductModal';
import { API_URL } from '../../../../config';

export function AutomobilesView({ defaultTab = 'Cars' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  const token = localStorage.getItem('yali_token');

  // Update activeTab when defaultTab prop changes (e.g., clicking different sidebar links)
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const tabs = ['Cars', 'SUVs', 'Bikes', 'Scooters', 'Commercial'];

  const schemas = {
    'Cars': [
      { name: 'brand', label: 'Brand', type: 'text', required: true },
      { name: 'model', label: 'Model', type: 'text', required: true },
      { name: 'year', label: 'Manufacturing Year', type: 'number', required: true },
      { name: 'mileage', label: 'Mileage (kmpl)', type: 'number', required: true },
      { name: 'condition', label: 'Condition (New/Used)', type: 'text', required: true }
    ],
    'SUVs': [
      { name: 'brand', label: 'Brand', type: 'text', required: true },
      { name: 'model', label: 'Model', type: 'text', required: true },
      { name: 'year', label: 'Manufacturing Year', type: 'number', required: true },
      { name: 'mileage', label: 'Mileage (kmpl)', type: 'number', required: true },
      { name: 'condition', label: 'Condition (New/Used)', type: 'text', required: true }
    ],
    'Bikes': [
      { name: 'brand', label: 'Brand', type: 'text', required: true },
      { name: 'model', label: 'Model', type: 'text', required: true },
      { name: 'engine', label: 'Engine (cc)', type: 'number', required: true },
      { name: 'mileage', label: 'Mileage (kmpl)', type: 'number', required: true }
    ],
    'Scooters': [
      { name: 'brand', label: 'Brand', type: 'text', required: true },
      { name: 'model', label: 'Model', type: 'text', required: true },
      { name: 'engine', label: 'Engine (cc)', type: 'number', required: true },
      { name: 'mileage', label: 'Mileage (kmpl)', type: 'number', required: true }
    ],
    'Commercial': [
      { name: 'brand', label: 'Brand', type: 'text', required: true },
      { name: 'capacity', label: 'Payload Capacity', type: 'text', required: true },
      { name: 'condition', label: 'Condition (New/Used)', type: 'text', required: true }
    ]
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/products?category=Automobiles&sub_category=${activeTab}&all=true`);
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
  }, [activeTab]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchProperties();
    } catch (err) {
      console.error('Failed to delete listing:', err);
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

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Automobiles Inventory</h2>
          <p className="text-gray-500 font-medium mt-1">Manage listings for cars, bikes, scooters, and commercial vehicles.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
              activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <GenericDataTableTab 
          categoryFilter="Automobiles" 
          subcategoryFilter={activeTab}
          products={properties}
          loading={loading}
          schema={schemas[activeTab]} 
          title={`${activeTab} Listings`} 
          subtitle={`Manage inventory for ${activeTab.toLowerCase()}`}
          onAdd={() => handleOpenModal()}
          onEdit={(p) => handleOpenModal(p)}
          onDelete={handleDelete}
        />
      </div>

      <CategoryProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        category="Automobiles"
        subCategory={activeTab}
        schema={schemas[activeTab]}
        initialData={editingProperty}
        token={token}
      />
    </div>
  );
}
