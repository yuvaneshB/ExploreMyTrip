import React, { useState } from 'react';
import { Send, CheckCircle2, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';

const HomeNewsletter = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      toast.error('Please enter a valid email address.');
      return;
    }
    
    if (!user) {
      toast.error('Please log in to subscribe to our newsletter.');
      return;
    }

    if (user.role !== 'Customer') {
      toast.error('Only Customer accounts are eligible for this newsletter coupon offer.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/newsletter/subscribe', { email });
      if (res.data.success) {
        setSubscribed(true);
        toast.success(res.data.message || 'Subscribed successfully!');
        setEmail('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to subscribe to the newsletter.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 font-sans">
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white rounded-[2.5rem] p-8 md:p-14 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 border border-white/5">
        {/* Background shapes */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/5 rounded-full translate-x-20 -translate-y-20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/5 rounded-full -translate-x-20 translate-y-20 blur-3xl pointer-events-none" />

        <div className="text-left space-y-4 max-w-xl z-10">
          <span className="inline-flex items-center gap-1.5 bg-white/10 px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-white/5">
            <Send className="w-3.5 h-3.5 text-gold-400" /> Travel Vitals letter
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Subscribe & Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-blue-100 to-blue-400 font-black">Exclusive Travel Insights</span>
          </h2>
          <p className="text-xs text-white/60 leading-relaxed font-semibold">
            Join 12,000+ adventurers who receive our weekly travel guides, flight alerts, and secret promo code launches directly in their inbox.
          </p>
        </div>

        <div className="w-full lg:w-auto min-w-[280px] md:min-w-[420px] z-10 shrink-0">
          {subscribed ? (
            <div className="bg-emerald-550/10 border border-emerald-500/20 p-6 rounded-3xl flex items-center gap-3 text-emerald-400 text-xs font-semibold leading-relaxed">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <strong className="block text-white">Subscription Confirmed!</strong>
                Check your inbox shortly for your first exclusive destination voucher.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="bg-white/10 border border-white/10 p-2 rounded-2xl md:rounded-[1.3rem] flex flex-col sm:flex-row gap-2 transition-all focus-within:border-gold-500/40">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your business email address..."
                className="bg-transparent border-none text-white focus:outline-none placeholder-white/40 text-xs font-semibold px-4 py-3 w-full"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold px-6 py-3 rounded-xl md:rounded-[0.9rem] text-xs transition-all shrink-0 hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : 'Subscribe'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default HomeNewsletter;
