import React, { useState } from 'react';
import { Save, Globe, Mail, Phone, MapPin, Image as ImageIcon } from 'lucide-react';

export function SettingsWebsiteTab() {
  const [formData, setFormData] = useState({
    siteName: 'YALI E-commerce Platform',
    contactEmail: 'support@yali.com',
    contactPhone: '+91 98765 43210',
    address: '123 Tech Park, Cyber City, Bangalore, India',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata (IST)',
    maintenanceMode: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Website Settings</h2>
          <p className="text-gray-500 font-medium mt-1">Configure global platform settings and contact information</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#0066cc] to-[#0052a3] text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
              <Globe className="w-5 h-5 text-gray-400" /> General Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Platform Name</label>
                <input 
                  type="text" name="siteName" value={formData.siteName} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] transition-all font-medium text-gray-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Default Currency</label>
                  <select 
                    name="currency" value={formData.currency} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] transition-all font-medium text-gray-900 cursor-pointer"
                  >
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">System Timezone</label>
                  <select 
                    name="timezone" value={formData.timezone} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] transition-all font-medium text-gray-900 cursor-pointer"
                  >
                    <option>Asia/Kolkata (IST)</option>
                    <option>America/New_York (EST)</option>
                    <option>Europe/London (GMT)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
              <Mail className="w-5 h-5 text-gray-400" /> Public Contact Information
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400"/> Support Email</label>
                  <input 
                    type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] transition-all font-medium text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400"/> Contact Phone</label>
                  <input 
                    type="text" name="contactPhone" value={formData.contactPhone} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] transition-all font-medium text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400"/> Headquarters Address</label>
                <textarea 
                  name="address" value={formData.address} onChange={handleChange} rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] transition-all font-medium text-gray-900 resize-none"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Brand Logo</h3>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group">
              <div className="w-16 h-16 bg-[#0066cc]/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-8 h-8 text-[#0066cc]" />
              </div>
              <p className="text-sm font-bold text-gray-900">Click to upload new logo</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 text-red-600">Danger Zone</h3>
            
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center mt-0.5">
                <input 
                  type="checkbox" name="maintenanceMode" 
                  checked={formData.maintenanceMode} onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">Maintenance Mode</div>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Disables public access to the platform.</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
