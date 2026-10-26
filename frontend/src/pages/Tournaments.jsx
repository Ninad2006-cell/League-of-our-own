import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  ChevronRight, 
  TrendingUp,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [activeTab, setActiveTab] = useState('fixtures'); // 'fixtures' | 'standings'
  const [fixtureFilter, setFixtureFilter] = useState('all');
  const [fixtures, setFixtures] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch tournaments on load
  useEffect(() => {
    let isMounted = true;
    async function fetchTournaments() {
      try {
        setLoading(true);
        const data = await api.tournaments.getAll();
        if (!isMounted) return;
        setTournaments(data);
        if (data.length > 0) {
          setSelectedTournament(data[0]);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load tournaments');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchTournaments();
    return () => { isMounted = false; };
  }, []);

  // 2. Fetch fixtures and standings when selected tournament changes
  useEffect(() => {
    if (!selectedTournament) return;
    let isMounted = true;

    async function fetchDetails() {
      try {
        const [fixturesData, standingsData] = await Promise.all([
          api.tournaments.getFixtures(selectedTournament.tournament_id, fixtureFilter),
          api.tournaments.getStandings(selectedTournament.tournament_id)
        ]);
        if (!isMounted) return;
        setFixtures(fixturesData);
        setStandings(standingsData);
      } catch (err) {
        if (!isMounted) return;
        console.warn('Failed to load tournament fixtures/standings:', err);
      }
    }

    fetchDetails();
    return () => { isMounted = false; };
  }, [selectedTournament, fixtureFilter]);

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
              <Trophy className="w-3.5 h-3.5" />
              <span>Tournaments & Standings Directory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
              Cricket Tournaments & Events
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Follow official league fixtures, tournament stages, schedules, and live standings across venues.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 -mt-6">

        {/* Tournaments Row */}
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500 shadow-sm border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
            <p className="text-sm font-semibold">Loading tournaments...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tournaments.map((t) => {
              const isSelected = selectedTournament?.tournament_id === t.tournament_id;
              return (
                <div
                  key={t.tournament_id}
                  onClick={() => setSelectedTournament(t)}
                  className={`bg-white rounded-2xl p-5 shadow-sm border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200/80 hover:border-slate-300 hover:shadow'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      {t.status || 'Active'}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{t.format} • {t.level}</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-3">{t.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {t.start_date} to {t.end_date}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">Matches Scheduled</span>
                    <span className="font-extrabold text-slate-900">{t.matches_count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View Toggle Tabs & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('fixtures')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'fixtures'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Fixtures & Matches
            </button>
            <button
              onClick={() => setActiveTab('standings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'standings'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Points Table (NRR)</span>
            </button>
          </div>

          {activeTab === 'fixtures' && (
            <div className="flex items-center gap-1.5 text-xs font-semibold px-2">
              {['all', 'live', 'upcoming', 'completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFixtureFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                    fixtureFilter === tab
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab 1: Fixtures Grid */}
        {activeTab === 'fixtures' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {fixtures.length === 0 ? (
              <div className="col-span-2 bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-slate-600">No {fixtureFilter !== 'all' ? fixtureFilter : ''} fixtures found</p>
              </div>
            ) : (
              fixtures.map((fixture) => (
                <div
                  key={fixture.match_id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                    <span className="font-bold text-slate-500">{fixture.tournament_name}</span>

                    {fixture.status === 'LIVE' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-black animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        LIVE
                      </span>
                    )}
                    {fixture.status === 'SCHEDULED' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
                        UPCOMING
                      </span>
                    )}
                    {fixture.status === 'COMPLETED' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                        RESULT
                      </span>
                    )}
                  </div>

                  <div className="py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                          {fixture.team1?.team_name?.slice(0, 2).toUpperCase() || 'T1'}
                        </div>
                        <span className="font-bold text-slate-900 text-base">{fixture.team1?.team_name || 'Team 1'}</span>
                      </div>
                      <span className="font-bold text-slate-900 text-sm">
                        {fixture.team1_score || '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                          {fixture.team2?.team_name?.slice(0, 2).toUpperCase() || 'T2'}
                        </div>
                        <span className="font-bold text-slate-900 text-base">{fixture.team2?.team_name || 'Team 2'}</span>
                      </div>
                      <span className="font-bold text-slate-900 text-sm">
                        {fixture.team2_score || '—'}
                      </span>
                    </div>
                  </div>

                  {fixture.result_summary && (
                    <div className="text-xs font-medium text-emerald-700 bg-emerald-50/60 rounded-lg p-2.5 mb-3 border border-emerald-100">
                      {fixture.result_summary}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(fixture.match_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[200px]">{fixture.venue_name}</span>
                      </div>
                    </div>

                    <Link
                      to={`/live-scorecard/${fixture.match_id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 text-white font-bold transition-all text-xs"
                    >
                      <span>{fixture.status === 'LIVE' ? 'Watch Live' : 'Scorecard'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Points Table Standings with NRR */}
        {activeTab === 'standings' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-extrabold text-slate-900">
                {selectedTournament?.name} — Official Standings
              </h3>
              <span className="text-xs text-slate-500 font-medium">Ranked by Points, NRR</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Team</th>
                    <th className="py-3 px-3 text-center">P</th>
                    <th className="py-3 px-3 text-center">W</th>
                    <th className="py-3 px-3 text-center">L</th>
                    <th className="py-3 px-3 text-center">T/NR</th>
                    <th className="py-3 px-3 text-center font-extrabold text-slate-900">Pts</th>
                    <th className="py-3 px-4 text-right font-extrabold text-slate-900">NRR</th>
                    <th className="py-3 px-4 text-center">Form</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {standings.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-slate-400">
                        No matches recorded yet for standings computation.
                      </td>
                    </tr>
                  ) : (
                    standings.map((team, idx) => (
                      <tr key={team.team_id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-extrabold text-slate-900">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                            idx === 0 ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'
                          }`}>
                            {team.rank || idx + 1}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {team.team_name}
                          {team.team_city && <span className="text-xs text-slate-400 block font-normal">{team.team_city}</span>}
                        </td>
                        <td className="py-3.5 px-3 text-center text-slate-700">{team.played}</td>
                        <td className="py-3.5 px-3 text-center text-emerald-600 font-bold">{team.won}</td>
                        <td className="py-3.5 px-3 text-center text-rose-600">{team.lost}</td>
                        <td className="py-3.5 px-3 text-center text-slate-500">{team.tied + team.nr}</td>
                        <td className="py-3.5 px-3 text-center font-black text-slate-900 bg-slate-50/50">{team.points}</td>
                        <td className={`py-3.5 px-4 text-right font-mono font-bold ${
                          team.nrr > 0 ? 'text-emerald-600' : team.nrr < 0 ? 'text-rose-600' : 'text-slate-700'
                        }`}>
                          {team.nrr > 0 ? `+${team.nrr.toFixed(3)}` : team.nrr.toFixed(3)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {team.form && team.form.length > 0 ? (
                              team.form.map((f, i) => (
                                <span
                                  key={i}
                                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                                    f === 'W' ? 'bg-emerald-100 text-emerald-700' :
                                    f === 'L' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {f}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Tournaments;
