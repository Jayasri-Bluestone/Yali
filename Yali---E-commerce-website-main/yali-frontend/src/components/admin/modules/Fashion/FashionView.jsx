import React, { useState, useEffect } from 'react';
import { GenericDataTableTab } from '../../GenericDataTableTab';
import { CategoryProductModal } from '../Shared/CategoryProductModal';
import { API_URL } from '../../../../config';

export function FashionView({ defaultTab = 'men' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  const token = localStorage.getItem('yali_token');

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const tabs = [
    { id: 'men', label: "Men's Fashion" },
    { id: 'women', label: "Women's Fashion" },
    { id: 'kids', label: "Kids' Fashion" },
    { id: 'ethnic', label: 'Ethnic Wear' },
    { id: 'western', label: 'Western Wear' },
    { id: 'fashion-accessories', label: 'Accessories' },
    { id: 'new-arrivals', label: 'New Arrivals' }
  ];

  const schemas = {
    'men': [
      { name: 'brand', label: 'Brand', type: 'text', required: true },
      { name: 'material', label: 'Material', type: 'text', required: true },
      { name: 'fit', label: 'Fit Type', type: 'text', required: true }
    ],
    'women': [
      { name: 'brand', label: 'Brand', type: 'text', required: true },
      { name: 'material', label: 'Material', type: 'text', required: true },
      { name: 'occasion', label: 'Occasion (Casual/Party)', type: 'text', required: true }
    ],
    'kids': [
      { name: 'brand', label: 'Brand', type: 'text', required: true },
      { name: 'ageGroup', label: 'Age Group', type: 'text', required: true },
      { name: 'material', label: 'Material', type: 'text', required: true }
    ],
    'ethnic': [
      { name: 'brand', label: 'Brand', type: 'text', required: true },
      { name: 'fabric', label: 'Fabric', type: 'text', required: true },
      { name: 'work', label: 'Embroidery/Work', type: 'text', required: true }
    ],
    'western': [
      { name: 'brand', label: 'Brand', type: 'text', required: true },
      { name: 'style', label: 'Style (Casual/Formal)', type: 'text', required: true },
      { name: 'material', label: 'Material', type: 'text', required: true }
    ],
    'fashion-accessories': [
      { name: 'brand', label: 'Brand', type: 'text', required: true },
      { name: 'type', label: 'Accessory Type', type: 'text', required: true },
      { name: 'material', label: 'Material', type: 'text', required: true }
    ],
    'new-arrivals': [
      { name: 'brand', label: 'Brand', type: 'text', required: true },
      { name: 'collection', label: 'Collection Name', type: 'text', required: true },
      { name: 'season', label: 'Season (e.g. Summer 2026)', type: 'text', required: true }
    ]
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/products?category=fashion&sub_category=${activeTab}&all=true`);
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

  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label || activeTab;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Fashion Inventory</h2>
          <p className="text-gray-500 font-medium mt-1">Manage clothing, footwear, and accessories.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
              activeTab === tab.id ? 'border-pink-600 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <GenericDataTableTab 
          categoryFilter="fashion" 
          subcategoryFilter={activeTab}
          products={properties}
          loading={loading}
          schema={schemas[activeTab]} 
          title={`${activeTabLabel} Listings`} 
          subtitle={`Manage inventory for ${activeTabLabel.toLowerCase()}`}
          onAdd={() => handleOpenModal()}
          onEdit={(p) => handleOpenModal(p)}
          onDelete={handleDelete}
        />
      </div>

      <CategoryProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        category="fashion"
        subCategory={activeTab}
        schema={schemas[activeTab]}
        initialData={editingProperty}
        token={token}
      />
    </div>
  );
}
