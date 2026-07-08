import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Compass, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import logo from '../assets/logo.png';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await login(data.email, data.password);
      if (res.success) {
        if (res.status === 'verificationRequired') {
          toast.success(res.message);
          navigate('/verify-otp', { state: { email: data.email } });
          return;
        }
        toast.success(`Welcome back, ${res.user.name}!`);
        
        // Role based redirection
        switch (res.user.role) {
          case 'Customer': navigate('/dashboard/customer'); break;
          case 'Agent': navigate('/dashboard/agent'); break;
          case 'Manager': navigate('/manager/dashboard'); break;
          case 'Finance': navigate('/finance/dashboard'); break;
          default: navigate('/');
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid credentials';
      toast.error(errMsg);
      if (errMsg.includes('verify') || errMsg.includes('OTP')) {
        navigate('/verify-otp', { state: { email: data.email } });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 relative overflow-hidden">
      {/* Back to Home Button */}
      <button
        onClick={() => navigate('/')}
        aria-label="Back to Home"
        type="button"
        className="absolute top-6 left-6 md:top-8 md:left-8 z-20 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-650 hover:text-gold-600 bg-transparent hover:bg-slate-100/60 active:bg-slate-150 border border-transparent focus:outline-none focus:ring-2 focus:ring-gold-500/20 group transition-all duration-300 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
        <span>Back to Home</span>
      </button>

      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-gold-500/5 blur-3xl pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-slate-200/30 blur-3xl pulse-glow"></div>

      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-3xl shadow-xl relative z-10">
        <div className="flex flex-col items-center gap-2 text-center mb-8">
          <img src={logo} alt="ExploreMyTrip" className="h-12 w-auto" />
          <h2 className="text-3xl font-extrabold tracking-tight text-gold-gradient">
            Welcome Back
          </h2>
          <p className="text-slate-500 text-sm">Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/10 transition-all text-slate-800"
                {...register('email', { required: 'Email address is required' })}
              />
            </div>
            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-gold-500 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/10 transition-all text-slate-800"
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-gold-500/25 transition-all duration-200"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-gold-500 hover:underline font-semibold">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
