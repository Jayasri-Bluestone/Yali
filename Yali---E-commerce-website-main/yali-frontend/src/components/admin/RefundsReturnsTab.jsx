import React, { useState } from 'react';
import { RefreshCcw, CheckCircle, Search, XCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../config';

export function RefundsReturnsTab({ orders, token, refreshOrders }) {
  const { showToast, showConfirm } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const relevantOrders = orders.filter(o => 
    ['Return Requested', 'Returned', 'Cancelled'].includes(o.status)
  ).filter(o => 
    o.order_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApproveReturn = async (order) => {
    if (order.status !== 'Return Requested') return;
    
    // Product price only refund
    const refundAmount = Math.max(0, parseFloat(order.subtotal) - parseFloat(order.discount || 0));

    showConfirm(`Approve return for ${order.order_id}? This will automatically refund ₹${refundAmount.toFixed(2)} (Product price only) to the customer's wallet. Delivery and tax charges will not be refunded.`, async () => {
      setProcessingId(order.order_id);
      try {
        const res = await fetch(`${API_URL}/admin/orders/${order.order_id}/approve_return`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to approve return');
        
        showToast(data.message || 'Return approved and refunded successfully', 'success');
        if (refreshOrders) refreshOrders();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setProcessingId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 text-[#0066cc]" />
            Refunds & Returns
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage return requests and view refunded cancellations.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search Order ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Order ID</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Customer</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Status</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Reason Provided</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase text-right">Refund State</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {relevantOrders.length > 0 ? relevantOrders.map((order) => (
                <tr key={order.order_id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#0066cc]">{order.order_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{order.customer_name}</div>
                    <div className="text-xs text-gray-500">{order.customer_email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                      order.status === 'Return Requested' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      order.status === 'Returned' ? 'bg-gray-200 text-gray-700 border border-gray-300' :
                      'bg-red-100 text-red-700 border border-red-200' // Cancelled
                    }`}>
                      {order.status === 'Cancelled' && <XCircle className="w-3 h-3"/>}
                      {['Return Requested', 'Returned'].includes(order.status) && <RefreshCcw className="w-3 h-3"/>}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate" title={order.return_reason || order.cancellation_reason || 'N/A'}>
                    <span className="text-gray-600 font-medium">
                      {order.return_reason || order.cancellation_reason || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {order.refund_status === 'refunded' ? (
                      <div>
                        <div className="font-bold text-green-600 flex items-center justify-end gap-1">
                          <CheckCircle className="w-3 h-3" />
                          ₹{order.refund_amount}
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase mt-0.5">Credited to Wallet</div>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">No refund processed</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {order.status === 'Return Requested' ? (
                      <button
                        onClick={() => handleApproveReturn(order)}
                        disabled={processingId === order.order_id}
                        className="px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white font-bold rounded-lg text-xs transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                      >
                        {processingId === order.order_id ? 'Processing...' : 'Approve & Refund'}
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-gray-400 px-2">Completed</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCcw className="w-10 h-10 text-gray-300 mb-3" />
                      <p className="text-base font-semibold text-gray-900">No refunds or returns</p>
                      <p className="text-sm mt-1">There are currently no return requests or cancelled orders.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
