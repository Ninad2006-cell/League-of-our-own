import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  MapPin, 
  Trophy, 
  Calendar, 
  Clock, 
  Activity, 
  TrendingUp, 
  Target,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { RangersLogo, StrikersLogo } from '../components/TeamLogos';
import api from '../lib/api';
import useLiveMatch from '../lib/useLiveMatch';

const LiveScores = () => {
  const { matchId: routeMatchId } = useParams();
  const [activeMatchId, setActiveMatchId] = useState(routeMatchId || null);
  const [activeTab, setActiveTab] = useState('Live');
  const [matchMetadata, setMatchMetadata] = useState(null);
  const [commentaryList, setCommentaryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Resolve matchId (if not in URL, fetch first live/upcoming match)
  useEffect(() => {
    let isMounted = true;
    async function resolveMatch() {
      if (routeMatchId) {
        setActiveMatchId(routeMatchId);
        return;
      }
      try {
        const matches = await api.matches.getAll();
        if (!isMounted) return;
        if (matches && matches.length > 0) {
          // Prefer live, else first
          const liveOne = matches.find(m => m.status === 'live') || matches[0];
          setActiveMatchId(liveOne.match_id);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to find active matches');
      }
    }
    resolveMatch();
    return () => { isMounted = false; };
  }, [routeMatchId]);

  // 2. Fetch initial scorecard and metadata
  useEffect(() => {
    if (!activeMatchId) return;
    let isMounted = true;

    async function fetchLiveMatchData() {
      try {
        setLoading(true);
        const [liveScore, meta, comm] = await Promise.all([
          api.matches.getLive(activeMatchId),
          api.matches.getById(activeMatchId),
          api.matches.getCommentary(activeMatchId)
        ]);
        if (!isMounted) return;
        setLiveScorecard(liveScore);
        setMatchMetadata(meta);
        setCommentaryList(comm);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load live match scorecard');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchLiveMatchData();
    return () => { isMounted = false; };
  }, [activeMatchId]);

  // 3. Connect real-time WebSocket for live sub-2-second sync
  const { scorecard, setScorecard: setLiveScorecard, isConnected, lastEvent } = useLiveMatch(activeMatchId);

  // If lastEvent was BALL_RECORDED or BALL_UNDONE, refresh commentary list
  useEffect(() => {
    if (lastEvent && activeMatchId) {
      api.matches.getCommentary(activeMatchId)
        .then(data => setCommentaryList(data))
        .catch(() => {});
    }
  }, [lastEvent, activeMatchId]);

  const tabs = ['Live', 'Scorecard', 'Commentary', 'Stats'];

  if (loading && !scorecard) {
    return (
      <div className="min-h-screen bg-[#eef2f6] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
          <p className="text-sm font-semibold text-slate-600">Connecting to live match feed...</p>
        </div>
      </div>
    );
  }

  if (error && !scorecard) {
    return (
      <div className="min-h-screen bg-[#eef2f6] p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm border border-slate-200">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-extrabold text-slate-900 mb-2">Live Feed Unavailable</h2>
          <p className="text-xs text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  const team1 = scorecard?.team1 || matchMetadata?.team1 || {};
  const team2 = scorecard?.team2 || matchMetadata?.team2 || {};
  const striker = scorecard?.striker;
  const nonStriker = scorecard?.non_striker;
  const currentBowler = scorecard?.current_bowler;
  const recentBalls = scorecard?.recent_balls || [];

  return (
    <div className="min-h-screen bg-[#eef2f6] pb-16 font-sans">
      {/* Top Banner / Match Header */}
      <div className="relative w-full h-[180px] sm:h-[200px] bg-[#070d1e] text-white overflow-hidden shadow-md flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/Live_Score_background.jpeg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/95 via-[#061129]/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          <div className="space-y-2 z-10">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
                {scorecard?.tournament || matchMetadata?.tournament?.name || 'Live Cricket Match'}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-white text-xs font-bold tracking-wider shadow ${
                isConnected ? 'bg-[#16a34a]' : 'bg-amber-600'
              }`}>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                {isConnected ? 'LIVE FEED' : 'SYNCING'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200 font-medium drop-shadow">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-300" />
                {scorecard?.venue || matchMetadata?.venue?.venue_name || 'Greenfield Stadium, Mumbai'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-slate-300" />
                T20 ({scorecard?.overs_limit || 20} Overs)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 -mt-6">
        
        {/* Top Cards: Scorecard Summary & Match Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Main Teams Match Overview Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col justify-center">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              
              {/* Team 1 */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm flex items-center justify-center bg-slate-900 border border-slate-100 font-black text-white text-xl">
                  {team1.team_name?.slice(0, 3).toUpperCase() || 'T1'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{team1.team_name || 'Team 1'}</h2>
                    {scorecard?.current_innings_no === 1 && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      {scorecard?.total_runs || 0}/{scorecard?.wickets || 0}
                    </span>
                    <span className="text-base font-semibold text-slate-500">
                      ({scorecard?.overs_played || '0.0'})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium mt-1">
                    <span>CRR: <strong className="text-slate-800">{scorecard?.crr || '0.00'}</strong></span>
                    {scorecard?.target && (
                      <>
                        <span className="text-slate-300">|</span>
                        <span>Target: <strong className="text-slate-800">{scorecard.target}</strong></span>
                        {scorecard.rrr && <span>(RRR: <strong className="text-rose-600">{scorecard.rrr}</strong>)</span>}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* VS Badge */}
              <div className="hidden sm:flex items-center justify-center">
                <span className="px-3.5 py-1.5 rounded-xl bg-[#f1f5f9] text-slate-700 font-extrabold text-xs uppercase tracking-wider">
                  VS
                </span>
              </div>

              {/* Team 2 */}
              <div className="flex items-center sm:flex-row-reverse gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm flex items-center justify-center bg-slate-800 border border-slate-100 font-black text-white text-xl">
                  {team2.team_name?.slice(0, 3).toUpperCase() || 'T2'}
                </div>
                <div className="sm:text-right">
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{team2.team_name || 'Team 2'}</h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    {scorecard?.current_innings_no === 2 ? 'Batting' : 'Yet to bat'}
                  </p>
                </div>
              </div>

            </div>

            {scorecard?.result_summary && (
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-emerald-700 bg-emerald-50/60 p-2.5 rounded-xl text-center">
                {scorecard.result_summary}
              </div>
            )}
          </div>

          {/* Match Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 flex flex-col justify-between">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2.5">
              Match Info
            </h3>
            <div className="space-y-2.5 text-xs sm:text-sm font-medium pt-2">
              <div className="flex items-center justify-between text-slate-600">
                <span className="inline-flex items-center gap-2 text-slate-700 font-semibold">
                  <Calendar className="w-4 h-4 text-slate-700" /> Date
                </span>
                <span className="text-slate-700">
                  {matchMetadata?.match_date ? new Date(matchMetadata.match_date).toLocaleDateString() : 'Live Today'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="inline-flex items-center gap-2 text-slate-700 font-semibold">
                  <MapPin className="w-4 h-4 text-slate-700" /> Venue
                </span>
                <span className="text-slate-700 truncate max-w-[170px] text-right">
                  {scorecard?.venue || 'Greenfield Stadium'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="inline-flex items-center gap-2 text-slate-700 font-semibold">
                  <Trophy className="w-4 h-4 text-slate-700" /> Tournament
                </span>
                <span className="text-slate-700 truncate max-w-[170px] text-right">
                  {scorecard?.tournament || 'Cricket League'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="inline-flex items-center gap-2 text-slate-700 font-semibold">
                  <Activity className="w-4 h-4 text-slate-700" /> Format
                </span>
                <span className="text-slate-700">T20 (20 Overs)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 px-4 flex items-center gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-semibold transition-all relative ${
                activeTab === tab
                  ? 'text-emerald-600 font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: Live Crease & Bowler View */}
        {activeTab === 'Live' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Active Batsmen Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
              <div className="flex items-center gap-2 font-bold text-slate-900 pb-3 mb-1 border-b border-slate-100">
                <span className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs font-bold">🏏</span>
                <span>Batsmen on Crease</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 text-[11px] font-semibold">
                      <th className="py-2 font-semibold">Batter</th>
                      <th className="py-2 text-right">R</th>
                      <th className="py-2 text-right">B</th>
                      <th className="py-2 text-right">4s</th>
                      <th className="py-2 text-right">6s</th>
                      <th className="py-2 text-right">SR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {striker && (
                      <tr className="font-semibold text-slate-800 bg-emerald-50/40">
                        <td className="py-2.5 flex items-center gap-1.5">
                          <span className="text-emerald-700 font-bold">{striker.name}</span>
                          <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-black">*</span>
                        </td>
                        <td className="py-2.5 text-right font-black text-slate-900">{striker.runs}</td>
                        <td className="py-2.5 text-right text-slate-500">{striker.balls}</td>
                        <td className="py-2.5 text-right text-slate-500">{striker.fours}</td>
                        <td className="py-2.5 text-right text-slate-500">{striker.sixes}</td>
                        <td className="py-2.5 text-right font-mono text-xs">{striker.strike_rate}</td>
                      </tr>
                    )}
                    {nonStriker && (
                      <tr className="text-slate-700">
                        <td className="py-2.5 text-slate-700">{nonStriker.name}</td>
                        <td className="py-2.5 text-right font-bold text-slate-900">{nonStriker.runs}</td>
                        <td className="py-2.5 text-right text-slate-500">{nonStriker.balls}</td>
                        <td className="py-2.5 text-right text-slate-500">{nonStriker.fours}</td>
                        <td className="py-2.5 text-right text-slate-500">{nonStriker.sixes}</td>
                        <td className="py-2.5 text-right font-mono text-xs">{nonStriker.strike_rate}</td>
                      </tr>
                    )}
                    {!striker && !nonStriker && (
                      <tr>
                        <td colSpan="6" className="py-4 text-center text-slate-400 text-xs">
                          Innings underway. Batsmen stats compiling...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active Bowler Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
              <div className="flex items-center gap-2 font-bold text-slate-900 pb-3 mb-1 border-b border-slate-100">
                <span className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold">⚡</span>
                <span>Current Bowler</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 text-[11px] font-semibold">
                      <th className="py-2 font-semibold">Bowler</th>
                      <th className="py-2 text-right">O</th>
                      <th className="py-2 text-right">M</th>
                      <th className="py-2 text-right">R</th>
                      <th className="py-2 text-right">W</th>
                      <th className="py-2 text-right">ECO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBowler ? (
                      <tr className="font-semibold text-slate-800">
                        <td className="py-2.5 text-blue-700 font-bold">{currentBowler.name}</td>
                        <td className="py-2.5 text-right">{currentBowler.overs}</td>
                        <td className="py-2.5 text-right text-slate-500">{currentBowler.maidens}</td>
                        <td className="py-2.5 text-right text-slate-900 font-bold">{currentBowler.runs}</td>
                        <td className="py-2.5 text-right font-black text-rose-600">{currentBowler.wickets}</td>
                        <td className="py-2.5 text-right font-mono text-xs">{currentBowler.economy}</td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-4 text-center text-slate-400 text-xs">
                          Bowler details ready on next delivery.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Balls Ribbon */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Deliveries</h4>
                <div className="flex items-center gap-2 overflow-x-auto py-2">
                  {recentBalls.length === 0 ? (
                    <span className="text-xs text-slate-400">Waiting for live deliveries...</span>
                  ) : (
                    recentBalls.map((ball, idx) => (
                      <span
                        key={idx}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${
                          ball === 'W'
                            ? 'bg-rose-500 text-white'
                            : ball === '6'
                            ? 'bg-blue-600 text-white'
                            : ball === '4'
                            ? 'bg-emerald-500 text-white'
                            : ball.includes('Wd') || ball.includes('Nb')
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {ball}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                <span>Overs Completed: <strong>{scorecard?.overs_played || '0.0'}</strong></span>
                <span>Wickets in Inning: <strong>{scorecard?.wickets || 0}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Commentary Feed */}
        {activeTab === 'Commentary' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Live Ball-by-Ball Commentary Feed</span>
              <span className="text-xs text-slate-400 font-normal">Real-time match events</span>
            </h3>

            {commentaryList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No commentary entries logged yet for this match.</p>
            ) : (
              <div className="divide-y divide-slate-100 space-y-3">
                {commentaryList.map((c) => (
                  <div key={c.ball_id} className="pt-3 flex items-start gap-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold shrink-0">
                      {c.over} ov
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm ${c.is_wicket ? 'font-bold text-rose-600' : 'text-slate-800'}`}>
                        {c.text}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {c.created_at ? new Date(c.created_at).toLocaleTimeString() : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Detailed Scorecard */}
        {activeTab === 'Scorecard' && (
          <div className="space-y-5">
            {/* Batting Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
              <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
                <span>Innings Batting Scorecard</span>
                <span className="text-xs text-slate-400 font-normal">Active Crease</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 text-xs uppercase tracking-wider">
                      <th className="py-2.5 px-3">Batter</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">R</th>
                      <th className="py-2.5 px-3 text-right">B</th>
                      <th className="py-2.5 px-3 text-right">4s</th>
                      <th className="py-2.5 px-3 text-right">6s</th>
                      <th className="py-2.5 px-3 text-right">SR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {striker && (
                      <tr className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{striker.name}</span>
                          <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-black">*</span>
                        </td>
                        <td className="py-3 px-3 text-emerald-700 font-medium text-xs">Batting (Striker)</td>
                        <td className="py-3 px-3 text-right font-black text-slate-900">{striker.runs}</td>
                        <td className="py-3 px-3 text-right text-slate-600">{striker.balls}</td>
                        <td className="py-3 px-3 text-right text-slate-600">{striker.fours}</td>
                        <td className="py-3 px-3 text-right text-slate-600">{striker.sixes}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">{striker.strike_rate}</td>
                      </tr>
                    )}
                    {nonStriker && (
                      <tr className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-bold text-slate-900">{nonStriker.name}</td>
                        <td className="py-3 px-3 text-slate-500 font-medium text-xs">Batting (Non-striker)</td>
                        <td className="py-3 px-3 text-right font-black text-slate-900">{nonStriker.runs}</td>
                        <td className="py-3 px-3 text-right text-slate-600">{nonStriker.balls}</td>
                        <td className="py-3 px-3 text-right text-slate-600">{nonStriker.fours}</td>
                        <td className="py-3 px-3 text-right text-slate-600">{nonStriker.sixes}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">{nonStriker.strike_rate}</td>
                      </tr>
                    )}
                    {!striker && !nonStriker && (
                      <tr>
                        <td colSpan="7" className="py-6 text-center text-slate-400 text-xs">
                          Innings scorecard will update as deliveries are recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bowling Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
              <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
                <span>Innings Bowling Figures</span>
                <span className="text-xs text-slate-400 font-normal">Active Spell</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 text-xs uppercase tracking-wider">
                      <th className="py-2.5 px-3">Bowler</th>
                      <th className="py-2.5 px-3 text-right">O</th>
                      <th className="py-2.5 px-3 text-right">M</th>
                      <th className="py-2.5 px-3 text-right">R</th>
                      <th className="py-2.5 px-3 text-right">W</th>
                      <th className="py-2.5 px-3 text-right">ECO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBowler ? (
                      <tr className="hover:bg-slate-50/80 font-medium">
                        <td className="py-3 px-3 font-bold text-slate-900">{currentBowler.name}</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-800">{currentBowler.overs}</td>
                        <td className="py-3 px-3 text-right text-slate-600">{currentBowler.maidens || 0}</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-800">{currentBowler.runs}</td>
                        <td className="py-3 px-3 text-right font-black text-rose-600">{currentBowler.wickets}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">{currentBowler.economy}</td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-slate-400 text-xs">
                          Bowler figures ready on active delivery.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Delivery Event Log */}
            {scorecard?.recent_balls_log && scorecard.recent_balls_log.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
                <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100 mb-4">
                  Recent Deliveries Breakdown
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                        <th className="py-2 px-3">Over</th>
                        <th className="py-2 px-3">Bowler</th>
                        <th className="py-2 px-3">Batsman</th>
                        <th className="py-2 px-3 text-center">Runs</th>
                        <th className="py-2 px-3">Extras</th>
                        <th className="py-2 px-3">Wicket</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {scorecard.recent_balls_log.map((ball) => (
                        <tr key={ball.id} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 font-mono font-bold text-slate-700">{ball.over}.{ball.ball}</td>
                          <td className="py-2 px-3 font-medium text-slate-900">{ball.bowler}</td>
                          <td className="py-2 px-3 text-slate-700">{ball.batsman}</td>
                          <td className="py-2 px-3 text-center font-bold text-slate-900">{ball.runs}</td>
                          <td className="py-2 px-3 text-slate-500">{ball.extras}</td>
                          <td className={`py-2 px-3 font-bold ${ball.wicket !== '-' ? 'text-rose-600' : 'text-slate-400'}`}>
                            {ball.wicket}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Match Detailed Analytics & Stats */}
        {activeTab === 'Stats' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100">
              Match Detailed Analytics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-400 block font-semibold">Total Runs</span>
                <span className="text-2xl font-black text-slate-900">{scorecard?.total_runs || 0}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-400 block font-semibold">Current Run Rate</span>
                <span className="text-2xl font-black text-emerald-600">{scorecard?.crr || '0.00'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-400 block font-semibold">Overs Played</span>
                <span className="text-2xl font-black text-slate-900">{scorecard?.overs_played || '0.0'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-400 block font-semibold">Target Required</span>
                <span className="text-2xl font-black text-blue-600">{scorecard?.target || '—'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
                <span className="text-xs text-slate-400 font-semibold block">Required Run Rate</span>
                <span className="text-xl font-black text-slate-800 mt-1 block">{scorecard?.rrr || '—'}</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
                <span className="text-xs text-slate-400 font-semibold block">Wickets Lost</span>
                <span className="text-xl font-black text-rose-600 mt-1 block">{scorecard?.wickets || 0}</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
                <span className="text-xs text-slate-400 font-semibold block">Overs Quota</span>
                <span className="text-xl font-black text-slate-800 mt-1 block">{scorecard?.overs_limit || 20} Ov</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LiveScores;
