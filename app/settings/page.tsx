'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Server, 
  Database, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  Bell,
  Monitor,
  User,
  Shield,
  LayoutDashboard,
  Globe,
  AlertTriangle,
  Lock,
  ChevronDown,
  FileText,
  MapPin,
  Activity,
  BarChart3,
  Layers,
  Map as MapIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchDashboardData } from '@/lib/api';
import { cn } from '@/lib/utils';

// ── Reusable Toggle Component ────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: on ? '#0d9488' : '#cbd5e1',
        position: 'relative',
        transition: 'background-color 0.2s',
        display: 'flex',
        alignItems: 'center',
        padding: '0 2px',
        outline: 'none'
      }}
    >
      <span style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: 'white',
        transition: 'transform 0.2s',
        transform: on ? 'translateX(20px)' : 'translateX(0px)'
      }} />
    </button>
  );
}

function ToggleRow({ label, sub, on, onToggle }: { label: string; sub?: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
      <div>
        <p className="text-sm font-bold text-[#1a2e2b]">{label}</p>
        {sub && <p className="text-xs text-slate-400 font-medium mt-0.5">{sub}</p>}
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  );
}

function Dropdown({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5 flex-1 min-w-[200px]">
      <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="relative">
        <select 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 px-4 pr-10 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-[#1a2e2b] appearance-none focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 transition-all cursor-pointer"
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://127.0.0.1:7860/api';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'failed'>('idle');
  const [refreshing, setRefreshing] = useState(false);

  // ─ 1. Notifications ─
  const [highRiskAlerts, setHighRiskAlerts] = useState(false);
  const [caseSurgeAlerts, setCaseSurgeAlerts] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState('20');

  // ─ 2. Display ─
  const [darkMode, setDarkMode] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState('1 minute');
  const [chartType, setChartType] = useState('Line Chart');

  // ─ 3. Customization ─
  const [defaultPage, setDefaultPage] = useState('Dashboard');
  const [itemsPerPage, setItemsPerPage] = useState('25');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // ─ 4. Localization ─
  const [language, setLanguage] = useState('English');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [units, setUnits] = useState('Metric');
  const [showUrdu, setShowUrdu] = useState(false);

  // ─ 5. Region ─
  const [defaultCity, setDefaultCity] = useState('Islamabad');
  const [timezone, setTimezone] = useState('GMT+5');
  const [showLowRisk, setShowLowRisk] = useState(true);

  // ─ 6. Security ─
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sessionTimeout, setSessionTimeout] = useState('1 hour');

  // ─ Toast ─
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success', duration: number = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  // ─ Auto Refresh Logic ─
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoRefresh) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            handleRefreshData();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(30);
    }
    return () => clearInterval(timer);
  }, [autoRefresh]);

  const handleSavePreferences = () => {
    const prefs = {
      highRiskAlerts, caseSurgeAlerts, alertThreshold,
      darkMode, refreshInterval, chartType,
      defaultPage, itemsPerPage, autoRefresh,
      language, dateFormat, units, showUrdu,
      defaultCity, timezone, showLowRisk,
      sessionTimeout
    };
    localStorage.setItem('outbreakiq_preferences', JSON.stringify(prefs));
    showToast('✅ Preferences Saved!');
  };

  const handleResetData = async () => {
    const confirmed = confirm("⚠️ Are you sure? This will delete ALL regions from the database. This cannot be undone.");
    if (confirmed) {
      try {
        const res = await fetch(`${API_BASE_URL}/regions/all`, { method: 'DELETE' });
        if (res.ok) {
          showToast('⚠️ All data has been reset!');
        } else {
          showToast('ℹ️ Reset requires backend endpoint setup', 'error');
        }
      } catch {
        showToast('ℹ️ Reset functionality offline', 'error');
      }
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    showToast('✅ Cache cleared successfully!');
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    try {
      const res = await fetch(`${API_BASE_URL}/regions`);
      if (res.ok) {
        setConnectionStatus('connected');
        showToast('✅ Backend Connected!');
        setTimeout(() => setConnectionStatus('idle'), 3000);
      } else {
        throw new Error();
      }
    } catch {
      setConnectionStatus('failed');
      showToast('❌ Connection Failed', 'error');
      setTimeout(() => setConnectionStatus('idle'), 3000);
    }
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/regions`);
      if (res.ok) {
        showToast('✅ Data Refreshed!');
      } else {
        throw new Error();
      }
    } catch {
      showToast('❌ Refresh Failed', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/regions`);
      const data = await res.json();
      const regions = data.regions || data;

      const headers = [
        'City', 'Risk', 'Active Cases', 'Patients', 'Disease', 
        'Hospital Capacity (%)', 'Vaccination Rate (%)', 
        'Population Density', 'Recommendations'
      ];
      
      const rows = regions.map((r: any) => [
        r.city,
        r.risk,
        r.activeCases,
        r.patients,
        r.disease || 'N/A',
        r.hospitalCapacity,
        r.vaccinationRate,
        r.populationDensity,
        (r.recommendations || []).join(' | ')
      ]);
      
      const csvContent = [headers, ...rows]
        .map((row: any[]) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `outbreakiq_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('✅ CSV Downloaded!', 'success', 2000);
    } catch {
      showToast('❌ CSV Export Failed', 'error');
    }
  };

  const handleExportPDF = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/regions`);
      const data = await res.json();
      const regions = data.regions || data;

      const stats = {
        totalCases: regions.reduce((acc: number, r: any) => acc + r.activeCases, 0),
        totalPatients: regions.reduce((acc: number, r: any) => acc + r.patients, 0),
        activeZones: regions.length,
        highRisk: regions.filter((r: any) => r.risk === 'High').length
      };

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; }
            .header { border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px; }
            .title { color: #0d9488; font-size: 28px; font-weight: bold; margin: 0; }
            .subtitle { color: #64748b; font-size: 14px; margin-top: 5px; }
            .date { float: right; color: #94a3b8; font-size: 12px; }
            
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 40px; }
            .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; text-align: center; }
            .stat-val { color: #0d9488; font-size: 20px; font-weight: bold; }
            .stat-lbl { color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }
            
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { text-align: left; background: #f1f5f9; color: #475569; padding: 12px 8px; border-bottom: 2px solid #e2e8f0; }
            td { padding: 10px 8px; border-bottom: 1px solid #f1f5f9; }
            
            .risk-High { color: #ef4444; font-weight: bold; }
            .risk-Medium { color: #f59e0b; font-weight: bold; }
            .risk-Low { color: #10b981; font-weight: bold; }
            
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header">
            <span class="date">${new Date().toLocaleDateString()}</span>
            <h1 class="title">OutbreakIQ Surveillance Report</h1>
            <div class="subtitle">Epidemiological Intelligence Platform</div>
          </div>

          <div class="summary-grid">
            <div class="stat-card">
              <div class="stat-val">${stats.totalCases.toLocaleString()}</div>
              <div class="stat-lbl">Total Cases</div>
            </div>
            <div class="stat-card">
              <div class="stat-val">${stats.totalPatients.toLocaleString()}</div>
              <div class="stat-lbl">Total Patients</div>
            </div>
            <div class="stat-card">
              <div class="stat-val">${stats.activeZones}</div>
              <div class="stat-lbl">Active Zones</div>
            </div>
            <div class="stat-card">
              <div class="stat-val">${stats.highRisk}</div>
              <div class="stat-lbl">High Risk Zones</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>City</th>
                <th>Risk</th>
                <th>Cases</th>
                <th>Disease</th>
                <th>Hospital Cap.</th>
                <th>Vaccination</th>
                <th>Recommendations</th>
              </tr>
            </thead>
            <tbody>
              ${regions.map((r: any) => `
                <tr>
                  <td style="font-weight:600">${r.city}</td>
                  <td class="risk-${r.risk}">${r.risk}</td>
                  <td>${r.activeCases.toLocaleString()}</td>
                  <td>${r.disease || 'N/A'}</td>
                  <td>${r.hospitalCapacity}%</td>
                  <td>${r.vaccinationRate}%</td>
                  <td style="color:#64748b; font-size:10px">${(r.recommendations || []).join(' | ')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            Generated by OutbreakIQ | ranasummar0.hf.space | © ${new Date().getFullYear()}
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
        showToast('✅ PDF Report Generated!', 'success', 2000);
      }
    } catch {
      showToast('❌ PDF Generation Failed', 'error');
    }
  };

  const CARD_CLS = "bg-white rounded-[1.25rem] border border-[#0d9488]/10 shadow-[0_4px_24px_rgba(13,148,136,0.08)]";

  return (
    <div className="p-10 lg:p-12 space-y-10 max-w-[1000px] mx-auto min-h-screen">
      {/* 1. Header */}
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

      <div className="grid gap-6">
        {/* CARD 1: Profile Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className={CARD_CLS}>
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#0d9488]" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-[#1a2e2b]">Profile</CardTitle>
                  <CardDescription className="font-medium">Account information and role.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-6">
              <div className="flex items-center gap-6">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Avatar" className="w-20 h-20 rounded-full border-4 border-white shadow-xl shadow-[#0d9488]/10" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#0d9488] flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-xl shadow-[#0d9488]/10">
                    {session?.user?.name ? session.user.name.split(' ').map((n:any) => n[0]).join('').toUpperCase() : 'RA'}
                  </div>
                )}
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-[#1a2e2b]">{session?.user?.name || "Rana Summar"}</h3>
                  <p className="text-sm font-medium text-slate-500">Health Administrator</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 pt-2">
                <div>
                  <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                  <p className="text-sm font-bold text-[#1a2e2b]">{session?.user?.email || "rana@outbreakiq.com"}</p>
                </div>
                <div>
                  <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-1">Member Since</p>
                  <p className="text-sm font-bold text-[#1a2e2b]">May 2026</p>
                </div>
              </div>
              <Button variant="outline" className="w-full h-11 border-[#0d9488] text-[#0d9488] rounded-xl font-bold hover:bg-[#0d9488]/5">
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 2: API Configuration */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className={CARD_CLS}>
            <CardHeader className="p-6">
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
                <AnimatePresence>
                  {connectionStatus === 'connected' && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1.5 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                      </Badge>
                    </motion.div>
                  )}
                  {connectionStatus === 'failed' && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                      <Badge className="bg-rose-50 text-rose-600 border-none px-4 py-1.5 flex items-center gap-2">
                        <XCircle className="w-3.5 h-3.5" /> Failed
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 font-mono text-sm text-slate-600 flex items-center justify-between">
                <span>{API_BASE_URL.replace('/api', '')}</span>
                <span className="text-[0.6rem] font-black text-slate-300 uppercase tracking-widest">Default Endpoint</span>
              </div>
              <Button 
                onClick={handleTestConnection} 
                disabled={connectionStatus === 'testing'}
                className="bg-[#0d9488] hover:bg-[#0b7a70] text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-[#0d9488]/10 transition-all active:scale-95"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", connectionStatus === 'testing' && "animate-spin")} />
                {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 3: Data Management */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={CARD_CLS}>
            <CardHeader className="p-6 pb-4">
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
            <CardContent className="p-6 pt-4 flex flex-wrap gap-4">
              <Button 
                variant="outline" 
                onClick={handleRefreshData}
                disabled={refreshing}
                className="h-12 rounded-xl px-6 border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
                {refreshing ? 'Refreshing...' : 'Refresh All Data'}
              </Button>
              <Button 
                variant="outline"
                onClick={handleExportCSV}
                className="h-12 rounded-xl px-6 border-[#0d9488] text-[#0d9488] font-bold hover:bg-[#0d9488]/5"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                onClick={handleExportPDF}
                className="h-12 rounded-xl px-6 bg-[#0d9488] hover:bg-[#0b7a70] text-white font-bold shadow-lg shadow-[#0d9488]/20"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export PDF Report
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 4: Dashboard Customization */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className={CARD_CLS}>
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-[#0d9488]" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-[#1a2e2b]">Dashboard Customization</CardTitle>
                  <CardDescription className="font-medium">Interface behavior and refresh rates.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Dropdown 
                  label="Default Page on Login" 
                  options={['Dashboard', 'Risk Zones', 'Statistics']} 
                  value={defaultPage} 
                  onChange={setDefaultPage}
                />
                <Dropdown 
                  label="Items Per Page" 
                  options={['10', '25', '50']} 
                  value={itemsPerPage} 
                  onChange={setItemsPerPage}
                />
              </div>
              <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-[#1a2e2b]">Auto-Refresh Data</p>
                    {autoRefresh && <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[10px] px-2">ACTIVE</Badge>}
                  </div>
                  <Toggle on={autoRefresh} onToggle={() => setAutoRefresh(prev => !prev)} />
                </div>
                {autoRefresh && (
                  <p className="text-xs font-bold text-[#0d9488] flex items-center gap-2 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Next refresh in: {countdown}s
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 5: Notification Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className={CARD_CLS}>
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#0d9488]" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-[#1a2e2b]">Notification Settings</CardTitle>
                  <CardDescription className="font-medium">Configure alert triggers and thresholds.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-1">
              <ToggleRow 
                label="High Risk Alerts" 
                sub="Notify when a region enters high risk status."
                on={highRiskAlerts}
                onToggle={() => setHighRiskAlerts(prev => !prev)}
              />
              <ToggleRow 
                label="Case Surge Alerts" 
                sub="Notify when active cases increase significantly."
                on={caseSurgeAlerts}
                onToggle={() => setCaseSurgeAlerts(prev => !prev)}
              />
              <div className="pt-4 space-y-2">
                <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Alert Threshold (%)</p>
                <input 
                  type="number" 
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-[#1a2e2b] focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 6: Display Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className={CARD_CLS}>
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-[#0d9488]" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-[#1a2e2b]">Display Preferences</CardTitle>
                  <CardDescription className="font-medium">Visual styling and data intervals.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-6">
              <ToggleRow 
                label="Dark Mode" 
                sub="Enable high-contrast night viewing."
                on={darkMode}
                onToggle={() => setDarkMode(prev => !prev)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Dropdown 
                  label="Data Refresh Interval" 
                  options={['30 seconds', '1 minute', '5 minutes', 'Manual Only']} 
                  value={refreshInterval} 
                  onChange={setRefreshInterval}
                />
                <Dropdown 
                  label="Chart Type" 
                  options={['Line Chart', 'Bar Chart', 'Area Chart', 'Radar Map']} 
                  value={chartType} 
                  onChange={setChartType}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 7: Localization */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className={CARD_CLS}>
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#0d9488]" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-[#1a2e2b]">Localization</CardTitle>
                  <CardDescription className="font-medium">Regional and language display settings.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Dropdown label="Language" options={['English', 'اردو (Urdu)']} value={language} onChange={setLanguage} />
                <Dropdown label="Date Format" options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']} value={dateFormat} onChange={setDateFormat} />
                <Dropdown label="Units" options={['Metric', 'Imperial']} value={units} onChange={setUnits} />
              </div>
              <ToggleRow 
                label="Show Urdu Labels" 
                sub="Experimental UI translation for right-to-left support."
                on={showUrdu}
                onToggle={() => setShowUrdu(prev => !prev)}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 8: Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className={CARD_CLS}>
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#0d9488]" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-[#1a2e2b]">Security</CardTitle>
                  <CardDescription className="font-medium">Access and session settings.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">New Password</p>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Confirm Password</p>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 transition-all"
                  />
                </div>
              </div>
              <Button className="w-full h-11 bg-[#0d9488] hover:bg-[#0b7a70] text-white rounded-xl font-bold shadow-lg shadow-[#0d9488]/10 transition-all">
                Update Password
              </Button>
              <div className="h-px bg-slate-50 w-full" />
              <div className="flex flex-wrap items-end gap-6">
                <div className="flex-1 min-w-[200px]">
                  <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-2">Last Login</p>
                  <p className="text-sm font-bold text-slate-600">{new Date().toLocaleString()}</p>
                </div>
                <Dropdown label="Session Timeout" options={['30 minutes', '1 hour', 'Never']} value={sessionTimeout} onChange={setSessionTimeout} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 9: Region Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className={CARD_CLS}>
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <MapIcon className="w-5 h-5 text-[#0d9488]" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-[#1a2e2b]">Region Preferences</CardTitle>
                  <CardDescription className="font-medium">Default location and timezone settings.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Dropdown 
                  label="Default City" 
                  options={['Islamabad', 'Karachi', 'Lahore', 'Peshawar', 'Quetta']} 
                  value={defaultCity} 
                  onChange={setDefaultCity} 
                />
                <Dropdown 
                  label="Timezone" 
                  options={['GMT+5', 'GMT+6', 'GMT+4', 'UTC']} 
                  value={timezone} 
                  onChange={setTimezone} 
                />
              </div>
              <ToggleRow 
                label="Show Low Risk Zones" 
                sub="Always display regions with green safety status."
                on={showLowRisk}
                onToggle={() => setShowLowRisk(prev => !prev)}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 10: Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <Card className="bg-red-50 rounded-[1.25rem] border border-red-200 shadow-sm overflow-hidden">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-red-600">Danger Zone</CardTitle>
                  <CardDescription className="font-medium text-red-400">Irreversible actions. Proceed with caution.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={handleResetData}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 px-6 font-bold flex-1 min-w-[200px]"
                >
                  Reset All Data
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleClearCache}
                  className="border-red-200 text-red-600 hover:bg-red-100/50 rounded-xl h-11 px-6 font-bold flex-1 min-w-[200px]"
                >
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Actions */}
        <div className="pt-6 flex justify-end">
          <Button 
            onClick={handleSavePreferences}
            className="bg-[#0d9488] hover:bg-[#0b7a70] text-white rounded-2xl h-14 px-12 font-bold text-lg shadow-xl shadow-[#0d9488]/20 transition-all active:scale-95"
          >
            Save All Preferences
          </Button>
        </div>
      </div>

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: toast.type === 'success' ? '#0d9488' : '#ef4444',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
