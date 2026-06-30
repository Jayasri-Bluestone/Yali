import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, Loader, Eye, Box, Download, Truck, CheckCircle, Clock } from 'lucide-react';
import { exportToCSV } from "../../../../utils/csvExport";
import { API_URL } from "../../../../config";
import { useToast } from "../../../../context/ToastContext";
import { Pagination } from "../../Pagination";

export function SalesAnalyticsTab({ token, userData, isVendor }) {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order status');
      
      showToast(data.message, 'success');
      setOrders(orders.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.order_id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchString = `${order.order_id} ${order.customer_name} ${order.customer_email}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending': 
      case 'Pending Payment Verification':
        return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">{status}</span>;
      case 'Confirmed': 
      case 'Packed':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">{status}</span>;
      case 'Shipped': 
      case 'Out for Delivery':
        return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">{status}</span>;
      case 'Delivered': 
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">{status}</span>;
      case 'Cancelled': 
      case 'Returned':
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">{status}</span>;
      default: 
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
        <Loader className="w-8 h-8 text-[#0066cc] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
      <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <ShoppingBag className="w-7 h-7 text-[#0066cc]" />
              Order Management
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-gray-500 text-sm font-medium">
                {isVendor ? 'Track and manage orders for your products.' : 'View all system orders across the platform.'}
              </p>
              <button
                onClick={() => exportToCSV(filteredOrders, 'orders')}
                className="flex items-center gap-2 px-3 py-1 bg-white text-[#0066cc] hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors text-xs font-bold"
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
                placeholder="Search Order ID, Customer..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] transition-all bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] transition-all bg-white appearance-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Returned">Returned</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
              <th className="p-4 pl-6">Order ID & Date</th>
              <th className="p-4">Customer Info</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total Value</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-10 text-center text-gray-500 font-medium">
                  <Box className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  No orders found matching your criteria.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr key={order.order_id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="font-bold text-[#0066cc] text-sm">#{order.order_id}</div>
                    <div className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(order.order_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-900 text-sm">{order.customer_name}</div>
                    <div className="text-xs text-gray-500">{order.customer_email}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-gray-700">
                      {order.items?.length || 0} items
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">₹{Number(order.total).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{order.payment_method}</div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Eye className="w-4 h-4" /> View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredOrders.length > 0 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
          itemsPerPage={itemsPerPage} 
          onItemsPerPageChange={setItemsPerPage} 
        />
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  Order #{selectedOrder.order_id}
                </h3>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  Placed on {new Date(selectedOrder.order_date).toLocaleString()}
                </p>
              </div>
              <div>{getStatusBadge(selectedOrder.status)}</div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
              
              {/* Customer & Shipping Details */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Customer Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="font-bold text-gray-900">{selectedOrder.customer_name}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrder.customer_email}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Shipping Address
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {selectedOrder.address}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Update Order Status
                  </h4>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0066cc] outline-none"
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateStatus(selectedOrder.order_id, e.target.value)}
                      disabled={isUpdating}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Returned">Returned</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Order Items & Summary */}
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Box className="w-4 h-4" /> Order Items ({selectedOrder.items?.length})
                </h4>
                
                <div className="space-y-3 mb-6 max-h-[250px] overflow-y-auto pr-2">
                  {selectedOrder.items?.map(item => (
                    <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Box className="w-6 h-6 text-gray-300 m-auto mt-3" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{item.name}</p>
                        {item.variant_desc && <p className="text-xs text-gray-500">{item.variant_desc}</p>}
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs font-medium bg-gray-200 px-2 py-0.5 rounded">Qty: {item.quantity}</span>
                          <span className="font-bold text-[#0066cc] text-sm">₹{Number(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-3 border-b border-blue-100 pb-2">Payment Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{Number(selectedOrder.subtotal).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>₹{Number(selectedOrder.shipping).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>₹{Number(selectedOrder.tax).toLocaleString()}</span>
                    </div>
                    {Number(selectedOrder.discount) > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Discount</span>
                        <span>-₹{Number(selectedOrder.discount).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-blue-100 flex justify-between font-black text-lg text-[#0066cc]">
                      <span>Total Paid</span>
                      <span>₹{Number(selectedOrder.total).toLocaleString()}</span>
                    </div>
                    <div className="text-right text-xs text-gray-500 font-medium mt-1">
                      Via {selectedOrder.payment_method}
                    </div>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end sticky bottom-0">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
