import React from 'react';
import { Outlet } from 'react-router-dom';
import ManagerNavbar from './ManagerNavbar.jsx';
import ManagerSidebar from './ManagerSidebar.jsx';

export const ManagerLayout = () => {
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
      <ManagerNavbar />
      <div className="flex-1 flex overflow-hidden">
        <ManagerSidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 h-full bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
