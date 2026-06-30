import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import {
  Layers, AlertTriangle, FileText, CheckCircle2, ShieldAlert,
  BarChart3, ArrowRight, TrendingUp, Clock, RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';

/* ── Chart theme ── */
const CHART_THEME = {
  grid:    '#1e293b',
  text:    '#64748b',
  tooltip: { bg: 'rgba(15,23,42,0.95)', border: '#334155', text: '#e2e8f0' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      {label && <p className="mb-1 font-semibold text-slate-300">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const PIE_COLORS = ['#f97316', '#14b8a6', '#ef4444', '#10b981', '#eab308'];

const AdminDashboard = () => {
  const [data, setData]               = useState(null);
  const [conflicts, setConflicts]     = useState([]);
  const [slaViolations, setSla]       = useState([]);
  const [allPermits, setAllPermits]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);

  const load = async () => {
    try {
      const [analyticsRes, permitsRes, conflictsRes, complaintsRes] = await Promise.all([
        axios.get('/api/analytics'),
        axios.get('/api/permits'),
        axios.get('/api/permits?status=Conflict'),
        axios.get('/api/complaints'),
      ]);

      if (analyticsRes.data.success)  setData(analyticsRes.data.data);
      if (permitsRes.data.success)    setAllPermits(permitsRes.data.data);
      if (conflictsRes.data.success)  setConflicts(conflictsRes.data.data);
      if (complaintsRes.data.success) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        setSla(complaintsRes.data.data.filter(c =>
          c.status !== 'Resolved' && new Date(c.createdAt) < sevenDaysAgo
        ));
      }
    } catch (err) {
      console.error('Admin dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRefresh = () => { setRefreshing(true); load(); };

  /* ── Derived metrics ── */
  const totalPermits = data ? Object.values(data.permits || {}).reduce((a, b) => a + b, 0) : 0;
  const activeCount  = allPermits.filter(p => p.status === 'Active').length;
  const pendingCount = allPermits.filter(p => p.status === 'Pending').length;
  const doneCount    = allPermits.filter(p => p.status === 'Completed').length;

  /* ── Permit status pie data ── */
  const pieData = [
    { name: 'Active',    value: activeCount },
    { name: 'Completed', value: doneCount },
    { name: 'Conflict',  value: conflicts.length },
    { name: 'Pending',   value: pendingCount },
  ].filter(d => d.value > 0);

  /* ── Monthly activity bar (last 6 months synthetic from permits) ── */
  const buildMonthlyBar = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        month: d.toLocaleString('default', { month: 'short' }),
        permits: allPermits.filter(p => {
          const c = new Date(p.createdAt);
          return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
        }).length,
        conflicts: conflicts.filter(p => {
          const c = new Date(p.createdAt);
          return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
        }).length,
      });
    }
    return months;
  };
  const monthlyData = buildMonthlyBar();

  /* ── Spark data for stat cards ── */
  const sparkPermits   = monthlyData.map(d => d.permits);
  const sparkConflicts = monthlyData.map(d => d.conflicts);

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Super Admin</p>
          <h1 className="page-title">Nodal Officer Console</h1>
          <p className="page-subtitle">
            City-wide permit oversight, conflict resolution, and SLA monitoring.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary self-start sm:self-auto gap-2"
          aria-label="Refresh dashboard"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── KPI tiles ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="animate-fade-in-up stagger-1">
          <StatCard title="Total Permits" value={totalPermits}
            icon={Layers} description="All departments"
            trend={totalPermits > 0 ? `+${activeCount} active` : ''} trendType="up"
            accent="gov" loading={loading} sparkData={sparkPermits} />
        </div>
        <div className="animate-fade-in-up stagger-2">
          <StatCard title="Active Conflicts" value={conflicts.length}
            icon={AlertTriangle} description="Requires resolution"
            trend={conflicts.length > 0 ? 'Urgent' : 'Clear'} trendType={conflicts.length > 0 ? 'down' : 'up'}
            accent="rose" loading={loading} sparkData={sparkConflicts} />
        </div>
        <div className="animate-fade-in-up stagger-3">
          <StatCard title="SLA Violations" value={slaViolations.length}
            icon={ShieldAlert} description="Unresolved > 7 days"
            trend={slaViolations.length > 0 ? 'Overdue' : 'On track'} trendType={slaViolations.length > 0 ? 'down' : 'up'}
            accent="amber" loading={loading} />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <StatCard title="Resolution Speed" value={`${data?.averageResolutionHours || 0}h`}
            icon={CheckCircle2} description="Avg complaint close time"
            trendType="up" accent="emerald" loading={loading} />
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Monthly activity bar chart */}
        <div className="section-shell p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800/70 pb-3">
            <h3 className="section-title text-sm">
              <BarChart3 className="h-4 w-4 text-gov-400" />
              Monthly Activity
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">Last 6 months</span>
          </div>
          {loading ? (
            <div className="skeleton h-52 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: CHART_THEME.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: CHART_THEME.text, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(v) => <span className="text-[11px] text-slate-400">{v}</span>} />
                <Bar dataKey="permits"   name="Permits"   fill="#14b8a6" radius={[4,4,0,0]} maxBarSize={32} />
                <Bar dataKey="conflicts" name="Conflicts" fill="#f43f5e" radius={[4,4,0,0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Permit status pie chart */}
        <div className="section-shell p-5">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800/70 pb-3">
            <h3 className="section-title text-sm">
              <Layers className="h-4 w-4 text-gov-400" />
              Permit Status
            </h3>
          </div>
          {loading ? (
            <div className="skeleton h-52 rounded-xl" />
          ) : pieData.length === 0 ? (
            <div className="flex h-52 items-center justify-center text-xs text-slate-500">No permit data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData} cx="50%" cy="45%"
                  innerRadius={52} outerRadius={78}
                  paddingAngle={3} dataKey="value"
                  isAnimationActive={true}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(v) => <span className="text-[10px] text-slate-400">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Conflict queue + SLA violations ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* Conflicts */}
        <div className="section-shell p-5">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800/70 pb-3">
            <h3 className="section-title text-sm">
              <AlertTriangle className="h-4 w-4 text-rose-500" style={{ animation: 'pulse 2s ease infinite' }} />
              Conflict Overlaps
              {conflicts.length > 0 && (
                <span className="ml-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500/20 px-1.5 text-[10px] font-extrabold text-rose-400">
                  {conflicts.length}
                </span>
              )}
            </h3>
            <Link to="/admin/conflicts" className="btn-ghost text-xs py-1.5 px-3">
              Resolve <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
          ) : conflicts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <p className="text-xs text-slate-500">No active conflicts detected</p>
            </div>
          ) : (
            <div className="space-y-2.5 scroll-area max-h-64">
              {conflicts.map(c => (
                <div key={c._id} className="flex items-start justify-between gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{c.roadName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{c.department?.name}</p>
                    <p className="text-[9px] text-rose-400 mt-0.5">
                      {new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="flex-shrink-0 rounded-lg bg-rose-500/15 px-2 py-0.5 text-[9px] font-extrabold uppercase text-rose-400 border border-rose-500/25">
                    Overlap
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SLA violations */}
        <div className="section-shell p-5">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800/70 pb-3">
            <h3 className="section-title text-sm">
              <Clock className="h-4 w-4 text-amber-500" />
              SLA Violations
              {slaViolations.length > 0 && (
                <span className="ml-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500/20 px-1.5 text-[10px] font-extrabold text-amber-400">
                  {slaViolations.length}
                </span>
              )}
            </h3>
            <Link to="/complaints-queue" className="btn-ghost text-xs py-1.5 px-3">
              Queue <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
          ) : slaViolations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <p className="text-xs text-slate-500">All complaints within SLA</p>
            </div>
          ) : (
            <div className="space-y-2.5 scroll-area max-h-64">
              {slaViolations.map(v => {
                const days = Math.round((Date.now() - new Date(v.createdAt)) / 86400000);
                return (
                  <div key={v._id} className="flex items-start justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate">{v.complaintType}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{v.department?.name || 'Unassigned'}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{new Date(v.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="flex-shrink-0 rounded-lg bg-rose-500/15 px-2 py-0.5 text-[9px] font-extrabold text-rose-400 border border-rose-500/25">
                      {days}d open
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
