import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-slate-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
