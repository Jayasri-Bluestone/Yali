import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    
    // Add new toast
    setToasts((prev) => [...prev, { id, message, type, isFadingOut: false }]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      // Start fade out animation
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isFadingOut: true } : t))
      );
      
      // Remove from list after fade out finishes (300ms)
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 3000);
  }, []);

  const showConfirm = useCallback((message, onConfirm) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    // Add new confirm toast, no auto-dismiss
    setToasts((prev) => [...prev, { id, message, type: 'confirm', isFadingOut: false, onConfirm }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isFadingOut: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pointer-events-none w-max px-4">
        {toasts.map((toast) => {
          let bgColor = 'bg-slate-900/90 backdrop-blur-xl shadow-2xl shadow-slate-900/20';
          let borderColor = 'border-slate-800/60';
          let textColor = 'text-slate-100';
          let Icon = Info;
          let iconColor = 'text-blue-400';

          switch (toast.type) {
            case 'success':
              Icon = CheckCircle;
              iconColor = 'text-emerald-400';
              break;
            case 'error':
              Icon = AlertCircle;
              iconColor = 'text-rose-400';
              break;
            case 'warning':
              Icon = AlertTriangle;
              iconColor = 'text-amber-400';
              break;
            case 'confirm':
              Icon = AlertTriangle;
              iconColor = 'text-amber-400';
              bgColor = 'bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-slate-900/40 ring-1 ring-amber-500/50';
              break;
            case 'info':
            default:
              Icon = Info;
              iconColor = 'text-blue-400';
              break;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-full border transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                toast.isFadingOut
                  ? 'opacity-0 -translate-y-4 scale-95'
                  : 'opacity-100 translate-y-0 scale-100 animate-slide-in'
              } ${bgColor} ${borderColor} ${textColor}`}
              style={{
                animation: toast.isFadingOut ? 'none' : 'slideIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards'
              }}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-sm font-semibold tracking-wide">
                <div className="mb-1 leading-relaxed">{toast.message}</div>
                {toast.type === 'confirm' && (
                  <div className="flex gap-2 mt-3 mb-1">
                    <button 
                      onClick={() => { if(toast.onConfirm) toast.onConfirm(); removeToast(toast.id); }}
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-full text-xs font-bold transition-colors shadow-sm"
                    >
                      Confirm
                    </button>
                    <button 
                      onClick={() => removeToast(toast.id)}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-full text-xs font-bold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-800 ml-2 self-start mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Inline styles for slide-in animation */}
      <style>{`
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
