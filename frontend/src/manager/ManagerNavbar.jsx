import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Compass, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';

import logo from '../assets/logo.png';

export const ManagerNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-50 shrink-0 shadow-sm">
      {/* Brand Logo */}
      <Link to="/manager/dashboard" className="flex flex-col items-start">
        <img src={logo} alt="ExploreMyTrip" className="h-9 w-auto" />
        <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase block mt-0.5 pl-12">
          Manager Portal
        </span>
      </Link>

      {/* Profile Section */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setShowProfileDropdown(v => !v)}
          className="flex items-center gap-2.5 border border-slate-200 bg-white px-3.5 py-2 rounded-full hover:border-amber-400 hover:shadow-md transition-all duration-200 cursor-pointer"
          aria-label="Open profile menu"
        >
          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-xs font-bold text-slate-700 leading-none">{user?.name}</span>
            <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Operations Manager</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showProfileDropdown && (
          <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 z-50 animate-dropdown">
            {/* User info header */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <strong className="text-sm text-slate-800 block truncate font-bold">{user?.name}</strong>
                <span className="text-[10px] text-slate-400 block truncate font-semibold">{user?.email}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1">
              <Link
                to="/manager/dashboard/profile"
                onClick={() => setShowProfileDropdown(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all text-slate-700 font-semibold text-xs border border-transparent hover:border-slate-100"
              >
                <UserIcon className="w-4 h-4 text-amber-500" />
                <span>My Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-all text-left w-full font-semibold text-xs border border-transparent hover:border-rose-100 cursor-pointer bg-transparent"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out Portal</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default ManagerNavbar;
