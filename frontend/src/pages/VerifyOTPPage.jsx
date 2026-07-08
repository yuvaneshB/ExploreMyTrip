import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

const VerifyOTPPage = () => {
  const { verifyOTP } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const email = location.state?.email || '';

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await verifyOTP(email, data.otp);
      if (res.success) {
        toast.success(res.message);
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-3xl shadow-xl relative z-10 text-center">
        <div className="flex flex-col items-center gap-4 mb-8">
          <img src={logo} alt="ExploreMyTrip Logo" className="h-12 object-contain" />
          <h2 className="text-3xl font-extrabold tracking-tight text-gold-gradient">
            Verify Email
          </h2>
          <p className="text-slate-500 text-sm">
            We sent a 6-digit verification code to <strong className="text-slate-800">{email || 'your email'}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Verification Code (OTP)
            </label>
            <input
              type="text"
              maxLength="6"
              placeholder="Enter Your OTP"
              className="w-full text-center tracking-wide text-lg font-bold py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/10 transition-all text-slate-800"
              {...register('otp', { 
                required: 'OTP is required',
                minLength: { value: 6, message: 'OTP must be exactly 6 digits' }
              })}
            />
            {errors.otp && <p className="text-xs text-rose-500 mt-1">{errors.otp.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-gold-500/25 transition-all duration-200"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          <span>Check your email for the verification code</span>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
