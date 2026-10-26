import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  MapPin, 
  ChevronRight,
  RefreshCw,
  AlertCircle,
  X,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [squadDetails, setSquadDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [squadLoading, setSquadLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchTeams() {
      try {
        setLoading(true);
        const data = await api.teams.getAll();
        if (!isMounted) return;
        setTeams(data);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load teams');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchTeams();
    return () => { isMounted = false; };
  }, []);

  const handleSelectTeam = async (team) => {
    setSelectedTeam(team);
    setSquadLoading(true);
    try {
      const details = await api.teams.getById(team.team_id);
      setSquadDetails(details);
    } catch (e) {
      console.warn('Failed to load squad:', e);
    } finally {
      setSquadLoading(false);
    }
  };

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Team Directory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
              Participating Teams & Squads
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Explore domestic, club, and franchise cricket teams, official coaching staff, and active squads.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 -mt-6">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-500 shadow-sm border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-sm font-semibold">Loading teams from registry...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div
                key={team.team_id}
                onClick={() => handleSelectTeam(team)}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-lg hover:border-blue-400/60 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                      {team.team_name.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {team.team_name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {team.city}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-2 border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Head Coach</span>
                      <span className="font-bold text-slate-800">{team.coach_name || 'TBD'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Registered Squad</span>
                      <span className="font-bold text-slate-800">{team.squad_count} Players</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform">
                  <span>View Squad Roster</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Squad Drawer / Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                  {selectedTeam.team_name.slice(0, 3).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{selectedTeam.team_name}</h2>
                  <p className="text-xs text-slate-500">{selectedTeam.city} • Coach: {selectedTeam.coach_name || 'TBD'}</p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedTeam(null); setSquadDetails(null); }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 py-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Squad Roster</h4>
              {squadLoading ? (
                <div className="py-8 text-center text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-xs">Loading squad members...</p>
                </div>
              ) : squadDetails?.squad?.length > 0 ? (
                squadDetails.squad.map((player) => (
                  <div
                    key={player.player_id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{player.name}</span>
                        <span className="text-slate-500">{player.batting_style || 'Right-hand bat'} • {player.bowling_style || 'Right-arm medium'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                        {player.role || 'Player'}
                      </span>
                      <Link
                        to={`/player/${player.player_id}`}
                        className="text-emerald-600 font-bold hover:underline flex items-center gap-0.5"
                      >
                        Profile <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No squad members registered yet for this team.</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => { setSelectedTeam(null); setSquadDetails(null); }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
