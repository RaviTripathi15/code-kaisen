import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, description, trend, trendType = 'up', loading = false, accent = 'gov' }) => {
  const accentColors = {
    gov: 'text-gov-400 border-gov-500/20 bg-gov-500/10',
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
  };

  if (loading) {
    return (
      <div className="glass-card space-y-4 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center justify-between">
          <div className="skeleton h-3 w-28" />
          <div className="skeleton h-11 w-11 rounded-xl" />
        </div>
        <div className="skeleton h-9 w-16" />
        <div className="skeleton h-3 w-36" />
      </div>
    );
  }

  return (
    <div className="glass-card group flex flex-col justify-between rounded-2xl border border-slate-850/80 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/70 hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{title}</span>
        {Icon && (
          <div className={`rounded-xl border p-2.5 shadow-inner shadow-slate-950/40 transition-transform duration-300 group-hover:scale-105 ${accentColors[accent] || accentColors.gov}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-5">
        <h3 className="font-display text-3xl font-extrabold tracking-tight text-white">{value}</h3>
      </div>

      {(description || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          {trend && (
            <span className={`flex items-center font-bold ${trendType === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trendType === 'up' ? <ArrowUpRight className="mr-0.5 h-3 w-3" /> : <ArrowDownRight className="mr-0.5 h-3 w-3" />}
              {trend}
            </span>
          )}
          <span className="truncate">{description}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
