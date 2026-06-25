import React from 'react';
import { Construction } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function AdminPlaceholderTab({ title }) {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const moduleName = title || pathParts[pathParts.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[60vh] mt-4">
      <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
        <Construction className="w-10 h-10 text-orange-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{moduleName || 'Under Construction'}</h2>
      <p className="text-gray-500 max-w-md text-center">
        This section is currently being developed. It will be available in a future update to help you manage this aspect of your business.
      </p>
    </div>
  );
}
