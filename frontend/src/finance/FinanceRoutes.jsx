import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import FinanceLayout from './FinanceLayout.jsx';
import FinanceDashboard from './FinanceDashboard.jsx';
import PaymentsPage from './PaymentsPage.jsx';
import TransactionsPage from './TransactionsPage.jsx';
import InvoicesPage from './InvoicesPage.jsx';
import RefundManagement from './RefundManagement.jsx';
import RevenueAnalytics from './RevenueAnalytics.jsx';
import FinancialReports from './FinancialReports.jsx';
import FinanceProfile from './FinanceProfile.jsx';

export const FinanceRoutes = () => {
  return (
    <Routes>
      <Route element={<FinanceLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<FinanceDashboard />} />
        <Route path="dashboard/payments" element={<PaymentsPage />} />
        <Route path="dashboard/transactions" element={<TransactionsPage />} />
        <Route path="dashboard/invoices" element={<InvoicesPage />} />
        <Route path="dashboard/refunds" element={<RefundManagement />} />
        <Route path="dashboard/analytics" element={<RevenueAnalytics />} />
        <Route path="dashboard/reports" element={<FinancialReports />} />
        <Route path="dashboard/profile" element={<FinanceProfile />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default FinanceRoutes;
