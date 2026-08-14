import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Droplets, BatteryCharging, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { getWaterLatest, getWaterHistory } from '../api/water';
import { Navbar } from '../components/Navbar';
import { StatusChip } from '../components/StatusChip';
import { ChartSkeleton, CardSkeleton } from '../components/LoadingSkeleton';

export const WaterPage: React.FC = () => {
  const {
    data: latestWater,
    isLoading: isLoadingLatest,
    refetch: refetchLatest,
    isFetching: isFetchingLatest,
  } = useQuery({
    queryKey: ['water-latest'],
    queryFn: getWaterLatest,
    refetchInterval: 15000,
  });

  const {
    data: historyWater,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['water-history'],
    queryFn: () => getWaterHistory(undefined, 30),
    refetchInterval: 15000,
  });

  const handleRefresh = () => {
    refetchLatest();
    refetchHistory();
  };

  const currentLevel = latestWater?.water_level ?? 0;
  let waterStatus = 'NORMAL';
  if (currentLevel < 20) {
    waterStatus = 'CRITICAL';
  } else if (currentLevel <= 40) {
    waterStatus = 'WARNING';
  }

  // Format historical chart data
  const chartData = (historyWater || [])
    .slice()
    .reverse()
    .map((item) => ({
      time: new Date(item.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      waterLevel: item.water_level ?? 0,
    }));

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-bg">
      <Navbar
        title="Water Tank Level Monitoring"
        subtitle="Real-time IoT water tank levels, history trends & low level alerts"
        onRefresh={handleRefresh}
        isRefreshing={isFetchingLatest}
      />

      <div className="p-6 space-y-8 max-w-7xl w-full mx-auto">
        {/* Main Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Level Large Card */}
          <div className="md:col-span-2 bg-surface rounded-card p-6 border border-border flex flex-col justify-between shadow-lg">
            {isLoadingLatest ? (
              <CardSkeleton />
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Droplets className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary text-base">Main Tank Level</h3>
                      <p className="text-xs text-text-secondary flex items-center mt-0.5">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-primary" />
                        Main Water Tank (WATER-001)
                      </p>
                    </div>
                  </div>
                  <StatusChip type="severity" value={waterStatus} />
                </div>

                <div className="mt-6 flex items-baseline space-x-3">
                  <span className="text-5xl font-extrabold text-text-primary tracking-tight">
                    {currentLevel.toFixed(1)}%
                  </span>
                  <span className="text-sm font-semibold text-text-secondary">Capacity</span>
                </div>

                {/* Level Progress Bar */}
                <div className="mt-4 w-full bg-surface-alt rounded-full h-3.5 border border-border overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      currentLevel < 20
                        ? 'bg-critical'
                        : currentLevel <= 40
                        ? 'bg-warning'
                        : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.min(Math.max(currentLevel, 0), 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-text-secondary">
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" />
                Updated:{' '}
                {latestWater?.timestamp
                  ? new Date(latestWater.timestamp).toLocaleString()
                  : 'N/A'}
              </span>
              <span className="flex items-center">
                <BatteryCharging className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Battery: {latestWater?.battery_level ?? 95}%
              </span>
            </div>
          </div>

          {/* Quick Threshold Guidelines Card */}
          <div className="bg-surface rounded-card p-6 border border-border flex flex-col justify-between shadow-lg">
            <div>
              <h4 className="font-bold text-text-primary text-sm mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 text-amber-400 mr-2" />
                Threshold Guidelines
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed mb-4">
                Automated alert generation triggers when tank levels fall into critical or warning ranges.
              </p>
              <div className="space-y-3">
                <div className="p-3 rounded-btn bg-critical/10 border border-critical/30 flex justify-between items-center text-xs">
                  <span className="font-semibold text-red-400">&lt; 20% Capacity</span>
                  <span className="font-bold text-red-400">CRITICAL ALERT</span>
                </div>
                <div className="p-3 rounded-btn bg-warning/10 border border-warning/30 flex justify-between items-center text-xs">
                  <span className="font-semibold text-amber-400">20% – 40% Capacity</span>
                  <span className="font-bold text-amber-400">WARNING ALERT</span>
                </div>
                <div className="p-3 rounded-btn bg-emerald-500/10 border border-emerald-500/30 flex justify-between items-center text-xs">
                  <span className="font-semibold text-emerald-400">&gt; 40% Capacity</span>
                  <span className="font-bold text-emerald-400">NORMAL OPERATIONAL</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 24-Hour Trend Line Chart */}
        <div className="bg-surface rounded-card p-6 border border-border shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-text-primary text-base">Telemetry History Trend</h3>
            <span className="text-xs text-text-secondary">Last 30 Readings</span>
          </div>

          {isLoadingHistory ? (
            <ChartSkeleton />
          ) : chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-text-secondary text-sm">
              No historical water telemetry available
            </div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                  <Line
                    type="monotone"
                    dataKey="waterLevel"
                    stroke="#06B6D4"
                    strokeWidth={3}
                    dot={{ fill: '#06B6D4', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
