import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import {
  FileText, CheckCircle2, Clock, AlertTriangle, FileDown,
  PlusCircle, ArrowRight, Search, Filter, ChevronUp, ChevronDown,
  RefreshCw, BarChart3,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from 'recharts';

/* ── Status colour map ── */
const STATUS_STYLES = {
  Active:    'bg-orange-500/12 text-orange-400 border border-orange-500/25',
  Conflict:  'bg-rose-500/12 text-rose-400 border border-rose-500/25',
  Completed: 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/25',
  Approved:  'bg-gov-500/12 text-gov-400 border border-gov-500/25',
  Pending:   'bg-amber-500/12 text-amber-400 border border-amber-500/25',
  Rejected:  'bg-red-500/12 text-red-400 border border-red-500/25',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-slate-300 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <b>{p.value}</b></p>
      ))}
    </div>
  );
};

const DepartmentDashboard = () => {
  const { user } = useAuth();
  const [permits, setPermits]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* Table controls */
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey]       = useState('createdAt');
  const [sortDir, setSortDir]       = useState('desc');
  const [page, setPage]             = useState(1);
  const PAGE_SIZE = 8;

  const load = async () => {
    if (!user?.department?._id) return;
    try {
      const res = await axios.get(`/api/permits?department=${user.department._id}`);
      if (res.data.success) setPermits(res.data.data);
    } catch (err) {
      console.error('Permits fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const handleRefresh = () => { setRefreshing(true); load(); };

  /* ── Derived counts ── */
  const counts = useMemo(() => ({
    active:    permits.filter(p => p.status === 'Active').length,
    pending:   permits.filter(p => p.status === 'Pending').length,
    conflict:  permits.filter(p => p.status === 'Conflict').length,
    completed: permits.filter(p => p.status === 'Completed').length,
  }), [permits]);

  /* ── Trend line data (last 6 months) ── */
  const trendData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const m = d.getMonth(), y = d.getFullYear();
      return {
        month: d.toLocaleString('default', { month: 'short' }),
        permits: permits.filter(p => {
          const c = new Date(p.createdAt);
          return c.getMonth() === m && c.getFullYear() === y;
        }).length,
      };
    });
  }, [permits]);

  /* ── Filtered / sorted table data ── */
  const tableData = useMemo(() => {
    let rows = permits.filter(p => {
      const matchSearch = !search || p.roadName.toLowerCase().includes(search.toLowerCase()) || p.ward.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
    rows = [...rows].sort((a, b) => {
      let av = a[sortKey] ?? '', bv = b[sortKey] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return rows;
  }, [permits, search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(tableData.length / PAGE_SIZE));
  const pageData   = tableData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortKey !== field) return <ChevronUp className="h-3 w-3 text-slate-700" />;
    return sortDir === 'asc'
      ? <ChevronUp className="h-3 w-3 text-gov-400" />
      : <ChevronDown className="h-3 w-3 text-gov-400" />;
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Department Officer</p>
          <h1 className="page-title">Utility Control Dashboard</h1>
          <p className="page-subtitle">Manage excavations, track workflows, and export approved permits.</p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto flex-wrap">
          <button onClick={handleRefresh} disabled={refreshing} className="btn-secondary gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link to="/permits/create" className="btn-primary">
            <PlusCircle className="h-4 w-4" />
            Request Permit
          </Link>
        </div>
      </div>

      {/* ── KPI tiles ── */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div className="animate-fade-in-up stagger-1">
          <StatCard title="Active Excavations" value={counts.active}
            icon={Clock} description="On-site right now"
            trend={counts.active > 0 ? 'Live' : ''} trendType="neutral"
            accent="amber" loading={loading}
            sparkData={trendData.map(d => d.permits)} />
        </div>
        <div className="animate-fade-in-up stagger-2">
          <StatCard title="Pending Approval" value={counts.pending}
            icon={FileText} description="Awaiting nodal review"
            accent="sky" loading={loading} />
        </div>
        <div className="animate-fade-in-up stagger-3">
          <StatCard title="Conflicts" value={counts.conflict}
            icon={AlertTriangle} description="GIS overlaps"
            trend={counts.conflict > 0 ? 'Urgent' : 'Clear'} trendType={counts.conflict > 0 ? 'down' : 'up'}
            accent="rose" loading={loading} />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <StatCard title="Completed" value={counts.completed}
            icon={CheckCircle2} description="Restored & closed"
            trend={`+${counts.completed}`} trendType="up"
            accent="emerald" loading={loading} />
        </div>
      </div>

      {/* ── Trend chart ── */}
      <div className="section-shell p-5">
        <div className="mb-4 flex items-center justify-between border-b border-slate-800/70 pb-3">
          <h3 className="section-title text-sm">
            <BarChart3 className="h-4 w-4 text-gov-400" />
            Permit Activity Trend
          </h3>
          <span className="text-[10px] text-slate-500">Last 6 months</span>
        </div>
        {loading ? <div className="skeleton h-40 rounded-xl" /> : (
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="permits" name="Permits" stroke="#14b8a6"
                strokeWidth={2} dot={{ r: 3, fill: '#14b8a6', strokeWidth: 0 }}
                activeDot={{ r: 5 }} isAnimationActive />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Permits table ── */}
      <div className="section-shell">
        {/* Table toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-800/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="section-title text-sm">
            <FileText className="h-4 w-4 text-gov-400" />
            Excavation Permits Log
            <span className="ml-1.5 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
              {tableData.length}
            </span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="search"
                placeholder="Search road, ward…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="glass-input h-8 pl-8 pr-3 text-xs w-44"
                aria-label="Search permits"
              />
            </div>
            {/* Status filter */}
            <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className="glass-input glass-select h-8 pl-8 pr-7 text-xs w-36"
                aria-label="Filter by status"
              >
                <option value="">All Statuses</option>
                {['Active','Pending','Approved','Conflict','Completed','Rejected'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-2 p-4">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        ) : pageData.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No permits match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs" role="table" aria-label="Excavation permits">
              <thead>
                <tr className="border-b border-slate-800/80">
                  {[
                    { key: '_id',       label: 'Ref ID' },
                    { key: 'roadName',  label: 'Road' },
                    { key: 'ward',      label: 'Ward' },
                    { key: 'startDate', label: 'Schedule' },
                    { key: 'status',    label: 'Status' },
                  ].map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="cursor-pointer select-none whitespace-nowrap py-3 pl-4 pr-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors first:pl-5 last:text-right"
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label} <SortIcon field={col.key} />
                      </span>
                    </th>
                  ))}
                  <th className="py-3 pr-5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {pageData.map(permit => (
                  <tr key={permit._id}
                    className="group transition-colors hover:bg-slate-900/40"
                  >
                    <td className="py-3.5 pl-5 font-mono text-[10px] text-slate-500">
                      #{permit._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3.5 pl-4 pr-2 font-semibold text-slate-200 max-w-[160px] truncate">
                      {permit.roadName}
                    </td>
                    <td className="py-3.5 pl-4 pr-2 text-slate-400">{permit.ward}</td>
                    <td className="py-3.5 pl-4 pr-2 text-slate-500 whitespace-nowrap">
                      {new Date(permit.startDate).toLocaleDateString()} –{' '}
                      {new Date(permit.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 pl-4 pr-2">
                      <span className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold uppercase ${STATUS_STYLES[permit.status] || 'bg-slate-800 text-slate-400'}`}>
                        {permit.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-5 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {['Approved','Active','Completed'].includes(permit.status) && (
                          <a
                            href={`/api/permits/${permit._id}/pdf`}
                            download
                            title="Download PDF"
                            className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-gov-400 hover:text-gov-300 hover:bg-slate-800 transition-colors"
                          >
                            <FileDown className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {permit.status === 'Conflict' && (
                          <Link
                            to="/admin/conflicts"
                            title="View conflict"
                            className="rounded-lg border border-rose-500/25 bg-rose-500/10 p-1.5 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-800/70 px-5 py-3">
            <span className="text-[11px] text-slate-500">
              Page {page} of {totalPages} · {tableData.length} results
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition-colors
                      ${page === pg
                        ? 'border-gov-500/40 bg-gov-500/15 text-gov-400 font-bold'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentDashboard;
