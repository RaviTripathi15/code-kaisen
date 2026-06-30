import React from 'react';

const STATUS_MAP = {
  Resolved: 'badge-resolved',
  Pending: 'badge-pending',
  'In Progress': 'badge-progress',
  'In Review': 'badge-progress',
  Overdue: 'badge-overdue',
  Active: 'badge-active',
  Open: 'badge-default',
  Closed: 'badge-default',
  Rejected: 'badge-overdue',
};

const StatusBadge = ({ status, className = '' }) => {
  const variant = STATUS_MAP[status] || 'badge-default';

  return (
    <span className={`${variant} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
};

export default StatusBadge;
