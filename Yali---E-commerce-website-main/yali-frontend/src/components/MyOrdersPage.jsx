import React, { useState } from 'react';
import { Package, ArrowLeft, Clock, CheckCircle, XCircle, RefreshCcw, ChevronRight, FileText, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { InvoiceModal } from './InvoiceModal';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

export function MyOrdersPage({ orders, token, refreshOrders, API_URL, refreshUserData }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [actionModal, setActionModal] = useState({ isOpen: false, type: '', orderId: '', itemId: null, reason: '' });
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const handleSubmitAction = async () => {
    if (!actionModal.reason.trim()) {
      showToast('Please provide a reason', 'error');
      return;
    }
    
    setIsSubmittingAction(true);
    try {
      if (actionModal.type === 'returnItem') {
        const res = await fetch(`${API_URL}/returns/request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ order_id: actionModal.orderId, item_id: actionModal.itemId, reason: actionModal.reason })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to request return');
        showToast(data.message || 'Return requested successfully', 'success');
      } else {
        const endpoint = actionModal.type === 'cancel' ? 'cancel' : 'return';
        const res = await fetch(`${API_URL}/orders/${actionModal.orderId}/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reason: actionModal.reason })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Failed to ${actionModal.type} order`);
        
        showToast(data.message || `Order ${actionModal.type === 'cancel' ? 'cancelled' : 'return requested'} successfully`, 'success');
      }

      setActionModal({ isOpen: false, type: '', orderId: '', itemId: null, reason: '' });
      if (refreshOrders) refreshOrders();
      if (refreshUserData) refreshUserData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'Returned': return 'bg-gray-200 text-gray-700 border-gray-300';
      case 'Shipped':
      case 'Out for Delivery': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="w-4 h-4" />;
      case 'Cancelled': return <XCircle className="w-4 h-4" />;
      case 'Returned': return <RefreshCcw className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const renderProgressTracker = (item, order) => {
    const { item_status: status, tracking_number: trackingNumber, tracking_link: trackingLink, delivery_partner: deliveryPartner } = item;
    if (['Cancelled', 'Returned', 'Return Requested', 'Return Approved'].includes(status) || ['Cancelled', 'Returned'].includes(order.status)) return null;
    
    const steps = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
    
    // Fallback to order.status if item.item_status is lagging behind due to older data
    const itemIndex = steps.indexOf(status);
    const orderIndex = steps.indexOf(order.status);
    const currentIndex = Math.max(itemIndex, orderIndex);

    // We don't have item-level status_history yet, so we will just show the order_date for Pending
    const stepDates = {};
    if (order.order_date) {
      stepDates['Pending'] = new Date(order.order_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }
    
    return (
      <div className="bg-white border-t border-gray-100 pb-4">
        <div className="relative max-w-4xl mx-auto px-6 py-6 sm:py-8">
          
          {/* DESKTOP (Horizontal) */}
          <div className="hidden sm:flex relative z-10 justify-between items-start">
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentIndex;
              return (
                <div key={step} className="flex-1 flex flex-col items-center relative">
                  {/* Connecting Line to next item */}
                  {idx < steps.length - 1 && (
                    <div className={`absolute top-4 left-1/2 w-full h-[2px] ${idx < currentIndex ? 'bg-[#008c00]' : 'bg-gray-200'} z-0`}></div>
                  )}
                  
                  {/* Circle */}
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-[#008c00] text-white shadow-sm ring-2 ring-green-50' : 'bg-gray-200 text-gray-400 border-2 border-white'}`}>
                    {isCompleted ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <span className="w-2 h-2 rounded-full bg-white"></span>}
                  </div>
                  
                  {/* Text */}
                  <div className={`mt-3 text-center px-1 ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                    <div className={`text-[10px] lg:text-xs ${isCompleted ? 'font-black' : 'font-semibold'}`}>{step}</div>
                    <div className="text-[9px] lg:text-[10px] mt-1 text-gray-500 font-medium">{stepDates[step] || ''}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* MOBILE (Vertical) */}
          <div className="sm:hidden relative z-10 flex flex-col ml-2">
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentIndex;
              const isLast = idx === steps.length - 1;
              return (
                <div key={step} className="flex items-start relative pb-6">
                  {/* Connecting Line to next item */}
                  {!isLast && (
                    <div className={`absolute top-6 bottom-0 left-3 w-[2px] -translate-x-1/2 ${idx < currentIndex ? 'bg-[#008c00]' : 'bg-gray-200'} z-0`}></div>
                  )}
                  
                  {/* Circle */}
                  <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isCompleted ? 'bg-[#008c00] text-white shadow-sm ring-2 ring-green-50' : 'bg-gray-200 text-gray-400 border-2 border-white'}`}>
                    {isCompleted ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                  </div>
                  
                  {/* Text */}
                  <div className={`ml-3 mt-0.5 ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                    <div className={`text-xs ${isCompleted ? 'font-black' : 'font-semibold'}`}>{step}</div>
                    <div className="text-[10px] mt-0.5 text-gray-500 font-medium">{stepDates[step] || ''}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-[#0066cc]" />
            Your Orders
          </h1>
        </div>

        {(!orders || orders.length === 0) ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Looks like you haven't made any purchases yet.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[#0066cc] text-white font-bold rounded-xl hover:bg-[#0052a3] transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.order_id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order Placed</p>
                      <p className="text-sm font-semibold text-gray-900">{new Date(order.order_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total</p>
                      <p className="text-sm font-semibold text-gray-900">₹{order.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
                      <p className="text-sm font-semibold text-[#0066cc]">{order.order_id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {['Delivered', 'Returned'].includes(order.status) ? 'Delivery Date' : 'Estimated Delivery'}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {(() => {
                          const orderDate = new Date(order.order_date);
                          const deliveryDate = new Date(orderDate);
                          // Estimate 5 days for delivery
                          deliveryDate.setDate(deliveryDate.getDate() + 5);
                          return deliveryDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>
                </div>

                {/* Order Tracking Information */}
                {(order.tracking_number || order.tracking_link || order.delivery_partner) && (
                  <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-[#0066cc]" />
                        <span className="font-bold text-gray-900 text-sm">Delivery & Tracking</span>
                      </div>
                      
                      {order.delivery_partner && (
                        <div className="flex items-center gap-2 text-sm bg-white px-3 py-1.5 rounded-lg border border-blue-100">
                          <span className="text-gray-500 font-medium">Partner:</span>
                          <span className="font-bold text-[#0066cc]">{order.delivery_partner}</span>
                        </div>
                      )}
                      
                      {order.tracking_number && (
                        <div className="flex items-center gap-2 text-sm bg-white px-3 py-1.5 rounded-lg border border-blue-100">
                          <span className="text-gray-500 font-medium">AWB/Tracking No:</span>
                          <span className="font-mono font-bold text-gray-900">{order.tracking_number}</span>
                        </div>
                      )}
                      
                      {order.tracking_link && (
                        <a 
                          href={order.tracking_link.startsWith('http') ? order.tracking_link : `https://${order.tracking_link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#0066cc] hover:bg-[#0052a3] px-4 py-1.5 rounded-lg transition-colors ml-auto shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Track Shipment
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="p-6 divide-y divide-gray-100">
                  {order.items?.map((item, idx) => (
                    <React.Fragment key={idx}>
                    <div className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                      <div 
                        className="w-24 h-24 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 cursor-pointer group"
                        onClick={() => navigate(`/product/${item.product_id}`)}
                      >
                        <img 
                          src={(() => {
                            if (!item.image) return ERROR_IMG_SRC;
                            let finalImg = item.image;
                            if (typeof item.image === 'string' && item.image.startsWith('[')) {
                              try {
                                const parsed = JSON.parse(item.image);
                                finalImg = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : ERROR_IMG_SRC;
                              } catch(e) {}
                            }
                            if (typeof finalImg === 'string') {
                              finalImg = finalImg.replace(/:\d+$/, ''); // Strip corrupted trailing :1
                            }
                            return finalImg;
                          })()} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null; // prevent infinite loop if fallback also fails
                            e.target.src = ERROR_IMG_SRC;
                          }}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h4 
                          className="text-lg font-bold text-gray-900 hover:text-[#0066cc] cursor-pointer transition-colors mb-1"
                          onClick={() => navigate(`/product/${item.product_id}`)}
                        >
                          {item.name}
                        </h4>
                        {item.variant_desc && (
                          <p className="text-xs text-gray-500 font-medium mb-1">{item.variant_desc}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="font-semibold bg-gray-100 px-2 py-1 rounded-md">Qty: {item.quantity}</span>
                          <span className="font-bold text-gray-900">₹{parseFloat(item.price).toFixed(2)}</span>
                        </div>
                        {(item.tracking_number || item.tracking_link || item.delivery_partner) && (
                          <div className="text-sm mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl inline-flex flex-col gap-1.5 shadow-sm">
                            {item.delivery_partner && (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-blue-800 text-xs uppercase tracking-wider">Logistics Partner:</span>
                                <span className="font-semibold text-blue-900">{item.delivery_partner}</span>
                              </div>
                            )}
                            {item.tracking_number && (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-blue-800 text-xs uppercase tracking-wider">AWB / Tracking No:</span>
                                <span className="font-mono text-blue-900 font-medium">{item.tracking_number}</span>
                              </div>
                            )}
                            {item.tracking_link && (
                              <div className="mt-1">
                                <a 
                                  href={item.tracking_link.startsWith('http') ? item.tracking_link : `https://${item.tracking_link}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0066cc] text-white text-xs font-bold rounded-lg hover:bg-[#0052a3] transition-colors"
                                >
                                  Track Shipment
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="sm:self-stretch flex flex-col items-end justify-center gap-2">
                        <button 
                          onClick={() => navigate(`/product/${item.product_id}`)}
                          className="text-sm font-bold text-[#0066cc] hover:text-[#0052a3] flex items-center gap-1 bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                        >
                          View Product <ChevronRight className="w-4 h-4" />
                        </button>
                        {item.item_status === 'Delivered' && (
                          <button 
                            onClick={() => setActionModal({ isOpen: true, type: 'returnItem', orderId: order.order_id, itemId: item.item_id || item.id, reason: '' })}
                            className="text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <RefreshCcw className="w-3 h-3" /> Return Item
                          </button>
                        )}
                        {['Return Requested', 'Return Approved', 'Returned'].includes(item.item_status) && (
                          <span className="text-xs font-bold text-orange-700 bg-orange-100 px-3 py-1.5 rounded-lg border border-orange-200">
                            {item.item_status}
                          </span>
                        )}
                      </div>
                    </div>
                    {renderProgressTracker(item, order)}
                  </React.Fragment>
                  ))}
                </div>

                {/* Order Footer Actions */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-4 flex-wrap">
                  <div className="text-xs text-gray-500 font-medium">
                    Payment Method: <span className="font-bold text-gray-800">{order.payment_method}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {['Pending', 'Confirmed', 'Packed'].includes(order.status) && (
                      <button
                        onClick={() => setActionModal({ isOpen: true, type: 'cancel', orderId: order.order_id, reason: '' })}
                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold rounded-xl border border-red-200 transition-colors text-sm flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel Order
                      </button>
                    )}
                    
                    {order.status === 'Delivered' && (
                      <>
                        <button
                          onClick={() => setSelectedInvoiceOrder({
                            ...order,
                            orderId: order.order_id,
                            orderDate: new Date(order.order_date).toLocaleDateString(),
                            paymentMethod: order.payment_method
                          })}
                          className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 font-bold rounded-xl transition-colors text-sm flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Download Invoice
                        </button>
                      </>
                    )}
                    
                    {order.status === 'Cancelled' && (
                      <div className="text-right">
                        <span className="text-xs font-semibold text-red-500 block">Order was cancelled.</span>
                        {order.refund_status === 'refunded' && (
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">₹{order.refund_amount} refunded to wallet</span>
                        )}
                      </div>
                    )}
                    
                    {['Return Requested', 'Returned'].includes(order.status) && (
                      <div className="text-right">
                        <span className="text-xs font-semibold text-gray-500 block">{order.status === 'Returned' ? 'Return completed.' : 'Return requested.'}</span>
                        {order.refund_status === 'refunded' && (
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">₹{order.refund_amount} refunded to wallet</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedInvoiceOrder && (
        <InvoiceModal
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
          {...selectedInvoiceOrder}
        />
      )}

      {/* Action Modal for Cancel/Return */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className={`p-6 border-b text-white flex items-center gap-3 ${actionModal.type === 'cancel' ? 'bg-red-600' : 'bg-gray-900'}`}>
              {actionModal.type === 'cancel' ? <XCircle className="w-6 h-6" /> : <RefreshCcw className="w-6 h-6" />}
              <h3 className="text-xl font-bold">{actionModal.type === 'cancel' ? 'Cancel Order' : 'Return Item'}</h3>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for {actionModal.type === 'cancel' ? 'cancelling order' : 'returning item'} <span className="font-bold text-gray-900">{actionModal.orderId}</span>.
                {actionModal.type === 'cancel' 
                  ? ' If you have already paid, the amount will be refunded directly to your Yali Wallet.' 
                  : ' Once approved, the product price will be refunded to your Yali Wallet.'}
              </p>
              
              <textarea
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] outline-none transition-all resize-none mb-6"
                rows="4"
                placeholder={`Enter your reason for ${actionModal.type === 'cancel' ? 'cancellation' : 'return'}...`}
                value={actionModal.reason}
                onChange={(e) => setActionModal({ ...actionModal, reason: e.target.value })}
              ></textarea>
              
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setActionModal({ isOpen: false, type: '', orderId: '', itemId: null, reason: '' })}
                  disabled={isSubmittingAction}
                  className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleSubmitAction}
                  disabled={isSubmittingAction || !actionModal.reason.trim()}
                  className={`px-6 py-2 text-sm font-bold text-white rounded-lg transition-colors flex items-center gap-2 ${
                    isSubmittingAction || !actionModal.reason.trim() 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : actionModal.type === 'cancel' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-900 hover:bg-black'
                  }`}
                >
                  {isSubmittingAction ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
