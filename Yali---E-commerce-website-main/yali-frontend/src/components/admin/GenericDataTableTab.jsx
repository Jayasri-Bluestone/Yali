import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Search, Plus, Loader2, PackageX, Download } from 'lucide-react';
import { exportToCSV } from '../../utils/csvExport';
import { API_URL } from '../../config';
import { useToast } from '../../context/ToastContext';

export function GenericDataTableTab({ 
  title, 
  subtitle, 
  emptyMessage = "No items found", 
  categoryFilter,
  subcategoryFilter,
  products = [],
  loading = false,
  onEdit,
  onDelete,
  onAdd
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { addToast } = useToast();

  const tokenStr = localStorage.getItem('yali_token');
  let userRole = 'vendor';
  if (tokenStr) {
    try {
      const payload = JSON.parse(atob(tokenStr.split('.')[1]));
      userRole = payload.role;
    } catch(e) {}
  }
  const isAdmin = userRole === 'admin';

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this product?')) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('yali_token')}` }
      });
      if (res.ok) {
        addToast('Product approved successfully', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        addToast('Failed to approve product', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this product?')) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('yali_token')}` }
      });
      if (res.ok) {
        addToast('Product rejected successfully', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        addToast('Failed to reject product', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter products by category/subcategory and search term
  const filteredProducts = products.filter(p => {
    let matches = true;
    if (categoryFilter) {
      matches = matches && p.category === categoryFilter;
    }
    if (subcategoryFilter) {
      matches = matches && (p.sub_category === subcategoryFilter || p.subcategory === subcategoryFilter);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      matches = matches && (
        p.name?.toLowerCase().includes(q) || 
        p.unique_id?.toLowerCase().includes(q)
      );
    }
    return matches;
  });

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, subcategoryFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm font-medium text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-transparent transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <button
            onClick={() => exportToCSV(filteredProducts, title.replace(/\s+/g, '_').toLowerCase())}
            className="flex items-center gap-2 px-3 py-2 bg-white text-[#0066cc] hover:bg-blue-50 rounded-xl border border-blue-200 transition-colors text-sm font-bold"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          {onAdd && (
            <button 
              onClick={onAdd}
              className="flex items-center gap-2 px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white rounded-xl font-bold text-sm transition-all shadow-sm shadow-blue-200"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add New</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <Loader2 className="w-10 h-10 text-[#0066cc] animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading data...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <PackageX className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">{emptyMessage}</h3>
          <p className="text-gray-500 mb-6 text-center max-w-md">There are currently no items matching your criteria. Try adjusting your search or add a new item.</p>
          {onAdd && (
            <button onClick={onAdd} className="px-6 py-2.5 bg-[#0066cc] text-white rounded-xl font-bold hover:bg-[#0052a3] transition-colors shadow-sm">
              Create First Item
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Product Info</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Pricing</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Inventory</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProducts.map(product => {
                  let parsedImages = [];
                  if (Array.isArray(product.images)) {
                    parsedImages = product.images;
                  } else if (typeof product.images === 'string') {
                    try {
                      const parsed = JSON.parse(product.images);
                      if (Array.isArray(parsed)) parsedImages = parsed;
                    } catch (e) {
                      if (product.images.trim()) {
                        parsedImages = product.images.split(',').map(s => s.trim()).filter(Boolean);
                      }
                    }
                  }
                  const displayImage = parsedImages.length > 0
                    ? parsedImages[0] 
                    : (product.image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600&q=80');

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={displayImage} 
                            alt={product.name} 
                            className="w-16 h-12 rounded-lg object-cover border border-gray-200 shadow-sm"
                          />
                          <div>
                            <div className="font-bold text-gray-900 line-clamp-1" title={product.name}>{product.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-bold text-gray-500">
                                ID: {product.unique_id || `PROD-${product.id}`}
                              </span>
                              {(product.vendor_name || product.vendor_company) && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                    {product.vendor_company || product.vendor_name}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-black text-gray-900">₹{parseFloat(product.price).toLocaleString()}</div>
                        {product.original_price && (
                          <div className="text-xs text-gray-400 line-through font-medium mt-0.5">
                            ₹{parseFloat(product.original_price).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                          (product.stock || 0) > 10 
                            ? 'bg-green-50 text-green-700' 
                            : (product.stock || 0) > 0 
                              ? 'bg-orange-50 text-orange-700' 
                              : 'bg-red-50 text-red-700'
                        }`}>
                          {(product.stock || 0)} in stock
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                            product.approval_status === 'pending' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                            product.approval_status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-200' :
                            product.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                            {product.approval_status === 'pending' ? 'PENDING' : product.approval_status === 'rejected' ? 'REJECTED' : (product.status || 'active').toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center justify-end gap-2">
                            {onEdit && (
                              <button onClick={() => onEdit(product)} className="p-2 text-gray-400 hover:text-[#0066cc] hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            {onDelete && (
                              <button onClick={() => onDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          {isAdmin && product.approval_status === 'pending' && (
                            <div className="flex items-center justify-end gap-1 mt-2">
                              <button onClick={() => handleApprove(product.id)} className="px-2 py-1 text-[10px] font-bold bg-green-100 text-green-700 hover:bg-green-200 rounded">
                                APPROVE
                              </button>
                              <button onClick={() => handleReject(product.id)} className="px-2 py-1 text-[10px] font-bold bg-red-100 text-red-700 hover:bg-red-200 rounded">
                                REJECT
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
              <span className="text-sm text-gray-500 font-medium">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center px-4 font-bold text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
