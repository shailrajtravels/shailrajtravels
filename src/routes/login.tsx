import React, { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { verifyAdminFn } from '../lib/auth';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import logo from '@/assets/logo11.png';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await verifyAdminFn({ data: { email, password } });
      if (res.success && res.token) {
        sessionStorage.setItem('adminToken', res.token);
        navigate({ to: '/admin' });
      } else {
        setError('Invalid password');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-blue/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 z-0 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-reveal">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Shailraj Travels" className="h-20 mb-4" />
          <h1 className="text-2xl font-bold font-display text-brand-blue-deep">Admin Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Secure access to manage your website</p>
        </div>

        <div className="bg-white rounded-[24px] p-8 shadow-xl shadow-brand-blue/5 border border-slate-100">
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-[15px] font-medium text-brand-blue-deep placeholder-slate-400 focus:ring-2 focus:ring-brand-green focus:border-brand-green focus:bg-white transition-all outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
                Master Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-[15px] font-medium text-brand-blue-deep placeholder-slate-400 focus:ring-2 focus:ring-brand-green focus:border-brand-green focus:bg-white transition-all outline-none"
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm font-medium animate-pulse">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-lg shadow-brand-green/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
        </div>
        
        <div className="text-center mt-8">
          <a href="/" className="text-sm font-medium text-slate-500 hover:text-brand-green transition-colors">
            &larr; Back to Website
          </a>
        </div>
      </div>
    </div>
  );
}
