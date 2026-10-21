import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Search, User, Sun } from 'lucide-react';

const Navbar = ({ isLoggedIn = false }) => {
  const location = useLocation();

  const navItems = [
    { 
      name: 'Home', 
      path: '/',
      isActive: location.pathname === '/' 
    },
    { 
      name: 'Tournaments', 
      path: '/tournaments',
      isActive: location.pathname === '/tournaments' || location.pathname === '/schedule-points'
    },
    { 
      name: 'Teams', 
      path: '/teams',
      isActive: location.pathname === '/teams'
    },
    { 
      name: 'Players', 
      path: '/players',
      isActive: location.pathname.startsWith('/player')
    },
    { 
      name: 'Live Scores', 
      path: '/live-scores',
      isActive: location.pathname.startsWith('/live-score') || location.pathname.startsWith('/live-scorecard')
    },
  ];

  return (
    <nav className="w-full bg-[#070c18] border-b border-slate-800/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-8 shrink-0">
            <Link to="/" className="flex items-center gap-2.5">
              {/* Cricket Ball Logo icon */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center relative shadow-md overflow-hidden">
                <div className="absolute inset-0 border-[1.5px] border-white/40 rounded-full scale-90 rotate-45" />
                <div className="w-full h-[2px] bg-white/70 rotate-45" />
                <div className="w-full h-[1px] bg-white/30 rotate-45 translate-y-[2px]" />
              </div>
              <span className="text-xl font-black text-white tracking-wider">CDMS</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3.5 py-1.5 text-sm font-medium transition-colors relative ${
                    item.isActive
                      ? 'text-white font-semibold after:content-[""] after:absolute after:bottom-[-20px] after:left-3.5 after:right-3.5 after:h-0.5 after:bg-emerald-400'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Search Bar & Actions */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Search Input */}
            <div className="relative hidden sm:block w-56 md:w-64 lg:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search teams, players, tournaments..."
                className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-[#111927] border border-slate-700/60 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500/80 transition-all"
              />
            </div>

            {/* Light / Theme Toggle Button */}
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-slate-800/60"
              aria-label="Theme toggle"
            >
              <Sun className="w-5 h-5" />
            </button>

            {/* Live Indicator Pill */}
            <Link 
              to="/live-scores"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:border-emerald-500/60 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live</span>
            </Link>

            {/* Login or User Profile Button */}
            {isLoggedIn ? (
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-emerald-500 transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#00d084] hover:bg-emerald-500 text-slate-950 font-bold text-sm shadow-sm transition-all"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-slate-800/60 overflow-x-auto text-xs">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`px-2 py-1 whitespace-nowrap ${
                item.isActive ? 'text-emerald-400 font-bold' : 'text-slate-300'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
