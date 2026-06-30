import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * PageHeader — production-level page title banner
 *
 * Props:
 *  eyebrow    string  — small label above title (e.g. "Citizen Services")
 *  title      string  — main page title
 *  subtitle   string  — description line
 *  breadcrumb string  — breadcrumb label (current page name)
 *  action     ReactNode — right-side CTA button(s)
 */
const PageHeader = ({ eyebrow, title, subtitle, action, breadcrumb }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800/70 bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-800/80 px-6 py-5 sm:px-8 sm:py-6 shadow-[0_16px_48px_rgba(2,6,23,0.38)] animate-fade-in-up">

      {/* Subtle teal accent in top-right corner */}
      <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-gov-500/8 blur-2xl" />
      <div className="pointer-events-none absolute right-12 top-4 h-16 w-16 rounded-full bg-indigo-500/6 blur-xl" />

      {/* Breadcrumb */}
      {breadcrumb && (
        <nav className="mb-3 flex items-center gap-1.5 text-[11px] text-slate-500" aria-label="Breadcrumb">
          <Link to="/" className="flex items-center gap-1 font-medium transition-colors hover:text-gov-400">
            <Home className="h-3 w-3" />
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-700" aria-hidden="true" />
          <span className="font-semibold text-slate-400">{breadcrumb}</span>
        </nav>
      )}

      {/* Main content */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2 min-w-0">
          {eyebrow && (
            <span className="eyebrow">{eyebrow}</span>
          )}
          <h1 className="page-title">{title}</h1>
          {subtitle && (
            <p className="page-subtitle">{subtitle}</p>
          )}
        </div>

        {action && (
          <div className="flex flex-shrink-0 flex-wrap gap-2">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
