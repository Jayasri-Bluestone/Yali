import React, { useState, useEffect } from 'react';
import { GenericDataTableTab } from '../../GenericDataTableTab';
import { CategoryProductModal } from '../Shared/CategoryProductModal';
import { API_URL } from '../../../../config';

export function OrganicProductsView({ defaultTab = 'vegetables' }) {
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
    { id: 'vegetables', label: 'Fresh Vegetables' },
    { id: 'fruits', label: 'Fresh Fruits' },
    { id: 'grocery', label: 'Organic Grocery' },
    { id: 'herbal', label: 'Herbal & Natural' },
    { id: 'personal-care', label: 'Personal Care' },
    { id: 'home-care', label: 'Home Care' },
    { id: 'farm-to-home', label: 'Farm to Home' }
  ];

  const schemas = {
    'vegetables': [
      { name: 'weight', label: 'Weight/Quantity', type: 'text', required: true },
      { name: 'farming', label: 'Farming Type', type: 'text', required: true },
      { name: 'shelfLife', label: 'Shelf Life', type: 'text', required: true }
    ],
    'fruits': [
      { name: 'weight', label: 'Weight/Quantity', type: 'text', required: true },
      { name: 'origin', label: 'Origin/Farm', type: 'text', required: true },
      { name: 'shelfLife', label: 'Shelf Life', type: 'text', required: true }
    ],
    'grocery': [
      { name: 'weight', label: 'Weight/Quantity', type: 'text', required: true },
      { name: 'brand', label: 'Brand/Farm', type: 'text', required: true },
      { name: 'certification', label: 'Certification (e.g. USDA Organic)', type: 'text', required: true },
      { name: 'expiryDate', label: 'Expiry Date', type: 'text', required: true }
    ],
    'herbal': [
      { name: 'weight', label: 'Weight/Quantity', type: 'text', required: true },
      { name: 'ingredients', label: 'Key Ingredients', type: 'text', required: true },
      { name: 'benefits', label: 'Primary Benefits', type: 'text', required: true }
    ],
    'personal-care': [
      { name: 'weight', label: 'Weight/Volume', type: 'text', required: true },
      { name: 'ingredients', label: 'Key Ingredients', type: 'text', required: true },
      { name: 'skinType', label: 'Suitable Skin/Hair Type', type: 'text', required: true }
    ],
    'home-care': [
      { name: 'weight', label: 'Weight/Volume', type: 'text', required: true },
      { name: 'ingredients', label: 'Key Ingredients', type: 'text', required: true },
      { name: 'usage', label: 'Usage Instructions', type: 'text', required: true }
    ],
    'farm-to-home': [
      { name: 'weight', label: 'Weight/Quantity', type: 'text', required: true },
      { name: 'farmName', label: 'Farm Name', type: 'text', required: true },
      { name: 'harvestDate', label: 'Harvest Date', type: 'text', required: true }
    ]
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/products?category=organic-products&sub_category=${activeTab}&all=true`);
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
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Organic Products Inventory</h2>
          <p className="text-gray-500 font-medium mt-1">Manage listings for fresh produce and natural groceries.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
              activeTab === tab.id ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <GenericDataTableTab 
          categoryFilter="organic-products" 
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
        category="organic-products"
        subCategory={activeTab}
        schema={schemas[activeTab]}
        initialData={editingProperty}
        token={token}
      />
    </div>
  );
}
