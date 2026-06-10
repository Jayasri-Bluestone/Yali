import { X, CreditCard, Wallet, Building2, Smartphone, ChevronRight, Lock, Tag, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { API_URL } from '../config';
import { formatINR } from '../utils/currency';

export function CheckoutPage({ items, onPaymentSuccess, coupons = [], token, user }) {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState('address');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);
  

  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSavedAddresses(data);
          const defaultAddr = data.find(a => a.is_default) || data[0];
          setSelectedAddressId(defaultAddr.id);
          setShippingAddress({
            name: defaultAddr.full_name,
            phone: defaultAddr.phone,
            address: defaultAddr.address_line,
            city: defaultAddr.city,
            state: defaultAddr.state,
            pincode: defaultAddr.pincode
          });
        } else {
          setIsAddingNew(true);
        }
      })
      .catch(console.error);
    } else {
      setIsAddingNew(true);
    }
  }, [token]);

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setIsAddingNew(false);
    setShippingAddress({
      name: addr.full_name,
      phone: addr.phone,
      address: addr.address_line,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode
    });
  };
  
  // Animated success state
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const [upiId, setUpiId] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedCoupon ? (subtotal * appliedCoupon.discount) / 100 : 0;
  const tax = (subtotal - discount) * 0.18;
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal - discount + tax + shipping;

  const handleApplyCoupon = () => {
    const foundCoupon = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.status === 'active');
    
    if (foundCoupon) {
      if (subtotal < foundCoupon.minOrder) {
        showToast(`This coupon requires a minimum order of ${formatINR(foundCoupon.minOrder)}`, 'warning');
        return;
      }
      
      const today = new Date().toISOString().split('T')[0];
      if (foundCoupon.expiry && foundCoupon.expiry < today) {
        showToast('This coupon has expired', 'error');
        return;
      }

      setAppliedCoupon({ code: foundCoupon.code, discount: foundCoupon.value });
      showToast(`Coupon ${foundCoupon.code} applied! ${foundCoupon.value}% discount added.`, 'success');
    } else {
      showToast('Invalid or inactive coupon code', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!token) {
      showToast('Session expired, please login again.', 'error');
      return;
    }
    
    try {
      const fullAddress = `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.pincode}`;
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          address: fullAddress,
          paymentMethod: paymentMethod === 'card' ? 'CARD' : paymentMethod.toUpperCase(),
          items: items.map(it => {
            let vDesc = null;
            let vId = null;
            if (it.selected_variant) {
              try {
                const v = typeof it.selected_variant === 'string' ? JSON.parse(it.selected_variant) : it.selected_variant;
                if (v) {
                  vId = v.id;
                  vDesc = Object.entries(v.attributes || {}).map(([k, val]) => `${k}: ${val}`).join(' | ');
                }
              } catch(e) {}
            } else if (it.selectedVariant) { // From Buy Now
              vId = it.selectedVariant.id;
              vDesc = Object.entries(it.selectedVariant.attributes || {}).map(([k, val]) => `${k}: ${val}`).join(' | ');
            }
            return {
              ...it,
              variant_id: vId,
              variant_desc: vDesc
            };
          }),
          subtotal: subtotal,
          tax: tax,
          shipping: shipping,
          discount: discount,
          total: total,
          appliedCoupon: appliedCoupon
        })
      });

      // Save new address to account if checkbox is checked
      if (isAddingNew && saveAddressToAccount) {
        fetch(`${API_URL}/addresses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: 'Home',
            full_name: shippingAddress.name,
            phone: shippingAddress.phone,
            address_line: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state,
            pincode: shippingAddress.pincode,
            is_default: savedAddresses.length === 0
          })
        }).catch(console.error); // Fire and forget
      }

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to place order');
      }

      setPlacedOrderId(resData.orderId);
      setShowSuccessAnim(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (showSuccessAnim) {
    return (
      <>
        {/* Success Backdrop */}
        <div className="min-h-screen bg-gray-50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-emerald-100 text-center animate-scale-in relative overflow-hidden">
            {/* Background glowing gradients */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Confetti Particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(15)].map((_, i) => {
                const colors = ['bg-amber-400', 'bg-emerald-400', 'bg-blue-400', 'bg-rose-400', 'bg-purple-400'];
                const randColor = colors[i % colors.length];
                const delay = (i * 0.15).toFixed(2);
                const left = (i * 6 + 6).toFixed(0);
                return (
                  <div
                    key={i}
                    className={`absolute w-2.5 h-2.5 rounded-full opacity-0 ${randColor} animate-confetti-float`}
                    style={{
                      left: `${left}%`,
                      top: '105%',
                      animationDelay: `${delay}s`,
                      animationDuration: '3.5s',
                      animationIterationCount: 'infinite'
                    }}
                  />
                );
              })}
            </div>

            {/* Success Checkmark Circle Drawing Animation */}
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-500/20 scale-0 animate-pop-in">
              <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" className="animate-draw-check" style={{ strokeDasharray: 50, strokeDashoffset: 50 }} />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-600 text-sm mb-6">
              Order ID: <span className="font-semibold text-[#0066cc]">#{placedOrderId}</span> has been placed.
            </p>

            {/* Reward Card */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6 animate-pulse-glow">
              <div className="flex items-center gap-3 justify-center text-amber-700">
                <span className="text-2xl">🎁</span>
                <div className="text-left">
                  <div className="font-bold text-sm">Reward Claimed!</div>
                  <div className="text-xs text-amber-600">50 YALI Points credited to your account</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onPaymentSuccess({
                  orderId: placedOrderId,
                  orderDate: new Date().toLocaleDateString(),
                  customerName: shippingAddress.name || user?.name || 'Customer',
                  customerEmail: user?.email || 'customer@example.com',
                  address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.pincode}`,
                  paymentMethod: paymentMethod === 'card' ? 'Card Payment' : paymentMethod.toUpperCase(),
                  items: items,
                  subtotal: subtotal,
                  tax: tax,
                  shipping: shipping,
                  discount: discount,
                  total: total,
                  status: 'Pending'
                });
                navigate('/');
              }}
              className="w-full py-3 bg-gradient-to-r from-[#0066cc] to-[#10b981] text-white rounded-xl font-semibold hover:shadow-xl transition-shadow cursor-pointer"
            >
              View Invoice & Receipt
            </button>
          </div>
        </div>

        {/* Inline CSS styling for animations */}
        <style>{`
          @keyframes confettiFloat {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 0.9;
            }
            90% {
              opacity: 0.9;
            }
            100% {
              transform: translateY(-420px) rotate(360deg);
              opacity: 0;
            }
          }
          .animate-confetti-float {
            animation-name: confettiFloat;
            animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
          @keyframes popIn {
            to {
              transform: scale(1);
            }
          }
          .animate-pop-in {
            animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
          @keyframes drawCheck {
            to {
              stroke-dashoffset: 0;
            }
          }
          .animate-draw-check {
            animation: drawCheck 0.5s ease-out 0.4s forwards;
          }
          @keyframes pulseGlow {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.2);
            }
            50% {
              box-shadow: 0 0 12px 4px rgba(245, 158, 11, 0.4);
            }
          }
          .animate-pulse-glow {
            animation: pulseGlow 2s infinite;
          }
        `}</style>
      </>
    );
  }

  const ERROR_IMG_SRC = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';
  
  const resolveItemImage = (item) => {
    let img = item.images?.[0] || item.image;
    if (typeof img === 'string') {
      if (img.startsWith('[')) {
        try {
          const arr = JSON.parse(img);
          if (Array.isArray(arr) && arr.length > 0) img = arr[0];
        } catch(e) {}
      }
      if (typeof img === 'string') return img.replace(/:\d+$/, '');
    }
    return img || ERROR_IMG_SRC;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-3xl font-black text-gray-900">Secure Checkout</h1>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 p-6 bg-gray-50 border-b border-gray-200">
          <div className={`flex items-center gap-2 ${step === 'address' ? 'text-[#0066cc]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              step === 'address' ? 'bg-[#0066cc] text-white' : 'bg-gray-300'
            }`}>
              1
            </div>
            <span className="hidden md:inline font-medium">Address</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
          <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-[#0066cc]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              step === 'payment' ? 'bg-[#0066cc] text-white' : 'bg-gray-300'
            }`}>
              2
            </div>
            <span className="hidden md:inline font-medium">Payment</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
          <div className={`flex items-center gap-2 ${step === 'review' ? 'text-[#0066cc]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              step === 'review' ? 'bg-[#0066cc] text-white' : 'bg-gray-300'
            }`}>
              3
            </div>
            <span className="hidden md:inline font-medium">Review</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6">
            {/* Left: Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Address Step */}
              {step === 'address' && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">Shipping Address</h3>
                  
                  {savedAddresses.length > 0 && (
                    <div className="mb-6 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {savedAddresses.map(addr => (
                          <div 
                            key={addr.id}
                            onClick={() => handleSelectAddress(addr)}
                            className={`p-4 border rounded-xl cursor-pointer transition-colors relative ${selectedAddressId === addr.id && !isAddingNew ? 'border-[#0066cc] bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-[#0066cc]/50 hover:bg-gray-50'}`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-gray-200 text-gray-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded">{addr.title}</span>
                              <span className="font-bold text-sm text-gray-900">{addr.full_name}</span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-1">{addr.address_line}</p>
                            <p className="text-xs text-gray-600">{addr.city}, {addr.state} {addr.pincode}</p>
                            <p className="text-xs font-medium text-gray-800 mt-2">{addr.phone}</p>
                            {selectedAddressId === addr.id && !isAddingNew && (
                              <div className="absolute top-4 right-4 w-5 h-5 bg-[#0066cc] rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <button 
                        onClick={() => {
                          setIsAddingNew(true);
                          setSelectedAddressId(null);
                          setShippingAddress({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });
                        }}
                        className={`text-sm font-bold w-full py-3 rounded-xl border-2 border-dashed transition-colors ${isAddingNew ? 'border-[#0066cc] text-[#0066cc] bg-blue-50/30' : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700'}`}
                      >
                        + Add New Address
                      </button>
                    </div>
                  )}

                  {isAddingNew && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={shippingAddress.name}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                          value={shippingAddress.address}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                          rows={3}
                          placeholder="Street address, apartment, suite, etc."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                            placeholder="New York"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                          <input
                            type="text"
                            value={shippingAddress.state}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                            placeholder="NY"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                        <input
                          type="text"
                          value={shippingAddress.pincode}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                          placeholder="10001"
                        />
                      </div>
                      
                      <div className="col-span-full pt-2 flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="saveAddress" 
                          checked={saveAddressToAccount}
                          onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-[#0066cc] focus:ring-[#0066cc]"
                        />
                        <label htmlFor="saveAddress" className="text-sm text-gray-700 font-medium">Save this address to my account for future use</label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Step */}
              {step === 'payment' && (
                <div className="space-y-4">
                  {/* Payment Method Selection */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4">Payment Method</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          paymentMethod === 'card' ? 'border-[#0066cc] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <CreditCard className="w-6 h-6 mx-auto mb-2 text-[#0066cc]" />
                        <div className="text-sm font-medium">Card</div>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          paymentMethod === 'upi' ? 'border-[#0066cc] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Smartphone className="w-6 h-6 mx-auto mb-2 text-[#10b981]" />
                        <div className="text-sm font-medium">UPI</div>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('netbanking')}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          paymentMethod === 'netbanking' ? 'border-[#0066cc] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Building2 className="w-6 h-6 mx-auto mb-2 text-[#8b5cf6]" />
                        <div className="text-sm font-medium">Net Banking</div>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('wallet')}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          paymentMethod === 'wallet' ? 'border-[#0066cc] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Wallet className="w-6 h-6 mx-auto mb-2 text-[#f59e0b]" />
                        <div className="text-sm font-medium">Wallet</div>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          paymentMethod === 'cod' ? 'border-[#0066cc] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">💵</div>
                        <div className="text-sm font-medium">COD</div>
                      </button>
                    </div>
                  </div>

                  {/* Payment Details */}
                  {paymentMethod === 'card' && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-green-600" />
                        Card Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                          <input
                            type="text"
                            value={cardDetails.number}
                            onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                          <input
                            type="text"
                            value={cardDetails.name}
                            onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                            <input
                              type="text"
                              value={cardDetails.expiry}
                              onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                              placeholder="MM/YY"
                              maxLength={5}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                            <input
                              type="password"
                              value={cardDetails.cvv}
                              onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                              placeholder="123"
                              maxLength={3}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold mb-4">UPI Payment</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                          placeholder="yourname@upi"
                        />
                      </div>
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-2">Or scan QR code</p>
                        <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                          <span className="text-gray-400">QR Code</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'cod' && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold mb-2">Cash on Delivery</h3>
                      <p className="text-gray-600">Pay when you receive your order. Additional charges may apply.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Review Step */}
              {step === 'review' && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">Order Review</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Shipping Address</h4>
                      <div className="text-gray-700">
                        <p>{shippingAddress.name}</p>
                        <p>{shippingAddress.phone}</p>
                        <p>{shippingAddress.address}</p>
                        <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-semibold mb-2">Payment Method</h4>
                      <p className="text-gray-700 capitalize">{paymentMethod.replace('_', ' ')}</p>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-semibold mb-4">Items in your Order</h4>
                      <div className="space-y-4">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50">
                            <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 p-1">
                              <img 
                                src={resolveItemImage(item)} 
                                alt={item.name} 
                                className="w-full h-full object-contain"
                                onError={(e) => { e.target.onerror = null; e.target.src = ERROR_IMG_SRC; }}
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 line-clamp-2">{item.name}</h4>
                              {(item.selected_variant || item.selectedVariant) && (
                                <p className="text-xs text-gray-500 mt-1 font-medium">
                                  {(() => {
                                    try {
                                      const v = item.selected_variant 
                                        ? (typeof item.selected_variant === 'string' ? JSON.parse(item.selected_variant) : item.selected_variant)
                                        : item.selectedVariant;
                                      return Object.entries(v.attributes || {}).map(([k, val]) => `${k}: ${val}`).join(' | ');
                                    } catch(e) { return null; }
                                  })()}
                                </p>
                              )}
                              <p className="text-sm text-gray-500 mt-1">Price: {formatINR(item.price)}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-sm font-medium">Qty: {item.quantity}</span>
                                <span className="font-bold text-[#0066cc]">{formatINR(item.price * item.quantity)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6">
                <h3 className="text-xl font-bold mb-4">Order Summary</h3>

                {/* Items List */}
                <div className="mb-6 max-h-[300px] overflow-y-auto pr-2 space-y-4">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-16 h-16 bg-white border border-gray-100 rounded-lg overflow-hidden flex-shrink-0 p-1">
                        <img 
                          src={resolveItemImage(item)} 
                          alt={item.name} 
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.onerror = null; e.target.src = ERROR_IMG_SRC; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h4>
                        {(item.selected_variant || item.selectedVariant) && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {(() => {
                              try {
                                const v = item.selected_variant 
                                  ? (typeof item.selected_variant === 'string' ? JSON.parse(item.selected_variant) : item.selected_variant)
                                  : item.selectedVariant;
                                return Object.entries(v.attributes || {}).map(([k, val]) => `${val}`).join(' | ');
                              } catch(e) { return null; }
                            })()}
                          </p>
                        )}
                        <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                          <span>Qty: {item.quantity}</span>
                          <span className="font-bold text-gray-900">{formatINR(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-6 mb-6"></div>

                {/* Coupon Code */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                      placeholder="Coupon code"
                      disabled={!!appliedCoupon}
                    />
                    {!appliedCoupon ? (
                      <button
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-[#10b981] text-white rounded-lg text-sm font-medium hover:bg-[#059669] transition-colors flex items-center gap-1"
                      >
                        <Tag className="w-4 h-4" />
                        Apply
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCode('');
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {appliedCoupon && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {appliedCoupon.discount}% discount applied!
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Try: SAVE10 or SAVE20</p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>{formatINR(subtotal)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedCoupon.discount}%)</span>
                      <span>-{formatINR(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-700">
                    <span>GST (18%)</span>
                    <span>{formatINR(tax)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : formatINR(shipping)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-gray-300 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Total</span>
                    <span className="text-2xl font-bold text-[#0066cc]">{formatINR(total)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {step === 'address' && (
                    <button
                      onClick={() => setStep('payment')}
                      className="w-full py-3 bg-gradient-to-r from-[#0066cc] to-[#10b981] text-white rounded-xl font-semibold hover:shadow-xl transition-shadow"
                      disabled={!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address}
                    >
                      Continue to Payment
                    </button>
                  )}
                  {step === 'payment' && (
                    <>
                      <button
                        onClick={() => setStep('review')}
                        className="w-full py-3 bg-gradient-to-r from-[#0066cc] to-[#10b981] text-white rounded-xl font-semibold hover:shadow-xl transition-shadow"
                      >
                        Review Order
                      </button>
                      <button
                        onClick={() => setStep('address')}
                        className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Back to Address
                      </button>
                    </>
                  )}
                  {step === 'review' && (
                    <>
                      <button
                        onClick={handlePlaceOrder}
                        className="w-full py-3 bg-gradient-to-r from-[#0066cc] to-[#10b981] text-white rounded-xl font-semibold hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
                      >
                        <Lock className="w-5 h-5" />
                        Place Order
                      </button>
                      <button
                        onClick={() => setStep('payment')}
                        className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Back to Payment
                      </button>
                    </>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Lock className="w-4 h-4" />
                  <span>Secure SSL Encrypted Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
