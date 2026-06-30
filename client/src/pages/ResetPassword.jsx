import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const { resettoken } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.put(`/api/auth/resetpassword/${resettoken}`, {
        password: data.password,
      });
      if (res.data.success) {
        toast.success('Password updated successfully.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-white">Reset Password</h2>
        <p className="mt-1.5 text-sm text-slate-400">
          Set a new secure password for your account
        </p>
      </div>

      {/* ── Form — NO overflow, NO max-h ── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="form-fields"
        noValidate
      >
        {/* New Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="reset-password">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              id="reset-password"
              type={showNew ? 'text' : 'password'}
              autoComplete="new-password"
              autoFocus
              placeholder="Minimum 6 characters"
              className={`glass-input pl-10 pr-11 ${errors.password ? 'glass-input-error' : ''}`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
                validate: val =>
                  /[A-Za-z]/.test(val) || 'Password must contain at least one letter',
              })}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowNew(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              aria-label={showNew ? 'Hide password' : 'Show password'}
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="form-error">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />{errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="reset-confirm">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              id="reset-confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              className={`glass-input pl-10 pr-11 ${errors.confirmPassword ? 'glass-input-error' : ''}`}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match',
              })}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirm(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="form-error">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />{errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={loading}
          className="auth-button btn-primary"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
              Updating…
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Update Password
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
