import React from 'react';
import { Outlet } from 'react-router-dom';
import FinanceNavbar from './FinanceNavbar.jsx';
import FinanceSidebar from './FinanceSidebar.jsx';

export const FinanceLayout = () => {
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
      <FinanceNavbar />
      <div className="flex-1 flex overflow-hidden">
        <FinanceSidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 h-full bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FinanceLayout;
