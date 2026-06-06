import { useState } from 'react';
import { Lock, Mail, ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../config';

export function AdminLogin({ onSuccess, onGoBack }) {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
 
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Role check: Only admin and vendor allowed
      if (data.user.role !== 'admin' && data.user.role !== 'vendor') {
        throw new Error('Access Denied: Only Admins or Vendors can access this portal.');
      }

      localStorage.setItem('yali_token', data.token);
      showToast(`Welcome to YALI Management Console, ${data.user.name}!`, 'success');
      onSuccess(data.user, data.token);

    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glowing Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-purple-700/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-indigo-700/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 animate-scale-in">
        
        {/* Go Back button */}
        <button
          onClick={onGoBack}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Storefront
        </button>

        {/* Portal Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">YALI Secure Portal</h2>
          <p className="text-slate-400 text-xs mt-1">Administrator & Merchant Verification Gateway</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Portal Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-950/40 border border-slate-800 focus:border-purple-500 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm transition-all"
                placeholder="admin@yali.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Gateway Key</label>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-950/40 border border-slate-800 focus:border-purple-500 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 cursor-pointer text-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Verifying Gateway...' : 'Verify & Enter'}
          </button>
        </form>

        {/* Security Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[10px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>SSL Secure 256-Bit Encrypted Session</span>
        </div>
      </div>
    </div>
  );
}
