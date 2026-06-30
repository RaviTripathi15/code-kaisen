import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User, Mail, Lock, Phone, MapPin, Building,
  LogIn, AlertCircle, Eye, EyeOff,
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

/**
 * Register — scroll contract:
 *
 *  ✅ form has NO max-height
 *  ✅ form has NO overflow-y:auto / overflow:hidden
 *  ✅ form uses .form-fields (flex-col + gap) — no space-y clipping risk
 *  ✅ submit button is a normal block at the bottom of form flow
 *  ✅ AuthLayout (.auth-container) lets the page body scroll
 */
const Register = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { role: 'Citizen' },
  });

  const selectedRole = watch('role');

  useEffect(() => {
    axios.get('/api/departments')
      .then(res => { if (res.data.success) setDepartments(res.data.data); })
      .catch(err => console.error('Departments fetch error:', err));
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    const res = await registerAuth(data);
    if (res.success) {
      toast.success('Registration completed! Welcome aboard.');
      navigate('/');
    } else {
      setApiError(res.error);
      toast.error(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-white">Create Account</h2>
        <p className="mt-1.5 text-sm text-slate-400">
          Register for utility e-coordination services
        </p>
      </div>

      {/* ── API-level error banner ── */}
      {apiError && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3.5 text-xs text-rose-400 animate-slide-down">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/*
        ── FORM ──
        .form-fields = flex flex-col gap-16px, overflow:visible
        NO max-h, NO overflow-y-auto, NO fixed height
        The page body (body tag) scrolls — this form NEVER scrolls internally
      */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="form-fields"
        noValidate
      >

        {/* Full Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="reg-name">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              autoFocus
              placeholder="e.g. Tarun Shivhare"
              className={`glass-input pl-10 ${errors.name ? 'glass-input-error' : ''}`}
              {...register('name', {
                required: 'Full name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
              })}
            />
          </div>
          {errors.name && (
            <p className="form-error">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />{errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
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

        {/* Phone */}
        <div className="form-group">
          <label className="form-label" htmlFor="reg-phone">Contact Number</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              placeholder="10-digit mobile number"
              className={`glass-input pl-10 ${errors.phone ? 'glass-input-error' : ''}`}
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: 'Enter a valid 10-digit Indian mobile number',
                },
              })}
            />
          </div>
          {errors.phone && (
            <p className="form-error">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />{errors.phone.message}
            </p>
          )}
        </div>

        {/* Role Picker */}
        <div className="form-group">
          <label className="form-label" htmlFor="reg-role">Account Role</label>
          <select
            id="reg-role"
            className="glass-input glass-select"
            {...register('role')}
          >
            <option value="Citizen">Citizen User</option>
            <option value="Department Officer">Department Officer</option>
          </select>
        </div>

        {/* Citizen — Ward */}
        {selectedRole === 'Citizen' && (
          <div className="form-group animate-fade-in-up">
            <label className="form-label" htmlFor="reg-ward">Residential Ward</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <select
                id="reg-ward"
                className={`glass-input glass-select pl-10 ${errors.ward ? 'glass-input-error' : ''}`}
                {...register('ward', { required: 'Please select your residential ward' })}
              >
                <option value="">Select Residential Ward</option>
                <option value="Ward 12 (TT Nagar)">Ward 12 (TT Nagar)</option>
                <option value="Ward 45 (MP Nagar)">Ward 45 (MP Nagar)</option>
                <option value="Ward 52 (Habibganj)">Ward 52 (Habibganj)</option>
                <option value="Ward 80 (Kolar)">Ward 80 (Kolar)</option>
              </select>
            </div>
            {errors.ward && (
              <p className="form-error">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />{errors.ward.message}
              </p>
            )}
          </div>
        )}

        {/* Officer — Department */}
        {selectedRole === 'Department Officer' && (
          <div className="form-group animate-fade-in-up">
            <label className="form-label" htmlFor="reg-dept">Assigned Department</label>
            <div className="relative">
              <Building className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <select
                id="reg-dept"
                className={`glass-input glass-select pl-10 ${errors.departmentCode ? 'glass-input-error' : ''}`}
                {...register('departmentCode', { required: 'Please select your department' })}
              >
                <option value="">Select Utility Department</option>
                {departments.map(d => (
                  <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
            {errors.departmentCode && (
              <p className="form-error">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />{errors.departmentCode.message}
              </p>
            )}
          </div>
        )}

        {/* Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="reg-password">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
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
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="form-error">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />{errors.password.message}
            </p>
          )}
        </div>

        {/* ── Submit — never hidden, never clipped ── */}
        <button
          type="submit"
          disabled={loading}
          className="auth-button btn-primary"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
              Registering…
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Create Account
            </>
          )}
        </button>

      </form>

      {/* ── Footer ── */}
      <div className="border-t border-slate-800/80 pt-4 text-center text-sm text-slate-400">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-gov-400 transition-colors hover:text-gov-300">
          Sign in here
        </Link>
      </div>

    </div>
  );
};

export default Register;
