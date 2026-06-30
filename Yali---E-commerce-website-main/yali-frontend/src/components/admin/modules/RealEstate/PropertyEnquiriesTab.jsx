import React, { useEffect, useState } from 'react';
import { API_URL } from '../../../../config';
import { exportToCSV } from '../../../../utils/csvExport';
import { Pagination } from '../../Pagination';
import { Download, Search, Filter } from 'lucide-react';

export function PropertyEnquiriesTab() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('yali_token');
      // Filter by type=property (Real Estate / Land / Plot enquiries)
      const res = await fetch(`${API_URL}/admin/enquiries?type=property`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setEnquiries(data);
    } catch (e) {
      console.error('Fetch property enquiries error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEnquiries(); }, []);

  const filteredEnquiries = enquiries.filter(q => {
    const searchStr = `${q.full_name || ''} ${q.email || ''} ${q.phone || ''} ${q.product_name || ''} ${q.id || ''}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || (q.status || 'pending') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredEnquiries.length / itemsPerPage);
  const paginatedEnquiries = filteredEnquiries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm min-h-[60vh] animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Property Enquiries</h2>
          <p className="text-gray-500 mt-1">Enquiries for land, plots and real estate visits.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search enquiries..."
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
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => exportToCSV(filteredEnquiries, 'property_enquiries')}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-[#0066cc] rounded-lg border border-gray-200 font-bold transition-colors text-sm"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={fetchEnquiries} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 font-bold text-sm text-white rounded-lg transition-colors">
              Refresh
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : enquiries.length === 0 ? (
        <p className="text-gray-500">No property enquiries yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b border-gray-200">
                <th className="p-2">ID</th>
                <th className="p-2">Product / Category</th>
                <th className="p-2">CTA</th>
                <th className="p-2">Name</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Email</th>
                <th className="p-2">Preferred Date</th>
                <th className="p-2">Message</th>
                <th className="p-2">Status</th>
                <th className="p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEnquiries.map(q => (
                <tr key={q.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 text-gray-500">{q.id}</td>
                  <td className="p-2">{q.product_name || q.category || (q.product_id ? `#${q.product_id}` : '-')}</td>
                  <td className="p-2 capitalize">{(q.cta_action || '').replace(/_/g, ' ') || '-'}</td>
                  <td className="p-2 font-medium">{q.full_name || '-'}</td>
                  <td className="p-2">{q.phone || '-'}</td>
                  <td className="p-2">{q.email || '-'}</td>
                  <td className="p-2">{q.preferred_date ? new Date(q.preferred_date).toLocaleDateString() : '-'}</td>
                  <td className="p-2 max-w-[200px] truncate">{q.message ? q.message.slice(0, 80) : '-'}</td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      q.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      q.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{q.status || 'pending'}</span>
                  </td>
                  <td className="p-2 text-gray-500 whitespace-nowrap">{new Date(q.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {filteredEnquiries.length > 0 && (
        <div className="mt-4">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
            itemsPerPage={itemsPerPage} 
            onItemsPerPageChange={setItemsPerPage} 
          />
        </div>
      )}
    </div>
  );
}
