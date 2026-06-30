import React from 'react';
import { Layers } from 'lucide-react';

const AuthLayout = ({ children }) => {
  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-slate-950 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.14),_transparent_28%)]" />
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[36%] w-[36%] rounded-full bg-gov-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-12%] right-[-8%] h-[36%] w-[36%] rounded-full bg-indigo-500/10 blur-[140px]" />

      <div className="z-10 text-center sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-5 inline-flex rounded-2xl border border-gov-500/30 bg-gov-500/15 p-3.5 shadow-xl shadow-gov-950/30">
          <Layers className="h-8 w-8 text-gov-400" />
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">SETU Portal</h1>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Single Window E-Coordination for Town Utilities
        </p>
      </div>

      <div className="z-10 mt-8 px-4 sm:mx-auto sm:w-full sm:max-w-md sm:px-0">
        <div className="glass-panel animate-fade-in-up rounded-[28px] border border-white/10 p-7 shadow-2xl shadow-slate-950/60 sm:p-10">
          {children}
        </div>
      </div>

      <p className="relative z-10 mt-8 text-center text-[11px] text-slate-600">
        Government of India · Civic Utility Coordination Platform
      </p>
    </div>
  );
};

export default AuthLayout;
