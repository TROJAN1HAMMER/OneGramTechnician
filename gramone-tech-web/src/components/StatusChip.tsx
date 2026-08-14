import React from 'react';

interface StatusChipProps {
  type: 'severity' | 'status' | 'deviceStatus';
  value: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ type, value }) => {
  let styleClasses = 'bg-surface-alt text-text-secondary border-border';

  const valUpper = value.toUpperCase();

  if (type === 'severity') {
    if (valUpper === 'CRITICAL') {
      styleClasses = 'bg-critical/15 text-red-400 border-critical/30';
    } else if (valUpper === 'WARNING') {
      styleClasses = 'bg-warning/15 text-amber-400 border-warning/30';
    }
  } else if (type === 'status') {
    if (valUpper === 'PENDING') {
      styleClasses = 'bg-red-500/15 text-red-400 border-red-500/30';
    } else if (valUpper === 'ACKNOWLEDGED') {
      styleClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    } else if (valUpper === 'RESOLVED') {
      styleClasses = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  } else if (type === 'deviceStatus') {
    if (valUpper === 'ONLINE') {
      styleClasses = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    } else {
      styleClasses = 'bg-slate-700/40 text-slate-400 border-slate-600/30';
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styleClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {value}
    </span>
  );
};
