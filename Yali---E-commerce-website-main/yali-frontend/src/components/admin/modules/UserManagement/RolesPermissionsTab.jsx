import React, { useState, useEffect } from 'react';
import { Shield, Key, CheckCircle2, XCircle, Plus, Info, Edit2 } from 'lucide-react';
import { API_URL } from '../../../../config';

export function RolesPermissionsTab() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('yali_token');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/roles`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setRoles(data);
          if (data.length > 0) setSelectedRole(data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch roles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, [token]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Roles & Permissions</h2>
          <p className="text-gray-500 font-medium mt-1">Configure access control levels and module permissions for staff.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all">
            <Plus className="w-4 h-4" /> Create Role
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && roles.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Roles List */}
          <div className="lg:col-span-1 space-y-3">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedRole === role.id 
                  ? 'bg-blue-50 border-blue-200 shadow-sm' 
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className={`w-5 h-5 ${selectedRole === role.id ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`font-bold ${selectedRole === role.id ? 'text-blue-900' : 'text-gray-700'}`}>{role.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                    {role.users} Users
                  </span>
                </div>
                <p className={`text-sm ${selectedRole === role.id ? 'text-blue-700' : 'text-gray-500'}`}>{role.description}</p>
              </button>
            ))}
          </div>

          {/* Permissions Matrix */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-lg font-black text-gray-900">Module Permissions</h3>
                <p className="text-sm font-medium text-gray-500">Configure what this role can access.</p>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                <Edit2 className="w-4 h-4" /> Edit Access
              </button>
            </div>
            
            <div className="p-5 flex-1">
              <div className="space-y-4">
                {Object.entries(roles.find(r => r.id === selectedRole)?.permissions || {}).map(([module, hasAccess]) => (
                  <div key={module} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                        <Key className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 capitalize">{module} Module</div>
                        <div className="text-xs font-medium text-gray-500 mt-0.5">Allow access to {module} endpoints and UI.</div>
                      </div>
                    </div>
                    
                    {/* Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={hasAccess} readOnly />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border-t border-blue-100 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 font-medium">Changes to role permissions will apply immediately to all users assigned to this role upon saving.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
