import React from 'react';
import { GenericDataTableTab } from '../../GenericDataTableTab';

export function DryFruitsListingsTab({ products, handleEditClick, handleDeleteProduct, setIsProductModalOpen, setProductForm }) {
  const onAdd = () => {
    setProductForm(prev => ({ ...prev, category: 'dry-fruits' }));
    setIsProductModalOpen(true);
  };

  return (
    <GenericDataTableTab
      title="Dry Fruits Listings"
      subtitle="Manage all your dry fruits inventory"
      emptyMessage="No dry fruits found"
      categoryFilter="dry-fruits"
      products={products}
      onEdit={handleEditClick}
      onDelete={handleDeleteProduct}
      onAdd={onAdd}
    />
  );
}
