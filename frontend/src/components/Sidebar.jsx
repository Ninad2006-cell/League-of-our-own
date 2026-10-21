import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Trophy,
  Users,
  User,
  MapPin,
  Calendar,
  Radio,
  BarChart3,
  PieChart,
  ShieldCheck,
  FileText,
  X
} from 'lucide-react';
import { CDMSLogo } from './TeamLogos';
import sidebarBg from '../assets/images/sidebar-bg.png';

export default function Sidebar({
  activeTab = 'dashboard',
  onTabChange,
  isMobileOpen = false,
  onCloseMobile
}) {
  const location = useLocation();
  const isScorerConsole = location.pathname.includes('/scorer/console');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard?tab=overview' },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy, path: '/admin/dashboard?tab=tournaments' },
    { id: 'teams', label: 'Teams', icon: Users, path: '/admin/dashboard?tab=teams' },
    { id: 'players', label: 'Players', icon: User, path: '/admin/dashboard?tab=players' },
    { id: 'venues', label: 'Venues', icon: MapPin, path: '/admin/dashboard?tab=venues' },
    { id: 'matches', label: 'Matches', icon: Calendar, path: '/admin/dashboard?tab=matches' },
    { id: 'live-scoring', label: 'Live Scoring', icon: Radio, path: '/scorer/console/1' },
    { id: 'points', label: 'Points Table', icon: BarChart3, path: '/admin/dashboard?tab=points' },
    { id: 'stats', label: 'Statistics', icon: PieChart, path: '/admin/dashboard?tab=stats' },
    { id: 'users', label: 'Users', icon: ShieldCheck, path: '/admin/dashboard?tab=users' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/admin/dashboard?tab=reports' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container with prominent background image coverage */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(6, 14, 36, 0.75) 0%, rgba(6, 14, 36, 0.45) 35%, rgba(6, 14, 36, 0.15) 65%, rgba(6, 14, 36, 0.40) 100%), url(${sidebarBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/10 bg-slate-950/40 backdrop-blur-sm">
          <Link to="/" className="flex items-center gap-3 group">
            <CDMSLogo className="w-10 h-10 group-hover:scale-105 transition-transform" />
            <div>
              <div className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5 drop-shadow">
                CDMS
              </div>
              <p className="text-[10px] tracking-wider uppercase text-slate-200 font-medium leading-none drop-shadow">
                Cricket Data Management System
              </p>
            </div>
          </Link>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            // Determine if item is currently active
            const isActive = isScorerConsole
              ? item.id === 'live-scoring'
              : activeTab === item.id || (item.id === 'dashboard' && activeTab === 'overview');

            const handleClick = (e) => {
              if (onTabChange && !isScorerConsole && item.id !== 'live-scoring') {
                e.preventDefault();
                onTabChange(item.id === 'dashboard' ? 'overview' : item.id);
                if (onCloseMobile) onCloseMobile();
              }
            };

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={handleClick}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#00c261] text-white shadow-lg shadow-emerald-500/30 font-semibold'
                    : 'text-slate-200 hover:text-white hover:bg-white/15 drop-shadow'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`} />
                <span className="truncate">{item.label}</span>
                {item.id === 'live-scoring' && (
                  <span className="ml-auto flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom session indicator with transparent backdrop so batsman & pitch remain clearly visible */}
        <div className="p-4 border-t border-white/15 bg-black/40 backdrop-blur-md text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium drop-shadow">CDMS Engine v2.4</span>
          </div>
          <Link to="/" className="text-emerald-300 hover:text-emerald-200 hover:underline font-semibold drop-shadow">
            Home
          </Link>
        </div>
      </aside>
    </>
  );
}
