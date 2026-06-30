import React, { useState, useEffect } from 'react';
import { 
  Users, Store, ShoppingBag, Truck, Undo2, AlertCircle, 
  Activity, Clock, ChevronDown, RefreshCw, MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

export function LiveDashboardTab({ isVendor }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [dateRange, setDateRange] = useState('all'); // 'today', 'yesterday', 'last7days', 'thismonth', 'all'
  const [liveMode, setLiveMode] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard/live?dateRange=${dateRange}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('yali_token')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch live stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStats();
  }, [dateRange]);

  useEffect(() => {
    let interval;
    if (liveMode) {
      interval = setInterval(() => {
        fetchStats();
      }, 15000); // 15 seconds short polling
    }
    return () => clearInterval(interval);
  }, [liveMode, dateRange]);

  const StatCard = ({ icon: Icon, label, value, color, delay, route }) => (
    <div 
      onClick={() => route && navigate(route)}
      className={`bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-fade-in ${route ? 'cursor-pointer hover:border-[#0066cc] hover:shadow-md transition-all' : ''}`} 
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-xl ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{label}</p>
          <div className="text-3xl font-black text-gray-900 mt-1">{value !== undefined ? value : '--'}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            Live Dashboard
            {liveMode && (
              <span className="relative flex h-3 w-3 ml-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </h2>
          <p className="text-gray-500 font-medium mt-1">
            Real-time analytics and alerts. Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Live Mode Toggle */}
          <button 
            onClick={() => setLiveMode(!liveMode)}
            className={`px-4 py-2 font-bold rounded-xl flex items-center gap-2 transition-all ${
              liveMode ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            {liveMode ? 'Live Mode: ON' : 'Live Mode: OFF'}
          </button>

          {/* Date Filter */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
            >
              <option value="today">Today (Live)</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 Days</option>
              <option value="thismonth">This Month</option>
              <option value="all">All Time</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button onClick={fetchStats} className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors" title="Force Refresh">
            <RefreshCw className={`w-5 h-5 ${loading && 'animate-spin'}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {!isVendor && (
          <>
            <StatCard icon={Users} label="Total Customers" value={stats?.totalCustomers} color="bg-blue-50 text-blue-600" delay={0} route="/admin/users" />
            <StatCard icon={Store} label="Total Vendors" value={stats?.totalVendors} color="bg-purple-50 text-purple-600" delay={50} route="/admin/vendors" />
          </>
        )}
        <StatCard icon={ShoppingBag} label="Orders" value={stats?.liveOrdersCount} color="bg-emerald-50 text-emerald-600" delay={100} route="/admin/sales-analytics" />
        <StatCard icon={MessageSquare} label="Leads / Enquiries" value={stats?.liveEnquiriesCount} color="bg-blue-50 text-blue-600" delay={120} route="/admin/property-enquiries" />
        <StatCard icon={Truck} label="Out for Delivery" value={stats?.liveDeliveryCount} color="bg-orange-50 text-orange-600" delay={150} route="/admin/sales-analytics" />
        <StatCard icon={Undo2} label="Returned / Cancelled" value={stats?.liveReturnedCount} color="bg-red-50 text-red-600" delay={200} route="/admin/refunds-returns" />
        <StatCard icon={Store} label="Revenue" value={stats?.totalRevenue ? `₹${Number(stats.totalRevenue).toLocaleString()}` : '₹0'} color="bg-[#0066cc]/10 text-[#0066cc]" delay={250} route="/admin/revenue-analytics" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Action Needed Alerts */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" /> Action Needed
          </h3>
          <div className="space-y-4">
            
            {stats?.pendingProductsCount > 0 && (
              <div 
                onClick={() => navigate('/admin/pending-approvals')}
                className="p-4 rounded-xl bg-orange-50 border border-orange-100 flex gap-3 items-start cursor-pointer hover:border-orange-300 transition-colors"
              >
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-orange-900">Pending Approvals</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    {isVendor 
                      ? `You have ${stats.pendingProductsCount} products currently awaiting admin approval.` 
                      : `There are ${stats.pendingProductsCount} vendor products awaiting your review.`}
                  </p>
                </div>
              </div>
            )}

            {stats?.lowStockCount > 0 && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-900">Low Stock Alert</h4>
                  <p className="text-sm text-red-700 mt-1">
                    {stats.lowStockCount} products are running critically low on inventory.
                  </p>
                </div>
              </div>
            )}

            {stats?.unansweredEnquiriesCount > 0 && (
              <div 
                onClick={() => navigate('/admin/property-enquiries')}
                className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3 items-start cursor-pointer hover:border-blue-300 transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-900">Unanswered Leads</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {isVendor 
                      ? `You have ${stats.unansweredEnquiriesCount} new customer enquiries on your products.` 
                      : `There are ${stats.unansweredEnquiriesCount} new customer enquiries awaiting response.`}
                  </p>
                </div>
              </div>
            )}

            {(!stats?.pendingProductsCount && !stats?.lowStockCount && !stats?.unansweredEnquiriesCount) && (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                <p className="font-bold text-gray-400">No urgent actions required!</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#0066cc]" /> Recent Activity
          </h3>
          
          <div className="space-y-4">
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((act, i) => (
                <div key={`${act.type}-${act.id}-${i}`} className="flex gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                  <div className={`p-2 rounded-lg h-fit ${act.type === 'order' ? 'bg-emerald-50 text-emerald-600' : act.type === 'enquiry' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                    {act.type === 'order' ? <ShoppingBag className="w-4 h-4" /> : act.type === 'enquiry' ? <MessageSquare className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">
                      {act.type === 'order' 
                        ? `New Order Placed (ID: ${act.id}) - Status: ${act.status}` 
                        : act.type === 'enquiry'
                        ? `New Enquiry (${act.status}) from ${act.name}`
                        : `Product ${act.name} was added / updated`}
                    </p>
                    <p className="text-xs font-bold text-gray-400 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" /> {new Date(act.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="font-bold text-gray-400">No recent activity found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
