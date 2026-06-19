import { useState, useEffect } from 'react';
import { Download, FileText, Filter, Loader, Calendar, Package, Users, Truck, ShoppingCart, Eye, ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../config';

export function ReportsTab({ userData, token }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  
  // Filter state
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    vendorId: 'all',
    category: 'all',
    status: 'all'
  });

  const [viewModal, setViewModal] = useState({
    isOpen: false,
    title: '',
    data: [],
    headers: []
  });

  const reports = [
    {
      id: 'sales',
      title: 'Sales & Tax Report',
      description: 'Comprehensive order, subtotal, and GST tax report for accounting.',
      icon: <FileText className="w-8 h-8 text-blue-500" />
    },
    {
      id: 'vendors',
      title: 'Vendor Commission & Settlements',
      description: 'Breakdown of vendor sales, platform commission, and net payables.',
      icon: <Users className="w-8 h-8 text-purple-500" />
    },
    {
      id: 'inventory',
      title: 'All Products Master Report',
      description: 'Master sheet of all products, stock levels, categories, and prices.',
      icon: <Package className="w-8 h-8 text-orange-500" />
    },
    {
      id: 'returns',
      title: 'Returns & Refunds Analysis',
      description: 'Details of all returned items, reasons, and potential refund losses.',
      icon: <Truck className="w-8 h-8 text-red-500" />
    },
    {
      id: 'customers',
      title: 'Customer Lifetime Value (CRM)',
      description: 'Top customers by total spent and order count.',
      icon: <Users className="w-8 h-8 text-green-500" />
    },
    {
      id: 'pincode',
      title: 'Pincode Delivery Analytics',
      description: 'Analyze which geographic pincodes generate the most revenue.',
      icon: <ShoppingCart className="w-8 h-8 text-indigo-500" />
    },
    {
      id: 'abandoned',
      title: 'Abandoned Cart Report',
      description: 'List of customers who left items in their cart without checking out.',
      icon: <ShoppingCart className="w-8 h-8 text-gray-500" />
    }
  ];

  useEffect(() => {
    if (userData.role === 'admin') {
      fetchVendors();
    }
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await fetch(`${API_URL}/vendors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVendors(data);
      }
    } catch (err) {
      console.error('Failed to fetch vendors for filter:', err);
    }
  };

  const handleAction = async (type, title, action) => {
    setLoading(true);
    try {
      // Build Query String
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.vendorId !== 'all') params.append('vendorId', filters.vendorId);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.status !== 'all') params.append('status', filters.status);

      const res = await fetch(`${API_URL}/reports/${type}?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to generate report');
      const data = await res.json();

      if (data.length === 0) {
        showToast(`No data found for ${title} with current filters.`, 'error');
        setLoading(false);
        return;
      }

      const headers = Object.keys(data[0]);

      if (action === 'view') {
        setViewModal({
          isOpen: true,
          title: title,
          data: data,
          headers: headers
        });
        setLoading(false);
        return;
      }

      // Convert JSON to CSV
      const csvRows = [];
      
      // Header row
      csvRows.push(headers.map(header => `"${header.replace(/_/g, ' ').toUpperCase()}"`).join(','));
      
      // Data rows
      for (const row of data) {
        const values = headers.map(header => {
          let val = row[header];
          if (val === null || val === undefined) val = '';
          // Escape quotes inside strings and wrap in quotes
          return `"${String(val).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
      }

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
      a.click();
      window.URL.revokeObjectURL(url);

      showToast(`${title} exported successfully!`, 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!viewModal.isOpen ? (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
          </div>

      {/* Global Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold">
          <Filter className="w-5 h-5" />
          Global Report Filters
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
            <input 
              type="date" 
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">End Date</label>
            <input 
              type="date" 
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
            />
          </div>
          {userData.role === 'admin' && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Filter by Vendor</label>
              <select 
                value={filters.vendorId}
                onChange={(e) => setFilters({...filters, vendorId: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
              >
                <option value="all">All Vendors</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.company_name || v.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
            >
              <option value="all">Any Status</option>
              <option value="Delivered">Delivered (Sales)</option>
              <option value="active">Active (Products)</option>
              <option value="Returned">Returned (Sales)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            
            <div className="mb-4 bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center">
              {report.icon}
            </div>
            
            <h3 className="text-lg font-bold text-gray-800 mb-2">{report.title}</h3>
            <p className="text-gray-500 text-sm mb-6 h-10">{report.description}</p>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleAction(report.id, report.title, 'view')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-600 font-medium rounded-xl hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                View
              </button>
              <button
                onClick={() => handleAction(report.id, report.title, 'export')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-green-50 text-green-600 font-medium rounded-xl hover:bg-green-600 hover:text-white transition-colors disabled:opacity-50"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export
              </button>
            </div>
          </div>
        ))}
      </div>

        </>
      ) : (
        /* Document View Mode */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[75vh]">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewModal({ isOpen: false, data: [], headers: [], title: '' })}
                className="p-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-gray-800">{viewModal.title}</h3>
            </div>
            <button
              onClick={() => {
                const type = reports.find(r => r.title === viewModal.title)?.id || 'report';
                handleAction(type, viewModal.title, 'export');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#0066cc] text-white font-medium rounded-xl hover:bg-[#0052a3] transition-colors shadow-sm"
            >
              <Download className="w-5 h-5" />
              Download CSV
            </button>
          </div>
          
          <div className="p-0 overflow-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  {viewModal.headers.map((header, idx) => (
                    <th key={idx} scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                      {header.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {viewModal.data.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-blue-50/50 transition-colors">
                    {viewModal.headers.map((header, colIdx) => {
                      let val = row[header];
                      if (val === null || val === undefined) val = '-';
                      return (
                        <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
