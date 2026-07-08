import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export const FinanceProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-800 font-sans">Financial Officer Profile</h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold font-sans">System access credentials and personnel identity details</p>
      </div>

      <div className="max-w-3xl bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm text-left">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gold-500/10 text-gold-600 flex items-center justify-center text-2xl font-bold border border-gold-200 shadow-inner">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <strong className="text-lg text-slate-800 block font-bold">{user?.name || 'Finance Manager'}</strong>
            <span className="text-xs text-slate-450 block font-semibold">{user?.email || 'finance@test.com'}</span>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-semibold">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Employee ID</span>
            <strong className="text-slate-850 font-bold mt-0.5 block">E-9042-FIN</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Assigned Role</span>
            <strong className="text-slate-850 font-bold mt-0.5 block">{user?.role || 'Finance'}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Department</span>
            <strong className="text-slate-850 font-bold mt-0.5 block">Accounts & Treasury</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Phone Number</span>
            <strong className="text-slate-850 font-bold mt-0.5 block">+1 (555) 902-4210</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Last Login Session</span>
            <strong className="text-slate-850 font-bold mt-0.5 block">{new Date().toDateString()}</strong>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all"
          >
            Sign Out Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceProfile;
