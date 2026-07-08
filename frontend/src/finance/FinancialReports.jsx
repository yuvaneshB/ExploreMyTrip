import React from 'react';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export const FinancialReports = () => {
  const handleExportExcel = async () => {
    try {
      const res = await api.get('/reports/finance/export');
      if (res.data.success) {
        toast.success('Spreadsheet compiled successfully!');
        window.open(`https://exploremytrip.onrender.com${res.data.downloadUrl}`);
      }
    } catch (err) {
      toast.error('Failed to export revenue sheet');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-800 font-sans font-sans">Financial Reports</h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold font-sans font-sans font-sans">Generate and download official financial spreadsheets and tax reports</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm text-left">
        <h3 className="font-extrabold text-slate-800 text-sm">Download Financial Ledgers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="border border-slate-150 p-5 rounded-2xl flex flex-col justify-between items-start gap-4">
            <div>
              <strong className="text-slate-850 font-bold text-sm block">Revenue report sheet (xlsx)</strong>
              <p className="text-slate-400 text-xs mt-1">Contains all detailed payments logs, corresponding VAT portions, and checkouts data.</p>
            </div>
            <button
              onClick={handleExportExcel}
              className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-bold transition-all shadow-md shadow-gold-500/10 cursor-pointer border-none"
            >
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;
