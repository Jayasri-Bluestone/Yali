import React, { useEffect, useState } from 'react';
import { API_URL } from '../../../../config';

export function PropertyEnquiriesTab() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('yali_token');
      // Filter by type=property (Real Estate / Land / Plot enquiries)
      const res = await fetch(`${API_URL}/admin/enquiries?type=property`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setEnquiries(data);
    } catch (e) {
      console.error('Fetch property enquiries error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEnquiries(); }, []);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm min-h-[60vh] animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Property Enquiries</h2>
          <p className="text-gray-500 mt-1">Enquiries for land, plots and real estate visits.</p>
        </div>
        <div>
          <button onClick={fetchEnquiries} className="px-3 py-2 bg-indigo-600 text-white rounded-lg">Refresh</button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : enquiries.length === 0 ? (
        <p className="text-gray-500">No property enquiries yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b border-gray-200">
                <th className="p-2">ID</th>
                <th className="p-2">Product / Category</th>
                <th className="p-2">CTA</th>
                <th className="p-2">Name</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Email</th>
                <th className="p-2">Preferred Date</th>
                <th className="p-2">Message</th>
                <th className="p-2">Status</th>
                <th className="p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map(q => (
                <tr key={q.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 text-gray-500">{q.id}</td>
                  <td className="p-2">{q.product_name || q.category || (q.product_id ? `#${q.product_id}` : '-')}</td>
                  <td className="p-2 capitalize">{(q.cta_action || '').replace(/_/g, ' ') || '-'}</td>
                  <td className="p-2 font-medium">{q.full_name || '-'}</td>
                  <td className="p-2">{q.phone || '-'}</td>
                  <td className="p-2">{q.email || '-'}</td>
                  <td className="p-2">{q.preferred_date ? new Date(q.preferred_date).toLocaleDateString() : '-'}</td>
                  <td className="p-2 max-w-[200px] truncate">{q.message ? q.message.slice(0, 80) : '-'}</td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      q.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      q.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{q.status || 'pending'}</span>
                  </td>
                  <td className="p-2 text-gray-500 whitespace-nowrap">{new Date(q.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
