'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  Filter, 
  Download,
  PieChart as PieIcon,
  RefreshCw, 
  ShieldCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchDashboardData } from '@/lib/api';
import type { DashboardResponse } from '@/lib/api';
import { cn } from '@/lib/utils';

const COLORS = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4'];

export default function StatsPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchDashboardData();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const pieData = data?.regions.slice(0, 5).map(r => ({
    name: r.city,
    value: r.activeCases
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <RefreshCw className="w-8 h-8 text-[#0d9488] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-10 lg:p-12 space-y-10 max-w-[1600px] mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="hero-heading text-4xl font-bold tracking-tight text-[#1a2e2b]">
            Analytics <span className="text-[#0d9488]">& Insights</span>
          </h1>
          <p className="text-[#6b7280] text-[0.95rem] font-medium mt-1">Deep-dive epidemiological datasets and growth forecasting.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full h-11 px-6 border-[#e5e7eb] bg-white text-slate-600 font-medium">
            <Filter className="w-4 h-4 mr-2" />
            Parameters
          </Button>
          <Button className="rounded-full h-11 px-7 font-medium bg-[#0d9488] hover:bg-[#0b7a70] text-white shadow-lg shadow-[#0d9488]/10 border-0">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cases Distribution */}
        <Card className="bg-white rounded-[1.25rem] border border-[#0d9488]/8 shadow-[0_4px_24px_rgba(13,148,136,0.08)] lg:col-span-1">
          <CardHeader className="p-8">
            <CardTitle className="text-xl font-bold text-[#1a2e2b] flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-[#0d9488]" />
              Regional Load
            </CardTitle>
            <CardDescription className="text-[0.85rem] font-medium text-[#6b7280]">Distribution of active cases by sector</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          <div className="px-8 pb-8 space-y-3">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-[0.75rem] font-bold text-slate-600">{item.name}</span>
                </div>
                <span className="text-[0.7rem] font-black text-slate-400 uppercase tracking-tighter">
                  {Math.round((item.value / (data?.totals.totalCases || 1)) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Growth Comparison */}
        <Card className="bg-white rounded-[1.25rem] border border-[#0d9488]/8 shadow-[0_4px_24px_rgba(13,148,136,0.08)] lg:col-span-2">
          <CardHeader className="p-8">
            <CardTitle className="text-xl font-bold text-[#1a2e2b] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0d9488]" />
              Resource Allocation
            </CardTitle>
            <CardDescription className="text-[0.85rem] font-medium text-[#6b7280]">Medical capacity vs Active regional load</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.regions.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="city" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #f1f5f9',
                    borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}
                />
                <Bar dataKey="activeCases" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={40} name="Active Load" />
                <Bar dataKey="hospitalCapacity" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={40} name="Capacity %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Transmission (R0)" value="0.94" trend="-0.02" icon={TrendingDown} />
        <MetricCard title="Recovery Index" value="84.2%" trend="+2.4%" icon={TrendingUp} />
        <MetricCard title="Clinical Yield" value="12.8" trend="+1.1" icon={Activity} />
        <MetricCard title="System Integrity" value="Optimal" status="Stable" icon={ShieldCheck} />
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, status, icon: Icon }: any) {
  return (
    <div className="bg-white p-7 rounded-[1.25rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-5">
        <div className="w-10 h-10 rounded-lg bg-[#ccece9] text-[#0d9488] flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={cn(
            "px-2 py-0.5 rounded-md font-bold text-[0.6rem] uppercase tracking-widest",
            trend.startsWith('+') ? "text-red-600 bg-red-50" : "text-[#0d9488] bg-[#ccece9]"
          )}>
            {trend}
          </div>
        )}
        {status && (
          <div className="px-2 py-0.5 rounded-md font-bold text-[0.6rem] uppercase tracking-widest text-[#0d9488] bg-[#ccece9]">
            {status}
          </div>
        )}
      </div>
      <p className="text-[0.65rem] font-bold text-[#9ca3af] uppercase tracking-[0.2em] mb-1">{title}</p>
      <h4 className="text-2xl font-bold text-[#1a2e2b]">{value}</h4>
    </div>
  );
}
