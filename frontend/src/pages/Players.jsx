import React, { useState, useEffect } from 'react';
import { 
  User, 
  Award, 
  TrendingUp, 
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const Players = () => {
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await api.players.getAll({
          search: searchQuery.trim(),
          role: selectedRole
        });
        if (!isMounted) return;
        setPlayers(data);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load players');
      } finally {
        if (isMounted) setLoading(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedRole]);

  return (
    <div className="min-h-screen bg-[#eef2f6] pb-16 font-sans">
      {/* Top Banner */}
      <div className="relative w-full h-[180px] sm:h-[200px] bg-[#070d1e] text-white overflow-hidden shadow-md flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/Live_Score_background.jpeg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/95 via-[#061129]/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <User className="w-3.5 h-3.5" />
              <span>Player Directory & Statistics</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
              Player Profiles & Career Records
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Search and explore domestic and league cricketers, batting metrics, bowling aggregates, and form.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 -mt-6">

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search player name..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs font-bold">
            {['all', 'Batter', 'Bowler', 'All-Rounder', 'Wicket-Keeper'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                  selectedRole === role
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {role === 'all' ? 'All Roles' : role}
              </button>
            ))}
          </div>
        </div>

        {/* Players Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-500 shadow-sm border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
            <p className="text-sm font-semibold">Searching player registry...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : players.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
            <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-600">No players found matching your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((player) => (
              <div
                key={player.player_id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-lg hover:border-emerald-500/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                      {player.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
                        {player.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {player.team_name || 'Independent'} • <span className="text-emerald-700 font-bold">{player.role || 'Player'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3.5 text-xs grid grid-cols-3 gap-2 border border-slate-100 text-center">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Matches</span>
                      <span className="font-black text-slate-800 text-sm">{player.matches}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Runs</span>
                      <span className="font-black text-slate-800 text-sm">{player.runs}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Wickets</span>
                      <span className="font-black text-slate-800 text-sm">{player.wickets}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>Avg: <strong className="text-slate-800">{player.batting_average}</strong></span>
                    <span>SR: <strong className="text-slate-800">{player.strike_rate}</strong></span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {player.batting_style || 'Right-hand bat'}
                  </span>
                  <Link
                    to={`/player/${player.player_id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Full Career Stats</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Players;
