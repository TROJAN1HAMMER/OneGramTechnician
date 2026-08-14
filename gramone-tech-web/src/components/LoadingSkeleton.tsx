import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-surface rounded-card p-6 border border-border/40 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-surface-alt rounded w-24" />
      <div className="w-10 h-10 bg-surface-alt rounded-lg" />
    </div>
    <div className="h-9 bg-surface-alt rounded w-32 mb-2" />
    <div className="h-3 bg-surface-alt rounded w-20" />
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="bg-surface rounded-card p-6 border border-border/40 animate-pulse h-80 flex flex-col justify-between">
    <div className="h-5 bg-surface-alt rounded w-40" />
    <div className="h-48 bg-surface-alt/50 rounded w-full my-4" />
    <div className="flex justify-between">
      <div className="h-3 bg-surface-alt rounded w-16" />
      <div className="h-3 bg-surface-alt rounded w-16" />
      <div className="h-3 bg-surface-alt rounded w-16" />
    </div>
  </div>
);
