import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

/*
 * StatCard — production-level KPI tile
 *
 * Props:
 *  title       string
 *  value       string | number
 *  icon        Lucide component
 *  description string
 *  trend       string  e.g. "↑ 15%"
 *  trendType   'up' | 'down' | 'neutral'
 *  loading     bool
 *  accent      'gov' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple'
 *  sparkData   array of numbers  e.g. [4,7,5,9,6,11,8]
 */
const ACCENTS = {
  gov:     { icon: 'text-gov-400 border-gov-500/20 bg-gov-500/10',     chart: '#14b8a6', glow: 'shadow-gov-500/10' },
  emerald: { icon: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10', chart: '#10b981', glow: 'shadow-emerald-500/10' },
  amber:   { icon: 'text-amber-400 border-amber-500/20 bg-amber-500/10',       chart: '#f59e0b', glow: 'shadow-amber-500/10' },
  rose:    { icon: 'text-rose-400 border-rose-500/20 bg-rose-500/10',          chart: '#f43f5e', glow: 'shadow-rose-500/10' },
  sky:     { icon: 'text-sky-400 border-sky-500/20 bg-sky-500/10',             chart: '#0ea5e9', glow: 'shadow-sky-500/10' },
  purple:  { icon: 'text-purple-400 border-purple-500/20 bg-purple-500/10',    chart: '#a855f7', glow: 'shadow-purple-500/10' },
};

const StatCard = ({
  title, value, icon: Icon, description,
  trend, trendType = 'up', loading = false,
  accent = 'gov', sparkData,
}) => {
  const a = ACCENTS[accent] || ACCENTS.gov;

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="glass-card rounded-2xl border border-slate-800 p-5 space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="skeleton h-3 w-28 rounded" />
          <div className="skeleton h-10 w-10 rounded-xl" />
        </div>
        <div className="skeleton h-9 w-20 rounded" />
        <div className="skeleton h-3 w-32 rounded" />
      </div>
    );
  }

  const trendColors = {
    up:      'text-emerald-400',
    down:    'text-rose-400',
    neutral: 'text-slate-400',
  };
  const TrendIcon = trendType === 'up' ? ArrowUpRight : trendType === 'down' ? ArrowDownRight : Minus;

  /* build spark data array */
  const spark = sparkData
    ? sparkData.map((v, i) => ({ v }))
    : null;

  return (
    <div className={`
      glass-card group relative flex flex-col justify-between
      rounded-2xl border border-slate-800/80 p-5
      shadow-lg ${a.glow}
      transition-all duration-300
      hover:-translate-y-1 hover:border-slate-700/60 hover:shadow-card-hover
      overflow-hidden
    `}>
      {/* Top row: label + icon */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 leading-tight">
          {title}
        </span>
        {Icon && (
          <div className={`
            rounded-xl border p-2.5 flex-shrink-0
            shadow-inner shadow-slate-950/50
            transition-all duration-300 group-hover:scale-110
            ${a.icon}
          `}>
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-4">
        <p className="font-display text-3xl font-extrabold tracking-tight text-white leading-none">
          {value ?? '—'}
        </p>
      </div>

      {/* Trend + description */}
      {(trend || description) && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          {trend && (
            <span className={`flex items-center gap-0.5 font-bold ${trendColors[trendType] || trendColors.neutral}`}>
              <TrendIcon className="h-3 w-3" aria-hidden="true" />
              {trend}
            </span>
          )}
          {description && <span className="truncate">{description}</span>}
        </div>
      )}

      {/* Mini sparkline */}
      {spark && (
        <div className="mt-4 h-10 w-full opacity-60 group-hover:opacity-90 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`sg-${accent}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={a.chart} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={a.chart} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={a.chart}
                strokeWidth={1.5}
                fill={`url(#sg-${accent})`}
                dot={false}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Subtle bottom glow */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${a.chart}80, transparent)` }}
      />
    </div>
  );
};

export default StatCard;
