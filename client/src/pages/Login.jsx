import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

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
    <div className="space-y-7">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-white">Sign In</h2>
        <p className="mt-2 text-sm text-slate-400">Access your citizen portal or department dashboard</p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3.5 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              id="email"
              type="email"
              placeholder="name@domain.com"
              className={`glass-input pl-10 ${errors.email ? 'glass-input-error' : ''}`}
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address format',
                },
              })}
            />
          </div>
          {errors.email && (
            <p className="form-error">
              <AlertCircle className="h-3 w-3" />
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <div className="flex items-center justify-between">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <Link to="/forgotpassword" className="text-[11px] font-semibold text-gov-400 transition-colors hover:text-gov-300">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className={`glass-input pl-10 ${errors.password ? 'glass-input-error' : ''}`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />
          </div>
          {errors.password && (
            <p className="form-error">
              <AlertCircle className="h-3 w-3" />
              {errors.password.message}
            </p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Sign In
            </>
          )}
        </button>
      </form>

      <div className="border-t border-slate-800/80 pt-5 text-center text-sm text-slate-400">
        New to the portal?{' '}
        <Link to="/register" className="font-semibold text-gov-400 transition-colors hover:text-gov-300">
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default Login;
