import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PageHeader = ({ eyebrow, title, subtitle, action, breadcrumb }) => {
  return (
    <div className="hero-banner animate-fade-in-up">
      {breadcrumb && (
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
          <Link to="/" className="font-medium transition-colors hover:text-gov-400">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-slate-400">{breadcrumb}</span>
        </nav>
      )}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <div>
            <h1 className="page-title">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
