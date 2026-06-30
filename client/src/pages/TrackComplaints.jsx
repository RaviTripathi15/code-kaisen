import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ComplaintTimeline from '../components/ComplaintTimeline';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { Star, FileText, Send, Eye, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const TrackComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComp, setSelectedComp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('/api/complaints');
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const selectComplaint = async (id) => {
    try {
      const res = await axios.get(`/api/complaints/${id}`);
      if (res.data.success) {
        setSelectedComp(res.data.data);
        if (res.data.data.rating) {
          setRatingScore(res.data.data.rating.score || 5);
          setRatingComment(res.data.data.rating.comment || '');
        } else {
          setRatingScore(5);
          setRatingComment('');
        }
      }
    } catch (err) {
      toast.error('Could not fetch complaint details.');
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComp) return;
    setSubmitLoading(true);

    try {
      const res = await axios.post(`/api/complaints/${selectedComp._id}/rate`, {
        score: ratingScore,
        comment: ratingComment,
      });

      if (res.data.success) {
        toast.success('Thank you for your feedback!');
        setSelectedComp(res.data.data);
        fetchComplaints();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit rating.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getPriorityClass = (priority) => {
    if (priority === 'High') return 'badge-overdue';
    if (priority === 'Low') return 'badge-default';
    return 'badge-pending';
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Citizen Services"
        breadcrumb="Complaint Tracking"
        title="Track Your Complaints"
        subtitle="Review status updates and rate resolution quality once your issue is resolved."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="section-shell p-5">
            <h3 className="section-title mb-5 border-b border-slate-800/80 pb-4 text-sm">
              <FileText className="h-4 w-4 text-gov-400" />
              Your Complaints
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-24 rounded-xl" />
                ))}
              </div>
            ) : complaints.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No complaints filed"
                description="You haven't submitted any complaints yet."
                action={
                  <Link to="/report" className="btn-primary text-xs">
                    Report an Issue
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {complaints.map((comp) => {
                  const isSelected = selectedComp?._id === comp._id;

                  return (
                    <div
                      key={comp._id}
                      onClick={() => selectComplaint(comp._id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                        isSelected
                          ? 'border-gov-500/40 bg-gov-500/10 shadow-lg'
                          : 'border-slate-850 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-bold text-slate-200">{comp.complaintType}</span>
                        <span className={getPriorityClass(comp.priority)}>{comp.priority}</span>
                      </div>

                      <p className="mt-2 line-clamp-2 text-xs italic leading-relaxed text-slate-400">{comp.description}</p>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-850/60 pt-3">
                        <StatusBadge status={comp.status} />
                        <span className="text-[10px] text-slate-500">{new Date(comp.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5 lg:col-span-2">
          {selectedComp ? (
            <>
              <div className="glass-panel space-y-5 rounded-2xl border border-slate-850 p-6">
                <div className="flex items-start justify-between gap-4 border-b border-slate-850 pb-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-100">{selectedComp.complaintType}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Ref: {selectedComp._id.slice(-8).toUpperCase()} · {selectedComp.ward}
                    </p>
                  </div>
                  <StatusBadge status={selectedComp.status} />
                </div>

                <div className="space-y-2.5 text-sm text-slate-300">
                  <p>
                    <span className="font-semibold text-slate-400">Description: </span>
                    {selectedComp.description}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-400">Department: </span>
                    {selectedComp.department?.name || 'Awaiting assignment'}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-400">Coordinates: </span>
                    {selectedComp.latitude}, {selectedComp.longitude}
                  </p>
                </div>

                {selectedComp.photoUrl && (
                  <div className="max-w-sm overflow-hidden rounded-xl border border-slate-800">
                    <img src={selectedComp.photoUrl} alt="Incident" className="max-h-56 w-full object-cover" />
                  </div>
                )}
              </div>

              <ComplaintTimeline steps={selectedComp.statusTimeline} currentStatus={selectedComp.status} />

              {selectedComp.status === 'Resolved' && (
                <div className="glass-panel space-y-5 rounded-2xl border border-slate-850 p-6">
                  <h3 className="section-title text-sm">
                    <Award className="h-4 w-4 text-amber-400" />
                    Rate Resolution
                  </h3>

                  {selectedComp.rating?.score ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${star <= selectedComp.rating.score ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                          />
                        ))}
                      </div>
                      <p className="italic text-slate-300">"{selectedComp.rating.comment || 'No comment provided'}"</p>
                      <p className="text-xs font-semibold text-emerald-400">Feedback submitted — thank you!</p>
                    </div>
                  ) : (
                    <form onSubmit={handleRatingSubmit} className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-slate-400">Your rating:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setRatingScore(star)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={`h-6 w-6 ${star <= ratingScore ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Comments</label>
                        <textarea
                          rows={3}
                          className="glass-textarea text-sm"
                          placeholder="Share feedback to help us improve..."
                          value={ratingComment}
                          onChange={(e) => setRatingComment(e.target.value)}
                        />
                      </div>

                      <button type="submit" disabled={submitLoading} className="btn-primary">
                        {submitLoading ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}
                        Submit Feedback
                      </button>
                    </form>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="section-shell flex h-full min-h-[400px] flex-col items-center justify-center">
              <EmptyState
                icon={Eye}
                title="Select a complaint"
                description="Choose a complaint from the list to view its full progress and timeline."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackComplaints;
