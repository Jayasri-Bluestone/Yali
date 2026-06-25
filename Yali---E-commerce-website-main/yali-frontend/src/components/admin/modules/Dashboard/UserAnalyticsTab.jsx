import React, { useState } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Users, UserPlus, UserCheck, Shield } from 'lucide-react';

const mockRoleData = [
  { name: 'Customers', value: 12450 },
  { name: 'Vendors', value: 3450 },
  { name: 'Property Agents', value: 850 },
  { name: 'Dealers', value: 420 }
];

const mockGrowthData = [
  { name: 'Jan', newUsers: 400, activeUsers: 2400 },
  { name: 'Feb', newUsers: 300, activeUsers: 2700 },
  { name: 'Mar', newUsers: 550, activeUsers: 3100 },
  { name: 'Apr', newUsers: 450, activeUsers: 3400 },
  { name: 'May', newUsers: 700, activeUsers: 4000 },
  { name: 'Jun', newUsers: 600, activeUsers: 4500 },
];

const COLORS = ['#0066cc', '#10b981', '#f59e0b', '#8b5cf6'];

export function UserAnalyticsTab() {
  const [timeRange, setTimeRange] = useState('30D');

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">User Analytics</h2>
          <p className="text-gray-500 font-medium mt-1">Platform demographics and growth metrics</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl border border-gray-200">
          {['7D', '30D', '90D', '1Y'].map(range => (
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Users', value: '17,170', icon: Users, color: 'blue' },
          { title: 'New Registrations', value: '600', icon: UserPlus, color: 'emerald' },
          { title: 'Active Monthly', value: '4,500', icon: UserCheck, color: 'amber' },
          { title: 'Verified Profiles', value: '12,450', icon: Shield, color: 'purple' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${kpi.color}-100`}>
                <Icon className={`w-6 h-6 text-${kpi.color}-600`} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-500">{kpi.title}</h3>
                <span className="text-2xl font-black text-gray-900">{kpi.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Demographics */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm col-span-1">
          <h3 className="text-lg font-bold text-gray-900 mb-4">User Demographics</h3>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockRoleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {mockRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [value.toLocaleString(), 'Users']}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+18px)] text-center pointer-events-none">
              <span className="block text-2xl font-black text-gray-900">17.1k</span>
              <span className="block text-xs font-bold text-gray-500">Total Users</span>
            </div>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">User Growth & Retention</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{fill: '#f3f4f6'}}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="activeUsers" name="Active Users" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="newUsers" name="New Registrations" fill="#0066cc" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
