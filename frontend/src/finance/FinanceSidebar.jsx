import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  DollarSign, FileText, List, AlertCircle, BarChart3, User, LogOut, TrendingUp
} from 'lucide-react';

export const FinanceSidebar = () => {
  const { logout } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/finance/dashboard', icon: BarChart3, end: true },
    { name: 'Payments', path: '/finance/dashboard/payments', icon: DollarSign },
    { name: 'Transactions', path: '/finance/dashboard/transactions', icon: List },
    { name: 'Revenue', path: '/finance/dashboard/analytics', icon: TrendingUp },
    { name: 'Invoices', path: '/finance/dashboard/invoices', icon: FileText },
    { name: 'Refund Requests', path: '/finance/dashboard/refunds', icon: AlertCircle },
    { name: 'Financial Reports', path: '/finance/dashboard/reports', icon: FileText },
    { name: 'Profile', path: '/finance/dashboard/profile', icon: User },
    { name: 'Logout', onClick: logout, icon: LogOut }
  ];

  return (
    <div className="w-full md:w-64 shrink-0 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 font-sans md:h-full md:overflow-y-auto">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Finance Portal
        </h3>
        <p className="text-sm font-semibold text-gold-600">Finance Manager</p>
      </div>

      <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
        {links.map((link) => {
          const Icon = link.icon;
          if (link.onClick) {
            return (
              <button
                key={link.name}
                onClick={link.onClick}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-slate-650 hover:bg-slate-50 hover:text-slate-900 cursor-pointer w-full text-left bg-transparent border-none"
              >
                <Icon className="w-4 h-4 text-rose-500" />
                <span className="text-rose-600 font-semibold">{link.name}</span>
              </button>
            );
          }
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 shrink-0 ${
                  isActive 
                    ? 'bg-gold-500 text-white font-semibold shadow-lg shadow-gold-500/20' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default FinanceSidebar;
