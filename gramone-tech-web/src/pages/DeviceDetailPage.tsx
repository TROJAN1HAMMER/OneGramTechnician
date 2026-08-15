import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Cpu,
  MapPin,
  Clock,
  ArrowLeft,
  Activity,
  AlertTriangle,
  Droplets,
  Trash2,
  Thermometer,
  Radio,
} from 'lucide-react';
import { getDeviceById, getDevices } from '../api/devices';
import { getAlerts } from '../api/alerts';
import { Navbar } from '../components/Navbar';
import { StatusChip } from '../components/StatusChip';
import { CardSkeleton } from '../components/LoadingSkeleton';
import type { Device } from '../types';
import { parseDate } from '../utils/date';

// Map device type → icon + accent colour
const deviceTypeConfig: Record<
  string,
  { icon: React.FC<{ className?: string }>; color: string; bg: string }
> = {
  water: { icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/30' },
  bin: { icon: Trash2, color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30' },
  environment: { icon: Thermometer, color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30' },
  rfid_button: { icon: Radio, color: 'text-primary', bg: 'bg-primary/15 border-primary/30' },
};

export const DeviceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deviceId = parseInt(id || '1', 10);

  // Fetch all devices for the switcher
  const { data: allDevices } = useQuery({
    queryKey: ['devices-list'],
    queryFn: getDevices,
    staleTime: 60000,
  });

  const {
    data: device,
    isLoading: isLoadingDevice,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['device', deviceId],
    queryFn: () => getDeviceById(deviceId),
  });

  const { data: deviceAlerts, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ['device-alerts', deviceId],
    queryFn: () => getAlerts({ device_id: deviceId }),
  });

  const cfg =
    device && deviceTypeConfig[device.device_type]
      ? deviceTypeConfig[device.device_type]
      : deviceTypeConfig['rfid_button'];

  const DeviceIcon = cfg.icon;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-bg">
      <Navbar
        title={device ? `Device ${device.device_code}` : 'Device Details'}
        subtitle="IoT Node hardware metadata, last seen, & alert history"
        onRefresh={refetch}
        isRefreshing={isFetching}
      />

      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Back Link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Operations Dashboard</span>
        </Link>

        {/* ── Device Switcher ─────────────────────────────────────────── */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-lg">
          <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-3 flex items-center">
            <Cpu className="w-3.5 h-3.5 mr-1.5 text-primary" />
            Switch Device Node
          </p>

          {!allDevices ? (
            <div className="flex space-x-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-10 w-32 rounded-btn bg-surface-alt animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allDevices.map((d: Device) => {
                const isActive = d.id === deviceId;
                const tcfg =
                  deviceTypeConfig[d.device_type] ?? deviceTypeConfig['rfid_button'];
                const DIcon = tcfg.icon;
                return (
                  <button
                    key={d.id}
                    onClick={() => navigate(`/devices/${d.id}`)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-btn border text-xs font-semibold transition-all min-h-[44px] ${
                      isActive
                        ? `${tcfg.bg} ${tcfg.color} shadow-md`
                        : 'bg-surface-alt border-border/50 text-text-secondary hover:border-border hover:text-text-primary'
                    }`}
                  >
                    <DIcon className="w-4 h-4 shrink-0" />
                    <span>{d.device_code}</span>
                    {/* Online indicator dot */}
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        d.status === 'online' ? 'bg-emerald-400' : 'bg-slate-500'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Main Content ─────────────────────────────────────────────── */}
        {isLoadingDevice ? (
          <CardSkeleton />
        ) : !device ? (
          <div className="bg-surface rounded-card p-12 text-center text-text-secondary border border-border">
            Device with ID #{deviceId} not found.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Metadata Card (2 cols) */}
            <div className="lg:col-span-2 bg-surface rounded-card p-6 border border-border space-y-6 shadow-lg">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center ${cfg.bg} ${cfg.color}`}
                  >
                    <DeviceIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">{device.device_code}</h2>
                    <p className="text-xs text-text-secondary capitalize">{device.device_type} Node</p>
                  </div>
                </div>
                <StatusChip type="deviceStatus" value={device.status} />
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-btn bg-surface-alt border border-border/40 space-y-1">
                  <span className="text-text-secondary font-medium">Location Name</span>
                  <p className="font-bold text-text-primary text-sm flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-primary" />
                    {device.location_name}
                  </p>
                </div>

                <div className="p-4 rounded-btn bg-surface-alt border border-border/40 space-y-1">
                  <span className="text-text-secondary font-medium">GPS Coordinates</span>
                  <p className="font-bold text-text-primary text-sm">
                    {device.latitude ?? '12.9716'}, {device.longitude ?? '77.5946'}
                  </p>
                </div>

                <div className="p-4 rounded-btn bg-surface-alt border border-border/40 space-y-1">
                  <span className="text-text-secondary font-medium">Last Seen Timestamp</span>
                  <p className="font-bold text-text-primary text-sm flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    {device.last_seen_at
                      ? parseDate(device.last_seen_at).toLocaleString()
                      : 'Never / Standby'}
                  </p>
                </div>

                <div className="p-4 rounded-btn bg-surface-alt border border-border/40 space-y-1">
                  <span className="text-text-secondary font-medium">Registration Date</span>
                  <p className="font-bold text-text-primary text-sm">
                    {parseDate(device.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="border-t border-border/40 pt-4">
                <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center">
                  <Activity className="w-4 h-4 mr-1.5 text-primary" />
                  Status & Telemetry Health Timeline
                </h3>
                <div className="p-4 rounded-btn bg-surface-alt/60 border border-border/40 text-xs text-text-secondary space-y-2">
                  <div className="flex justify-between">
                    <span>Node Connection Status</span>
                    <span
                      className={`font-bold ${
                        device.status === 'online' ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {device.status === 'online' ? 'ACTIVE TELEMETRY STREAM' : 'OFFLINE / STANDBY'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Firmware Protocol</span>
                    <span className="font-mono text-text-primary">GramOne ESP32 v1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Device Type</span>
                    <span className={`font-bold capitalize ${cfg.color}`}>
                      {device.device_type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert History Sidebar */}
            <div className="bg-surface rounded-card p-6 border border-border flex flex-col shadow-lg">
              <div className="flex items-center space-x-2 border-b border-border/40 pb-4 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-text-primary text-sm">Device Alert History</h3>
              </div>

              {isLoadingAlerts ? (
                <div className="space-y-3">
                  <div className="h-14 bg-surface-alt rounded-btn animate-pulse" />
                  <div className="h-14 bg-surface-alt rounded-btn animate-pulse" />
                </div>
              ) : !deviceAlerts || deviceAlerts.length === 0 ? (
                <div className="py-8 text-center text-xs text-text-secondary">
                  No alerts recorded for this device.
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-96">
                  {deviceAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-btn bg-surface-alt border border-border/40 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <StatusChip type="severity" value={alert.severity} />
                        <StatusChip type="status" value={alert.status} />
                      </div>
                      <p className="font-medium text-text-primary">{alert.message}</p>
                      <p className="text-[10px] text-text-secondary">
                        {parseDate(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
