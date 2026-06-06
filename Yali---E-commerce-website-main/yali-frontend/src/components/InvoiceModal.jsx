import { X, Download, Printer, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';

export function InvoiceModal({
  isOpen,
  onClose,
  items,
  orderId,
  orderDate,
  customerName,
  customerEmail,
  address,
  paymentMethod,
  subtotal,
  tax,
  shipping,
  discount,
  total
}) {
  if (!isOpen) return null;

  const { showToast } = useToast();

  const handleDownload = () => {
    showToast('Invoice PDF download started!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-white rounded-2xl z-50 overflow-hidden shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[#0066cc] to-[#10b981] text-white print:hidden">
          <h2 className="text-2xl font-bold">Tax Invoice</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
              title="Download PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handlePrint}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
              title="Print"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8 bg-white" id="invoice-content">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-[#22d3ee] via-[#0066cc] to-[#10b981] rounded-lg" />
                <span className="text-3xl font-bold bg-gradient-to-r from-[#0066cc] to-[#10b981] bg-clip-text text-transparent">
                  YALI
                </span>
              </div>
              <p className="text-sm text-gray-600">123 E-commerce Street</p>
              <p className="text-sm text-gray-600">Mumbai, Maharashtra 400001</p>
              <p className="text-sm text-gray-600">GSTIN: 27ABCDE1234F1Z5</p>
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">INVOICE</h3>
              <p className="text-sm"><span className="font-medium">Invoice No:</span> {orderId}</p>
              <p className="text-sm"><span className="font-medium">Date:</span> {orderDate}</p>
              <div className="mt-2 inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                <Check className="w-4 h-4" />
                PAID
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-2 gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Bill To:</h4>
              <p className="text-sm font-medium">{customerName}</p>
              <p className="text-sm text-gray-600">{customerEmail}</p>
              <p className="text-sm text-gray-600 mt-1">{address}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Payment Details:</h4>
              <p className="text-sm"><span className="font-medium">Method:</span> {paymentMethod}</p>
              <p className="text-sm"><span className="font-medium">Status:</span> <span className="text-green-600">Completed</span></p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 text-sm font-semibold text-gray-700">#</th>
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Product</th>
                <th className="text-center py-3 text-sm font-semibold text-gray-700">Qty</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-700">Price</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-3 text-sm text-gray-600">{index + 1}</td>
                  <td className="py-3">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="py-3 text-center text-sm text-gray-600">{item.quantity}</td>
                  <td className="py-3 text-right text-sm text-gray-600">{formatINR(item.price)}</td>
                  <td className="py-3 text-right text-sm font-medium text-gray-900">
                    {formatINR(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-green-600">-{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-600">GST (18%):</span>
                <span className="font-medium">{formatINR(tax)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium">{shipping === 0 ? 'FREE' : formatINR(shipping)}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-gray-300 mt-2">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-2xl text-[#0066cc]">{formatINR(total)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-200 pt-6">
            <div className="bg-blue-50 border-l-4 border-[#0066cc] p-4 mb-4">
              <p className="text-sm font-medium text-gray-900 mb-1">Return Policy</p>
              <p className="text-sm text-gray-700">
                Items can be returned within 7-10 days of delivery. Refund will be credited to your wallet within 3-5 business days.
              </p>
            </div>
            <div className="text-center text-sm text-gray-600">
              <p>Thank you for shopping with YALI!</p>
              <p>For support: support@yali.in | +91 98765 43210</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
