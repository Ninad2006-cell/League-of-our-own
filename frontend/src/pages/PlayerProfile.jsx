import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, 
  ArrowLeft, 
  TrendingUp, 
  Shield, 
  Award, 
  Calendar,
  Activity,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import api from '../lib/api';

const PlayerProfile = () => {
  const { playerId } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchPlayer() {
      if (!playerId) return;
      try {
        setLoading(true);
        const data = await api.players.getById(playerId);
        if (!isMounted) return;
        setPlayer(data);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load player profile');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchPlayer();
    return () => { isMounted = false; };
  }, [playerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef2f6] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
          <p className="text-sm font-semibold text-slate-600">Loading career records...</p>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-[#eef2f6] p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm border border-slate-200">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-extrabold text-slate-900 mb-2">Player Not Found</h2>
          <p className="text-xs text-slate-500 mb-4">{error || 'Unable to retrieve player profile details.'}</p>
          <Link
            to="/players"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Players
          </Link>
        </div>
      </div>
    );
  }

  const stats = player.career_stats || {};
  const recentPerformances = player.recent_performances || [];

  return (
    <div className="min-h-screen bg-[#eef2f6] pb-16 font-sans">
      {/* Top Banner */}
      <div className="relative w-full h-[220px] bg-[#070d1e] text-white overflow-hidden shadow-md flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/Live_Score_background.jpeg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/95 via-[#061129]/85 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          <div className="space-y-3 z-10">
            <Link
              to="/players"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Directory
            </Link>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-xl">
                {player.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{player.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    {player.role || 'Cricketer'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Team: <strong className="text-white">{player.team_name || 'Free Agent'}</strong>
                  {player.team_city && ` (${player.team_city})`}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {player.batting_style || 'Right-hand bat'} • {player.bowling_style || 'Right-arm medium'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 -mt-6">

        {/* Career Stat Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 text-center">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Matches</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.matches_played || 0}</span>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 text-center">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Career Runs</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{stats.runs || 0}</span>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 text-center">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Batting Avg</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.batting_average?.toFixed(1) || '0.0'}</span>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 text-center">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Strike Rate</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block">{stats.strike_rate?.toFixed(1) || '0.0'}</span>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 text-center">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Wickets</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">{stats.wickets || 0}</span>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 text-center">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Economy</span>
            <span className="text-2xl font-black text-purple-600 mt-1 block">{stats.economy?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        {/* Detailed Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Batting Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
            <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>Career Batting Figures</span>
            </h3>
            <div className="divide-y divide-slate-100 text-sm mt-2">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Innings Batted / Balls Faced</span>
                <span className="font-bold text-slate-800">{stats.balls_faced || 0} balls</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Total Runs Scored</span>
                <span className="font-bold text-slate-800">{stats.runs || 0}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Fifties (50s)</span>
                <span className="font-bold text-slate-800">{stats.fifties || 0}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Hundreds (100s)</span>
                <span className="font-bold text-slate-800">{stats.hundreds || 0}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Batting Strike Rate</span>
                <span className="font-bold text-emerald-600">{stats.strike_rate || 0.0}</span>
              </div>
            </div>
          </div>

          {/* Bowling Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
            <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-600" />
              <span>Career Bowling Figures</span>
            </h3>
            <div className="divide-y divide-slate-100 text-sm mt-2">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Overs Bowled</span>
                <span className="font-bold text-slate-800">{stats.overs_bowled || 0.0} ov</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Runs Conceded</span>
                <span className="font-bold text-slate-800">{stats.runs_conceded || 0}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Wickets Taken</span>
                <span className="font-bold text-rose-600">{stats.wickets || 0}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Bowling Economy Rate</span>
                <span className="font-bold text-purple-600">{stats.economy || 0.0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Match Form Guide Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Recent Match Performances (Form Guide)</span>
            </h3>
            <span className="text-xs text-slate-400">Last 5 Matches</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Opponent</th>
                  <th className="py-3 px-4 text-center">Runs (Balls)</th>
                  <th className="py-3 px-4 text-center">Wickets (Overs)</th>
                  <th className="py-3 px-4 text-center">Runs Conceded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPerformances.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      No recent match appearances recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentPerformances.map((perf, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-500">
                        {perf.match_date ? new Date(perf.match_date).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{perf.opponent}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">
                        {perf.runs} <span className="text-xs text-slate-400 font-normal">({perf.balls}b)</span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-rose-600">
                        {perf.wickets} <span className="text-xs text-slate-400 font-normal">({perf.overs_bowled} ov)</span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-700">{perf.runs_conceded}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlayerProfile;
