import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail } from 'lucide-react';
import logo from '../assets/logo.png';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await forgotPassword(data.email);
      if (res.success) {
        toast.success(res.message);
        navigate('/reset-password', { state: { email: data.email } });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit forgot password request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-3xl shadow-xl relative z-10">
        <div className="flex flex-col items-center gap-2 text-center mb-8">
          <img src={logo} alt="ExploreMyTrip" className="h-12 w-auto" />
          <h2 className="text-3xl font-extrabold tracking-tight text-gold-gradient">
            Forgot Password
          </h2>
          <p className="text-slate-500 text-sm">Enter email address to retrieve password OTP</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                placeholder="Enter Your Email"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/10 transition-all text-slate-800"
                {...register('email', { required: 'Email address is required' })}
              />
            </div>
            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-gold-500/25 transition-all duration-200"
          >
            {loading ? 'Submitting...' : 'Request OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
