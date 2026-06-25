import { useState, useEffect } from 'react';
import { API_URL } from "../../../../config";
import { Landmark, ArrowUpRight, CheckCircle, XCircle, Download } from 'lucide-react';
import { exportToCSV } from "../../../../utils/csvExport";

export function SettlementsTab({ isVendor, userData, token }) {
  const [bankDetails, setBankDetails] = useState({ bankAccountNumber: '', ifscCode: '', accountHolderName: '', bankName: '' });
  const [payouts, setPayouts] = useState([]);
  const [requestAmount, setRequestAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Admin approval modal
  const [approvalModal, setApprovalModal] = useState({ open: false, payoutId: null, action: null });
  const [transactionId, setTransactionId] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchPayouts = async () => {
    try {
      const res = await fetch(`${API_URL}/payouts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setPayouts(await res.json());
    } catch (err) {
      console.error('Failed to fetch payouts', err);
    }
  };

  useEffect(() => {
    fetchPayouts();
    if (isVendor && userData?.vendorDetails?.bank_details) {
      setBankDetails(userData.vendorDetails.bank_details);
    }
  }, [userData]);

  const handleSaveBankDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/vendors/bank-details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(bankDetails)
      });
      if (res.ok) {
        alert('Bank details saved successfully!');
        window.location.reload(); // Quick refresh to update userData context
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      alert('Error saving details');
    }
    setLoading(false);
  };

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    if (!requestAmount || isNaN(requestAmount) || requestAmount <= 0) return alert('Enter a valid amount');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/payouts/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: parseFloat(requestAmount) })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Payout requested!');
        setRequestAmount('');
        fetchPayouts();
        window.location.reload(); // update wallet visually
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error requesting payout');
    }
    setLoading(false);
  };

  const handleAdminAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/payouts/${approvalModal.payoutId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          status: approvalModal.action,
          transaction_id: transactionId,
          admin_notes: adminNotes
        })
      });
      if (res.ok) {
        alert(`Payout ${approvalModal.action}!`);
        setApprovalModal({ open: false, payoutId: null, action: null });
        setTransactionId('');
        setAdminNotes('');
        fetchPayouts();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      alert('Error processing request');
    }
    setLoading(false);
  };

  if (isVendor) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bank Details Form */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Landmark className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Bank Account Details</h2>
            </div>
            <form onSubmit={handleSaveBankDetails} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Account Holder Name</label>
                <input required type="text" value={bankDetails.accountHolderName} onChange={e => setBankDetails({...bankDetails, accountHolderName: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bank Name</label>
                <input required type="text" value={bankDetails.bankName} onChange={e => setBankDetails({...bankDetails, bankName: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Account Number</label>
                  <input required type="text" value={bankDetails.bankAccountNumber} onChange={e => setBankDetails({...bankDetails, bankAccountNumber: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">IFSC Code</label>
                  <input required type="text" value={bankDetails.ifscCode} onChange={e => setBankDetails({...bankDetails, ifscCode: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
              </div>
              <button disabled={loading} type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors">
                Save Bank Details
              </button>
            </form>
          </div>

          {/* Request Payout */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-2xl shadow-sm text-white">
            <h2 className="text-xl font-bold mb-2">Available Balance</h2>
            <div className="text-4xl font-black mb-6">₹{parseFloat(userData?.wallet || 0).toFixed(2)}</div>
            
            <form onSubmit={handleRequestPayout} className="bg-white/10 p-4 rounded-xl space-y-4 backdrop-blur-sm">
              <h3 className="font-semibold">Request Withdrawal</h3>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70">₹</span>
                  <input required type="number" step="0.01" max={userData?.wallet} value={requestAmount} onChange={e => setRequestAmount(e.target.value)} className="w-full pl-8 p-3 bg-white/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white" placeholder="Amount" />
                </div>
                <button disabled={loading} type="submit" className="px-6 bg-white text-purple-700 font-bold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                  Withdraw
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Payout History</h2>
            <button
              onClick={() => exportToCSV(payouts, 'my_payouts')}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-[#0066cc] rounded-lg border border-gray-200 transition-colors text-sm font-semibold"
              title="Export Payouts to CSV"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-semibold bg-gray-50">
                  <th className="p-4 rounded-l-lg">Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Transaction Ref</th>
                  <th className="p-4 rounded-r-lg">Notes</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="p-4">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-gray-900">₹{parseFloat(p.amount).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${p.status==='Approved' ? 'bg-green-100 text-green-700' : p.status==='Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 font-mono text-xs">{p.transaction_id || '-'}</td>
                    <td className="p-4 text-gray-500">{p.admin_notes || '-'}</td>
                  </tr>
                ))}
                {payouts.length === 0 && (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-400">No payout requests yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Admin View
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Vendor Settlement Requests</h2>
          <button
            onClick={() => exportToCSV(payouts, 'all_payouts')}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-[#0066cc] rounded-lg border border-gray-200 transition-colors text-sm font-semibold"
            title="Export All Payouts to CSV"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 font-semibold bg-gray-50">
                <th className="p-4 rounded-l-lg">Date</th>
                <th className="p-4">Vendor</th>
                <th className="p-4">Bank Details</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="p-4">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">{p.company_name || p.vendor_name}</div>
                    <div className="text-xs text-gray-500">{p.vendor_email}</div>
                  </td>
                  <td className="p-4">
                    {p.bank_details ? (
                      <div className="text-xs text-gray-600 space-y-0.5">
                        <div className="font-medium text-gray-900">{p.bank_details.bankName}</div>
                        <div>A/C: {p.bank_details.bankAccountNumber}</div>
                        <div>IFSC: {p.bank_details.ifscCode}</div>
                        <div>Name: {p.bank_details.accountHolderName}</div>
                      </div>
                    ) : (
                      <span className="text-red-500 text-xs font-semibold">Not provided</span>
                    )}
                  </td>
                  <td className="p-4 font-bold text-gray-900 text-lg">₹{parseFloat(p.amount).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${p.status==='Approved' ? 'bg-green-100 text-green-700' : p.status==='Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {p.status === 'Pending' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setApprovalModal({ open: true, payoutId: p.id, action: 'Approved' })} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => setApprovalModal({ open: true, payoutId: p.id, action: 'Rejected' })} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    {p.status !== 'Pending' && (
                      <span className="text-xs font-mono text-gray-500">{p.transaction_id || p.admin_notes || 'Processed'}</span>
                    )}
                  </td>
                </tr>
              ))}
              {payouts.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">No payout requests to process.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {approvalModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6">
            <h3 className="text-xl font-bold mb-4">
              {approvalModal.action === 'Approved' ? 'Approve Payout' : 'Reject Payout'}
            </h3>
            <form onSubmit={handleAdminAction} className="space-y-4">
              {approvalModal.action === 'Approved' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Bank Transaction ID (UTR)</label>
                  <input required type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. UPI123456789" />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Notes (Optional)</label>
                <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Add a note..."></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setApprovalModal({ open: false })} className="flex-1 px-4 py-2 border border-gray-200 font-bold rounded-lg hover:bg-gray-50 text-gray-600">Cancel</button>
                <button type="submit" className={`flex-1 px-4 py-2 text-white font-bold rounded-lg ${approvalModal.action === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
