'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { User, LogIn, Bell, Search, Settings, AlertCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  
  const [summary, setSummary] = useState<any>(null);
  const [topAlerts, setTopAlerts] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const [sumRes, alertsRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/alerts/summary'),
          fetch('http://127.0.0.1:8000/api/alerts/')
        ]);
        const sumData = await sumRes.json();
        const alertsData = await alertsRes.json();
        setSummary(sumData);
        setTopAlerts(alertsData.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch nav alerts", err);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        {/* Breadcrumb or Search placeholder if needed */}
        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search analytics, regions, or alerts..." 
            className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#0d9488]/20 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 text-slate-400 hover:text-[#0d9488] transition-colors"
          >
            <Bell className="w-5 h-5" />
            {summary?.total_active_alerts > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white text-[8px] font-bold text-white items-center justify-center">
                  {summary.total_active_alerts}
                </span>
              </span>
            )}
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-[320px] bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 overflow-hidden"
              >
                <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">Recent Alerts</h4>
                  <Link href="/alerts" onClick={() => setShowDropdown(false)} className="text-[10px] font-black text-[#0d9488] uppercase tracking-wider hover:underline">View All</Link>
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  {topAlerts.length > 0 ? topAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-1.5 rounded-lg ${alert.severity === 'critical' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                          <AlertCircle className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight mb-1">{alert.message}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                             <MapPin className="w-3 h-3" />
                             {alert.city} • Just now
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-slate-400 text-xs italic">No active alerts.</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#1a2e2b]">{session?.user?.name || 'Researcher'}</p>
                <p className="text-[0.65rem] font-black text-[#0d9488] uppercase tracking-wider">Authorized Personnel</p>
              </div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 rounded-xl bg-[#0d9488]/10 flex items-center justify-center border border-[#0d9488]/20"
              >
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Avatar" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <User className="w-5 h-5 text-[#0d9488]" />
                )}
              </motion.div>
            </div>
          ) : (
            <Button 
              onClick={() => signIn()}
              className="rounded-xl bg-[#1a2e2b] hover:bg-black text-white px-6 font-bold text-sm flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
