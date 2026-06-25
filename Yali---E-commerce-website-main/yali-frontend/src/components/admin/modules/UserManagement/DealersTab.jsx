import React, { useState, useEffect } from 'react';
import { Store, MapPin, Phone, Star, ShieldCheck, MoreVertical, Plus, Filter, Search, TrendingUp, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { API_URL } from '../../../../config';

export function DealersTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('yali_token');

  useEffect(() => {
    const fetchDealers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/users?role=vendor&managed_category=Automobiles`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setDealers(data);
      } catch (err) {
        console.error('Failed to fetch dealers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDealers();
  }, [token]);

  const filteredDealers = dealers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.dealership && d.dealership.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Automobile Dealers</h2>
          <p className="text-gray-500 font-medium mt-1">Manage vendor accounts, verify dealerships, and monitor performance.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search dealers..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all">
            <Plus className="w-4 h-4" /> Add Dealer
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Store className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-black text-gray-900">{dealers.length}</div>
            <div className="text-sm font-bold text-gray-500">Total Dealers</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl"><ShieldCheck className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-black text-gray-900">{dealers.filter(d => d.status === 'active').length}</div>
            <div className="text-sm font-bold text-gray-500">Verified Network</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-black text-gray-900">{dealers.reduce((acc, curr) => acc + (curr.activeListings || 0), 0)}</div>
            <div className="text-sm font-bold text-gray-500">Active Listings</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertCircle className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-black text-gray-900">{dealers.filter(d => d.status === 'pending_approval').length}</div>
            <div className="text-sm font-bold text-gray-500">Pending Approvals</div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Dealers Table */}
      {!loading && filteredDealers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Dealer Info</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Contact</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Performance</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDealers.map((dealer) => {
                  const isVerified = dealer.status === 'active';
                  const displayStatus = isVerified ? 'Verified' : dealer.status;
                  
                  return (
                    <tr key={dealer.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full border border-gray-200 shadow-sm bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                              {dealer.name.charAt(0).toUpperCase()}
                            </div>
                            {isVerified && (
                              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border border-white">
                                <ShieldCheck className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{dealer.name}</div>
                            <div className="text-xs font-medium text-blue-600">{dealer.dealership || 'Independent'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900 font-medium">{dealer.phone || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{dealer.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-bold text-gray-900">{dealer.activeListings || 0}</div>
                            <div className="text-xs font-medium text-gray-500">Listings</div>
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{dealer.totalSales || 0}</div>
                            <div className="text-xs font-medium text-gray-500">Sales</div>
                          </div>
                          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md text-xs font-bold">
                            <Star className="w-3 h-3 fill-current" /> 4.5
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                          isVerified ? 'bg-green-50 text-green-600 border border-green-100' :
                          dealer.status === 'pending_approval' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                          {displayStatus.toUpperCase()}
                        </span>
                        <div className="text-xs text-gray-400 mt-1">Joined {new Date(dealer.created_at).getFullYear()}</div>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && filteredDealers.length === 0 && (
        <div className="py-20 text-center bg-white rounded-2xl border border-gray-200 shadow-sm mt-6">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">No dealers found</h3>
        </div>
      )}
    </div>
  );
}
