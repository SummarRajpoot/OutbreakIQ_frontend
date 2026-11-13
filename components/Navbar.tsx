'use client';

import { useSession, signIn } from "next-auth/react";
import { User, LogIn, Bell, Search, AlertCircle, MapPin, Menu, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { fetchAlerts, fetchAlertsSummary, type Alert, type AlertSummary } from '@/lib/api';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  
  const [summary, setSummary] = useState<AlertSummary | null>(null);
  const [topAlerts, setTopAlerts] = useState<Alert[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync mobile drawer state from Sidebar
  useEffect(() => {
    const handleSidebarState = (e: Event) => {
      const customEvent = e as CustomEvent<{ open: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.open === 'boolean') {
        setIsMobileMenuOpen(customEvent.detail.open);
      }
    };
    window.addEventListener('episphere:sidebar-state', handleSidebarState);
    return () => window.removeEventListener('episphere:sidebar-state', handleSidebarState);
  }, []);

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Load real-time alerts summary and top alerts
  useEffect(() => {
    let isMounted = true;
    const loadNavAlerts = async () => {
      try {
        const [sumData, alertsData] = await Promise.all([
          fetchAlertsSummary(),
          fetchAlerts(),
        ]);
        if (isMounted) {
          setSummary(sumData);
          setTopAlerts(Array.isArray(alertsData) ? alertsData.slice(0, 5) : []);
        }
      } catch (err) {
        console.error("Failed to fetch nav alerts", err);
      }
    };
    loadNavAlerts();
    const interval = setInterval(loadNavAlerts, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="h-16 sm:h-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 transition-all">
      {/* Left Area: Mobile Hamburger + Brand / Desktop Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Mobile Hamburger Button */}
        {isLoggedIn && (
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('episphere:toggle-sidebar'));
            }}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-800" />
            ) : (
              <Menu className="w-5 h-5 text-slate-800" />
            )}
          </button>
        )}

        {/* Mobile Brand Identifier (visible only on mobile) */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0D9488] to-[#0EA5E9] flex items-center justify-center text-white shadow-sm shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-[#0B132B]">EpiSphere</span>
        </div>

        {/* Desktop / Tablet Search Input */}
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search global intelligence, regions, or alerts..." 
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all outline-none"
          />
        </div>
      </div>

      {/* Right Area: Alerts & User Profile */}
      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
        {/* Alerts Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button 
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-label="View alerts and notifications"
            aria-expanded={showDropdown}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]"
          >
            <Bell className="w-5 h-5" />
            {summary && summary.total_active_alerts > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#E11D48] text-[9px] font-bold text-white items-center justify-center shadow-sm">
                  {summary.total_active_alerts > 99 ? '99+' : summary.total_active_alerts}
                </span>
              </span>
            )}
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-[300px] sm:w-[340px] bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden z-50"
              >
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">Active Intelligence Alerts</h4>
                    {summary && summary.total_active_alerts > 0 && (
                      <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {summary.total_active_alerts}
                      </span>
                    )}
                  </div>
                  <Link 
                    href="/alerts" 
                    onClick={() => setShowDropdown(false)} 
                    className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
                  {topAlerts.length > 0 ? topAlerts.map((alert) => (
                    <div key={alert.id} className="p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-2.5">
                        <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                          alert.severity === 'critical' 
                            ? 'bg-rose-50 text-rose-600 border border-rose-200/60' 
                            : 'bg-amber-50 text-amber-600 border border-amber-200/60'
                        }`}>
                          <AlertCircle className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2 mb-1">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {alert.city}
                            </span>
                            <span>•</span>
                            <span>Active Cases: {alert.active_cases.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No active alerts. Surveillance network stable.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile / Authentication Section */}
        <div className="flex items-center gap-3 pl-3 sm:pl-5 border-l border-slate-200">
          {isLoggedIn ? (
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-xs sm:text-sm font-bold text-[#0B132B] leading-tight">
                  {session?.user?.name || 'Authorized Researcher'}
                </p>
                <p className="text-[0.62rem] font-bold text-[#0D9488] uppercase tracking-wider">
                  Health Intelligence
                </p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0D9488]/10 border border-[#0D9488]/20 flex items-center justify-center shrink-0 overflow-hidden">
                {session?.user?.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || "User Avatar"} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D9488]" />
                )}
              </div>
            </div>
          ) : (
            <Button 
              onClick={() => signIn()}
              className="rounded-xl bg-[#0B132B] hover:bg-[#0F172A] text-white px-4 sm:px-5 py-2 font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Sign In</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
