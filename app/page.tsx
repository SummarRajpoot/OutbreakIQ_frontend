'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Activity, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Globe, 
  Microscope,
  Stethoscope
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const [citySearch, setCitySearch] = useState('');

  return (
    <div className="p-10 lg:p-14 space-y-12 max-w-[1200px] mx-auto min-h-screen flex flex-col justify-center">
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
                    <div>
                      <p className="text-[1.2rem] font-bold text-[#1a2e2b]">24,500+</p>
                      <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Patients Tracked</p>
                    </div>
                    <div>
                      <p className="text-[1.2rem] font-bold text-[#1a2e2b]">WHO v4.2</p>
                      <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Protocol Standard</p>
                    </div>
                  </div>
                  <Button className="bg-[#1a2e2b] text-white hover:bg-black rounded-lg px-6 font-bold text-sm">
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
