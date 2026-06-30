import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import {
  FileText, CheckCircle2, Clock, AlertOctagon,
  ArrowRight, MapPin, Construction, TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const PIE_COLORS = ['#10b981', '#f59e0b', '#14b8a6'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs shadow-xl">
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.payload.fill }}>
          {p.name}: <b>{p.value}</b>
        </p>
      ))}
    </div>
  );
};

const CitizenDashboard = () => {
  const [complaints, setComplaints]       = useState([]);
  const [activePermits, setActivePermits] = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          axios.get('/api/complaints'),
          axios.get('/api/permits?status=Active'),
        ]);
        if (cRes.data.success) setComplaints(cRes.data.data);
        if (pRes.data.success) setActivePermits(pRes.data.data);
      } catch (err) {
        console.error('Citizen dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const total    = complaints.length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const pending  = total - resolved;
  const pct      = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const pieData = [
    { name: 'Resolved',   value: resolved, fill: '#10b981' },
    { name: 'Pending',    value: pending,  fill: '#f59e0b' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <PageHeader
        eyebrow="Citizen Services"
        title="My Dashboard"
        subtitle="Monitor road-digging activities in your area and manage your reported utility issues."
        action={
          <Link to="/report" className="btn-primary">
            <FileText className="h-4 w-4" />
            Report Issue
          </Link>
        }
      />

      {/* ── KPI tiles ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="animate-fade-in-up stagger-1">
          <StatCard title="Total Complaints" value={total}
            icon={FileText} description="Submitted by you"
            loading={loading} accent="gov"
            sparkData={[2,3,1,4,2,3,total]} />
        </div>
        <div className="animate-fade-in-up stagger-2">
          <StatCard title="Resolved" value={resolved}
            icon={CheckCircle2} description="Closed by departments"
            trend={`${pct}% resolved`} trendType="up"
            accent="emerald" loading={loading}
            sparkData={[0,1,1,2,1,resolved-1,resolved].map(v => Math.max(0,v))} />
        </div>
        <div className="animate-fade-in-up stagger-3">
          <StatCard title="Pending" value={pending}
            icon={Clock} description="Under investigation"
            trend={pending > 0 ? `${pending} open` : 'All clear'}
            trendType={pending > 0 ? 'neutral' : 'up'}
            accent="amber" loading={loading} />
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* ── Active closures list ── */}
        <div className="lg:col-span-2 section-shell p-5">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="section-title text-sm">
              <AlertOctagon className="h-4 w-4 text-orange-400" />
              Active Road Closures
              {activePermits.length > 0 && (
                <span className="ml-1.5 rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-extrabold text-orange-400">
                  {activePermits.length}
                </span>
              )}
            </h3>
            <Link to="/map" className="btn-ghost text-xs py-1.5 px-3">
              Map view <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
            </div>
          ) : activePermits.length === 0 ? (
            <EmptyState
              icon={Construction}
              title="No active excavations"
              description="There are no road-digging activities in your area right now."
              action={<Link to="/map" className="btn-secondary text-xs">Explore Map</Link>}
            />
          ) : (
            <div className="space-y-2.5">
              {activePermits.slice(0, 6).map((permit) => (
                <div key={permit._id}
                  className="group flex items-start justify-between gap-4 rounded-xl border border-slate-800/70 bg-slate-900/50 p-4 transition-all duration-200 hover:border-orange-500/25 hover:bg-slate-900/80"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-bold text-slate-200 truncate">{permit.roadName}</p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      {permit.ward} · Depth {permit.depth}m
                    </p>
                    <p className="text-xs italic leading-relaxed text-slate-500 line-clamp-1">{permit.purpose}</p>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                    <StatusBadge status="Active" />
                    <span className="text-[10px] text-slate-600">
                      Until {new Date(permit.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {activePermits.length > 6 && (
                <Link to="/map" className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/40 py-2.5 text-xs font-semibold text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors">
                  +{activePermits.length - 6} more on map <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ── Right panel: complaints + mini pie ── */}
        <div className="flex flex-col gap-5">

          {/* Pie chart summary */}
          {!loading && total > 0 && (
            <div className="section-shell p-5">
              <h3 className="section-title text-sm mb-4 border-b border-slate-800/80 pb-3">
                <TrendingUp className="h-4 w-4 text-gov-400" />
                Complaint Summary
              </h3>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%"
                    innerRadius={36} outerRadius={52}
                    paddingAngle={4} dataKey="value" isAnimationActive>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex items-center justify-center gap-4 text-[10px]">
                {pieData.map(d => (
                  <span key={d.name} className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ background: d.fill }} />
                    <span className="text-slate-400">{d.name} ({d.value})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent complaints */}
          <div className="section-shell flex flex-col p-5 flex-1">
            <div className="mb-4 flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="section-title text-sm">
                <FileText className="h-4 w-4 text-gov-400" />
                Recent Complaints
              </h3>
              <Link to="/tracking" className="btn-ghost text-xs py-1.5 px-3">
                View all
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
              </div>
            ) : complaints.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No complaints yet"
                description="Report utility issues like unauthorised digging or leaks."
                action={<Link to="/report" className="btn-primary text-xs">Report First Issue</Link>}
              />
            ) : (
              <div className="space-y-2.5">
                {complaints.slice(0, 4).map(comp => (
                  <div key={comp._id}
                    className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-3.5 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold text-slate-300">{comp.complaintType}</span>
                      <StatusBadge status={comp.status} />
                    </div>
                    <p className="mt-1 line-clamp-1 text-[11px] italic text-slate-500">{comp.description}</p>
                    <p className="mt-1.5 text-right text-[10px] text-slate-600">
                      {new Date(comp.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {complaints.length > 0 && (
              <div className="mt-4 border-t border-slate-800/70 pt-4">
                <Link to="/report" className="btn-primary w-full text-xs py-2.5">
                  Report New Issue
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
