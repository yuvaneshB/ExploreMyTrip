import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Briefcase, User, FileText, DollarSign, List, Shield, 
  MapPin, Calendar, Heart, MessageSquare, AlertCircle, BarChart3, LogOut 
} from 'lucide-react';

const Sidebar = ({ role }) => {
  const { logout } = useAuth();

  const getLinks = () => {
    switch (role) {
      case 'Customer':
        return [
          { name: 'My Trips & Bookings', path: '/dashboard/customer', icon: Briefcase },
          { name: 'My Profile & Passports', path: '/dashboard/customer/profile', icon: User },
          { name: 'My Wishlist', path: '/wishlist', icon: Heart },
          { name: 'Refund Inquiries', path: '/dashboard/customer/refunds', icon: AlertCircle }
        ];
      case 'Agent':
        return [
          { name: 'Tours Workspace', path: '/dashboard/agent', icon: List },
          { name: 'Create New Tour', path: '/dashboard/agent/create-tour', icon: Calendar },
          { name: 'My Tour Bookings', path: '/dashboard/agent/bookings', icon: Briefcase },
          { name: 'Locations Setup', path: '/dashboard/agent/locations', icon: MapPin },
          { name: 'Review Replies', path: '/dashboard/agent/reviews', icon: MessageSquare }
        ];
      case 'Manager':
        return [
          { name: 'KPIs Analytics', path: '/dashboard/manager', icon: BarChart3 },
          { name: 'Staff Control', path: '/dashboard/manager/staff', icon: Shield },
          { name: 'Moderate Reviews', path: '/dashboard/manager/reviews', icon: MessageSquare },
          { name: 'Refund Approvals', path: '/dashboard/manager/refunds', icon: AlertCircle }
        ];
      case 'Finance':
        return [
          { name: 'Finance Dashboard', path: '/finance/dashboard', icon: BarChart3 },
          { name: 'Payments', path: '/finance/dashboard/payments', icon: DollarSign },
          { name: 'Transactions', path: '/finance/dashboard/transactions', icon: List },
          { name: 'Invoices', path: '/finance/dashboard/invoices', icon: FileText },
          { name: 'Refunds', path: '/finance/dashboard/refunds', icon: AlertCircle },
          { name: 'Reports', path: '/finance/dashboard/reports', icon: FileText },
          { name: 'Revenue Analytics', path: '/finance/dashboard/analytics', icon: BarChart3 },
          { name: 'Profile', path: '/finance/dashboard/profile', icon: User },
          { name: 'Logout', onClick: logout, icon: LogOut }
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <div className="w-full md:w-64 shrink-0 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 font-sans md:sticky md:top-0 md:h-screen md:overflow-y-auto">
      <div className="hidden md:block">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Control Panel
        </h3>
        <p className="text-sm font-semibold text-gold-600">{role} Workspace</p>
      </div>

      <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
        {links.map((link) => {
          const Icon = link.icon;
          if (link.onClick) {
            return (
              <button
                key={link.name}
                onClick={link.onClick}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-slate-650 hover:bg-slate-50 hover:text-slate-900 cursor-pointer w-full text-left"
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
              end
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

export default Sidebar;
