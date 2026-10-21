import React, { useState } from 'react';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Search, 
  Filter, 
  ShieldCheck,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Tournaments = () => {
  const [selectedTournament, setSelectedTournament] = useState('City Champions League');
  const [fixtureFilter, setFixtureFilter] = useState('all');

  const tournaments = [
    { id: 'ccl', name: 'City Champions League', teams: 6, matches: 30, dates: 'Aug 01 - Aug 28, 2025', prize: '₹25,00,000', status: 'In Progress' },
    { id: 't20cup', name: 'National T20 Cup', teams: 8, matches: 32, dates: 'Sep 10 - Oct 05, 2025', prize: '₹50,00,000', status: 'Upcoming' },
    { id: 'spt', name: 'State Premier Trophy', teams: 4, matches: 12, dates: 'Jul 15 - Jul 30, 2025', prize: '₹15,00,000', status: 'Completed' },
  ];

  const fixtures = [
    {
      id: 1,
      tournament: 'City Champions League',
      matchNo: 'Match 22',
      status: 'LIVE',
      stage: 'Group Stage',
      date: 'Today, Aug 12, 2025',
      time: '02:00 PM (IST)',
      venue: 'Greenfield Stadium, Mumbai',
      teamA: { name: 'Rangers', score: '128/4 (16.2 ov)' },
      teamB: { name: 'Strikers', score: 'Yet to bat' },
      note: 'Rangers need 28 runs in 22 balls to win',
    },
    {
      id: 2,
      tournament: 'City Champions League',
      matchNo: 'Match 23',
      status: 'UPCOMING',
      stage: 'Group Stage',
      date: 'Tomorrow, Aug 13, 2025',
      time: '07:30 PM (IST)',
      venue: 'Wankhede Arena, Mumbai',
      teamA: { name: 'Titans', score: '' },
      teamB: { name: 'Royals', score: '' },
      note: 'Match starts at 07:30 PM',
    },
    {
      id: 3,
      tournament: 'City Champions League',
      matchNo: 'Match 21',
      status: 'COMPLETED',
      stage: 'Group Stage',
      date: 'Yesterday, Aug 11, 2025',
      time: '07:30 PM (IST)',
      venue: 'Eden Sports Complex, Kolkata',
      teamA: { name: 'Warriors', score: '152/8 (20.0 ov)' },
      teamB: { name: 'Titans', score: '155/3 (18.2 ov)' },
      note: 'Titans won by 7 wickets (with 10 balls remaining)',
    },
    {
      id: 4,
      tournament: 'City Champions League',
      matchNo: 'Match 20',
      status: 'COMPLETED',
      stage: 'Group Stage',
      date: 'Aug 10, 2025',
      time: '03:30 PM (IST)',
      venue: 'Greenfield Stadium, Mumbai',
      teamA: { name: 'Knights', score: '138/9 (20.0 ov)' },
      teamB: { name: 'Rangers', score: '139/2 (15.4 ov)' },
      note: 'Rangers won by 8 wickets',
    },
  ];

  const filteredFixtures = fixtures.filter((f) => {
    if (fixtureFilter === 'all') return true;
    return f.status.toLowerCase() === fixtureFilter.toLowerCase();
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
              <Trophy className="w-3.5 h-3.5" />
              <span>Tournaments Directory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
              Cricket Tournaments & Events
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Follow official league fixtures, tournament stages, schedules, and live matches across venues.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 -mt-6">

        {/* Featured Tournaments Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tournaments.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTournament(t.name)}
              className={`bg-white rounded-2xl p-5 shadow-sm border transition-all cursor-pointer ${
                selectedTournament === t.name
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200/80 hover:border-slate-300 hover:shadow'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  t.status === 'In Progress' ? 'bg-emerald-100 text-emerald-800' :
                  t.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {t.status}
                </span>
                <span className="text-xs font-bold text-slate-500">{t.teams} Teams</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mt-3">{t.name}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {t.dates}
              </p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-500">Prize Pool</span>
                <span className="font-extrabold text-slate-900">{t.prize}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Pills */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-slate-900 px-3">
              {selectedTournament} Fixtures
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-2">
            {['all', 'live', 'upcoming', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFixtureFilter(tab)}
                className={`px-3.5 py-1.5 rounded-lg capitalize transition-colors ${
                  fixtureFilter === tab
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Fixtures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredFixtures.map((fixture) => (
            <div
              key={fixture.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500">{fixture.matchNo}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{fixture.stage}</span>
                </div>

                {fixture.status === 'LIVE' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-black animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    LIVE
                  </span>
                )}
                {fixture.status === 'UPCOMING' && (
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
                      {fixture.teamA.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-slate-900 text-base">{fixture.teamA.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">
                    {fixture.teamA.score || '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                      {fixture.teamB.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-slate-900 text-base">{fixture.teamB.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">
                    {fixture.teamB.score || '—'}
                  </span>
                </div>
              </div>

              {fixture.note && (
                <div className="text-xs font-medium text-emerald-700 bg-emerald-50/60 rounded-lg p-2.5 mb-3 border border-emerald-100">
                  {fixture.note}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{fixture.date} • {fixture.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[200px] sm:max-w-[250px]">{fixture.venue}</span>
                  </div>
                </div>

                <Link
                  to="/live-scores"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 text-white font-bold transition-all text-xs"
                >
                  <span>{fixture.status === 'LIVE' ? 'Watch Live' : 'Scorecard'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Tournaments;
