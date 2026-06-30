import { Plus, Trash2, Edit2, Download, Search, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ToggleSwitch } from "../../ToggleSwitch";
import { Pagination } from "../../Pagination";
import { exportToCSV } from "../../../../utils/csvExport";

export function CouponsTab({
  coupons,
  setIsCouponModalOpen,
  setEditingCoupon,
  setCouponForm,
  handleEditCouponClick,
  handleDeleteCoupon,
  handleToggleStatus
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const filteredCoupons = coupons.filter(c => {
    const searchString = `${c.code || ''} ${c.type || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || 
                          (statusFilter === 'Active' && c.status === 'active') ||
                          (statusFilter === 'Inactive' && c.status !== 'active');
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const currentItems = filteredCoupons.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900">Discount Coupons Hub</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search coupons..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] transition-all bg-gray-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] transition-all bg-gray-50 appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <button
            onClick={() => exportToCSV(filteredCoupons, 'coupons')}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-[#0066cc] rounded-lg border border-gray-200 transition-colors text-sm font-semibold cursor-pointer"
            title="Export Coupons to CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setIsCouponModalOpen(true)}
            className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all gap-2 text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Coupon
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map(c => (
          <div key={c.code} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-white border-r border-gray-200 rounded-r-full" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-white border-l border-gray-200 rounded-l-full" />
            
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded text-sm tracking-wider">
                  {c.code}
                </span>
                <div className="flex gap-2 items-center">
                  <div onClick={(e) => e.stopPropagation()}>
                    <ToggleSwitch 
                      checked={c.status === 'active'}
                      onChange={() => handleToggleStatus('coupons', c.code, c.status)}
                    />
                  </div>
                  <button
                    onClick={() => handleEditCouponClick(c)}
                    className="text-blue-500 hover:text-blue-700 transition-colors p-1 cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCoupon(c.code)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-3xl font-extrabold text-gray-900 mb-2">
                {c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`} OFF
              </div>
              <div className="text-xs text-gray-500 space-y-1 mt-3">
                <div>Min order: <span className="font-semibold">₹{c.minOrder}</span></div>
                <div>Expires: <span className="font-semibold">{c.expiry?.split('T')[0] || c.expiry}</span></div>
              </div>
            </div>
          </div>
        ))}
        {coupons.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-400 text-sm">No coupons found. Create one to get started!</div>
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={setItemsPerPage} />
    </div>
  );
}
