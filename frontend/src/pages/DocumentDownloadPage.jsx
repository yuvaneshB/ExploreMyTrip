import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getBackendUrl } from '../services/api';
import { Loader2, AlertCircle } from 'lucide-react';

const DocumentDownloadPage = () => {
  const { secureToken } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'eticket';
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!secureToken) {
      setError('Invalid or missing document access token.');
      return;
    }

    try {
      const backendUrl = getBackendUrl();
      // Redirect window directly to backend document stream
      window.location.href = `${backendUrl}/api/v1/bookings/documents/download/${secureToken}`;
    } catch (err) {
      setError('An error occurred while preparing your download.');
    }
  }, [secureToken, type]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-md text-center space-y-6">
        {error ? (
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="w-16 h-16 text-rose-500" />
            <h1 className="text-xl font-bold text-slate-800">Download Failed</h1>
            <p className="text-sm text-slate-500">{error}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
            <h1 className="text-xl font-bold text-slate-800">Retrieving Document</h1>
            <p className="text-sm text-slate-500">
              Please wait while we secure and prepare your {type === 'eticket' ? 'E-Ticket' : 'Itinerary'} PDF.
            </p>
            <div className="text-xs text-slate-400">
              If your download doesn't start automatically, please refresh the page.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentDownloadPage;
