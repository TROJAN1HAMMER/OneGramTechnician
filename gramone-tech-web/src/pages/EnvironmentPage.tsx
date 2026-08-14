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
import { Thermometer, Wind, Clock, ShieldAlert } from 'lucide-react';
import { getEnvironmentLatest, getEnvironmentHistory } from '../api/environment';
import { Navbar } from '../components/Navbar';
import { StatusChip } from '../components/StatusChip';
import { ChartSkeleton, CardSkeleton } from '../components/LoadingSkeleton';
import { useRealtimeTelemetry } from '../hooks/useRealtimeTelemetry';

export const EnvironmentPage: React.FC = () => {
  useRealtimeTelemetry();

  const {
    data: latestEnv,
    isLoading: isLoadingLatest,
    refetch: refetchLatest,
    isFetching: isFetchingLatest,
  } = useQuery({
    queryKey: ['environment-latest'],
    queryFn: getEnvironmentLatest,
    refetchInterval: 15000,
  });

  const {
    data: historyEnv,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['environment-history'],
    queryFn: () => getEnvironmentHistory(undefined, 30),
    refetchInterval: 15000,
  });

  const handleRefresh = () => {
    refetchLatest();
    refetchHistory();
  };

  const temp = latestEnv?.temperature ?? 0;
  const humidity = latestEnv?.humidity ?? 0;

  const isHighTemp = temp > 40;
  const isHighHumidity = humidity > 85;

  let comfortStatus = 'Optimal Environmental Conditions';
  let comfortSeverity = 'NORMAL';
  if (isHighTemp && isHighHumidity) {
    comfortStatus = 'Warning: High Temp & High Humidity';
    comfortSeverity = 'WARNING';
  } else if (isHighTemp) {
    comfortStatus = 'Warning: High Temperature Threshold Exceeded';
    comfortSeverity = 'WARNING';
  } else if (isHighHumidity) {
    comfortStatus = 'Warning: High Humidity Threshold Exceeded';
    comfortSeverity = 'WARNING';
  }

  const chartData = (historyEnv || [])
    .slice()
    .reverse()
    .map((item) => ({
      time: new Date(item.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      temperature: item.temperature ?? 0,
      humidity: item.humidity ?? 0,
    }));

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-bg">
      <Navbar
        title="Environmental Sensor Monitoring"
        subtitle="Real-time ambient temperature, relative humidity & weather comfort indicators"
        onRefresh={handleRefresh}
        isRefreshing={isFetchingLatest}
      />

      <div className="p-6 space-y-8 max-w-7xl w-full mx-auto">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Temperature Card */}
          <div className="bg-surface rounded-card p-6 border border-border flex flex-col justify-between shadow-lg">
            {isLoadingLatest ? (
              <CardSkeleton />
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Temperature
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <Thermometer className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline space-x-2">
                  <span className="text-4xl font-extrabold text-text-primary tracking-tight">
                    {temp.toFixed(1)}°C
                  </span>
                  {isHighTemp && (
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      High Temp &gt;40°C
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="mt-4 pt-3 border-t border-border/40 text-xs text-text-secondary flex justify-between">
              <span>Node: ENV-001</span>
              <span>School Campus</span>
            </div>
          </div>

          {/* Humidity Card */}
          <div className="bg-surface rounded-card p-6 border border-border flex flex-col justify-between shadow-lg">
            {isLoadingLatest ? (
              <CardSkeleton />
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Relative Humidity
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <Wind className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline space-x-2">
                  <span className="text-4xl font-extrabold text-text-primary tracking-tight">
                    {humidity.toFixed(1)}%
                  </span>
                  {isHighHumidity && (
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      High Humidity &gt;85%
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="mt-4 pt-3 border-t border-border/40 text-xs text-text-secondary flex justify-between">
              <span>Status: {isHighHumidity ? 'Elevated' : 'Normal'}</span>
              <span>Battery: {latestEnv?.battery_level ?? 90}%</span>
            </div>
          </div>

          {/* Comfort Indicator Card */}
          <div className="bg-surface rounded-card p-6 border border-border flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Comfort Status
                </span>
                <StatusChip type="severity" value={comfortSeverity} />
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-base font-bold text-text-primary flex items-center">
                  <ShieldAlert className="w-4 h-4 mr-2 text-primary" />
                  {comfortStatus}
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Calculated from DHT environmental telemetry readings at School Campus Sensor (ENV-001).
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/40 text-xs text-text-secondary flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" />
              Updated:{' '}
              {latestEnv?.timestamp
                ? new Date(latestEnv.timestamp).toLocaleTimeString()
                : 'N/A'}
            </div>
          </div>
        </div>

        {/* Environmental Trends Line Chart */}
        <div className="bg-surface rounded-card p-6 border border-border shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-text-primary text-base">Temperature & Humidity Trends</h3>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <span className="flex items-center text-orange-400">
                <span className="w-3 h-3 rounded-full bg-orange-500 mr-1.5" />
                Temperature (°C)
              </span>
              <span className="flex items-center text-sky-400">
                <span className="w-3 h-3 rounded-full bg-sky-500 mr-1.5" />
                Humidity (%)
              </span>
            </div>
          </div>

          {isLoadingHistory ? (
            <ChartSkeleton />
          ) : chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-text-secondary text-sm">
              No historical environmental telemetry available
            </div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} />
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
                    dataKey="temperature"
                    stroke="#F97316"
                    strokeWidth={2.5}
                    dot={{ fill: '#F97316', r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="#38BDF8"
                    strokeWidth={2.5}
                    dot={{ fill: '#38BDF8', r: 3 }}
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
