import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  ChevronDown,
  Radio,
  User,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function TopHeader({
  title,
  subtitle,
  variant = 'admin', // 'admin' | 'scorer'
  onToggleMobileSidebar,
  searchPlaceholder = 'Search tournaments, teams, players...',
  onSearchChange,
  searchValue = ''
}) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Retrieve user or mock based on variant
  const isScorer = variant === 'scorer';
  const userName = isScorer ? 'Rohit Kumar' : 'Admin';
  const userRole = isScorer ? 'Official Scorer' : 'Administrator';

  const handleLogout = () => {
    localStorage.removeItem('cdms_auth_user');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-sm">
      {/* Left side */}
      <div className="flex items-center gap-4 flex-1">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {isScorer ? (
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Live Scoring
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              LIVE
            </span>
          </div>
        ) : (
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        )}
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3 lg:gap-5">
        {/* Match status badge for scorer */}
        {isScorer && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Match In Progress</span>
          </div>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900">Notifications</span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">2 New</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs mt-2 space-y-2">
                <div className="pt-2">
                  <p className="font-semibold text-slate-800">Match 14: Rangers vs Strikers</p>
                  <p className="text-slate-500">Innings 1 in progress (16.2 overs)</p>
                  <span className="text-[10px] text-slate-400">Just now</span>
                </div>
                <div className="pt-2">
                  <p className="font-semibold text-slate-800">Tournament Schedule Updated</p>
                  <p className="text-slate-500">City Champions League fixtures published</p>
                  <span className="text-[10px] text-slate-400">2 hours ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile / Account Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1 pl-2 pr-2.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
              {userName.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-800 leading-tight">{userName}</div>
              <div className="text-[11px] text-slate-400 font-medium leading-none">{userRole}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-800">{userName}</p>
                <p className="text-[11px] text-slate-500">{userRole}</p>
              </div>

              <Link
                to="/admin/dashboard"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Dashboard
              </Link>
              <Link
                to="/scorer/console/1"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
              >
                <Radio className="w-4 h-4" />
                Live Scoring Console
              </Link>
              <Link
                to="/"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Public Home
              </Link>

              <div className="border-t border-slate-100 my-1"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
