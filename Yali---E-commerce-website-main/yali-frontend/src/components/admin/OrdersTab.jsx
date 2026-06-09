import { useState, useEffect } from 'react';
import { Pagination } from './Pagination';

export function OrdersTab({
  filteredOrders,
  isSuperAdmin,
  approvedVendors,
  handleOrderStatusChange,
  handleAssignOrder,
  handleTrackingUpdate,
  handleDeliveryDateUpdate
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredOrders.length]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const currentItems = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-950">Store Order Assignments & Fulfillment Logs</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 font-semibold bg-gray-50">
              <th className="p-4 rounded-l-lg">Order ID</th>
              <th className="p-4">Customer Details</th>
              <th className="p-4">Items / Total</th>
              <th className="p-4">Fulfillment Status</th>
              <th className="p-4">Assigned Vendor</th>
              <th className="p-4">Expected Delivery</th>
              <th className="p-4 text-right rounded-r-lg">Tracking Details</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(o => (
              <tr key={o.order_id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="p-4 font-semibold text-[#0066cc]">{o.order_id}</td>
                <td className="p-4">
                  <div className="font-semibold text-gray-950">{o.customerName}</div>
                  <div className="text-xs text-gray-500">{o.customerEmail}</div>
                  <div className="text-xs text-gray-500 max-w-xs break-words mt-1 bg-gray-50 p-2 rounded border border-gray-100">{o.address}</div>
                </td>
                <td className="p-4">
                  <div className="font-bold text-gray-900">₹{(o.total || 0).toFixed(2)}</div>
                  <div className="text-xs text-gray-500">{o.items?.map(it => `${it.name} (x${it.quantity})`).join(', ')}</div>
                </td>
                <td className="p-4">
                  <select
                    value={o.status || 'Pending'}
                    onChange={(e) => handleOrderStatusChange(o.order_id, e.target.value)}
                    className="px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Returned">Returned</option>
                  </select>
                </td>
                <td className="p-4">
                  {isSuperAdmin ? (
                    <select
                      value={o.assigned_vendor_id || ''}
                      onChange={(e) => handleAssignOrder(o.order_id, e.target.value)}
                      className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="">-- Unassigned --</option>
                      {approvedVendors.map(v => (
                        <option key={v.id} value={v.id}>{v.vendorDetails?.companyName || v.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs font-semibold text-gray-700">
                      {approvedVendors.find(v => v.id === o.assigned_vendor_id)?.vendorDetails?.companyName || 'Not Assigned'}
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <input
                    type="date"
                    defaultValue={o.expected_delivery_date ? new Date(o.expected_delivery_date).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleDeliveryDateUpdate(o.order_id, e.target.value)}
                    className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer bg-gray-50"
                  />
                </td>
                <td className="p-4 text-right">
                  <input
                    type="text"
                    placeholder="Tracking Code"
                    defaultValue={o.tracking_number || ''}
                    onBlur={(e) => handleTrackingUpdate(o.order_id, e.target.value)}
                    className="w-32 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">No orders logged under your dashboard filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />
    </div>
  );
}
