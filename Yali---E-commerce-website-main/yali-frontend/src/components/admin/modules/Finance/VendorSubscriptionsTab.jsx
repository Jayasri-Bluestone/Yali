import React from 'react';
import { Briefcase, Search, Plus } from 'lucide-react';

export function VendorSubscriptionsTab() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-900">Vendor Subscriptions</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage subscription tiers for vendors.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search vendors..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-transparent transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white rounded-xl font-bold text-sm transition-all shadow-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Tier</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-16 flex flex-col items-center justify-center text-center">
          <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Subscriptions Found</h3>
          <p className="text-gray-500 max-w-md">Vendor subscription data will be displayed here.</p>
        </div>
      </div>
    </div>
  );
}
