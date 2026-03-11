
import React, { useState } from 'react';
import { Mail, Lock, CheckCircle2, Github, Chrome, Apple } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string) => void;
  onSwitchToSignUp: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#020617] to-[#0ea5e9] relative overflow-hidden">
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay z-0" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/p6.png")' }}></div>
      
      {/* Subtle Background Illustrations */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4A90E2 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      {/* Decorative Checklist Items */}
      <div className="absolute top-20 left-[15%] opacity-10 transform -rotate-12 hidden lg:block">
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-white/50 w-48">
          <div className="h-2 w-24 bg-slate-200 rounded-full mb-3"></div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border border-slate-300"></div>
              <div className="h-1.5 w-16 bg-slate-100 rounded-full"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <div className="h-1.5 w-20 bg-slate-100 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-20 right-[15%] opacity-10 transform rotate-12 hidden lg:block">
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-white/50 w-48">
          <div className="h-2 w-20 bg-slate-200 rounded-full mb-3"></div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <div className="h-1.5 w-24 bg-slate-100 rounded-full"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border border-slate-300"></div>
              <div className="h-1.5 w-12 bg-slate-100 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md px-6 z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white/10 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/20 p-8 md:p-10">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="relative w-16 h-16 bg-gradient-to-br from-[#4A90E2] to-[#7B61FF] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-4 overflow-hidden">
              <div className="absolute top-2 left-3 w-1.5 h-2 bg-white/40 rounded-full"></div>
              <div className="absolute top-2 right-3 w-1.5 h-2 bg-white/40 rounded-full"></div>
              <CheckCircle2 size={32} className="text-white drop-shadow-md" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2">Schedio</h1>
            <p className="text-white/60 font-medium">Organize your day with clarity.</p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onLogin(email); }}>
            <div className="space-y-2">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center text-white/40 group-focus-within:text-white transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-white/10 focus:border-white/30 focus:bg-white/10 text-white placeholder:text-white/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-black text-white/40 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] font-black text-blue-300 hover:text-blue-200 uppercase tracking-widest">Forgot Password?</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center text-white/40 group-focus-within:text-white transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-white/10 focus:border-white/30 focus:bg-white/10 text-white placeholder:text-white/20 transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-white text-[#1E1B4B] font-black py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] mt-2 hover:bg-blue-50"
            >
              Log In
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="bg-[#1E1B4B]/20 backdrop-blur-md px-4 text-white/40">OR</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-3.5 rounded-2xl text-sm font-bold text-white hover:bg-white/10 transition-all shadow-sm">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              Continue with Google
            </button>
            <button className="w-full flex items-center justify-center gap-3 bg-white text-black py-3.5 rounded-2xl text-sm font-bold hover:bg-slate-100 transition-all shadow-sm">
              <Apple size={20} fill="black" />
              Continue with Apple
            </button>
          </div>

          {/* Footer */}
          <p className="text-center mt-10 text-sm text-white/60 font-medium">
            Don’t have an account? <button onClick={onSwitchToSignUp} className="text-white font-bold hover:underline">Sign Up</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
