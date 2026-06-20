import { useState, useEffect, Fragment } from 'react';
import { Pagination } from './Pagination';
import { API_URL } from '../../config';
import { ChevronDown, ChevronUp, Package, Download } from 'lucide-react';
import { exportToCSV } from '../../utils/csvExport';

export function OrdersTab({
  filteredOrders,
  isSuperAdmin,
  approvedVendors,
  handleOrderStatusChange,
  handleOrderItemStatusChange,
  handleAssignOrder, // (Not really used anymore for item-level, but kept for signature)
  handleTrackingUpdate,
  handleDeliveryDateUpdate
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredOrders.length]);

  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentItems = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Note: handleAssignOrder and handleOrderStatusChange (overall) are still available,
  // but we focus on item-level updates now.
  const updateItemVendor = async (itemId, newVendorId) => {
    // We can reuse the order-items status endpoint to also update vendor if we modify the backend,
    // or just leave it since the backend auto-routes. 
    // To keep it simple, we'll just allow them to update tracking and status.
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-950">Store Order Assignments & Fulfillment Logs</h2>
        <button
          onClick={() => exportToCSV(filteredOrders, 'orders')}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-[#0066cc] rounded-lg border border-gray-200 transition-colors text-sm font-semibold"
          title="Export Orders to CSV"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 font-semibold bg-gray-50">
              <th className="p-4 rounded-l-lg w-10"></th>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer Details</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Expected Delivery</th>
              <th className="p-4 text-right rounded-r-lg">Overall Status</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(o => (
              <Fragment key={o.order_id}>
                <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <button onClick={() => toggleOrder(o.order_id)} className="p-1 hover:bg-gray-200 rounded text-gray-500">
                      {expandedOrders[o.order_id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </td>
                  <td className="p-4 font-semibold text-[#0066cc]">{o.order_id}</td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-950">{o.customerName}</div>
                    <div className="text-xs text-gray-500">{o.customerEmail}</div>
                    <div className="text-xs text-gray-500 max-w-xs break-words mt-1 bg-gray-50 p-2 rounded border border-gray-100">{o.address}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">₹{(o.total || 0).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{o.items?.length || 0} Items</div>
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
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-semibold text-xs border border-gray-200">
                      {o.status}
                    </span>
                  </td>
                </tr>

                {/* Expanded Item Level Details */}
                {expandedOrders[o.order_id] && (
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td colSpan="6" className="p-4">
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                          <Package size={16} className="text-gray-500" />
                          <span className="font-semibold text-sm text-gray-700">Order Items (Vendor Assignments)</span>
                        </div>
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-gray-100 text-gray-500 text-xs">
                              <th className="p-3">Product Name</th>
                              <th className="p-3">Qty</th>
                              <th className="p-3">Assigned Vendor</th>
                              <th className="p-3">Item Status</th>
                              <th className="p-3">Tracking Code</th>
                            </tr>
                          </thead>
                          <tbody>
                            {o.items?.map(it => (
                              <tr key={it.item_id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                <td className="p-3">
                                  <div className="font-medium text-gray-900">{it.name}</div>
                                  {it.variant_desc && <div className="text-xs text-gray-500">{it.variant_desc}</div>}
                                </td>
                                <td className="p-3 text-gray-600">x{it.quantity}</td>
                                <td className="p-3">
                                  <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100">
                                    {approvedVendors.find(v => v.id === it.vendor_id)?.vendorDetails?.companyName || 'Auto-Routing / Default'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <select
                                    value={it.item_status || 'Pending'}
                                    onChange={(e) => handleOrderItemStatusChange(it.item_id, e.target.value)}
                                    className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Packed">Packed</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Out for Delivery">Out for Delivery</option>
                                    <option value="Delivered">Delivered</option>
                                  </select>
                                </td>
                                <td className="p-3">
                                  <input
                                    type="text"
                                    placeholder="Enter AWB / Tracking"
                                    defaultValue={it.tracking_number || ''}
                                    onBlur={(e) => handleOrderItemStatusChange(it.item_id, it.item_status, { trackingNumber: e.target.value })}
                                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">No orders logged under your dashboard filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={setItemsPerPage} />
    </div>
  );
}
