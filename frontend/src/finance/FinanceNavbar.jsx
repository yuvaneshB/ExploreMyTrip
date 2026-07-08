import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Compass, User as UserIcon, LogOut } from 'lucide-react';

import logo from '../assets/logo.png';

export const FinanceNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-50 shrink-0">
      {/* Brand Logo */}
      <Link to="/finance/dashboard" className="flex items-center">
        <img src={logo} alt="ExploreMyTrip" className="h-9 w-auto" />
      </Link>

      {/* Action Controls */}
      <div className="flex items-center gap-6">
        {/* User Account Dropdown */}
        <div className="relative">
          <button 
            onClick={() => { setShowProfileDropdown(!showProfileDropdown); }}
            className="flex items-center gap-2 border border-slate-200 bg-white px-3.5 py-1.5 rounded-full hover:border-gold-500 hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-600 font-bold text-xs">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-bold text-slate-700 hidden sm:inline">{user?.name}</span>
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 flex flex-col gap-3.5 z-50 animate-dropdown">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-600 font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <strong className="text-sm text-slate-800 block truncate font-bold">{user?.name}</strong>
                  <span className="text-[10px] text-slate-500 block truncate">{user?.email}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1 border-t border-slate-100 pt-3">
                <Link 
                  to="/finance/dashboard/profile" 
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 text-slate-750 font-medium text-xs border border-transparent hover:border-slate-150 hover:shadow-sm"
                >
                  <UserIcon className="w-4 h-4 text-gold-600" />
                  <span>Audit Settings</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-all duration-200 text-left w-full font-semibold text-xs border border-transparent hover:border-rose-100 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out Portal</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default FinanceNavbar;
