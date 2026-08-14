import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert, IdCard, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getRfidHistory } from '../api/access';
import { getAlerts } from '../api/alerts';
import { Navbar } from '../components/Navbar';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { useRealtimeTelemetry } from '../hooks/useRealtimeTelemetry';

export const AccessSafetyPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Listen for real-time updates for rfid and emergency events
  useRealtimeTelemetry();

  // Fetch RFID history
  const {
    data: rfidScans,
    isLoading: isRfidLoading,
    isFetching: isRfidFetching,
    refetch: refetchRfid,
  } = useQuery({
    queryKey: ['rfid-history'],
    queryFn: () => getRfidHistory(),
    refetchInterval: 15000,
  });

  // Fetch Emergency Alerts (Pending Critical)
  const {
    data: alerts,
    isLoading: isAlertsLoading,
    isFetching: isAlertsFetching,
    refetch: refetchAlerts,
  } = useQuery({
    queryKey: ['alerts', 'PENDING', 'CRITICAL'],
    queryFn: () => getAlerts({ status: 'PENDING', severity: 'CRITICAL', limit: 50 }),
    refetchInterval: 15000,
  });

  const handleRefresh = () => {
    refetchRfid();
    refetchAlerts();
  };

  const emergencyAlerts = (alerts || []).filter(a => a.alert_type === 'EMERGENCY_BUTTON');

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-bg">
      <Navbar
        title="Access & Safety"
        subtitle="Monitor RFID access logs and Emergency Stop triggers"
        onRefresh={handleRefresh}
        isRefreshing={isRfidFetching || isAlertsFetching}
      />

      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* Emergency Stop Alerts Section */}
        <div className="bg-surface rounded-card border border-border shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between bg-critical/5">
            <div className="flex items-center space-x-3">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">Active Emergency Stops</h2>
            </div>
            {emergencyAlerts.length > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-critical/20 text-red-400 text-xs font-bold animate-pulse">
                {emergencyAlerts.length} Active
              </span>
            )}
          </div>
          
          <div className="p-6">
            {isAlertsLoading ? (
               <CardSkeleton />
            ) : emergencyAlerts.length === 0 ? (
               <div className="py-8 flex flex-col items-center justify-center text-center">
                 <ShieldCheck className="w-12 h-12 text-emerald-500/50 mb-3" />
                 <h3 className="text-sm font-bold text-text-primary">No Emergency Alerts</h3>
                 <p className="text-xs text-text-secondary mt-1">All safety systems normal.</p>
               </div>
            ) : (
               <div className="space-y-4">
                 {emergencyAlerts.map(alert => (
                   <div key={alert.id} className="p-4 rounded-btn border border-critical/30 bg-critical/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div className="flex items-start space-x-3">
                       <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                       <div>
                         <p className="text-sm font-bold text-text-primary">{alert.message}</p>
                         <p className="text-xs text-text-secondary mt-1">
                           Device: <span className="text-red-400 font-mono">{alert.device_code}</span> • Location: {alert.location_name}
                         </p>
                       </div>
                     </div>
                     <div className="text-xs text-text-secondary whitespace-nowrap">
                       {new Date(alert.created_at).toLocaleString()}
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>

        {/* RFID Scans Section */}
        <div className="bg-surface rounded-card border border-border shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border/40 flex items-center space-x-3 bg-surface-alt/50">
            <IdCard className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">Recent Access Logs (RFID)</h2>
          </div>
          
          {isRfidLoading ? (
            <div className="p-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : !rfidScans || rfidScans.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <IdCard className="w-12 h-12 text-slate-500/30 mb-3" />
              <h3 className="text-sm font-bold text-text-primary">No Access Logs</h3>
              <p className="text-xs text-text-secondary mt-1">No RFID scans have been recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-alt/30 text-xs uppercase tracking-wider text-text-secondary border-b border-border/40">
                    <th className="px-6 py-3 font-semibold">Card UID</th>
                    <th className="px-6 py-3 font-semibold">Device Code</th>
                    <th className="px-6 py-3 font-semibold">Time Scanned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm">
                  {rfidScans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-surface-alt/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-primary font-medium">{scan.card_uid}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                        {scan.device_code || `ID: ${scan.device_id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                        {new Date(scan.scanned_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
