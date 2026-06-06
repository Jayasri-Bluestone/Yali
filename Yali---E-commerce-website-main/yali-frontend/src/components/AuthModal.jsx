import { Mail, Lock, User, Phone, ArrowLeft, Check, Building, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { API_URL } from '../config';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLoginModule from 'react-facebook-login/dist/facebook-login-render-props';
const FacebookLogin = FacebookLoginModule.default || FacebookLoginModule;



export function AuthModal({ isOpen, onClose, onSuccess }) {
  const { showToast } = useToast();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isVendor, setIsVendor] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [taxId, setTaxId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'forgot') {
      setResetSent(true);
      setTimeout(() => {
        showToast('Password reset link sent to your email!', 'info');
        setMode('login');
        setResetSent(false);
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      if (mode === 'register') {
        const regBody = {
          name,
          email,
          phone,
          password,
          role: isVendor ? 'vendor' : 'customer',
          companyName: isVendor ? companyName : undefined,
          storeDescription: isVendor ? storeDescription : undefined,
          taxId: isVendor ? taxId : undefined
        };

        const res = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(regBody)
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        showToast(data.message || 'Account created successfully!', 'success');
        
        if (isVendor) {
          setMode('login');
          setLoading(false);
          return;
        }
      }

      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        throw new Error(loginData.error || 'Authentication failed');
      }

      localStorage.setItem('yali_token', loginData.token);
      showToast('Welcome back to YALI!', 'success');
      onSuccess?.(loginData.user, loginData.token);
      onClose?.();

      setEmail('');
      setPassword('');
      setName('');
      setPhone('');
      setIsVendor(false);
      setCompanyName('');
      setStoreDescription('');
      setTaxId('');

    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: tokenResponse.access_token })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Google login failed');
        
        localStorage.setItem('yali_token', data.token);
        showToast('Successfully logged in with Google!', 'success');
        onSuccess?.(data.user, data.token);
        onClose?.();
      } catch (error) {
        showToast(error.message, 'error');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      showToast('Google authentication was cancelled or failed.', 'error');
    }
  });

  const responseFacebook = async (response) => {
    if (response.error || !response.accessToken) return;
    
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/facebook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: response.accessToken })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Facebook login failed');
      
      localStorage.setItem('yali_token', data.token);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      onSuccess?.(data.user, data.token);
      onClose?.();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[850px] z-[100] flex animate-slide-in">
        
        {/* Desktop Close Button outside modal */}
        <button
          onClick={onClose}
          className="absolute -right-12 top-0 text-white hover:text-gray-300 transition-colors hidden md:block cursor-pointer"
        >
          <X className="w-9 h-9" />
        </button>

        <div className="bg-white rounded shadow-2xl flex flex-col md:flex-row w-full overflow-hidden max-h-[90vh]">
          
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-800 transition-colors md:hidden z-10 bg-white/80 rounded-full p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column - Theme Banner */}
          <div className="w-full md:w-2/5 bg-gradient-to-br from-[#0066cc] to-[#10b981] p-8 text-white flex flex-col justify-between flex-shrink-0 relative overflow-hidden hidden md:flex">
            <div className="relative z-10">
              <h2 className="text-[28px] font-semibold mb-4 leading-tight">
                {mode === 'login' ? 'Login' : mode === 'register' ? "Looks like you're new here!" : 'Reset Password'}
              </h2>
              <p className="text-blue-100 text-[15px] leading-relaxed font-medium pr-4">
                {mode === 'login' 
                  ? 'Get access to your Orders, Wishlist and Recommendations' 
                  : mode === 'register'
                  ? 'Sign up with your details to get started'
                  : 'Enter your email to receive a password reset link'
                }
              </p>
            </div>
            
            {/* Illustration */}
            <div className="mt-12 flex justify-center items-end relative z-10">
              <div className="w-full flex items-end justify-center relative h-40">
                <div className="absolute bottom-0 w-[200%] h-32 bg-white/10 rounded-[100%] blur-xl opacity-50"></div>
                <div className="bg-white rounded-lg p-3 shadow-lg relative z-10 border border-white/20 flex items-center justify-center">
                   <div className="w-20 h-14 bg-gray-100 rounded border-2 border-gray-200 flex flex-col items-center justify-center gap-1">
                     <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                     <div className="w-10 h-2 bg-gray-300 rounded-full"></div>
                   </div>
                   <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full border-[3px] border-[#10b981] flex items-center justify-center shadow-sm">
                     <div className="w-3 h-3 border-t-2 border-r-2 border-white transform rotate-45 -translate-x-0.5 translate-y-0.5"></div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="w-full md:w-3/5 p-6 md:p-9 bg-white flex flex-col overflow-y-auto">
            {mode === 'forgot' && resetSent ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-start gap-3 mt-4">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold">Email Sent!</p>
                  <p>Please check your email for password reset instructions.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-5">
                
                {/* Mobile Header (Only visible on small screens) */}
                <div className="md:hidden mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : 'Reset Password'}
                  </h2>
                </div>

                {mode === 'register' && (
                  <>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="peer w-full pt-5 pb-2 border-b-2 border-gray-200 focus:border-[#0066cc] focus:outline-none transition-colors text-sm text-gray-900 bg-transparent placeholder-transparent"
                        placeholder="Full Name"
                        required
                        id="regName"
                      />
                      <label htmlFor="regName" className="absolute left-0 top-0 text-xs text-gray-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#0066cc]">
                        Full Name
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="peer w-full pt-5 pb-2 border-b-2 border-gray-200 focus:border-[#0066cc] focus:outline-none transition-colors text-sm text-gray-900 bg-transparent placeholder-transparent"
                        placeholder="Phone Number"
                        required
                        id="regPhone"
                      />
                      <label htmlFor="regPhone" className="absolute left-0 top-0 text-xs text-gray-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#0066cc]">
                        Phone Number
                      </label>
                    </div>

                    <div className="p-3 bg-gray-50 border border-gray-200 rounded flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-500" />
                        <div className="text-left">
                          <span className="text-sm font-semibold text-gray-800 block">Register as Vendor</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isVendor}
                        onChange={(e) => setIsVendor(e.target.checked)}
                        className="w-4 h-4 text-[#0066cc] border-gray-300 rounded focus:ring-[#0066cc] cursor-pointer"
                      />
                    </div>

                    {isVendor && (
                      <div className="space-y-4 p-4 border border-gray-200 rounded bg-gray-50 mt-2">
                        <div className="relative">
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="peer w-full pt-4 pb-1 border-b-2 border-gray-300 focus:border-[#0066cc] focus:outline-none transition-colors text-sm bg-transparent placeholder-transparent"
                            placeholder="Company Name"
                            required={isVendor}
                            id="vendorCompany"
                          />
                          <label htmlFor="vendorCompany" className="absolute left-0 top-0 text-[10px] text-gray-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-[#0066cc]">
                            Company / Store Name
                          </label>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={taxId}
                            onChange={(e) => setTaxId(e.target.value)}
                            className="peer w-full pt-4 pb-1 border-b-2 border-gray-300 focus:border-[#0066cc] focus:outline-none transition-colors text-sm bg-transparent placeholder-transparent"
                            placeholder="Tax ID"
                            id="vendorTax"
                          />
                          <label htmlFor="vendorTax" className="absolute left-0 top-0 text-[10px] text-gray-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-[#0066cc]">
                            Tax Registration ID (Optional)
                          </label>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="relative mt-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="peer w-full pt-5 pb-2 border-b-2 border-gray-200 focus:border-[#0066cc] focus:outline-none transition-colors text-sm text-gray-900 bg-transparent placeholder-transparent"
                    placeholder="Enter Email/Mobile number"
                    required
                    id="authEmail"
                  />
                  <label htmlFor="authEmail" className="absolute left-0 top-0 text-xs text-gray-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#0066cc]">
                    Enter Email/Mobile number
                  </label>
                </div>

                {mode !== 'forgot' && (
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="peer w-full pt-5 pb-2 border-b-2 border-gray-200 focus:border-[#0066cc] focus:outline-none transition-colors text-sm text-gray-900 bg-transparent placeholder-transparent"
                      placeholder="Enter Password"
                      required
                      id="authPassword"
                    />
                    <label htmlFor="authPassword" className="absolute left-0 top-0 text-xs text-gray-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#0066cc]">
                      Enter Password
                    </label>
                    
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="absolute right-0 top-3 text-[11px] text-[#0066cc] font-semibold hover:underline cursor-pointer"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-6 leading-relaxed">
                  By continuing, you agree to YALI's <span className="text-[#0066cc] cursor-pointer">Terms of Use</span> and <span className="text-[#0066cc] cursor-pointer">Privacy Policy</span>.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#0066cc] to-[#10b981] text-white font-semibold text-[15px] shadow-sm hover:shadow-lg transition-all hover:opacity-90 disabled:opacity-70 mt-2 cursor-pointer rounded-md"
                >
                  {loading ? 'Please wait...' : (mode === 'login' ? 'Login' : mode === 'register' ? 'Continue' : 'Request Link')}
                </button>

                {mode === 'login' && (
                  <>
                    <div className="flex items-center gap-4 my-4">
                      <div className="h-px bg-gray-200 flex-1"></div>
                      <span className="text-xs text-gray-400">OR</span>
                      <div className="h-px bg-gray-200 flex-1"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => loginWithGoogle()}
                        className="flex items-center justify-center gap-2 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Google</span>
                      </button>
                      <FacebookLogin
                        appId={import.meta.env.VITE_FACEBOOK_APP_ID || "YOUR_FACEBOOK_APP_ID"}
                        autoLoad={false}
                        fields="name,email,picture"
                        callback={responseFacebook}
                        render={renderProps => (
                          <button
                            type="button"
                            onClick={renderProps.onClick}
                            className="flex items-center justify-center gap-2 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Facebook</span>
                          </button>
                        )}
                      />
                    </div>
                  </>
                )}
              </form>
            )}
            
            <div className="mt-auto pt-8 flex justify-center pb-2">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-[#0066cc] font-semibold text-sm hover:underline cursor-pointer bg-white px-2"
              >
                {mode === 'login' ? 'New to YALI? Create an account' : 'Existing User? Log in'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
