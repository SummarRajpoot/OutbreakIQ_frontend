'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  RefreshCw, 
  Plus, 
  MapPin, 
  Users, 
  Activity, 
  ChevronRight,
  X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchDashboardData, addOrUpdateRegion } from '@/lib/api';
import type { RegionOut, RegionCreate } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function RiskZonesPage() {
  const [regions, setRegions] = useState<RegionOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardData();
      setRegions(data.regions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRegions = regions.filter(r => filter === 'All' || r.risk === filter);
  
  const highRiskCount = regions.filter(r => r.risk === 'High').length;
  const mediumRiskCount = regions.filter(r => r.risk === 'Medium').length;
  const lowRiskCount = regions.filter(r => r.risk === 'Low').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <RefreshCw className="w-10 h-10 text-[#0d9488] animate-spin" />
        <p className="text-[0.7rem] font-black text-[#0d9488] uppercase tracking-[0.2em]">Updating Risk Grid...</p>
      </div>
    );
  }

  return (
    <div className="p-10 lg:p-12 space-y-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h1 className="hero-heading text-4xl font-bold tracking-tight text-[#1a2e2b]">Risk <span className="text-rose-600">Classification</span></h1>
          </div>
          <p className="text-slate-500 text-[0.95rem] font-medium">Categorized surveillance zones by epidemiological threat levels.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadData} className="rounded-full h-11 px-6 border-slate-200">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Grid
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="rounded-full h-11 px-7 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200">
            <Plus className="w-4 h-4 mr-2" />
            Register Zone
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="High Alert" count={highRiskCount} color="rose" />
        <SummaryCard title="Medium Alert" count={mediumRiskCount} color="amber" />
        <SummaryCard title="Low Alert" count={lowRiskCount} color="emerald" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-1">
        {(['All', 'High', 'Medium', 'Low'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-6 py-3 text-[0.7rem] font-black uppercase tracking-[0.2em] transition-all relative",
              filter === f ? "text-[#0d9488]" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {f} Risk
            {filter === f && (
              <motion.div layoutId="filter-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0d9488]" />
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredRegions.map((region) => (
            <RegionCard key={region.id} region={region} />
          ))}
        </AnimatePresence>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddZoneModal 
            onClose={() => setShowAddModal(false)} 
            onSuccess={() => {
              setShowAddModal(false);
              loadData();
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryCard({ title, count, color }: any) {
  const colors: any = {
    rose: "border-rose-500 bg-rose-50/30 text-rose-600",
    amber: "border-amber-500 bg-amber-50/30 text-amber-600",
    emerald: "border-emerald-500 bg-emerald-50/30 text-emerald-600"
  };

  return (
    <Card className={cn("border-l-4 shadow-sm", colors[color])}>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-[0.65rem] font-black uppercase tracking-widest opacity-70 mb-1">{title}</p>
          <h4 className="text-3xl font-black">{count}</h4>
        </div>
        <ChevronRight className="w-6 h-6 opacity-30" />
      </CardContent>
    </Card>
  );
}

function RegionCard({ region }: { region: RegionOut }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-none shadow-xl shadow-slate-200/40 hover:translate-y-[-2px] transition-all group overflow-hidden">
        <CardContent className="p-0">
          <div className="flex h-full">
            <div className={cn(
              "w-2 transition-all group-hover:w-3",
              region.risk === 'High' ? "bg-rose-500" : 
              region.risk === 'Medium' ? "bg-amber-500" : "bg-emerald-500"
            )} />
            <div className="p-8 flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-[#1a2e2b] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-slate-300" />
                    {region.city}
                  </h3>
                  <p className="text-[0.7rem] font-bold text-slate-400 italic mt-0.5">{region.disease || 'General Surveillance'}</p>
                </div>
                <Badge className={cn(
                  "rounded-full px-4 py-1 text-[0.65rem] font-black uppercase tracking-widest border-none",
                  region.risk === 'High' ? "bg-rose-50 text-rose-600" : 
                  region.risk === 'Medium' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                )}>
                  {region.risk} Priority
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-3 h-3 text-[#0d9488]" />
                    <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Active Cases</span>
                  </div>
                  <p className="text-2xl font-black text-[#1a2e2b]">{region.activeCases.toLocaleString()}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-3 h-3 text-[#0d9488]" />
                    <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Population</span>
                  </div>
                  <p className="text-2xl font-black text-[#1a2e2b]">{region.populationDensity ? (region.populationDensity/1000).toFixed(1) + 'k/sqm' : 'N/A'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-3">Health Directives</p>
                <div className="flex flex-wrap gap-2">
                  {region.recommendations.slice(0, 2).map((rec, i) => (
                    <div key={i} className="px-3 py-1.5 rounded-lg bg-slate-50 text-[0.65rem] font-bold text-slate-600 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-[#0d9488]" />
                      {rec.length > 40 ? rec.substring(0, 40) + '...' : rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AddZoneModal({ onClose, onSuccess }: any) {
  const [formData, setFormData] = useState<RegionCreate>({
    city: '',
    activeCases: '' as any,
    patients: '' as any,
    disease: '',
    populationDensity: '' as any,
    hospitalCapacity: '' as any,
    vaccinationRate: '' as any
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addOrUpdateRegion(formData);
      onSuccess();
    } catch (err) {
      alert('Failed to register zone');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#1a2e2b]/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden"
      >
        <div className="p-10 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#1a2e2b]">Register <span className="text-[#0d9488]">Zone</span></h2>
              <p className="text-slate-400 text-sm font-medium">Input local epidemiological data parameters.</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="input-field-label">Location City</label>
                <Input 
                  placeholder="e.g. Hyderabad" 
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="input-field-label">Active Cases</label>
                <Input 
                  type="number"
                  value={formData.activeCases as any}
                  onChange={e => setFormData({...formData, activeCases: e.target.value === '' ? undefined : Number(e.target.value) || 0})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="input-field-label">Clinical Patients</label>
                <Input 
                  type="number"
                  value={formData.patients}
                  onChange={e => setFormData({...formData, patients: e.target.value === '' ? undefined : Number(e.target.value) || 0})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="input-field-label">Disease Type</label>
                <Input 
                  placeholder="e.g. Dengue"
                  value={formData.disease}
                  onChange={e => setFormData({...formData, disease: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="input-field-label">Population Density (/sqm)</label>
                <Input 
                  type="number"
                  value={formData.populationDensity as any}
                  onChange={e => setFormData({...formData, populationDensity: e.target.value === '' ? undefined : Number(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <label className="input-field-label">Hospital Capacity (%)</label>
                <Input 
                  type="number"
                  value={formData.hospitalCapacity as any}
                  onChange={e => setFormData({...formData, hospitalCapacity: e.target.value === '' ? undefined : Number(e.target.value) || 0})}
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 bg-[#0d9488] hover:bg-[#0b7a70] text-white rounded-xl font-bold shadow-lg shadow-[#0d9488]/20">
              Confirm Registration
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
