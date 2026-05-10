'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Activity, 
  Map, 
  BarChart3, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { signOut } from "next-auth/react";
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
  { name: 'Risk Zones', path: '/risk-zones', icon: Map },
  { name: 'Statistics', path: '/stats', icon: Activity },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-white border-r border-slate-100 flex flex-col z-50">
      {/* Logo Section */}
      <div className="p-7 mb-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-[#0d9488] rounded-xl flex items-center justify-center shadow-lg shadow-[#0d9488]/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-[1.1rem] font-bold text-[#1a2e2b] leading-tight tracking-tight">OutbreakIQ</h1>
            <p className="text-[0.6rem] font-black text-[#0d9488] uppercase tracking-[0.2em] opacity-80">Surveillance</p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5">
        {navItems.map((item, index) => {
          const isActive = pathname === item.path;
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-[0.9rem] font-bold transition-all duration-300 group",
                  isActive 
                    ? "bg-[#0d9488] text-white shadow-md shadow-[#0d9488]/20" 
                    : "text-slate-500 hover:bg-[#ccece9] hover:text-[#0d9488]"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-[#0d9488]"
                )} />
                {item.name}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 mt-auto space-y-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[#f0faf9] border border-[#0d9488]/10 rounded-2xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <span className="text-[0.7rem] font-black text-[#1a2e2b] uppercase tracking-wider">System Operational</span>
          </div>
          <p className="text-[0.75rem] text-slate-500 font-medium leading-relaxed">
            All nodes active. Live surveillance data synchronizing.
          </p>
        </motion.div>

        <button 
          onClick={() => signOut({callbackUrl: '/login'})}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-[0.9rem] font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
