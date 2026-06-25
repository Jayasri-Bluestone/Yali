import { TrendingUp, ShoppingBag, Users, Percent, AlertTriangle } from 'lucide-react';

export function DashboardTab({
  totalSales,
  totalOrdersCount,
  pendingOrdersCount,
  lowStockCount,
  isVendor,
  filteredOrders,
  users,
  filteredProducts
}) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
          <div className="text-gray-500 text-sm font-semibold">Total Revenue</div>
          <div className="text-3xl font-extrabold text-gray-900 mt-2">₹{totalSales.toFixed(2)}</div>
          <div className="text-xs text-green-600 font-medium mt-1">▲ 14.5% this month</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="text-gray-500 text-sm font-semibold">Total Orders</div>
          <div className="text-3xl font-extrabold text-gray-900 mt-2">{totalOrdersCount}</div>
          <div className="text-xs text-indigo-600 font-medium mt-1">{pendingOrdersCount} pending fulfillment</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="text-gray-500 text-sm font-semibold">Low Stock Warnings</div>
          <div className="text-3xl font-extrabold text-red-600 mt-2">{lowStockCount}</div>
          <div className="text-xs text-orange-600 font-medium mt-1">Products below stock limit</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
          <div className="text-gray-500 text-sm font-semibold">{isVendor ? 'Fulfillment Status' : 'System Users'}</div>
          <div className="text-3xl font-extrabold text-gray-900 mt-2">
            {isVendor ? `${filteredOrders.filter(o => o.status === 'Delivered').length} Shipped` : users.length}
          </div>
          <div className="text-xs text-gray-500 font-medium mt-1">
            {isVendor ? 'Successfully completed orders' : 'Active user base'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart Mockup */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4 text-gray-900">Monthly Sales Metrics</h3>
          <div className="h-64 flex items-end justify-between gap-2 pt-6">
            {[45, 60, 50, 75, 90, 80, 110, 95, 120, 135, 150, 175].map((val, idx) => {
              const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx];
              const heightPercent = (val / 200) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                  <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-semibold">₹{val}k</div>
                  <div
                    className="w-full bg-gradient-to-t from-purple-700 to-indigo-500 rounded-t-md hover:from-purple-600 hover:to-indigo-400 transition-all duration-300"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[10px] text-gray-500 font-semibold">{month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Highlight Warnings */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-gray-950">Low Stock Highlights</h3>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-60 pr-1">
            {filteredProducts.filter(p => (p.stock || 0) < 5).map(p => (
              <div key={p.id} className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                <div className="text-xs font-semibold text-gray-800 truncate max-w-[150px]">{p.name}</div>
                <div className="text-xs font-bold text-red-600">Stock: {p.stock || 0}</div>
              </div>
            ))}
            {filteredProducts.filter(p => (p.stock || 0) < 5).length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">All products are adequately stocked!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
