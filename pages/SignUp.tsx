
import React, { useState } from 'react';
import { Mail, Lock, User, CheckCircle2, Apple } from 'lucide-react';

interface SignUpProps {
  onSignUp: (name: string, email: string) => void;
  onSwitchToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUp, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#020617] to-[#0ea5e9] relative overflow-hidden">
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay z-0" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/p6.png")' }}></div>
      
      {/* Subtle Background Illustrations */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4A90E2 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      {/* Decorative Checklist Items */}
      <div className="absolute top-20 right-[15%] opacity-10 transform rotate-12 hidden lg:block">
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

      {/* SignUp Card */}
      <div className="w-full max-w-md px-6 z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white/10 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/20 p-8 md:p-10">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative w-14 h-14 bg-gradient-to-br from-[#4A90E2] to-[#7B61FF] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-4 overflow-hidden">
              <div className="absolute top-2 left-3 w-1.5 h-2 bg-white/40 rounded-full"></div>
              <div className="absolute top-2 right-3 w-1.5 h-2 bg-white/40 rounded-full"></div>
              <CheckCircle2 size={28} className="text-white drop-shadow-md" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-1">Schedio</h1>
            <h2 className="text-xl font-bold text-white">Create Your Account</h2>
            <p className="text-white/60 text-sm font-medium">Start planning smarter today.</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSignUp(name, email); }}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center text-white/40 group-focus-within:text-white transition-colors">
                  <User size={16} />
                </div>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-white/10 focus:border-white/30 focus:bg-white/10 text-white placeholder:text-white/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center text-white/40 group-focus-within:text-white transition-colors">
                  <Mail size={16} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-white/10 focus:border-white/30 focus:bg-white/10 text-white placeholder:text-white/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center text-white/40 group-focus-within:text-white transition-colors">
                    <Lock size={16} />
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-white/10 focus:border-white/30 focus:bg-white/10 text-white placeholder:text-white/20 transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Confirm</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center text-white/40 group-focus-within:text-white transition-colors">
                    <Lock size={16} />
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-white/10 focus:border-white/30 focus:bg-white/10 text-white placeholder:text-white/20 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-1 py-1">
              <input type="checkbox" id="terms" className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500" required />
              <label htmlFor="terms" className="text-xs text-white/60 font-medium">
                I agree to the <button type="button" className="text-white font-bold hover:underline">Terms & Privacy Policy</button>
              </label>
            </div>

            <button 
              type="submit"
              className="w-full bg-white text-[#1E1B4B] font-black py-3.5 rounded-2xl shadow-lg transition-all active:scale-[0.98] mt-2 hover:bg-blue-50"
            >
              Create Account
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="bg-[#1E1B4B]/20 backdrop-blur-md px-4 text-white/40">OR</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center bg-white/5 border border-white/10 py-3 rounded-2xl hover:bg-white/10 transition-all shadow-sm">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            </button>
            <button className="flex items-center justify-center bg-white py-3 rounded-2xl text-black hover:bg-slate-100 transition-all shadow-sm">
              <Apple size={20} fill="black" />
            </button>
          </div>

          {/* Footer */}
          <p className="text-center mt-8 text-sm text-white/60 font-medium">
            Already have an account? <button onClick={onSwitchToLogin} className="text-white font-bold hover:underline">Log In</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
