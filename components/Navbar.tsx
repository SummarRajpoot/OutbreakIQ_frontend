'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { User, LogIn, Bell, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

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
        <button className="relative p-2 text-slate-400 hover:text-[#0d9488] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </button>

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
