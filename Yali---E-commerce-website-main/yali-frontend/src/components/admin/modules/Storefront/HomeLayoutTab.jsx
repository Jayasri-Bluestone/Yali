import React from 'react';
import { Layout, Plus, Search } from 'lucide-react';

export function HomeLayoutTab() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-900">Home Page Layout</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage dynamic sections and UI cards on the home page.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white rounded-xl font-bold text-sm transition-all shadow-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Section</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-16 flex flex-col items-center justify-center text-center">
          <Layout className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Layout Configuration Empty</h3>
          <p className="text-gray-500 max-w-md mb-6">Add dynamic UI cards, carousels, or promotional banners to build your homepage layout.</p>
          <button className="px-6 py-2.5 bg-[#0066cc] text-white rounded-xl font-bold hover:bg-[#0052a3] transition-colors shadow-sm">
            Configure Layout
          </button>
        </div>
      </div>
    </div>
  );
}
