import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, AreaChart, Area 
} from 'recharts';
import { TrendingUp, DollarSign, CreditCard, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';

const mockRevenueData = [
  { name: 'Jan', revenue: 4000, profit: 2400 },
  { name: 'Feb', revenue: 3000, profit: 1398 },
  { name: 'Mar', revenue: 2000, profit: 9800 },
  { name: 'Apr', revenue: 2780, profit: 3908 },
  { name: 'May', revenue: 1890, profit: 4800 },
  { name: 'Jun', revenue: 2390, profit: 3800 },
  { name: 'Jul', revenue: 3490, profit: 4300 },
];

const mockRecentTransactions = [
  { id: 'TRX-1029', user: 'TechCorp India', amount: 45000, status: 'Completed', date: '2026-06-21', type: 'B2B Order' },
  { id: 'TRX-1030', user: 'Aman Sharma', amount: 1250, status: 'Pending', date: '2026-06-22', type: 'Retail' },
  { id: 'TRX-1031', user: 'Green Valley Farms', amount: 8900, status: 'Completed', date: '2026-06-22', type: 'Vendor Payout' },
  { id: 'TRX-1032', user: 'SuperMart LLC', amount: 120500, status: 'Processing', date: '2026-06-22', type: 'B2B Order' },
];

export function RevenueAnalyticsTab() {
  const [timeRange, setTimeRange] = useState('7D');

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Revenue Analytics</h2>
          <p className="text-gray-500 font-medium mt-1">Financial overview and transaction metrics</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl border border-gray-200">
          {['24H', '7D', '30D', '1Y', 'ALL'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                timeRange === range ? 'bg-white text-[#0066cc] shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <DollarSign className="w-20 h-20" />
          </div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-700">Gross Revenue</h3>
          </div>
          <div className="relative z-10">
            <span className="text-3xl font-black text-gray-900">₹24,50,000</span>
            <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold mt-2">
              <ArrowUpRight className="w-4 h-4" /> +14.5% vs last period
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <CreditCard className="w-20 h-20" />
          </div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-700">Net Profit</h3>
          </div>
          <div className="relative z-10">
            <span className="text-3xl font-black text-gray-900">₹8,45,200</span>
            <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold mt-2">
              <ArrowUpRight className="w-4 h-4" /> +8.2% vs last period
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <Calendar className="w-20 h-20" />
          </div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-bold text-gray-700">Pending Clearances</h3>
          </div>
          <div className="relative z-10">
            <span className="text-3xl font-black text-gray-900">₹1,24,000</span>
            <div className="flex items-center gap-1 text-red-600 text-sm font-bold mt-2">
              <ArrowDownRight className="w-4 h-4" /> -2.1% vs last period
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue & Profit Trends</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockRevenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066cc" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0066cc" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
              <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [`₹${value.toLocaleString()}`, '']}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#0066cc" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">Recent High-Value Transactions</h3>
          <button className="text-sm font-bold text-[#0066cc] hover:text-[#0052a3]">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Entity</th>
                <th className="p-4">Type</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockRecentTransactions.map((trx, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-semibold text-gray-900">{trx.id}</td>
                  <td className="p-4 font-bold text-gray-700">{trx.user}</td>
                  <td className="p-4 text-gray-500">{trx.type}</td>
                  <td className="p-4 text-gray-500">{trx.date}</td>
                  <td className="p-4 font-black text-gray-900">₹{trx.amount.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                      trx.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                      trx.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
