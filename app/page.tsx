'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity,
  Zap,
  ArrowRight,
  Globe,
  Microscope,
  Stethoscope,
  AlertCircle,
  ShieldAlert,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { fetchDashboardData } from '@/lib/api';
import type { RegionData } from '@/lib/api';

// ─── derived stats ────────────────────────────────────────────────────────────
interface Stats {
  totalPatients: number;
  totalActiveCases: number;
  avgRecoveryRate: number;
  totalRegions: number;
}

function deriveStats(regions: RegionData[]): Stats {
  const totalPatients = regions.reduce((s, r) => s + (r.patients ?? 0), 0);
  const totalActiveCases = regions.reduce((s, r) => s + (r.activeCases ?? 0), 0);
  const avgRecoveryRate =
    regions.length > 0
      ? regions.reduce((s, r) => s + (r.vaccinationRate ?? 0), 0) / regions.length
      : 0;
  return { totalPatients, totalActiveCases, avgRecoveryRate, totalRegions: regions.length };
}

// ─── tiny skeleton helper ─────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 ${className}`}
      aria-hidden="true"
    />
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const [citySearch, setCitySearch] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchDashboardData()
      .then((data) => {
        if (!cancelled) {
          setStats(deriveStats(data.regions));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message ?? 'Failed to load live data.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const handleAnalyze = () => {
    const query = citySearch.trim();
    router.push(query ? `/dashboard?region=${encodeURIComponent(query)}` : '/dashboard');
  };

  return (
    <div className="p-10 lg:p-14 space-y-12 max-w-[1200px] mx-auto min-h-screen flex flex-col justify-center">

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-rose-400 hover:text-rose-600 font-bold"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d9488]/10 text-[#0d9488] text-[0.7rem] font-bold uppercase tracking-widest mb-4">
            <Zap className="w-3 h-3" />
            V4.0 Live Monitoring
          </div>
          <h1 className="hero-heading text-6xl lg:text-7xl font-bold tracking-tight text-[#1a2e2b] leading-[1.1]">
            Health <span className="text-[#0d9488]">Intelligence</span> <br />
            Redefined.
          </h1>
          <p className="text-slate-500 text-lg mt-6 max-w-xl font-medium leading-relaxed">
            Advanced epidemiological surveillance and predictive analytics platform for proactive public health management.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-4 pt-4"
        >
          <Link href="/dashboard">
            <Button className="rounded-full h-12 px-8 bg-[#0d9488] hover:bg-[#0b7a70] text-white shadow-lg shadow-[#0d9488]/20 group">
              Launch Dashboard
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button variant="outline" className="rounded-full h-12 px-8 border-slate-200 text-slate-600 hover:bg-slate-50">
            View Documentation
          </Button>
        </motion.div>
      </div>

      {/* Quick Analysis Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Card className="overflow-hidden border-none shadow-2xl shadow-slate-200/50">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-3">
              <div className="p-8 md:col-span-2 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="input-field-label">Target Region</label>
                    <Input
                      placeholder="Enter city or district..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="input-field-label">Metric Priority</label>
                    <div className="h-10 flex gap-2">
                      <Button variant="outline" className="flex-1 rounded-md text-[0.7rem] font-bold border-[#0d9488] bg-[#0d9488]/5 text-[#0d9488]">Active Cases</Button>
                      <Button variant="outline" className="flex-1 rounded-md text-[0.7rem] font-bold border-slate-200 text-slate-400">Recovery Rate</Button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-8">
                    {/* Patients Tracked */}
                    <div>
                      {loading ? (
                        <Skeleton className="h-6 w-24 mb-1" />
                      ) : (
                        <p className="text-[1.2rem] font-bold text-[#1a2e2b]">
                          {stats ? stats.totalPatients.toLocaleString() + '+' : '—'}
                        </p>
                      )}
                      <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Patients Tracked</p>
                    </div>
                    {/* Regions Monitored */}
                    <div>
                      {loading ? (
                        <Skeleton className="h-6 w-16 mb-1" />
                      ) : (
                        <p className="text-[1.2rem] font-bold text-[#1a2e2b]">
                          {stats ? stats.totalRegions + ' Zones' : '—'}
                        </p>
                      )}
                      <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Regions Monitored</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    className="bg-[#1a2e2b] text-white hover:bg-black rounded-lg px-6 font-bold text-sm"
                  >
                    Analyze Data
                  </Button>
                </div>
              </div>
              <div className="bg-[#0d9488] p-8 flex flex-col justify-center text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-8 h-8 opacity-50" />
                  <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Real-time Stream</p>
                </div>
                <h3 className="text-2xl font-bold leading-tight">Instant epidemiological insights at your fingertips.</h3>
                {/* Live summary */}
                {!loading && stats && (
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xl font-black">{stats.totalActiveCases.toLocaleString()}</p>
                      <p className="text-[0.6rem] font-bold uppercase tracking-widest opacity-70">Active Cases</p>
                    </div>
                    <div>
                      <p className="text-xl font-black">{stats.avgRecoveryRate.toFixed(1)}%</p>
                      <p className="text-[0.6rem] font-bold uppercase tracking-widest opacity-70">Avg Recovery</p>
                    </div>
                  </div>
                )}
                {loading && (
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full bg-white/20" />
                    <Skeleton className="h-10 w-full bg-white/20" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-6 pt-6">
        <FeatureCard
          icon={Stethoscope}
          title="Clinical Sync"
          description="Direct integration with hospital management systems for instant data reporting."
          delay={0.6}
        />
        <FeatureCard
          icon={Globe}
          title="Global Grid"
          description="Cross-border surveillance network synchronized with international health protocols."
          delay={0.7}
        />
        <FeatureCard
          icon={Microscope}
          title="Facility Care"
          description="Precision tracking of medical capacity and critical care resource allocation."
          delay={0.8}
        />
      </div>

      {/* ── Section 1: How OutbreakIQ Works ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-[1.5rem] bg-[#0d9488]/6 border border-[#0d9488]/10 p-10 space-y-5"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d9488]/10 text-[#0d9488] text-[0.65rem] font-black uppercase tracking-widest">
          <Activity className="w-3 h-3" />
          Epidemiological Intelligence
        </div>
        <h2 className="text-3xl font-bold text-[#1a2e2b] tracking-tight">
          How OutbreakIQ <span className="text-[#0d9488]">Works</span>
        </h2>
        <p className="text-slate-500 text-base font-medium leading-relaxed max-w-2xl">
          OutbreakIQ combines real-time disease data, population analytics, and AI-driven risk
          scoring to help public health officials respond faster and smarter.
        </p>
      </motion.div>

      {/* ── Section 2: Two info cards ───────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Card 1 — Why Early Detection Matters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-[1.25rem] border border-slate-100 shadow-lg shadow-slate-200/40 p-8 space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-[#1a2e2b]">Why Early Detection Matters</h3>
          </div>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Identifying outbreak signals early allows health authorities to deploy resources before
            disease spreads uncontrollably.
          </p>
          <ul className="space-y-3">
            {[
              'Reduces overall infection rates',
              'Prevents healthcare system overload',
              'Saves lives through timely intervention',
              'Minimizes economic disruption',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                <CheckCircle className="w-4 h-4 text-[#0d9488] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Card 2 — How Risk Score is Calculated */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-[1.25rem] border border-slate-100 shadow-lg shadow-slate-200/40 p-8 space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0d9488]/10 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-[#0d9488]" />
            </div>
            <h3 className="text-lg font-bold text-[#1a2e2b]">How Risk Score is Calculated</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { emoji: '🌡️', label: 'Active Cases', bg: 'bg-rose-50', text: 'text-rose-600' },
              { emoji: '🏥', label: 'Hospital Capacity', bg: 'bg-blue-50', text: 'text-blue-600' },
              { emoji: '💉', label: 'Vaccination Rate', bg: 'bg-emerald-50', text: 'text-emerald-600' },
              { emoji: '👥', label: 'Population Density', bg: 'bg-amber-50', text: 'text-amber-600' },
            ].map(({ emoji, label, bg, text }) => (
              <div
                key={label}
                className={`flex items-center gap-3 rounded-xl ${bg} px-4 py-3`}
              >
                <span className="text-xl">{emoji}</span>
                <span className={`text-[0.75rem] font-bold ${text}`}>{label}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-400 text-xs font-medium leading-relaxed pt-1">
            Each factor is weighted and combined into a composite risk index updated in real time
            as new regional data arrives.
          </p>
        </motion.div>
      </div>

      {/* ── Section 3: Monitored Disease Profiles ───────────────────── */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-[#1a2e2b] tracking-tight">
            Monitored <span className="text-[#0d9488]">Disease Profiles</span>
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Surveillance categories actively tracked across all registered zones.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              emoji: '🦟',
              name: 'Dengue',
              desc: 'Vector-borne. Highly correlated with rainfall and humidity.',
              iconBg: 'bg-[#0d9488]/10',
              delay: 0.1,
            },
            {
              emoji: '🌡️',
              name: 'Heatstroke',
              desc: 'Environmental. Directly linked to extreme temperature spikes.',
              iconBg: 'bg-orange-50',
              delay: 0.2,
            },
            {
              emoji: '🦠',
              name: 'COVID-19',
              desc: 'Airborne. High risk in densely populated areas.',
              iconBg: 'bg-blue-50',
              delay: 0.3,
            },
            {
              emoji: '🦟',
              name: 'Malaria',
              desc: 'Vector-borne. Requires immediate vector control.',
              iconBg: 'bg-emerald-50',
              delay: 0.4,
            },
          ].map(({ emoji, name, desc, iconBg, delay }) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay }}
              className="bg-white rounded-[1.25rem] border border-slate-100 shadow-md shadow-slate-200/30 p-6 space-y-4 hover:border-[#0d9488]/20 transition-colors group"
            >
              <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center text-2xl`}>
                {emoji}
              </div>
              <div>
                <p className="text-[#1a2e2b] font-black text-base">{name}</p>
                <p className="text-slate-400 text-xs font-medium leading-relaxed mt-1">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="p-8 rounded-[1.5rem] bg-white border border-slate-100 hover:border-[#0d9488]/20 transition-all group"
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-[#0d9488]/10 transition-colors">
        <Icon className="w-6 h-6 text-slate-400 group-hover:text-[#0d9488] transition-colors" />
      </div>
      <h3 className="text-lg font-bold text-[#1a2e2b] mb-2">{title}</h3>
      <p className="text-sm text-slate-500 font-medium leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

