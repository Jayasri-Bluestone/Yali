import React, { useState, useEffect } from 'react';
import { GenericDataTableTab } from '../../GenericDataTableTab';
import { API_URL } from '../../../../config';

export function PendingApprovalsTab() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingProperties = async () => {
    try {
      setLoading(true);
      // Fetch all products across all categories and filter pending on frontend, 
      // or fetch everything with all=true and then filter.
      // Since GET /products?all=true exists, let's use it.
      const res = await fetch(`${API_URL}/products?all=true`);
      const data = await res.json();
      if (res.ok) {
        // Filter out only pending items
        const pendingItems = data.filter(item => item.approval_status === 'pending');
        setProperties(pendingItems);
      }
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProperties();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Global Pending Approvals</h2>
          <p className="text-gray-500 font-medium mt-1">Review and approve all items posted by vendors across all categories.</p>
        </div>
      </div>

      <div className="mt-6">
        <GenericDataTableTab 
          products={properties}
          loading={loading}
          title="Awaiting Approval" 
          subtitle="All vendor products currently pending admin review"
          emptyMessage="You're all caught up! No pending items to approve."
        />
      </div>
    </div>
  );
}
