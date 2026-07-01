import React, { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { verifyAdminFn } from '@/backend/infrastructure/auth';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import logo from '@/frontend/shared/assets/Shailraj travels-Punelogo.png';

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError("");

    try {
      const res = await verifyAdminFn({ data: { email, password } });
      if (res.success && res.token) {
        sessionStorage.setItem("adminToken", res.token);
        navigate({ to: "/admin" });
      } else {
        setError(res.message || "Invalid email or password");
      }
    } catch (err: any) {
      const rawMsg = err.message || "";
      if (
        rawMsg.includes("<!doctype html>") ||
        rawMsg.includes("<html>") ||
        rawMsg.includes("<html")
      ) {
        setError("Login failed due to a server error. Please try again later.");
      } else {
        setError(rawMsg || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLElement;
      if (
        (target.tagName === "INPUT" && (target as HTMLInputElement).type !== "button" && (target as HTMLInputElement).type !== "submit") ||
        target.tagName === "SELECT"
      ) {
        const form = e.currentTarget;
        const inputs = Array.from(
          form.querySelectorAll("input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled])")
        ) as HTMLElement[];
        
        const index = inputs.indexOf(target);
        if (index > -1 && index < inputs.length - 1) {
          e.preventDefault();
          inputs[index + 1].focus();
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-blue/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 z-0 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-reveal">
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-full bg-white border border-slate-100 shadow-md shadow-brand-blue/5 flex items-center justify-center mb-6 overflow-hidden">
            <img 
              src={logo} 
              alt="Shailraj Travels Logo" 
              className="h-full w-full object-contain" 
              style={{ transform: "scale(1.65)" }} 
            />
          </div>
          <h1 className="text-2xl font-bold font-display text-brand-blue-deep">Admin Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Secure access to manage your website</p>
        </div>

        <div className="bg-white rounded-[24px] p-8 shadow-xl shadow-brand-blue/5 border border-slate-100">
          <form
            onSubmit={handleLogin}
            onKeyDown={handleFormKeyDown}
            className="flex flex-col gap-6"
          >
            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Email Address
              </label>
              <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 h-[56px] transition focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/15">
                <Mail className="h-5 w-5 text-slate-400 shrink-0 transition-colors group-focus-within:text-brand-green" />
                <input
                  suppressHydrationWarning
                  id="email"
                  name="email"
                  autoComplete="username"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address..."
                  className="w-full bg-transparent text-[15px] font-semibold text-brand-blue-deep placeholder:text-slate-400 placeholder:font-medium focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Master Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Master Password
              </label>
              <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 h-[56px] transition focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/15">
                <Lock className="h-5 w-5 text-slate-400 shrink-0 transition-colors group-focus-within:text-brand-green" />
                <input
                  suppressHydrationWarning
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full bg-transparent text-[15px] font-semibold text-brand-blue-deep placeholder:text-slate-400 placeholder:font-medium focus:outline-none"
                />
              </div>
              {error && <p className="text-red-500 text-sm font-semibold mt-1 animate-pulse">{error}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full h-[56px] bg-[#10A34A] hover:bg-[#0D8A3E] text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-[#10A34A]/20 hover:shadow-[#10A34A]/30 hover:-translate-y-0.5 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-8">
          <a
            href="/"
            className="text-sm font-semibold text-slate-500 hover:text-brand-green transition-colors"
          >
            &larr; Back to Website
          </a>
        </div>
      </div>
    </div>
  );
}
