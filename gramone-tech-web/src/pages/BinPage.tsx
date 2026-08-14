import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Trash2, AlertTriangle, MapPin, Clock, BatteryCharging } from 'lucide-react';
import { getBinLatest, getBinHistory } from '../api/bin';
import { Navbar } from '../components/Navbar';
import { StatusChip } from '../components/StatusChip';
import { ChartSkeleton, CardSkeleton } from '../components/LoadingSkeleton';

export const BinPage: React.FC = () => {
  const {
    data: latestBin,
    isLoading: isLoadingLatest,
    refetch: refetchLatest,
    isFetching: isFetchingLatest,
  } = useQuery({
    queryKey: ['bin-latest'],
    queryFn: getBinLatest,
    refetchInterval: 15000,
  });

  const {
    data: historyBin,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['bin-history'],
    queryFn: () => getBinHistory(undefined, 30),
    refetchInterval: 15000,
  });

  const handleRefresh = () => {
    refetchLatest();
    refetchHistory();
  };

  const fillLevel = latestBin?.fill_level ?? 0;
  const isOverflowRisk = fillLevel > 85;

  const chartData = (historyBin || [])
    .slice()
    .reverse()
    .map((item) => ({
      time: new Date(item.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      fillLevel: item.fill_level ?? 0,
    }));

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-bg">
      <Navbar
        title="Smart Waste Bin Monitoring"
        subtitle="Real-time fill capacity, overflow alert monitoring & collection dispatch"
        onRefresh={handleRefresh}
        isRefreshing={isFetchingLatest}
      />

      <div className="p-6 space-y-8 max-w-7xl w-full mx-auto">
        {/* Overflow Risk Banner */}
        {isOverflowRisk && (
          <div className="bg-critical/15 border border-critical/30 rounded-card p-6 flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-bold text-base">CRITICAL: Waste Bin Overflow Warning</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Market Street Bin (BIN-001) has reached {fillLevel}% capacity (&gt;85% threshold). Dispatch collection technician immediately.
                </p>
              </div>
            </div>
            <StatusChip type="severity" value="CRITICAL" />
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fill Level Card */}
          <div className="md:col-span-2 bg-surface rounded-card p-6 border border-border flex flex-col justify-between shadow-lg">
            {isLoadingLatest ? (
              <CardSkeleton />
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Trash2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary text-base">Market Street Smart Bin</h3>
                      <p className="text-xs text-text-secondary flex items-center mt-0.5">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-primary" />
                        Market Street Junction (BIN-001)
                      </p>
                    </div>
                  </div>
                  <StatusChip type="severity" value={isOverflowRisk ? 'CRITICAL' : 'NORMAL'} />
                </div>

                <div className="mt-6 flex items-baseline space-x-3">
                  <span className="text-5xl font-extrabold text-text-primary tracking-tight">
                    {fillLevel.toFixed(1)}%
                  </span>
                  <span className="text-sm font-semibold text-text-secondary">Capacity Filled</span>
                </div>

                {/* Progress Ring / Bar */}
                <div className="mt-4 w-full bg-surface-alt rounded-full h-3.5 border border-border overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverflowRisk ? 'bg-critical' : 'bg-purple-500'
                    }`}
                    style={{ width: `${Math.min(Math.max(fillLevel, 0), 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-text-secondary">
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" />
                Last Serviced / Updated:{' '}
                {latestBin?.timestamp
                  ? new Date(latestBin.timestamp).toLocaleString()
                  : 'N/A'}
              </span>
              <span className="flex items-center">
                <BatteryCharging className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Battery: {latestBin?.battery_level ?? 88}%
              </span>
            </div>
          </div>

          {/* Collection Status Card */}
          <div className="bg-surface rounded-card p-6 border border-border flex flex-col justify-between shadow-lg">
            <div>
              <h4 className="font-bold text-text-primary text-sm mb-3">Bin Dispatch Status</h4>
              <p className="text-xs text-text-secondary leading-relaxed mb-4">
                Smart ultrasonic sensors trigger alerts when fill capacity exceeds 85% to prevent waste overflow.
              </p>
              <div className="space-y-3">
                <div className="p-3 rounded-btn bg-surface-alt border border-border/50 flex justify-between items-center text-xs">
                  <span className="text-text-secondary">Target Dispatch Time</span>
                  <span className="font-semibold text-text-primary">&lt; 2 Hours</span>
                </div>
                <div className="p-3 rounded-btn bg-surface-alt border border-border/50 flex justify-between items-center text-xs">
                  <span className="text-text-secondary">Sensor Frequency</span>
                  <span className="font-semibold text-text-primary">Every 15 Mins</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Chart */}
        <div className="bg-surface rounded-card p-6 border border-border shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-text-primary text-base">Fill Level Trend Chart</h3>
            <span className="text-xs text-text-secondary">Last 30 Telemetry Cycles</span>
          </div>

          {isLoadingHistory ? (
            <ChartSkeleton />
          ) : chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-text-secondary text-sm">
              No historical bin telemetry available
            </div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={12} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="fillLevel"
                    stroke="#A855F7"
                    fill="#A855F7"
                    fillOpacity={0.2}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
