import React from 'react';
import { Layers, Plus, Search, FileText } from 'lucide-react';

export function PageBuilderTab() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-900">Page Builder</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Create and manage custom static pages like About Us, Privacy Policy, etc.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search pages..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-transparent transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white rounded-xl font-bold text-sm transition-all shadow-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Page</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-16 flex flex-col items-center justify-center text-center">
          <FileText className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Pages Created Yet</h3>
          <p className="text-gray-500 max-w-md mb-6">Build your first custom page to display static content to your users.</p>
          <button className="px-6 py-2.5 bg-[#0066cc] text-white rounded-xl font-bold hover:bg-[#0052a3] transition-colors shadow-sm">
            Start Building
          </button>
        </div>
      </div>
    </div>
  );
}
