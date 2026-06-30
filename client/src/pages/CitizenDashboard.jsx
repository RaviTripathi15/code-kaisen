import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { FileText, CheckCircle2, Clock, AlertOctagon, Info, ArrowRight, MapPin, Construction } from 'lucide-react';
import { Link } from 'react-router-dom';

const CitizenDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [activePermits, setActivePermits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsRes, permitsRes] = await Promise.all([
          axios.get('/api/complaints'),
          axios.get('/api/permits?status=Active'),
        ]);

        if (complaintsRes.data.success) {
          setComplaints(complaintsRes.data.data);
        }
        if (permitsRes.data.success) {
          setActivePermits(permitsRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching citizen dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter((c) => c.status === 'Resolved').length;
  const pendingComplaints = totalComplaints - resolvedComplaints;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Citizen Services"
        title="Dashboard"
        subtitle="Monitor road-digging activities in your area and report utility issues without leaving the portal."
        action={
          <Link to="/report" className="btn-primary w-full sm:w-auto">
            Report Issue
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="stagger-1 animate-fade-in-up">
          <StatCard
            title="Total Complaints"
            value={totalComplaints}
            icon={FileText}
            description="Submitted by you"
            loading={loading}
          />
        </div>
        <div className="stagger-2 animate-fade-in-up">
          <StatCard
            title="Resolved"
            value={resolvedComplaints}
            icon={CheckCircle2}
            description="Closed by departments"
            trend={`${totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0}%`}
            trendType="up"
            accent="emerald"
            loading={loading}
          />
        </div>
        <div className="stagger-3 animate-fade-in-up">
          <StatCard
            title="Pending"
            value={pendingComplaints}
            icon={Clock}
            description="Under investigation"
            accent="amber"
            loading={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="section-shell p-6">
            <div className="mb-5 flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h3 className="section-title">
                <AlertOctagon className="h-5 w-5 text-orange-400" />
                Active Road Closures
              </h3>
              <Link to="/map" className="btn-ghost text-xs">
                View on Map <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-20 rounded-xl" />
                ))}
              </div>
            ) : activePermits.length === 0 ? (
              <EmptyState
                icon={Construction}
                title="No active excavations"
                description="There are no road-digging activities reported in your area right now."
                action={
                  <Link to="/map" className="btn-secondary text-xs">
                    Explore Utility Map
                  </Link>
                }
              />
            ) : (
              <div className="max-h-[340px] space-y-3 overflow-y-auto pr-1">
                {activePermits.map((permit) => (
                  <div
                    key={permit._id}
                    className="group flex items-start justify-between gap-4 rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/80"
                  >
                    <div className="min-w-0 space-y-1.5">
                      <p className="text-sm font-bold text-slate-200">{permit.roadName}</p>
                      <p className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        Ward {permit.ward} · Depth {permit.depth}m
                      </p>
                      <p className="text-xs italic leading-relaxed text-slate-500 line-clamp-2">{permit.purpose}</p>
                    </div>

                    <div className="flex flex-shrink-0 flex-col items-end gap-2">
                      <StatusBadge status="Active" />
                      <span className="text-[10px] text-slate-500">
                        Until {new Date(permit.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="section-shell flex flex-col p-6">
          <div className="mb-5 flex items-center justify-between border-b border-slate-800/80 pb-4">
            <h3 className="section-title">
              <Info className="h-5 w-5 text-gov-400" />
              Recent Complaints
            </h3>
            <Link to="/tracking" className="btn-ghost text-xs">
              View All
            </Link>
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-16 rounded-xl" />
                ))}
              </div>
            ) : complaints.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No complaints yet"
                description="Report utility issues like unauthorized digging, leaks, or road damage."
                action={
                  <Link to="/report" className="btn-primary text-xs">
                    Report Your First Issue
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {complaints.slice(0, 4).map((comp) => (
                  <div
                    key={comp._id}
                    className="rounded-xl border border-slate-800/70 bg-slate-950/45 p-3.5 transition-all duration-200 hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-slate-300">{comp.complaintType}</span>
                      <StatusBadge status={comp.status} />
                    </div>
                    <p className="mt-1.5 line-clamp-1 text-xs italic text-slate-500">{comp.description}</p>
                    <p className="mt-2 text-right text-[10px] text-slate-600">
                      {new Date(comp.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {complaints.length > 0 && (
            <div className="mt-5 border-t border-slate-800/80 pt-5">
              <Link to="/report" className="btn-primary w-full">
                Report New Issue
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
