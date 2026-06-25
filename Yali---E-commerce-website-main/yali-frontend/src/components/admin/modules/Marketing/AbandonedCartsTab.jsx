import React from 'react';
import { ShoppingCart, Search } from 'lucide-react';

export function AbandonedCartsTab() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-900">Abandoned Carts</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Track and re-engage users with abandoned carts.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search users or carts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-transparent transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-16 flex flex-col items-center justify-center text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Abandoned Carts</h3>
          <p className="text-gray-500 max-w-md">There are currently no abandoned carts to display.</p>
        </div>
      </div>
    </div>
  );
}
