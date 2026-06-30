import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    const res = await login(data.email, data.password);
    if (res.success) {
      toast.success('Logged in successfully!');
      navigate('/');
    } else {
      setErrorMsg(res.error);
      toast.error(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-white">Sign In</h2>
        <p className="mt-1.5 text-sm text-slate-400">
          Access your citizen portal or department dashboard
        </p>
      </div>

      {/* ── API error banner ── */}
      {errorMsg && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3.5 text-xs text-rose-400 animate-slide-down">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Form — NO max-h, NO overflow-y-auto ── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="form-fields"
        noValidate
      >
        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              id="login-email"
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
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="form-group">
          <div className="flex items-center justify-between">
            <label className="form-label" htmlFor="login-password">Password</label>
            <Link
              to="/forgotpassword"
              tabIndex={-1}
              className="text-[11px] font-semibold text-gov-400 transition-colors hover:text-gov-300"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              className={`glass-input pl-10 pr-11 ${errors.password ? 'glass-input-error' : ''}`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="form-error">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* ── Submit button — always fully visible ── */}
        <button
          type="submit"
          disabled={loading}
          className="auth-button btn-primary"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Sign In
            </>
          )}
        </button>
      </form>

      {/* ── Footer ── */}
      <div className="border-t border-slate-800/80 pt-4 text-center text-sm text-slate-400">
        New to the portal?{' '}
        <Link to="/register" className="font-semibold text-gov-400 transition-colors hover:text-gov-300">
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default Login;
