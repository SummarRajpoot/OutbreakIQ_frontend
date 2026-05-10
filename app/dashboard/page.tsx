'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  AlertTriangle,
  RefreshCw,
  Search,
  Trash2,
  Edit,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchDashboardData, deleteRegion } from '@/lib/api';
import type { DashboardResponse, RegionOut } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchDashboardData();
      setData(res);
    } catch (err) {
      console.error(err);
      setError('Connection refused. Please ensure the backend is running on localhost:8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this region?')) {
      try {
        await deleteRegion(id);
        loadData(); // Refresh
      } catch (err) {
        alert('Failed to delete region');
      }
    }
  };

  const filteredRegions = data?.regions.filter(r => 
    r.city.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <div className="relative">
          <RefreshCw className="w-10 h-10 text-[#0d9488] animate-spin" />
          <div className="absolute inset-0 w-10 h-10 text-[#0d9488] animate-ping opacity-20" />
        </div>
        <p className="text-[0.7rem] font-black text-[#0d9488] uppercase tracking-[0.2em] animate-pulse">Synchronizing Grid...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[80vh] text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#1a2e2b] mb-2">Sync Failure</h2>
        <p className="text-slate-500 max-w-md mb-8 font-medium">{error}</p>
        <Button onClick={loadData} className="bg-[#0d9488] hover:bg-[#0b7a70] rounded-full px-8">
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="p-10 lg:p-12 space-y-10 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="hero-heading text-4xl font-bold tracking-tight text-[#1a2e2b]">
            Live <span className="text-[#0d9488]">Command Center</span>
          </h1>
          <p className="text-slate-500 text-[0.95rem] font-medium mt-1">Real-time epidemiological grid monitoring and alert system.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search regions..." 
              className="pl-10 w-[240px] rounded-full border-slate-100 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="rounded-full bg-[#1a2e2b] hover:bg-black text-white px-6 shadow-lg shadow-black/5">
            System Report
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Cases" 
          value={data?.totals.totalCases.toLocaleString()} 
          icon={Activity} 
          trend="+12.4%" 
          isPositive={false} 
        />
        <StatCard 
          title="Total Patients" 
          value={data?.totals.totalPatients.toLocaleString()} 
          icon={Users} 
          trend="+5.2%" 
          isPositive={true} 
        />
        <StatCard 
          title="Active Zones" 
          value={data?.totals.activeRegions} 
          icon={LayoutDashboardIcon} 
          status="Stable" 
        />
        <StatCard 
          title="High Risk" 
          value={data?.totals.highRisk} 
          icon={AlertTriangle} 
          status="Attention Required" 
          isWarning={true}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/40">
          <CardHeader className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-[#1a2e2b]">Trend Projection</CardTitle>
                <CardDescription className="font-medium">Active case trajectory for highest impact region.</CardDescription>
              </div>
              <Badge className="bg-emerald-50 text-emerald-600 border-none">Real-time Sync</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-0 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.topChart[0]?.data || []}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#0d9488" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alerts Sidebar */}
        <Card className="border-none shadow-xl shadow-slate-200/40">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-bold text-[#1a2e2b]">Regional Alerts</CardTitle>
            <CardDescription className="font-medium">High priority hotspots</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-6">
            {data?.regions.slice(0, 5).map((region, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    region.risk === 'High' ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]" : "bg-[#0d9488]"
                  )} />
                  <div>
                    <p className="text-sm font-bold text-[#1a2e2b]">{region.city}</p>
                    <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">{region.risk} Risk</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0d9488] group-hover:translate-x-1 transition-all" />
              </div>
            ))}
            <Button variant="ghost" className="w-full mt-4 text-[0.7rem] font-black uppercase tracking-[0.2em] text-[#0d9488] hover:bg-[#0d9488]/5">
              View All Intelligence
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="border-none shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Location</th>
                <th className="p-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Risk Level</th>
                <th className="p-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Active Cases</th>
                <th className="p-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Growth</th>
                <th className="p-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Capacity</th>
                <th className="p-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRegions.map((region) => (
                <tr key={region.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="p-6">
                    <p className="text-sm font-bold text-[#1a2e2b]">{region.city}</p>
                    <p className="text-[0.7rem] font-medium text-slate-400 italic">{region.disease || 'General Monitoring'}</p>
                  </td>
                  <td className="p-6">
                    <Badge className={cn(
                      "rounded-full px-3 py-0.5 text-[0.6rem] font-black uppercase tracking-widest border-none",
                      region.risk === 'High' ? "bg-rose-50 text-rose-600" : 
                      region.risk === 'Medium' ? "bg-amber-50 text-amber-600" : "bg-[#ccece9] text-[#0d9488]"
                    )}>
                      {region.risk}
                    </Badge>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-bold text-[#1a2e2b]">{region.activeCases.toLocaleString()}</p>
                    <p className="text-[0.65rem] font-medium text-slate-400">Recorded Patients</p>
                  </td>
                  <td className="p-6">
                    <div className={cn(
                      "flex items-center gap-1 text-[0.7rem] font-black",
                      region.activeTrend.startsWith('-') ? "text-[#0d9488]" : "text-rose-600"
                    )}>
                      {region.activeTrend.startsWith('-') ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      {region.activeTrend}
                    </div>
                  </td>
                  <td className="p-6 w-[200px]">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${region.hospitalCapacity}%` }}
                          className={cn(
                            "h-full rounded-full",
                            region.hospitalCapacity > 80 ? "bg-rose-500" : "bg-[#0d9488]"
                          )}
                        />
                      </div>
                      <span className="text-[0.65rem] font-bold text-slate-500">{region.hospitalCapacity}%</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-slate-100">
                        <Edit className="w-4 h-4 text-slate-400" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 rounded-lg hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => handleDelete(region.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, isPositive, isWarning, status }: any) {
  return (
    <Card className="border-none shadow-lg shadow-slate-200/30 overflow-hidden relative group hover:translate-y-[-2px] transition-all">
      <CardContent className="p-7">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
            isWarning ? "bg-rose-50 text-rose-600" : "bg-[#ccece9] text-[#0d9488]"
          )}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div className={cn(
              "px-2 py-1 rounded-lg font-black text-[0.6rem] uppercase tracking-widest",
              isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
              {trend}
            </div>
          )}
          {status && (
            <div className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">
              {status}
            </div>
          )}
        </div>
        <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
        <h4 className="text-3xl font-bold text-[#1a2e2b]">{value}</h4>
      </CardContent>
    </Card>
  );
}

function LayoutDashboardIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
