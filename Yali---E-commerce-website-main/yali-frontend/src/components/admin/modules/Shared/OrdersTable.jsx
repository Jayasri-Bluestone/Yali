import React, { useState, useEffect } from 'react';
import { Package, ChevronDown, ChevronUp, MapPin, Phone, CreditCard, Box, Truck, CheckCircle, Clock, Link as LinkIcon, Send, Search, Download } from 'lucide-react';
import { formatINR } from '../../../../utils/currency';
import { exportToCSV } from '../../../../utils/csvExport';
import { Pagination } from '../../Pagination';
import { API_URL } from '../../../../config';

const STATUS_OPTIONS = [
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

export function OrdersTable({ orders, onStatusChange, title, subtitle }) {
  const [expandedRow, setExpandedRow] = useState(null);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [trackingForms, setTrackingForms] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredOrders = orders?.filter(order => {
    const searchString = `${order.order_id || ''} ${order.customer_name || ''} ${order.customer_email || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  }) || [];

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => setCurrentPage(1), [searchTerm]);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const token = localStorage.getItem('yali_token');
        const res = await fetch(`${API_URL}/delivery-partners`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDeliveryPartners(data.filter(p => p.status === 'active'));
        }
      } catch (err) {
        console.error('Failed to fetch delivery partners', err);
      }
    };
    fetchPartners();
  }, []);

  const handleTrackingChange = (orderId, field, value) => {
    setTrackingForms(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value
      }
    }));
  };

  const handleSaveTracking = (order) => {
    const trackingData = trackingForms[order.order_id] || {};
    // Only pass fields that are filled out to avoid overwriting with empties
    const extraData = {};
    if (trackingData.trackingNumber) extraData.trackingNumber = trackingData.trackingNumber;
    if (trackingData.trackingLink) extraData.trackingLink = trackingData.trackingLink;
    if (trackingData.deliveryPartner) extraData.deliveryPartner = trackingData.deliveryPartner;

    onStatusChange(order.order_id, order.status, extraData);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Confirmed': return 'bg-teal-100 text-teal-800';
      case 'Packed': return 'bg-indigo-100 text-indigo-800';
      case 'Out for Delivery': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[40vh]">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-1">No Orders Found</h3>
        <p className="text-gray-500 text-center max-w-sm">
          There are currently no orders in this section. When customers place orders, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {title && <h2 className="text-xl font-black text-gray-900 tracking-tight">{title}</h2>}
          {subtitle && <p className="text-sm text-gray-500 font-medium mt-1">{subtitle}</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] transition-all bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => exportToCSV(filteredOrders, 'orders')}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 hover:bg-gray-50 hover:text-[#0066cc] rounded-xl border border-gray-200 transition-colors text-sm font-bold shadow-sm"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-10"></th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-48">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedOrders.map((order) => {
              const isExpanded = expandedRow === order.order_id;
              
              return (
                <React.Fragment key={order.order_id}>
                  <tr 
                    className={`hover:bg-gray-50/50 transition-colors group cursor-pointer ${isExpanded ? 'bg-blue-50/30' : ''}`}
                    onClick={() => setExpandedRow(isExpanded ? null : order.order_id)}
                  >
                    <td className="p-4 text-gray-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900 text-sm">{order.order_id}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{order.items?.length || 0} items</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-semibold text-gray-800">
                        {new Date(order.order_date).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {new Date(order.order_date).toLocaleTimeString('en-IN', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-gray-900">{order.customer_name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 max-w-[150px] truncate">{order.customer_email}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-black text-gray-900">{formatINR(order.total)}</div>
                      <div className="text-xs text-green-600 font-semibold mt-0.5 text-nowrap">
                        {order.payment_method === 'COD' ? 'Cash on Delivery' : 'Prepaid'}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-700 uppercase tracking-wide">
                        {order.category || 'Various'}
                      </span>
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <select
                          className={`text-xs font-bold rounded-lg border-0 py-2 pl-3 pr-8 focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm appearance-none flex-1 ${getStatusColor(order.status)}`}
                          value={order.status}
                          onChange={(e) => onStatusChange(order.order_id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status} className="bg-white text-gray-900 font-medium">
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Item Details */}
                  {isExpanded && (
                    <tr>
                      <td colSpan="7" className="p-0 border-b border-gray-200">
                        <div className="bg-gradient-to-b from-blue-50/50 to-white px-8 py-6 shadow-inner">
                          
                          {/* Order Meta Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Delivery Address</h4>
                                <p className="text-sm font-medium text-gray-800 whitespace-pre-line leading-relaxed">
                                  {order.address}
                                </p>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
                              <div className="flex items-start gap-3">
                                <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="w-full">
                                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payment Breakdown</h4>
                                  <div className="space-y-1 mt-2">
                                    <div className="flex justify-between text-xs text-gray-600">
                                      <span>Subtotal</span>
                                      <span className="font-semibold text-gray-900">{formatINR(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-600">
                                      <span>Tax</span>
                                      <span className="font-semibold text-gray-900">{formatINR(order.tax)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-600">
                                      <span>Shipping</span>
                                      <span className="font-semibold text-gray-900">{formatINR(order.shipping)}</span>
                                    </div>
                                    {parseFloat(order.discount) > 0 && (
                                      <div className="flex justify-between text-xs text-green-600">
                                        <span>Discount</span>
                                        <span className="font-semibold">-{formatINR(order.discount)}</span>
                                      </div>
                                    )}
                                    <div className="border-t border-gray-100 my-1 pt-1 flex justify-between text-sm font-black text-gray-900">
                                      <span>Total</span>
                                      <span>{formatINR(order.total)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Delivery & Tracking Section */}
                          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-6 animate-fade-in">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <Truck className="w-4 h-4" />
                                Delivery & Tracking
                              </h4>
                              {['Packed', 'Shipped', 'Out for Delivery'].includes(order.status) && (
                                <button
                                  onClick={() => handleSaveTracking(order)}
                                  className="text-xs flex items-center gap-1 bg-[#0066cc] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#0052a3] transition-colors"
                                >
                                  <Send className="w-3 h-3" />
                                  Save Tracking
                                </button>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Partner</label>
                                <select
                                  value={trackingForms[order.order_id]?.deliveryPartner ?? order.delivery_partner ?? ''}
                                  onChange={(e) => handleTrackingChange(order.order_id, 'deliveryPartner', e.target.value)}
                                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                                  disabled={!['Packed', 'Shipped', 'Out for Delivery'].includes(order.status)}
                                >
                                  <option value="">Select Partner</option>
                                  {deliveryPartners.map(dp => (
                                    <option key={dp.id} value={dp.name}>{dp.name}</option>
                                  ))}
                                  {order.delivery_partner && !deliveryPartners.find(dp => dp.name === order.delivery_partner) && (
                                    <option value={order.delivery_partner}>{order.delivery_partner}</option>
                                  )}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Tracking Number</label>
                                <input
                                  type="text"
                                  placeholder="e.g. AWB123456789"
                                  value={trackingForms[order.order_id]?.trackingNumber ?? order.tracking_number ?? ''}
                                  onChange={(e) => handleTrackingChange(order.order_id, 'trackingNumber', e.target.value)}
                                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                                  disabled={!['Packed', 'Shipped', 'Out for Delivery'].includes(order.status)}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Tracking URL (Optional)</label>
                                <div className="relative">
                                  <input
                                    type="url"
                                    placeholder="https://"
                                    value={trackingForms[order.order_id]?.trackingLink ?? order.tracking_link ?? ''}
                                    onChange={(e) => handleTrackingChange(order.order_id, 'trackingLink', e.target.value)}
                                    className="w-full text-sm pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                                    disabled={!['Packed', 'Shipped', 'Out for Delivery'].includes(order.status)}
                                  />
                                  <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                              </div>
                            </div>
                            
                            {!['Packed', 'Shipped', 'Out for Delivery'].includes(order.status) && (
                              <p className="text-xs text-orange-600 font-medium mt-3 flex items-center gap-1 bg-orange-50 p-2 rounded-md">
                                Change order status to 'Packed' or 'Shipped' to assign tracking details.
                              </p>
                            )}
                          </div>

                          {/* Order Items */}
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Order Items ({order.items?.length || 0})</h4>
                          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="p-3 font-semibold text-gray-600 w-16">Image</th>
                                  <th className="p-3 font-semibold text-gray-600">Product</th>
                                  <th className="p-3 font-semibold text-gray-600">Category</th>
                                  <th className="p-3 font-semibold text-gray-600 text-right">Qty</th>
                                  <th className="p-3 font-semibold text-gray-600 text-right">Price</th>
                                  <th className="p-3 font-semibold text-gray-600 text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {order.items?.map((item) => (
                                  <tr key={item.item_id || item.id} className="hover:bg-gray-50/50">
                                    <td className="p-3">
                                      <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                                        {item.image ? (
                                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                          <Package className="w-5 h-5 text-gray-400" />
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <div className="font-bold text-gray-900 line-clamp-1">{item.name}</div>
                                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description || 'No description'}</div>
                                    </td>
                                    <td className="p-3">
                                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                                        {item.sub_category || item.category || 'Various'}
                                      </span>
                                    </td>
                                    <td className="p-3 text-right font-semibold text-gray-800">{item.quantity}x</td>
                                    <td className="p-3 text-right text-gray-600">{formatINR(item.price)}</td>
                                    <td className="p-3 text-right font-bold text-gray-900">{formatINR(item.price * item.quantity)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredOrders.length > 0 && (
        <div className="border-t border-gray-200 p-2">
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
