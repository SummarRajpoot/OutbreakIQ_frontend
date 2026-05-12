'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  Clock, 
  MapPin,
  Check,
  Activity
} from 'lucide-react';

interface Alert {
  id: number;
  city: string;
  severity: 'critical' | 'warning' | 'watch' | 'normal';
  color: string;
  message: string;
  active_cases: int;
  timestamp: string;
  acknowledged: boolean;
}

interface Summary {
  counts: {
    critical: number;
    warning: number;
    watch: number;
    normal: number;
  };
  highest_severity: string;
  total_active_alerts: number;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [alertsRes, summaryRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/alerts/'),
        fetch('http://127.0.0.1:8000/api/alerts/summary')
      ]);
      setAlerts(await alertsRes.json());
      setSummary(await summaryRes.json());
    } catch (err) {
      console.error("Failed to fetch alerts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const acknowledgeAlert = async (city: string) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/alerts/acknowledge/${city}`, { method: 'POST' });
      // Update local state for immediate feedback
      setAlerts(prev => prev.map(a => a.city === city ? { ...a, acknowledged: true } : a));
    } catch (err) {
      console.error("Failed to acknowledge alert", err);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      case 'watch': return <Info className="w-6 h-6 text-yellow-500" />;
      default: return <CheckCircle2 className="w-6 h-6 text-green-500" />;
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 border-red-500/20';
      case 'warning': return 'bg-orange-500/10 border-orange-500/20';
      case 'watch': return 'bg-yellow-500/10 border-yellow-500/20';
      default: return 'bg-green-500/10 border-green-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 mb-2">
              Alert Center
            </h1>
            <p className="text-slate-400 text-lg">
              Real-time monitoring and emergency notifications across all active regions.
            </p>
          </div>
          <div className="hidden md:flex bg-slate-800/50 border border-slate-700 p-2 rounded-2xl gap-2">
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-xl">
                <Clock className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-slate-300">Auto-refresh: 30s</span>
             </div>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {summary && [
            { label: 'Critical', count: summary.counts.critical, color: 'border-red-500', icon: AlertCircle, text: 'text-red-500' },
            { label: 'Warning', count: summary.counts.warning, color: 'border-orange-500', icon: AlertTriangle, text: 'text-orange-500' },
            { label: 'Watch', count: summary.counts.watch, color: 'border-yellow-500', icon: Info, text: 'text-yellow-500' },
            { label: 'Normal', count: summary.counts.normal, color: 'border-green-500', icon: CheckCircle2, text: 'text-green-500' },
          ].map((card) => (
            <motion.div 
              key={card.label}
              whileHover={{ y: -5 }}
              className={`bg-slate-800/40 border-l-4 ${card.color} rounded-2xl p-6 shadow-xl backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between mb-4">
                <card.icon className={`w-8 h-8 ${card.text} opacity-80`} />
                <span className={`text-3xl font-black ${card.text}`}>{card.count}</span>
              </div>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Alert List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-3">
            Active Notifications
            {alerts.some(a => !a.acknowledged) && (
               <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
               </span>
            )}
          </h2>

          <AnimatePresence mode="popLayout">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-24 bg-slate-800/30 rounded-2xl animate-pulse" />
              ))
            ) : alerts.map((alert) => (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: alert.acknowledged ? 0.6 : 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group flex items-center gap-6 p-6 rounded-2xl border ${getSeverityBg(alert.severity)} transition-all`}
              >
                <div className="hidden sm:flex p-3 bg-slate-900/50 rounded-xl">
                   {getSeverityIcon(alert.severity)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      {alert.city}
                    </h3>
                    <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded border ${alert.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' : alert.severity === 'warning' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : alert.severity === 'watch' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{alert.message}</p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5" />
                      {alert.active_cases} Active Cases
                    </span>
                  </div>
                </div>

                {!alert.acknowledged ? (
                  <button 
                    onClick={() => acknowledgeAlert(alert.city)}
                    className="p-3 bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-white rounded-xl border border-teal-500/30 transition-all shadow-lg hover:shadow-teal-500/20 group/btn"
                  >
                    <Check className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  </button>
                ) : (
                  <div className="p-3 text-slate-600 bg-slate-900/30 rounded-xl border border-slate-800">
                    <Check className="w-5 h-5 opacity-50" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
