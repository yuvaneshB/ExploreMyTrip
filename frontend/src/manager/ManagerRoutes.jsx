import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ManagerLayout from './ManagerLayout.jsx';
import ManagerDashboard from './ManagerDashboard.jsx';
import TourManagement from './TourManagement.jsx';
import BookingManagement from './BookingManagement.jsx';
import CustomerRequests from './CustomerRequests.jsx';
import ReviewManagement from './ReviewManagement.jsx';
import Reports from './Reports.jsx';
import ManagerProfile from './ManagerProfile.jsx';

export const ManagerRoutes = () => {
  return (
    <Routes>
      <Route element={<ManagerLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="dashboard/tours" element={<TourManagement />} />
        <Route path="dashboard/bookings" element={<BookingManagement />} />
        <Route path="dashboard/requests" element={<CustomerRequests />} />
        <Route path="dashboard/reviews" element={<ReviewManagement />} />
        <Route path="dashboard/reports" element={<Reports />} />
        <Route path="dashboard/profile" element={<ManagerProfile />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default ManagerRoutes;
