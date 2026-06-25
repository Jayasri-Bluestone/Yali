import React, { useMemo } from 'react';
import { OrdersTable } from './OrdersTable';

export function CategoryOrdersView({ category, categoryLabel, orders, onStatusChange }) {
  const filteredOrders = useMemo(() => {
    return orders.filter(o => o.category === category);
  }, [orders, category]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{categoryLabel} Orders</h2>
          <p className="text-gray-500 font-medium mt-1">Manage and track customer orders for {categoryLabel}.</p>
        </div>
      </div>

      <OrdersTable 
        orders={filteredOrders} 
        onStatusChange={onStatusChange} 
        title={`All ${categoryLabel} Orders`}
      />
    </div>
  );
}
