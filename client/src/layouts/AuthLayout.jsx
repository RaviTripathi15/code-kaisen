import React from 'react';
import { Layers } from 'lucide-react';

/**
 * AuthLayout
 *
 * Rules that MUST hold:
 *  1. The page (body) scrolls — not any inner container.
 *  2. Nothing has a fixed height that could clip the card.
 *  3. No overflow:hidden anywhere in this tree.
 *  4. Horizontal scroll is blocked at html/body level (index.css).
 *
 * Layout strategy:
 *  - auth-container = flex column, justify-content: flex-start
 *    → content stacks from the top, page scrolls naturally downward
 *  - auth-card = height:auto, overflow:visible
 *    → card grows with its content, never clips
 *  - Decorative blobs = position:fixed
 *    → purely visual, never affect document flow
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="auth-container">

      {/* Fixed decorative background blobs — zero layout impact */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.14),_transparent_28%)]" />
      <div className="pointer-events-none fixed left-[-10%] top-[-10%] h-[36%] w-[36%] rounded-full bg-gov-500/10 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-[-12%] right-[-8%] h-[36%] w-[36%] rounded-full bg-indigo-500/10 blur-[140px]" />

      {/* ── Branding header ── */}
      <div className="relative z-10 mb-6 text-center w-full max-w-[500px]">
        <div className="mb-4 inline-flex rounded-2xl border border-gov-500/30 bg-gov-500/15 p-3.5 shadow-xl shadow-gov-950/30">
          <Layers className="h-8 w-8 text-gov-400" />
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">
          SETU Portal
        </h1>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Single Window E-Coordination for Town Utilities
        </p>
      </div>

      {/* ── Form card ── */}
      {/*
        auth-card class:  width 100%, max-width 500px, height auto,
                          overflow visible, padding 36px 32px, border-radius 24px
        glass-panel:      glassmorphism background + shadow
        animate-fade-in-up: entrance animation
        No max-height. No overflow:hidden. No fixed height.
      */}
      <div className="relative z-10 w-full max-w-[500px]">
        <div className="auth-card glass-panel animate-fade-in-up border border-white/10 shadow-2xl shadow-slate-950/60">
          {children}
        </div>
      </div>

      {/* ── Footer ── */}
      <p className="relative z-10 mt-8 text-center text-[11px] text-slate-600">
        Government of India · Civic Utility Coordination Platform
      </p>

    </div>
  );
};

export default AuthLayout;
