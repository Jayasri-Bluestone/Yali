import React, { useState, useEffect } from 'react';
import { GenericDataTableTab } from '../../GenericDataTableTab';
import { CategoryProductModal } from '../Shared/CategoryProductModal';
import { API_URL } from '../../../../config';

export function DryFruitsView({ defaultTab = 'nuts' }) {
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
    { id: 'nuts', label: 'Premium Nuts' },
    { id: 'dried-fruits', label: 'Dried Fruits' },
    { id: 'seeds', label: 'Healthy Seeds' },
    { id: 'nut-butters', label: 'Nut Butters' },
    { id: 'gift-packs', label: 'Gift Packs' },
    { id: 'premium-dry-fruits', label: 'Organic & Premium' },
    { id: 'health', label: 'Health Benefits' }
  ];

  const schemas = {
    'nuts': [
      { name: 'weight', label: 'Weight/Quantity', type: 'text', required: true },
      { name: 'origin', label: 'Origin', type: 'text', required: true },
      { name: 'grade', label: 'Quality Grade', type: 'text', required: true }
    ],
    'dried-fruits': [
      { name: 'weight', label: 'Weight/Quantity', type: 'text', required: true },
      { name: 'origin', label: 'Origin/Sourced From', type: 'text', required: true },
      { name: 'shelfLife', label: 'Shelf Life', type: 'text', required: true }
    ],
    'seeds': [
      { name: 'weight', label: 'Weight/Quantity', type: 'text', required: true },
      { name: 'type', label: 'Seed Type (Raw/Roasted)', type: 'text', required: true },
      { name: 'benefits', label: 'Health Benefits', type: 'text', required: true }
    ],
    'nut-butters': [
      { name: 'weight', label: 'Weight/Volume', type: 'text', required: true },
      { name: 'ingredients', label: 'Ingredients', type: 'text', required: true },
      { name: 'shelfLife', label: 'Shelf Life', type: 'text', required: true }
    ],
    'gift-packs': [
      { name: 'weight', label: 'Total Weight', type: 'text', required: true },
      { name: 'items', label: 'Included Items', type: 'text', required: true },
      { name: 'occasion', label: 'Occasion (Festive/Corporate)', type: 'text', required: true }
    ],
    'premium-dry-fruits': [
      { name: 'weight', label: 'Weight/Quantity', type: 'text', required: true },
      { name: 'certification', label: 'Certification (e.g. Organic)', type: 'text', required: true },
      { name: 'origin', label: 'Origin', type: 'text', required: true }
    ],
    'health': [
      { name: 'weight', label: 'Weight/Quantity', type: 'text', required: true },
      { name: 'targetIssue', label: 'Target Health Issue', type: 'text', required: true },
      { name: 'dosage', label: 'Recommended Dosage', type: 'text', required: true }
    ]
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/products?category=dry-fruits&sub_category=${activeTab}&all=true`);
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
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Dry Fruits & Nuts Inventory</h2>
          <p className="text-gray-500 font-medium mt-1">Manage premium nuts, seeds, and gift hampers.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
              activeTab === tab.id ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <GenericDataTableTab 
          categoryFilter="dry-fruits" 
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
        category="dry-fruits"
        subCategory={activeTab}
        schema={schemas[activeTab]}
        initialData={editingProperty}
        token={token}
      />
    </div>
  );
}
