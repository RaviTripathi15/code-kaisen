import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/forgotpassword', { email: data.email });
      if (res.data.success) {
        setSuccess(true);
        toast.success('Password reset instructions emailed.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Email could not be sent.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-white">Recover Password</h2>
        <p className="mt-1.5 text-sm text-slate-400">
          We'll send a reset link to your email address
        </p>
      </div>

      {success ? (
        /* ── Success state ── */
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6 text-center animate-fade-in-up">
          <CheckCircle2 className="h-12 w-12 text-emerald-400" />
          <div>
            <h4 className="font-bold text-slate-100 text-sm">Reset Link Sent</h4>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed max-w-xs">
              Check your email for the reset link. If you're in dev mode, watch the backend terminal logs.
            </p>
          </div>
          <Link
            to="/login"
            className="text-xs font-semibold text-gov-400 hover:text-gov-300 transition-colors underline"
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
        /* ── Form — NO overflow, NO max-h ── */
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="form-fields"
          noValidate
        >
          <div className="form-group">
            <label className="form-label" htmlFor="forgot-email">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="name@domain.com"
                className={`glass-input pl-10 ${errors.email ? 'glass-input-error' : ''}`}
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
                    message: 'Enter a valid email address',
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className="form-error">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />{errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button btn-primary"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Reset Link
              </>
            )}
          </button>

          <div className="border-t border-slate-800/80 pt-4 text-center text-sm text-slate-400">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-gov-400 transition-colors hover:text-gov-300">
              Sign in here
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
