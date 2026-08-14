import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Wifi,
  WifiOff,
  AlertTriangle,
  Clock,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { getDashboardSummary } from '../api/dashboard';
import { getAlerts } from '../api/alerts';
import { Navbar } from '../components/Navbar';
import { StatusChip } from '../components/StatusChip';
import { CardSkeleton } from '../components/LoadingSkeleton';

export const DashboardPage: React.FC = () => {
  const {
    data: summary,
    isLoading: isLoadingSummary,
    isError: isErrorSummary,
    error: summaryError,
    refetch: refetchSummary,
    isFetching: isFetchingSummary,
  } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
    refetchInterval: 15000,
  });

  const {
    data: recentAlerts,
    isLoading: isLoadingAlerts,
    refetch: refetchAlerts,
  } = useQuery({
    queryKey: ['recent-alerts'],
    queryFn: () => getAlerts({ limit: 5 }),
    refetchInterval: 15000,
  });

  const handleRefresh = () => {
    refetchSummary();
    refetchAlerts();
  };

  const isRefreshing = isFetchingSummary;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-bg">
      <Navbar
        title="Operations Dashboard"
        subtitle="Real-time IoT telemetry aggregate metrics & system health"
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="p-6 space-y-8 max-w-7xl w-full mx-auto">
        {/* Error Retry Banner */}
        {isErrorSummary && (
          <div className="bg-critical/15 border border-critical/30 rounded-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-bold text-sm">Failed to Load Live Metrics</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  {(summaryError as any)?.message || 'Could not connect to backend server'}
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-btn bg-critical text-text-primary text-xs font-bold hover:bg-red-700 transition-colors flex items-center space-x-2 shrink-0 min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {/* Top Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoadingSummary ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              {/* 1. Online Devices */}
              <div className="bg-surface rounded-card p-6 border border-border flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Online Nodes
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <Wifi className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold text-text-primary tracking-tight">
                    {summary?.online_devices ?? 0}
                  </span>
                  <p className="text-xs text-emerald-400 mt-1 font-medium flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                    Active connection
                  </p>
                </div>
              </div>

              {/* 2. Offline Devices */}
              <div className="bg-surface rounded-card p-6 border border-border flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Offline Nodes
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-slate-700/30 border border-slate-600/30 flex items-center justify-center">
                    <WifiOff className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold text-text-primary tracking-tight">
                    {summary?.offline_devices ?? 0}
                  </span>
                  <p className="text-xs text-text-secondary mt-1 font-medium">Standby / Unreachable</p>
                </div>
              </div>

              {/* 3. Active Alerts */}
              <div className="bg-surface rounded-card p-6 border border-border flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between text-amber-400">
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Active Alerts
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold text-text-primary tracking-tight">
                    {summary?.active_alerts ?? 0}
                  </span>
                  <p className="text-xs text-amber-400 mt-1 font-medium">Pending / Acknowledged</p>
                </div>
              </div>

              {/* 4. Last Sync Time */}
              <div className="bg-surface rounded-card p-6 border border-border flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between text-primary">
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Last Sync
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm font-bold text-text-primary block truncate">
                    {summary?.last_sync
                      ? new Date(summary.last_sync).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })
                      : 'Pending Sync'}
                  </span>
                  <p className="text-xs text-text-secondary mt-1 font-medium truncate">
                    {summary?.last_sync
                      ? new Date(summary.last_sync).toLocaleDateString()
                      : 'No Telemetry Yet'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Middle Content: Recent Alerts & System Scope */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Alerts List (2 cols) */}
          <div className="lg:col-span-2 bg-surface rounded-card p-6 border border-border flex flex-col shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-text-primary">Recent Operations Alerts</h3>
              </div>
              <Link
                to="/alerts"
                className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center space-x-1"
              >
                <span>View All Alerts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoadingAlerts ? (
              <div className="space-y-3">
                <div className="h-16 bg-surface-alt rounded-btn animate-pulse" />
                <div className="h-16 bg-surface-alt rounded-btn animate-pulse" />
                <div className="h-16 bg-surface-alt rounded-btn animate-pulse" />
              </div>
            ) : !recentAlerts || recentAlerts.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <ShieldCheck className="w-12 h-12 text-emerald-400/80 mb-3" />
                <p className="text-sm font-semibold text-text-primary">All Systems Nominal</p>
                <p className="text-xs text-text-secondary mt-1">
                  No active unresolved alerts across IoT telemetry nodes.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-btn bg-surface-alt/60 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-border transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <StatusChip type="severity" value={alert.severity} />
                        <span className="text-xs font-bold text-text-primary">
                          {alert.device_code || `Device #${alert.device_id}`}
                        </span>
                        <span className="text-xs text-text-secondary">•</span>
                        <span className="text-xs text-text-secondary">{alert.location_name}</span>
                      </div>
                      <p className="text-sm text-text-primary font-medium">{alert.message}</p>
                    </div>
                    <div className="flex items-center space-x-3 shrink-0">
                      <StatusChip type="status" value={alert.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Scope & Health Card (1 col) */}
          <div className="bg-surface rounded-card p-6 border border-border flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center space-x-2 text-primary mb-4">
                <Radio className="w-5 h-5" />
                <h3 className="text-base font-bold text-text-primary">Node Health Overview</h3>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed mb-6">
                Monitors GramOne Technician IoT Nodes: Water Tanks, Smart Waste Bins, Environmental Monitors, and Emergency Panic Buttons.
              </p>

              <div className="space-y-3 border-t border-border/40 pt-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary">Water Level Thresholds</span>
                  <span className="font-semibold text-text-primary">&lt;20% CRITICAL | 20-40% WARN</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary">Bin Overflow Threshold</span>
                  <span className="font-semibold text-text-primary">&gt;85% CRITICAL</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary">Temp / Humidity Thresholds</span>
                  <span className="font-semibold text-text-primary">&gt;40°C WARN | &gt;85% WARN</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary">Panic Button Alert</span>
                  <span className="font-semibold text-red-400">IMMEDIATE CRITICAL</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/40">
              <Link
                to="/devices/1"
                className="w-full py-2.5 px-4 rounded-btn bg-surface-alt hover:bg-border text-text-primary text-xs font-semibold flex items-center justify-center space-x-2 transition-colors min-h-[44px]"
              >
                <span>View Device Details</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
