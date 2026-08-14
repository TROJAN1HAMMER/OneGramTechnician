import React from 'react';
import { RefreshCw, Radio } from 'lucide-react';

interface NavbarProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  subtitle,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-text-primary tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4">
        {/* Live Network Stream Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Live Backend Stream</span>
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-btn bg-surface-alt hover:bg-border text-text-primary border border-border text-sm font-medium transition-colors min-h-[44px] disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        )}
      </div>
    </header>
  );
};
