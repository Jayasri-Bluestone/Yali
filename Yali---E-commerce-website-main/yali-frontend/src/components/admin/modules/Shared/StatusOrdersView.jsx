import React, { useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import { OrdersTable } from './OrdersTable';

export function StatusOrdersView({ status, title, description, orders, onStatusChange }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Extract unique categories for the filter dropdown
  const availableCategories = useMemo(() => {
    const cats = new Set(orders.map(o => o.category).filter(Boolean));
    return Array.from(cats);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    
    // Filter by status if a specific status is provided
    if (status) {
      result = result.filter(o => o.status === status);
    }
    
    // Filter by selected category
    if (selectedCategory !== 'all') {
      result = result.filter(o => o.category === selectedCategory);
    }
    
    return result;
  }, [orders, status, selectedCategory]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
          <p className="text-gray-500 font-medium mt-1">{description}</p>
        </div>
        
        {/* Category Filter */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-sm font-bold text-gray-700 bg-transparent border-0 focus:ring-0 p-0 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'organic-products' ? 'Organic Products' :
                 cat === 'dry-fruits' ? 'Dry Fruits' :
                 cat === 'fashion' ? 'Fashion & Apparel' :
                 cat === 'automobiles' ? 'Automobiles' :
                 cat === 'real-estate' ? 'Real Estate' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <OrdersTable 
        orders={filteredOrders} 
        onStatusChange={onStatusChange} 
      />
    </div>
  );
}
