'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BarChart3, 
  Map, 
  Activity, 
  Hospital, 
  Bell, 
  Settings, 
  LogOut,
  ShieldCheck,
  X
} from 'lucide-react';
import { signOut } from "next-auth/react";
import { cn } from '@/lib/utils';
import { fetchAlertsSummary } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';

const navItems = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
  { name: 'Risk Zones', path: '/risk-zones', icon: Map },
  { name: 'Statistics', path: '/stats', icon: Activity },
  { name: 'Hospitals', path: '/hospitals', icon: Hospital },
  { name: 'Alerts', path: '/alerts', icon: Bell },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [hasCritical, setHasCritical] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Synchronize mobile open/close state with Navbar hamburger control
  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('episphere:sidebar-state', { detail: { open: false } }));
    }
  }, []);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('episphere:sidebar-state', { detail: { open: next } }));
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const handleToggle = () => toggleMobile();
    const handleClose = () => closeMobile();
    const handlePopState = () => closeMobile();

    window.addEventListener('episphere:toggle-sidebar', handleToggle);
    window.addEventListener('episphere:close-sidebar', handleClose);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('episphere:toggle-sidebar', handleToggle);
      window.removeEventListener('episphere:close-sidebar', handleClose);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [toggleMobile, closeMobile]);

  // Support Escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeMobile]);

  // Prevent background body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  // Fetch real-time alerts summary for badge notification
  useEffect(() => {
    let isMounted = true;
    const checkAlerts = async () => {
      try {
        const data = await fetchAlertsSummary();
        if (isMounted && data?.counts) {
          setHasCritical(data.counts.critical > 0);
        }
      } catch (err) {
        console.error("Sidebar alerts check failed", err);
      }
    };
    checkAlerts();
    const interval = setInterval(checkAlerts, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Shared navigation link renderer
  const renderNavItems = (onItemClick?: () => void) => (
    <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[0.875rem] font-medium transition-all duration-200 group relative outline-none",
              "focus-visible:ring-2 focus-visible:ring-[#0EA5E9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B132B]",
              isActive 
                ? "bg-gradient-to-r from-[#0EA5E9]/20 via-[#0D9488]/15 to-transparent text-white font-semibold shadow-sm border-l-[3px] border-[#0EA5E9]" 
                : "text-slate-300 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent"
            )}
          >
            <item.icon className={cn(
              "w-4 h-4 shrink-0 transition-colors duration-200",
              isActive ? "text-[#38BDF8]" : "text-slate-400 group-hover:text-slate-200"
            )} />
            <span className="truncate">{item.name}</span>
            {item.name === 'Alerts' && hasCritical && (
              <span 
                className="ml-auto w-2 h-2 bg-[#E11D48] rounded-full shadow-[0_0_8px_rgba(225,29,72,0.8)] animate-pulse" 
                aria-label="Critical alert pending"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );

  // Shared operational status & sign-out footer
  const renderFooter = () => (
    <div className="p-3.5 mt-auto space-y-3 border-t border-slate-800/60 bg-[#0B132B]/80">
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-3">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </div>
          <span className="text-[0.68rem] font-bold text-slate-200 uppercase tracking-wider">
            System Operational
          </span>
        </div>
        <p className="text-[0.72rem] text-slate-400 font-normal leading-relaxed">
          Nodes active. Live data synchronizing.
        </p>
      </div>

      <button 
        type="button"
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="flex items-center gap-3 px-3.5 py-2 w-full rounded-xl text-[0.85rem] font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
      >
        <LogOut className="w-4 h-4 shrink-0 group-hover:rotate-12 transition-transform duration-200" />
        <span>Sign Out</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar (w-240px) */}
      <aside 
        aria-label="Desktop primary navigation"
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-[240px] bg-[#0B132B] border-r border-slate-800/80 z-40 select-none"
      >
        {/* Brand Header */}
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#0D9488] to-[#0EA5E9] rounded-xl flex items-center justify-center shadow-md shadow-[#0D9488]/20 text-white shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold text-white leading-tight tracking-tight">EpiSphere</h1>
              <p className="text-[0.58rem] font-bold text-[#38BDF8] uppercase tracking-[0.04em] leading-tight mt-0.5 whitespace-nowrap">
                Global Health Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        {renderNavItems()}

        {/* Footer */}
        {renderFooter()}
      </aside>

      {/* Mobile Slide-Over Drawer & Backdrop Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true" aria-label="Mobile navigation menu">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobile}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Slide-over Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-[260px] max-w-[85vw] h-full bg-[#0B132B] border-r border-slate-800 flex flex-col z-10 shadow-2xl"
            >
              {/* Mobile Drawer Header with Close Button */}
              <div className="p-4 flex items-center justify-between border-b border-slate-800/80">
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#0D9488] to-[#0EA5E9] rounded-lg flex items-center justify-center text-white shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-bold text-white block leading-tight">EpiSphere</span>
                    <span className="text-[0.58rem] font-bold text-[#38BDF8] uppercase tracking-[0.04em] block leading-tight mt-0.5 whitespace-nowrap">
                      Global Health Intelligence
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeMobile}
                  aria-label="Close navigation menu"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              {renderNavItems(closeMobile)}

              {/* Mobile Footer */}
              {renderFooter()}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
