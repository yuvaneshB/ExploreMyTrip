import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldAlert, Lock } from 'lucide-react';
import logo from '../assets/logo.png';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const { resetPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const email = location.state?.email || '';

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await resetPassword(email, data.otp, data.newPassword);
      if (res.success) {
        toast.success(res.message);
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-3xl shadow-xl relative z-10 text-center">
        <div className="flex flex-col items-center gap-2 mb-8">
          <img src={logo} alt="ExploreMyTrip" className="h-12 w-auto" />
          <h2 className="text-3xl font-extrabold tracking-tight text-gold-gradient">
            Reset Password
          </h2>
          <p className="text-slate-500 text-sm">
            Enter the 6-digit OTP code and select a new secure password
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
          {/* OTP Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Verification Code (OTP)
            </label>
            <input
              type="text"
              maxLength="6"
              placeholder="Enter Your OTP"
              className="w-full text-center tracking-widest text-xl font-bold py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/10 transition-all text-slate-800"
              {...register('otp', { required: 'OTP is required' })}
            />
            {errors.otp && <p className="text-xs text-rose-500 mt-1">{errors.otp.message}</p>}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/10 transition-all text-slate-800"
                {...register('newPassword', { 
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
              />
            </div>
            {errors.newPassword && <p className="text-xs text-rose-500 mt-1">{errors.newPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-gold-500/25 transition-all duration-200"
          >
            {loading ? 'Processing...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldAlert className="w-4 h-4" />
          <span>Check your email for the verification code</span>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
