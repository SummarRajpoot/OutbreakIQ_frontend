'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Server, 
  Database, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchDashboardData } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'failed'>('idle');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      await fetchDashboardData();
      setConnectionStatus('connected');
    } catch (err) {
      setConnectionStatus('failed');
    }
  };

  const exportData = async () => {
    try {
      const data = await fetchDashboardData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `outbreakiq_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export data');
    }
  };

  return (
    <div className="p-10 lg:p-12 space-y-10 max-w-[1000px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#0d9488] rounded-2xl flex items-center justify-center shadow-lg shadow-[#0d9488]/20">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="hero-heading text-4xl font-bold tracking-tight text-[#1a2e2b]">
            System <span className="text-[#0d9488]">Configuration</span>
          </h1>
          <p className="text-slate-500 text-[0.95rem] font-medium mt-1">Manage platform preferences and API connections.</p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* API Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white rounded-[1.25rem] border border-[#0d9488]/8 shadow-[0_4px_24px_rgba(13,148,136,0.08)]">
            <CardHeader className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                    <Server className="w-5 h-5 text-[#0d9488]" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-[#1a2e2b]">API Configuration</CardTitle>
                    <CardDescription className="font-medium">Backend service endpoint settings.</CardDescription>
                  </div>
                </div>
                {connectionStatus === 'connected' && (
                  <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1.5 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Connected
                  </Badge>
                )}
                {connectionStatus === 'failed' && (
                  <Badge className="bg-rose-50 text-rose-600 border-none px-4 py-1.5 flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5" />
                    Failed
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 font-mono text-sm text-slate-600 flex items-center justify-between">
                <span>{apiUrl}</span>
                <span className="text-[0.6rem] font-black text-slate-300 uppercase tracking-widest">Default Endpoint</span>
              </div>
              <Button 
                onClick={testConnection} 
                disabled={connectionStatus === 'testing'}
                className="bg-[#0d9488] hover:bg-[#0b7a70] text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-[#0d9488]/10 transition-all active:scale-95"
              >
                {connectionStatus === 'testing' ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Test Connection
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-white rounded-[1.25rem] border border-[#0d9488]/8 shadow-[0_4px_24px_rgba(13,148,136,0.08)]">
            <CardHeader className="p-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <Database className="w-5 h-5 text-[#0d9488]" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-[#1a2e2b]">Data Management</CardTitle>
                  <CardDescription className="font-medium">Maintain and export platform datasets.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 flex gap-4">
              <Button variant="outline" className="h-12 rounded-xl px-6 border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh All Data
              </Button>
              <Button 
                onClick={exportData}
                className="h-12 rounded-xl px-6 bg-[#1a2e2b] hover:bg-black text-white font-bold shadow-lg shadow-black/5"
              >
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white rounded-[1.25rem] border border-[#0d9488]/8 shadow-[0_4px_24px_rgba(13,148,136,0.08)]">
            <CardHeader className="p-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <Info className="w-5 h-5 text-[#0d9488]" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-[#1a2e2b]">About Platform</CardTitle>
                  <CardDescription className="font-medium">System specifications and versioning.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-1">Application Name</p>
                  <p className="text-lg font-bold text-[#1a2e2b]">OutbreakIQ v2.0</p>
                </div>
                <div>
                  <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-1">Architecture</p>
                  <p className="text-lg font-bold text-[#1a2e2b]">Next.js 14 + FastAPI</p>
                </div>
                <div>
                  <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-1">Infrastructure</p>
                  <div className="flex items-center gap-2 text-[#0d9488] font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    Neon PostgreSQL
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
