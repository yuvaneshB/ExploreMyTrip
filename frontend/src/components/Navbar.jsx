import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../hooks/useWishlist.js';
import { 
  Menu, X, Compass, User as UserIcon, LogOut, 
  LayoutDashboard, Heart, ChevronDown, Briefcase 
} from 'lucide-react';

import logo from '../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { wishlistCounter } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'Customer': return '/dashboard/customer';
      case 'Agent': return '/dashboard/agent';
      case 'Manager': return '/manager/dashboard';
      case 'Finance': return '/finance/dashboard';
      default: return '/';
    }
  };

  const isTabActive = (item) => {
    switch (item) {
      case 'home':
        return pathname === '/';
      case 'tours':
        return pathname.startsWith('/tours');
      case 'wishlist':
        return pathname === '/wishlist';
      case 'bookings':
        return pathname.startsWith('/bookings');
      case 'agent':
        return pathname.startsWith('/dashboard/agent');
      default:
        return false;
    }
  };

  const getLinkClass = (tab) => {
    const isActive = isTabActive(tab);
    return `flex items-center gap-1.5 font-medium transition-all duration-200 ${
      isActive 
        ? 'text-blue-600' 
        : 'text-slate-650 hover:text-blue-600'
    }`;
  };

  const getMobileLinkClass = (tab) => {
    const isActive = isTabActive(tab);
    return `py-2 transition-colors duration-200 ${
      isActive ? 'text-blue-600 font-bold border-l-2 border-blue-600 pl-2' : 'text-slate-600 hover:text-blue-600'
    }`;
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="ExploreMyTrip" className="h-9 w-auto" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
          <Link to="/" className={getLinkClass('home')}>Home</Link>
          <Link to="/tours" className={getLinkClass('tours')}>Explore Tours</Link>
          
          {user && user.role === 'Agent' && (
            <Link to="/dashboard/agent" className={getLinkClass('agent')}>Agent Dashboard</Link>
          )}

          <Link to="/wishlist" className={getLinkClass('wishlist')}>
            <Heart className={`w-4 h-4 transition-colors ${isTabActive('wishlist') ? 'text-blue-600 fill-blue-600' : 'text-rose-500 fill-current'}`} /> Wishlist
            {wishlistCounter > 0 && (
              <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center">
                {wishlistCounter}
              </span>
            )}
          </Link>

          {user && (
            <Link to="/bookings" className={getLinkClass('bookings')}>
              <Briefcase className={`w-4 h-4 transition-colors ${isTabActive('bookings') ? 'text-blue-600' : 'text-gold-500'}`} /> My Bookings
            </Link>
          )}
        </div>

        {/* User Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 rounded-full shadow-sm shadow-blue-500/15 hover:shadow-md hover:shadow-blue-500/30 transition-all duration-200"
              >
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <UserIcon className="w-4 h-4 text-gold-500" />
                )}
                <span className="text-sm font-sans text-slate-700">{user.name}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 flex flex-col gap-3.5 z-50 animate-dropdown">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-slate-150" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-600 font-bold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <strong className="text-sm text-slate-800 block truncate font-semibold">{user.name}</strong>
                      <span className="text-[10px] text-slate-500 block truncate">{user.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 text-left">
                    <span className="text-[9px] uppercase font-bold text-slate-400 px-3">Role privileges</span>
                    <div className="mx-2 px-3 py-1.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between text-xs text-slate-700">
                      <span>Access Level</span>
                      <strong className="text-gold-600 font-bold text-[10px] uppercase tracking-wider">{user.role}</strong>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 border-t border-slate-100 pt-3">
                    {user.role !== 'Agent' && (
                      <Link 
                        to={getDashboardLink()} 
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 text-slate-700 font-medium text-xs border border-transparent hover:border-slate-150 hover:shadow-sm"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gold-600" />
                        <span>Access Dashboard</span>
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-all duration-200 text-left w-full font-semibold text-xs border border-transparent hover:border-rose-100"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-5 py-2 text-slate-600 hover:text-gold-500 transition-colors">Login</Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-6 py-2 rounded-full font-semibold shadow-lg shadow-gold-500/25 transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden text-slate-700" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-slate-200 flex flex-col gap-4">
          <Link to="/" onClick={() => setIsOpen(false)} className={getMobileLinkClass('home')}>Home</Link>
          <Link to="/tours" onClick={() => setIsOpen(false)} className={getMobileLinkClass('tours')}>Explore Tours</Link>
          
          {user && user.role === 'Agent' && (
            <Link to="/dashboard/agent" onClick={() => setIsOpen(false)} className={getMobileLinkClass('agent')}>Agent Dashboard</Link>
          )}

          <Link to="/wishlist" onClick={() => setIsOpen(false)} className={`${getMobileLinkClass('wishlist')} flex items-center justify-between`}>
            <span>Wishlist</span>
            {wishlistCounter > 0 && (
              <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full min-w-4 text-center">
                {wishlistCounter}
              </span>
            )}
          </Link>

          {user && (
            <Link to="/bookings" onClick={() => setIsOpen(false)} className={`${getMobileLinkClass('bookings')} flex items-center gap-2`}>
              <Briefcase className={`w-4.5 h-4.5 ${isTabActive('bookings') ? 'text-blue-600' : 'text-gold-500'}`} />
              <span>My Bookings</span>
            </Link>
          )}
          {user ? (
            <>
              {user.role !== 'Agent' && (
                <Link to={getDashboardLink()} onClick={() => setIsOpen(false)} className="py-2 text-gold-500 font-semibold">My Dashboard</Link>
              )}
              <button 
                onClick={handleLogout} 
                className="py-2 text-left text-rose-500 hover:text-rose-600 border-t border-slate-200 mt-2"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
              <Link to="/login" onClick={() => setIsOpen(false)} className="py-2 text-center text-slate-600 hover:text-gold-500">Login</Link>
              <Link 
                to="/register" 
                onClick={() => setIsOpen(false)} 
                className="bg-gold-500 text-white py-3 rounded-xl text-center font-bold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
