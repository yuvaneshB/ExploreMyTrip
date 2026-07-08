import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { Toaster } from 'react-hot-toast';
import FinanceRoutes from './finance/FinanceRoutes.jsx';
import ManagerRoutes from './manager/ManagerRoutes.jsx';

// Layout components
import Navbar from './components/Navbar.jsx';
import Chatbot from './components/Chatbot.jsx';


// Pages
import LandingPage from './pages/LandingPage.jsx';
import TourListingPage from './pages/TourListingPage.jsx';
import TourDetailPage from './pages/TourDetailPage.jsx';
import BookingCheckoutPage from './pages/BookingCheckoutPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import DiscoverPage from './pages/DiscoverPage.jsx';
import DestinationDetailPage from './pages/DestinationDetailPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import BookingDetailsPage from './pages/BookingDetailsPage.jsx';
import DocumentDownloadPage from './pages/DocumentDownloadPage.jsx';



// Auth Pages
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import VerifyOTPPage from './pages/VerifyOTPPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';

// Dashboards
import CustomerDashboard from './dashboards/CustomerDashboard.jsx';
import AgentDashboard from './dashboards/AgentDashboard.jsx';
import ManagerDashboard from './dashboards/ManagerDashboard.jsx';
import FinanceDashboard from './dashboards/FinanceDashboard.jsx';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center py-20">Authenticating...</div>;
  if (!user) return <Navigate to="/login" replace />;



  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'Finance') {
      return <Navigate to="/finance/dashboard" replace />;
    }
    if (user.role === 'Manager') {
      return <Navigate to="/manager/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

function MainWebsiteLayout() {
  const location = useLocation();
  const isAgentRoute = location.pathname.startsWith('/dashboard/agent');
  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col justify-between">
      <Navbar />
      {!isAgentRoute && <Chatbot />}
      <div className="flex-1">
        <Outlet />
      </div>
      <footer className="border-t border-slate-200 bg-slate-50 py-6 text-center text-xs text-slate-500 font-sans">
        &copy; {new Date().getFullYear()} ExploreMyTrip. All rights reserved. Your journey starts here.
      </footer>
    </div>
  );
}

function StandaloneLayout() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 flex flex-col">
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

function MainApp() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthRoute = ['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'].includes(location.pathname);

  useEffect(() => {
    if (user && user.role === 'Finance' && !location.pathname.startsWith('/finance') && !isAuthRoute) {
      navigate('/finance/dashboard', { replace: true });
    }
    if (user && user.role === 'Manager' && !location.pathname.startsWith('/manager') && !isAuthRoute) {
      navigate('/manager/dashboard', { replace: true });
    }
  }, [user, location.pathname, isAuthRoute, navigate]);

  return (
    <>
      <Routes>
        {/* Main Website Layout Wrapped Routes */}
        <Route element={<MainWebsiteLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/tours" element={<TourListingPage />} />
          <Route path="/tours/:slug" element={<TourDetailPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/destinations/details" element={<DestinationDetailPage />} />
          
          {/* Protected Client Actions */}
          <Route 
            path="/wishlist" 
            element={
              <ProtectedRoute allowedRoles={['Customer', 'Agent', 'Manager', 'Finance']}>
                <WishlistPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bookings" 
            element={
              <ProtectedRoute allowedRoles={['Customer', 'Agent', 'Manager', 'Finance']}>
                <MyBookingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bookings/:id" 
            element={
              <ProtectedRoute allowedRoles={['Customer', 'Agent', 'Manager', 'Finance']}>
                <BookingDetailsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute allowedRoles={['Customer']}>
                <BookingCheckoutPage />
              </ProtectedRoute>
            } 
          />

          {/* Protected Role-Based Dashboards */}
          <Route 
            path="/dashboard/customer/*" 
            element={
              <ProtectedRoute allowedRoles={['Customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/agent/*" 
            element={
              <ProtectedRoute allowedRoles={['Agent']}>
                <AgentDashboard />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Standalone Layout Wrapped Routes */}
        <Route element={<StandaloneLayout />}>
          <Route path="/documents/:secureToken" element={<DocumentDownloadPage />} />


          
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route 
            path="/dashboard/manager/*" 
            element={<Navigate to="/manager/dashboard" replace />} 
          />
          <Route 
            path="/manager/*" 
            element={
              <ProtectedRoute allowedRoles={['Manager']}>
                <ManagerRoutes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/finance/*" 
            element={<Navigate to="/finance/dashboard" replace />} 
          />
          <Route 
            path="/finance/*" 
            element={
              <ProtectedRoute allowedRoles={['Finance']}>
                <FinanceRoutes />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }
        }}
      />
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <WishlistProvider>
          <MainApp />
        </WishlistProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
