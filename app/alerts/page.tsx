'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Check, 
  Activity,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { acknowledgeAlert, fetchAlerts, fetchAlertsSummary, type Alert, type AlertSummary } from '@/lib/api';

type SeverityFilter = 'all' | 'critical' | 'warning' | 'watch' | 'normal';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<AlertSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SeverityFilter>('all');
  const [acknowledgingCity, setAcknowledgingCity] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadAlerts = async () => {
      try {
        const [alertsData, summaryData] = await Promise.all([
          fetchAlerts(),
          fetchAlertsSummary(),
        ]);
        if (isMounted) {
          setAlerts(Array.isArray(alertsData) ? alertsData : []);
          setSummary(summaryData);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch alerts", err);
        if (isMounted) setLoading(false);
      }
    };

    loadAlerts();
    const interval = setInterval(loadAlerts, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleAcknowledge = async (city: string) => {
    try {
      setAcknowledgingCity(city);
      await acknowledgeAlert(city);
      setAlerts(prev => prev.map(a => a.city === city ? { ...a, acknowledged: true } : a));
    } catch (err) {
      console.error("Failed to acknowledge alert", err);
    } finally {
      setAcknowledgingCity(null);
    }
  };

  const counts = {
    all: alerts.length,
    critical: summary?.counts.critical ?? alerts.filter(a => a.severity.toLowerCase() === 'critical').length,
    warning: summary?.counts.warning ?? alerts.filter(a => a.severity.toLowerCase() === 'warning').length,
    watch: summary?.counts.watch ?? alerts.filter(a => a.severity.toLowerCase() === 'watch').length,
    normal: summary?.counts.normal ?? alerts.filter(a => a.severity.toLowerCase() === 'normal').length,
  };

  const filterTabs: { id: SeverityFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All Alerts', count: counts.all },
    { id: 'critical', label: 'Critical', count: counts.critical },
    { id: 'warning', label: 'Warning', count: counts.warning },
    { id: 'watch', label: 'Watch', count: counts.watch },
    { id: 'normal', label: 'Normal', count: counts.normal },
  ];

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'all') return true;
    return a.severity.toLowerCase() === filter.toLowerCase();
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            Critical
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            Warning
          </span>
        );
      case 'watch':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-yellow-50 text-yellow-800 border border-yellow-200">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
            Watch
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Normal
          </span>
        );
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'watch':
        return <Info className="w-5 h-5 text-yellow-700" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getCardBorder = (severity: string, acknowledged: boolean) => {
    if (acknowledged) return 'border-l-4 border-l-slate-300 border-slate-200 opacity-70';
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'border-l-4 border-l-rose-500 border-slate-200 hover:border-slate-300';
      case 'warning':
        return 'border-l-4 border-l-amber-500 border-slate-200 hover:border-slate-300';
      case 'watch':
        return 'border-l-4 border-l-yellow-500 border-slate-200 hover:border-slate-300';
      default:
        return 'border-l-4 border-l-emerald-500 border-slate-200 hover:border-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
                Alerts Center
              </h1>
              {alerts.some(a => !a.acknowledged && a.severity.toLowerCase() === 'critical') && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Real-time epidemiological monitoring and surveillance notifications across monitored regions.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-xs text-xs font-semibold text-slate-600">
              <Clock className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>Auto-refresh: 30s</span>
            </div>
          </div>
        </header>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { 
              id: 'critical' as SeverityFilter,
              label: 'Critical', 
              count: counts.critical, 
              border: 'border-rose-200 hover:border-rose-300', 
              accent: 'bg-rose-50 text-rose-700',
              icon: AlertCircle, 
              countColor: 'text-rose-600',
              activeRing: filter === 'critical' ? 'ring-2 ring-rose-500' : ''
            },
            { 
              id: 'warning' as SeverityFilter,
              label: 'Warning', 
              count: counts.warning, 
              border: 'border-amber-200 hover:border-amber-300', 
              accent: 'bg-amber-50 text-amber-700',
              icon: AlertTriangle, 
              countColor: 'text-amber-600',
              activeRing: filter === 'warning' ? 'ring-2 ring-amber-500' : ''
            },
            { 
              id: 'watch' as SeverityFilter,
              label: 'Watch', 
              count: counts.watch, 
              border: 'border-yellow-200 hover:border-yellow-300', 
              accent: 'bg-yellow-50 text-yellow-800',
              icon: Info, 
              countColor: 'text-yellow-700',
              activeRing: filter === 'watch' ? 'ring-2 ring-yellow-500' : ''
            },
            { 
              id: 'normal' as SeverityFilter,
              label: 'Normal', 
              count: counts.normal, 
              border: 'border-emerald-200 hover:border-emerald-300', 
              accent: 'bg-emerald-50 text-emerald-700',
              icon: CheckCircle2, 
              countColor: 'text-emerald-600',
              activeRing: filter === 'normal' ? 'ring-2 ring-emerald-500' : ''
            },
          ].map((card) => (
            <motion.button
              type="button"
              key={card.label}
              whileHover={{ y: -2 }}
              onClick={() => setFilter(filter === card.id ? 'all' : card.id)}
              className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-xs text-left transition-all cursor-pointer ${card.border} ${card.activeRing} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.accent}`}>
                  <card.icon className="w-4.5 h-4.5" />
                </div>
                <span className={`text-2xl sm:text-3xl font-extrabold ${card.countColor} tracking-tight`}>
                  {card.count}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {card.label}
              </p>
            </motion.button>
          ))}
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center justify-between gap-4 flex-wrap pb-1">
          <div 
            role="tablist" 
            aria-label="Filter alerts by severity"
            className="inline-flex p-1 bg-white border border-slate-200 rounded-xl shadow-xs gap-1 overflow-x-auto max-w-full"
          >
            {filterTabs.map((tab) => {
              const isActive = filter === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setFilter(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9] ${
                    isActive 
                      ? 'bg-[#0B132B] text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Showing <span className="font-bold text-slate-900">{filteredAlerts.length}</span> of {alerts.length} notifications
          </div>
        </div>

        {/* Alerts List Container */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {loading ? (
              // Loading Skeleton State
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded-md w-1/4" />
                    <div className="h-3 bg-slate-100 rounded-md w-3/4" />
                    <div className="h-3 bg-slate-100 rounded-md w-1/3" />
                  </div>
                </div>
              ))
            ) : filteredAlerts.length === 0 ? (
              // Clean Reassuring Empty State
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center shadow-xs space-y-3"
              >
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {filter === 'all' 
                    ? 'No Active Surveillance Alerts' 
                    : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Alerts Active`}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  {filter === 'all' 
                    ? 'All regional surveillance feeds are synchronizing normally. No threshold triggers detected.'
                    : `All monitored feeds in the ${filter} category are operating within normal baseline boundaries.`}
                </p>
                {filter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]"
                  >
                    View All Categories
                  </button>
                )}
              </motion.div>
            ) : (
              // Active Filtered Alerts
              filteredAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={`bg-white rounded-2xl p-4 sm:p-5 shadow-xs border transition-all flex flex-col sm:flex-row sm:items-center gap-4 ${getCardBorder(alert.severity, alert.acknowledged)}`}
                >
                  {/* Severity Icon Badge */}
                  <div className="flex items-center justify-between sm:justify-start gap-3 shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="sm:hidden">
                      {getSeverityBadge(alert.severity)}
                    </div>
                  </div>

                  {/* Alert Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                      <h3 className="font-bold text-[#0B132B] text-base flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#0D9488]" />
                        <span>{alert.city}</span>
                      </h3>
                      <div className="hidden sm:inline-flex">
                        {getSeverityBadge(alert.severity)}
                      </div>
                      {alert.acknowledged && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                          <Check className="w-3 h-3 text-slate-500" />
                          Acknowledged
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed mb-2.5">
                      {alert.message}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-500">
                        <Activity className="w-3.5 h-3.5 text-[#0D9488]" />
                        <span>{alert.active_cases.toLocaleString()} Active Cases</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Button: Acknowledge */}
                  <div className="pt-2 sm:pt-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-slate-100 shrink-0 flex items-center justify-end">
                    {!alert.acknowledged ? (
                      <button 
                        type="button"
                        disabled={acknowledgingCity === alert.city}
                        onClick={() => handleAcknowledge(alert.city)}
                        aria-label={`Acknowledge alert for ${alert.city}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 transition-all shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]"
                      >
                        {acknowledgingCity === alert.city ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0D9488]" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-700" />
                        )}
                        <span>Acknowledge</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Acknowledged</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
