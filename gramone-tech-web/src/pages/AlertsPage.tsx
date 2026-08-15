import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  CheckCheck,
  Search,
  Filter,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { getAlerts, acknowledgeAlert, resolveAlert } from '../api/alerts';
import { Navbar } from '../components/Navbar';
import { StatusChip } from '../components/StatusChip';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { parseDate } from '../utils/date';

export const AlertsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: alerts,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['alerts', statusFilter, severityFilter],
    queryFn: () =>
      getAlerts({
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
        limit: 100,
      }),
    refetchInterval: 15000,
  });

  // Acknowledge mutation
  const ackMutation = useMutation({
    mutationFn: (id: number) => acknowledgeAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.detail || err.message || 'Failed to acknowledge alert');
    },
  });

  // Resolve mutation
  const resolveMutation = useMutation({
    mutationFn: (id: number) => resolveAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.detail || err.message || 'Failed to resolve alert');
    },
  });

  // Filter alerts by search term
  const filteredAlerts = (alerts || []).filter((alert) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (alert.device_code && alert.device_code.toLowerCase().includes(term)) ||
      (alert.location_name && alert.location_name.toLowerCase().includes(term)) ||
      (alert.message && alert.message.toLowerCase().includes(term)) ||
      (alert.alert_type && alert.alert_type.toLowerCase().includes(term))
    );
  });

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-bg">
      <Navbar
        title="Alert Management Center"
        subtitle="Monitor, acknowledge, and resolve real-time IoT system alerts"
        onRefresh={refetch}
        isRefreshing={isFetching}
      />

      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Action Error Notification */}
        {actionError && (
          <div className="p-4 rounded-card bg-critical/15 border border-critical/30 flex items-center justify-between text-red-400 text-sm">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-xs underline hover:text-text-primary"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Controls & Search */}
        <div className="bg-surface rounded-card p-4 border border-border flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search device code, location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-btn bg-surface-alt border border-border text-text-primary placeholder:text-slate-500 text-xs focus:outline-none focus:border-primary min-h-[44px]"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center space-x-2 text-xs text-text-secondary">
              <Filter className="w-4 h-4 text-primary" />
              <span className="font-semibold">Filters:</span>
            </div>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 rounded-btn bg-surface-alt border border-border text-text-primary text-xs focus:outline-none focus:border-primary min-h-[44px]"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="WARNING">WARNING</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-btn bg-surface-alt border border-border text-text-primary text-xs focus:outline-none focus:border-primary min-h-[44px]"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>

        {/* Alerts Table / List */}
        <div className="bg-surface rounded-card border border-border overflow-hidden shadow-lg">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <ShieldCheck className="w-16 h-16 text-emerald-400/70 mb-4" />
              <h3 className="text-base font-bold text-text-primary">No Operations Alerts Found</h3>
              <p className="text-xs text-text-secondary mt-1 max-w-sm">
                There are no alerts matching the selected filter criteria.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-6 hover:bg-surface-alt/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left Metadata & Message */}
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <StatusChip type="severity" value={alert.severity} />
                      <StatusChip type="status" value={alert.status} />
                      <span className="text-xs font-bold text-text-primary px-2 py-0.5 rounded bg-surface-alt border border-border">
                        {alert.device_code || `Device #${alert.device_id}`}
                      </span>
                      {alert.location_name && (
                        <span className="text-xs text-text-secondary">
                          • {alert.location_name}
                        </span>
                      )}
                      <span className="text-xs text-text-secondary">
                        • {parseDate(alert.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-text-primary">{alert.message}</p>

                    <div className="flex items-center space-x-4 text-xs text-text-secondary">
                      <span>Type: <code className="text-primary font-mono">{alert.alert_type}</code></span>
                      {alert.acknowledged_at && (
                        <span>Ack at: {parseDate(alert.acknowledged_at).toLocaleTimeString()}</span>
                      )}
                      {alert.resolved_at && (
                        <span>Resolved at: {parseDate(alert.resolved_at).toLocaleTimeString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center space-x-3 shrink-0">
                    {alert.status === 'PENDING' && (
                      <button
                        onClick={() => ackMutation.mutate(alert.id)}
                        disabled={ackMutation.isPending}
                        className="px-4 py-2 rounded-btn bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors min-h-[44px] disabled:opacity-50"
                      >
                        {ackMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>Acknowledge</span>
                      </button>
                    )}

                    {alert.status !== 'RESOLVED' && (
                      <button
                        onClick={() => resolveMutation.mutate(alert.id)}
                        disabled={resolveMutation.isPending}
                        className="px-4 py-2 rounded-btn bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors min-h-[44px] disabled:opacity-50"
                      >
                        {resolveMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCheck className="w-4 h-4" />
                        )}
                        <span>Resolve</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
