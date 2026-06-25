import React, { useState, useEffect } from 'react';
import { RefreshCcw, CheckCircle, XCircle, Search, Filter, Loader, Eye, Box, Download } from 'lucide-react';
import { exportToCSV } from "../../../../utils/csvExport";
import { API_URL } from "../../../../config";
import { useToast } from "../../../../context/ToastContext";

export function ReturnsTab({ token, userData, isVendor }) {
  const { showToast } = useToast();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [actionModal, setActionModal] = useState({ isOpen: false, returnId: null, status: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, [token]);

  const fetchReturns = async () => {
    try {
      const res = await fetch(`${API_URL}/returns`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch returns');
      const data = await res.json();
      setReturns(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleActionSubmit = async () => {
    if (['Rejected', 'Received'].includes(actionModal.status) && !actionModal.notes.trim()) {
      showToast('Please provide notes for this action', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/returns/${actionModal.returnId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: actionModal.status, admin_notes: actionModal.notes })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update return request');
      
      showToast(data.message, 'success');
      setActionModal({ isOpen: false, returnId: null, status: '', notes: '' });
      fetchReturns();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReturns = returns.filter(req => {
    const matchesSearch = 
      req.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending': return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">Pending Review</span>;
      case 'Approved': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">Return Approved</span>;
      case 'Rejected': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">Rejected</span>;
      case 'Received': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">Item Received / Refunded</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
        <Loader className="w-8 h-8 text-[#0066cc] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading returns...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <RefreshCcw className="w-7 h-7 text-[#0066cc]" />
              Returns & Refunds (RMA)
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-gray-500 text-sm font-medium">Manage customer return requests and refunds.</p>
              <button
                onClick={() => exportToCSV(filteredReturns, 'returns')}
                className="flex items-center gap-2 px-3 py-1 bg-white text-[#0066cc] hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors text-xs font-bold"
                title="Export Returns to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders or products..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] transition-all bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative w-full sm:w-40">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] transition-all bg-white appearance-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Received">Received</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
              <th className="p-4 pl-6">Order & Product</th>
              <th className="p-4">Customer Info</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredReturns.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500 font-medium">
                  <Box className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  No return requests found matching your filters.
                </td>
              </tr>
            ) : (
              filteredReturns.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                        {req.image ? (
                           <img 
                             src={(() => {
                               let finalImg = req.image;
                               if (typeof req.image === 'string' && req.image.startsWith('[')) {
                                 try {
                                   const parsed = JSON.parse(req.image);
                                   finalImg = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : '';
                                 } catch(e) {}
                               }
                               if (typeof finalImg === 'string') {
                                 finalImg = finalImg.replace(/:\d+$/, ''); 
                               }
                               return finalImg;
                             })()} 
                             alt={req.product_name}
                             className="w-full h-full object-cover"
                             onError={(e) => { e.target.style.display = 'none'; }}
                           />
                        ) : (
                           <Box className="w-5 h-5 text-gray-400 m-auto mt-2.5" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm line-clamp-1">{req.product_name}</div>
                        <div className="text-xs text-gray-500 font-medium font-mono mt-0.5">Order #{req.order_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-900 text-sm">{req.customer_name}</div>
                    <div className="text-xs text-gray-500">{req.customer_email}</div>
                  </td>
                  <td className="p-4 max-w-xs">
                    <div className="text-sm text-gray-800 line-clamp-2">{req.reason}</div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(req.created_at).toLocaleString()}</div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {getStatusBadge(req.status)}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {req.status === 'Pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActionModal({ isOpen: true, returnId: req.id, status: 'Approved', notes: '' })}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200"
                          title="Approve Return"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setActionModal({ isOpen: true, returnId: req.id, status: 'Rejected', notes: '' })}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                          title="Reject Return"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    {req.status === 'Approved' && (
                      <button
                        onClick={() => setActionModal({ isOpen: true, returnId: req.id, status: 'Received', notes: '' })}
                        className="text-xs font-bold bg-[#0066cc] text-white px-3 py-1.5 rounded-lg hover:bg-[#0052a3] transition-colors shadow-sm"
                      >
                        Mark Received
                      </button>
                    )}
                    {['Received', 'Rejected'].includes(req.status) && (
                      <span className="text-xs text-gray-400 font-medium">Resolved</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Action Modal */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className={`p-5 border-b text-white flex items-center gap-3 ${
              actionModal.status === 'Approved' ? 'bg-blue-600' : 
              actionModal.status === 'Rejected' ? 'bg-red-600' : 'bg-green-600'
            }`}>
              {actionModal.status === 'Rejected' ? <XCircle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
              <h3 className="text-lg font-bold">
                {actionModal.status === 'Approved' ? 'Approve Return' : 
                 actionModal.status === 'Rejected' ? 'Reject Return' : 'Mark as Received & Refunded'}
              </h3>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                {actionModal.status === 'Approved' && 'Approving this request will notify the customer to ship the item back. The status will change to "Return Approved".'}
                {actionModal.status === 'Rejected' && 'Rejecting this request will mark it as closed and keep the order status as "Delivered". Please provide a reason below.'}
                {actionModal.status === 'Received' && 'Marking as received means you have received the item back and processed the refund. This will close the return ticket.'}
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Admin Notes (Optional for Approval)</label>
                <textarea
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] outline-none transition-all resize-none"
                  rows="3"
                  placeholder="E.g., Item was found damaged by customer negligence..."
                  value={actionModal.notes}
                  onChange={(e) => setActionModal({ ...actionModal, notes: e.target.value })}
                ></textarea>
              </div>
              
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setActionModal({ isOpen: false, returnId: null, status: '', notes: '' })}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActionSubmit}
                  disabled={isSubmitting || (['Rejected', 'Received'].includes(actionModal.status) && !actionModal.notes.trim())}
                  className={`px-6 py-2 text-sm font-bold text-white rounded-lg transition-colors ${
                    isSubmitting || (['Rejected', 'Received'].includes(actionModal.status) && !actionModal.notes.trim())
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : actionModal.status === 'Approved' ? 'bg-blue-600 hover:bg-blue-700'
                      : actionModal.status === 'Rejected' ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
