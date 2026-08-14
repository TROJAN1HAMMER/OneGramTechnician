import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Droplets,
  Trash2,
  Thermometer,
  BellRing,
  Cpu,
  LogOut,
  Shield,
} from 'lucide-react';
import { logout } from '../api/auth';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Access & Safety', path: '/access-control', icon: Shield },
  { name: 'Water Monitoring', path: '/water', icon: Droplets },
  { name: 'Smart Bin', path: '/bin', icon: Trash2 },
  { name: 'Environment', path: '/environment', icon: Thermometer },
  { name: 'Alert Center', path: '/alerts', icon: BellRing },
];

export const Sidebar: React.FC = () => {
  const userEmail = localStorage.getItem('user_email') || 'tech@gramone.org';

  return (
    <aside className="w-64 bg-surface border-r border-border min-h-screen flex flex-col justify-between p-4 shrink-0">
      <div>
        {/* Logo Branding */}
        <div className="flex items-center space-x-3 px-3 py-4 mb-6 border-b border-border/40">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center">
            <Cpu className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-text-primary text-base leading-tight">GramOne IoT</h1>
            <p className="text-xs text-text-secondary font-medium">Technician Operations</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-btn text-sm font-medium transition-colors min-h-[48px] ${
                    isActive
                      ? 'bg-primary text-text-primary shadow-sm'
                      : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="border-t border-border/40 pt-4 space-y-3">
        <div className="px-3 py-2 bg-surface-alt/50 rounded-btn">
          <p className="text-xs text-text-secondary">Logged in as</p>
          <p className="text-sm font-semibold text-text-primary truncate">{userEmail}</p>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-btn bg-critical/10 text-red-400 hover:bg-critical/20 border border-critical/30 text-sm font-semibold transition-colors min-h-[48px]"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
