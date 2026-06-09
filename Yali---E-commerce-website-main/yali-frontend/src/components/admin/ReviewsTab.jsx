import { useState, useEffect } from 'react';
import { MessageSquare, Star, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { API_URL } from '../../config';
import { useToast } from '../../context/ToastContext';
import { Pagination } from './Pagination';

export function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast, showConfirm } = useToast();
  const token = localStorage.getItem('yali_token');

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [reviews.length]);

  const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE);
  const currentItems = reviews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/admin/reviews/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      showToast(`Review ${status} successfully`, 'success');
      fetchReviews();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    showConfirm('Are you sure you want to delete this review?', async () => {
      try {
        const res = await fetch(`${API_URL}/admin/reviews/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete review');
        showToast('Review deleted successfully', 'success');
        fetchReviews();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading reviews...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-600" /> Product Reviews Management
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-200">
              <th className="py-4 px-4 font-semibold text-gray-600 text-sm">Product</th>
              <th className="py-4 px-4 font-semibold text-gray-600 text-sm">Reviewer</th>
              <th className="py-4 px-4 font-semibold text-gray-600 text-sm">Rating</th>
              <th className="py-4 px-4 font-semibold text-gray-600 text-sm">Comment</th>
              <th className="py-4 px-4 font-semibold text-gray-600 text-sm">Status</th>
              <th className="py-4 px-4 font-semibold text-gray-600 text-sm text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500 font-medium">
                  No reviews found.
                </td>
              </tr>
            ) : (
              currentItems.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4 text-sm text-gray-900 font-semibold">{review.product_name}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{review.author_name}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 max-w-xs">
                    <p className="truncate" title={review.comment}>{review.comment || '-'}</p>
                    {review.media && review.media.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {review.media.map((m, idx) => (
                          <div key={idx} className="w-10 h-10 rounded border border-gray-200 overflow-hidden shrink-0">
                            {m.type === 'video' ? (
                              <video src={m.url} className="w-full h-full object-cover" />
                            ) : (
                              <a href={m.url} target="_blank" rel="noopener noreferrer">
                                <img src={m.url} alt="media" className="w-full h-full object-cover" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      review.status === 'approved' ? 'bg-green-100 text-green-700' :
                      review.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {review.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      {review.status !== 'approved' && (
                        <button onClick={() => handleStatusChange(review.id, 'approved')} title="Approve" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      {review.status !== 'rejected' && (
                        <button onClick={() => handleStatusChange(review.id, 'rejected')} title="Reject" className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(review.id)} title="Delete" className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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
