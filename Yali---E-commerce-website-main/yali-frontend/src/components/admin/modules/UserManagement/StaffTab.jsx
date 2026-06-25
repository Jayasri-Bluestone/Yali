import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Shield, Briefcase, Search, Plus, Filter, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { API_URL } from '../../../../config';

export function StaffTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('yali_token');

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/users?role=admin`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setStaffList(data);
      } catch (err) {
        console.error('Failed to fetch staff:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [token]);

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Internal Staff</h2>
          <p className="text-gray-500 font-medium mt-1">Manage employees, assign departments, and track activity.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search staff..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all">
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Staff Table */}
      {!loading && filteredStaff.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Employee</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Contact</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Role & Dept</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full border border-gray-200 shadow-sm bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                          {staff.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{staff.name}</div>
                          <div className="text-xs font-medium text-gray-500">ID: {staff.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <Mail className="w-4 h-4 text-gray-400" /> {staff.email}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-800 capitalize">{staff.role}</div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-purple-600 mt-1 bg-purple-50 px-2 py-0.5 rounded-md inline-flex">
                        <Briefcase className="w-3 h-3" /> {staff.managed_category || 'General'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                        staff.status === 'active' ? 'bg-green-50 text-green-600 border border-green-100' :
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {staff.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && filteredStaff.length === 0 && (
        <div className="py-20 text-center bg-white rounded-2xl border border-gray-200 shadow-sm mt-6">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">No staff found</h3>
        </div>
      )}
    </div>
  );
}
