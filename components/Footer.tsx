import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="ml-0 border-t border-slate-100 bg-white px-8 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">

        {/* Left — Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0d9488]">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">OutbreakIQ</p>
            <p className="text-xs text-slate-400">Epidemiological Surveillance Platform</p>
          </div>
        </div>

        {/* Center — Stack info */}
        <div className="flex items-center gap-6 text-xs text-slate-400">
          <span>Next.js 14 + Flask</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-400" />
            Neon PostgreSQL
          </span>
          <span>•</span>
          <span>v2.0</span>
        </div>

        {/* Right — Copyright */}
        <div className="text-xs text-slate-400">
          © 2026 OutbreakIQ · Built by ranasummar0
        </div>

      </div>
    </footer>
  );
}
