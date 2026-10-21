import React, { useState } from 'react';
import { 
  User, 
  Award, 
  TrendingUp, 
  Activity, 
  MapPin, 
  Calendar, 
  Shield, 
  Zap, 
  ChevronRight,
  BarChart2,
  Search,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Players = () => {
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const playersList = [
    {
      id: 1,
      name: 'Arjun Sharma',
      team: 'Rangers',
      role: 'Batter',
      battingStyle: 'Right-hand bat',
      matches: 48,
      runs: 1680,
      average: '45.40',
      sr: '142.85',
      fifties: 12,
      hundreds: 2,
      badge: 'Captain',
      avatarColor: 'from-emerald-500 to-green-600',
    },
    {
      id: 2,
      name: 'Rohit Verma',
      team: 'Rangers',
      role: 'Batter',
      battingStyle: 'Right-hand bat',
      matches: 42,
      runs: 1340,
      average: '38.20',
      sr: '132.50',
      fifties: 9,
      hundreds: 1,
      badge: 'Opener',
      avatarColor: 'from-blue-500 to-indigo-600',
    },
    {
      id: 3,
      name: 'Dev Malhotra',
      team: 'Strikers',
      role: 'Bowler',
      battingStyle: 'Right-arm fast',
      matches: 50,
      runs: 240,
      wickets: 68,
      economy: '6.45',
      best: '4/18',
      badge: 'Lead Pacer',
      avatarColor: 'from-rose-500 to-red-600',
    },
    {
      id: 4,
      name: 'Sameer Khan',
      team: 'Strikers',
      role: 'All-Rounder',
      battingStyle: 'Left-arm orthodox',
      matches: 38,
      runs: 820,
      wickets: 44,
      economy: '7.10',
      average: '28.40',
      badge: 'All-Rounder',
      avatarColor: 'from-amber-500 to-orange-600',
    },
    {
      id: 5,
      name: 'Kunal Patel',
      team: 'Rangers',
      role: 'Wicket-Keeper',
      battingStyle: 'Right-hand bat',
      matches: 34,
      runs: 780,
      average: '32.50',
      sr: '148.20',
      fifties: 5,
      dismissals: 28,
      badge: 'Keeper',
      avatarColor: 'from-teal-500 to-emerald-600',
    },
    {
      id: 6,
      name: 'Hardik Roy',
      team: 'Titans',
      role: 'All-Rounder',
      battingStyle: 'Right-arm medium-fast',
      matches: 55,
      runs: 1450,
      wickets: 52,
      sr: '154.20',
      economy: '8.12',
      badge: 'Captain',
      avatarColor: 'from-purple-500 to-indigo-600',
    },
  ];

  const filteredPlayers = playersList.filter((p) => {
    const matchesRole = selectedRole === 'all' || p.role.toLowerCase() === selectedRole.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.team.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

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
              <span>Player Roster</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
              Player Profiles & Career Stats
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Inspect player performance metrics, averages, strike rates, career milestones, and scouting bios.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 -mt-6">

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
            {['all', 'batter', 'bowler', 'all-rounder', 'wicket-keeper'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3.5 py-1.5 rounded-lg capitalize whitespace-nowrap transition-colors ${
                  selectedRole === role
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search player or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Players Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${player.avatarColor} p-0.5 shrink-0 shadow-xs flex items-center justify-center`}>
                  <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-lg">
                    {player.name.slice(0, 1)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-extrabold text-slate-900 truncate">
                      {player.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                      {player.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {player.role} • <strong className="text-slate-700">{player.team}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {player.battingStyle}
                  </p>
                </div>
              </div>

              {/* Stats Highlights */}
              <div className="py-4 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Matches</span>
                  <div className="text-base font-black text-slate-900">{player.matches}</div>
                </div>

                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {player.role === 'Bowler' ? 'Wickets' : 'Runs'}
                  </span>
                  <div className="text-base font-black text-emerald-600">
                    {player.role === 'Bowler' ? player.wickets : player.runs}
                  </div>
                </div>

                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {player.role === 'Bowler' ? 'Econ' : 'Avg'}
                  </span>
                  <div className="text-base font-black text-slate-900">
                    {player.role === 'Bowler' ? player.economy : player.average}
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  {player.sr ? `SR: ${player.sr}` : `Best: ${player.best}`}
                </span>

                <Link
                  to={`/player/${player.id}`}
                  className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <span>Full Profile</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Players;
