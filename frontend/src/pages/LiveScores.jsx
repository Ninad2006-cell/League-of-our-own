import React, { useState } from 'react';
import { 
  MapPin, 
  Trophy, 
  Calendar, 
  Clock, 
  Activity, 
  MessageSquare, 
  TrendingUp, 
  Target 
} from 'lucide-react';
import { RangersLogo, StrikersLogo } from '../components/TeamLogos';

const LiveScores = () => {
  const [activeTab, setActiveTab] = useState('Live');

  const tabs = ['Live', 'Scorecard', 'Commentary', 'Stats'];

  // Current over balls (16.3 over status)
  const currentOverBalls = [
    { runs: '1', bg: 'bg-[#f0f4f8] text-slate-800' },
    { runs: '4', bg: 'bg-[#86efac] text-emerald-950 font-bold' },
    { runs: '0', bg: 'bg-[#f0f4f8] text-slate-800' },
    { runs: '1', bg: 'bg-[#f0f4f8] text-slate-800' },
    { runs: '6', bg: 'bg-[#93c5fd] text-blue-950 font-bold' },
    { runs: '0', bg: 'bg-[#f0f4f8] text-slate-800' },
  ];

  // Batting data
  const batters = [
    { name: 'Arjun Sharma', isStriker: true, runs: 52, balls: 38, fours: 6, sixes: 2, sr: '136.8' },
    { name: 'Rohit Verma', isStriker: false, runs: 34, balls: 28, fours: 4, sixes: 1, sr: '121.4' },
    { name: 'Kunal Patel', isStriker: false, runs: 18, balls: 12, fours: 2, sixes: 1, sr: '150.0' },
  ];

  // Bowling data
  const bowlers = [
    { name: 'Sameer Khan', overs: '3.2', maidens: 0, runs: 28, wickets: 1, eco: '8.40' },
    { name: 'Dev Malhotra', overs: '4.0', maidens: 0, runs: 24, wickets: 2, eco: '6.00' },
  ];

  // Commentary data
  const commentaryList = [
    {
      over: '16.2',
      badge: '0',
      badgeClass: 'bg-slate-100 text-slate-700',
      text: 'Sameer Khan to Arjun Sharma — Dot ball. Good length delivery, defended.',
      time: '2 mins ago',
    },
    {
      over: '16.1',
      badge: '6',
      badgeClass: 'bg-[#2563eb] text-white font-bold',
      text: 'Sameer Khan to Arjun Sharma — SIX! Cracking shot over long on.',
      time: '3 mins ago',
    },
    {
      over: '15.6',
      badge: '1',
      badgeClass: 'bg-slate-200 text-slate-800 font-medium',
      text: 'Dev Malhotra to Rohit Verma — Single. Pushed to mid-wicket.',
      time: '5 mins ago',
    },
    {
      over: '15.5',
      badge: '4',
      badgeClass: 'bg-[#10b981] text-white font-bold',
      text: 'Dev Malhotra to Rohit Verma — FOUR! Beautifully timed through covers.',
      time: '6 mins ago',
    },
    {
      over: '15.4',
      badge: '0',
      badgeClass: 'bg-slate-100 text-slate-700',
      text: 'Dev Malhotra to Rohit Verma — Dot ball. Good fielding in the ring.',
      time: '7 mins ago',
    },
  ];

  return (
    <div className="min-h-screen bg-[#eef2f6] pb-16 font-sans">
      {/* Top Banner / Match Header */}
      <div className="relative w-full h-[180px] sm:h-[200px] bg-[#070d1e] text-white overflow-hidden shadow-md flex items-center">
        {/* Background Image: Stadium with floodlights */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/Live_Score_background.jpeg')` }}
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/95 via-[#061129]/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          <div className="space-y-2 z-10">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
                City Champions League
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#16a34a] text-white text-xs font-bold tracking-wider shadow">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                LIVE
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200 font-medium drop-shadow">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-300" />
                Greenfield Stadium, Mumbai
              </span>
              <span className="text-slate-400">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-slate-300" />
                T20
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 -mt-6">
        
        {/* Top Cards: Scorecard Summary & Match Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Main Teams Match Overview Card (Spans 2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col justify-center">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              
              {/* Team 1: Rangers */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm flex items-center justify-center bg-slate-900 border border-slate-100">
                  <RangersLogo size={76} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Rangers</h2>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      128/4
                    </span>
                    <span className="text-base font-semibold text-slate-500">(16.2)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium mt-1">
                    <span>CRR: <strong className="text-slate-800">7.84</strong></span>
                    <span className="text-slate-300">|</span>
                    <span>Target: <strong className="text-slate-800">156</strong></span>
                  </div>
                </div>
              </div>

              {/* VS Badge */}
              <div className="hidden sm:flex items-center justify-center">
                <span className="px-3.5 py-1.5 rounded-xl bg-[#f1f5f9] text-slate-700 font-extrabold text-xs uppercase tracking-wider">
                  VS
                </span>
              </div>

              {/* Team 2: Strikers */}
              <div className="flex items-center sm:flex-row-reverse gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm flex items-center justify-center bg-slate-900 border border-slate-100">
                  <StrikersLogo size={76} />
                </div>
                <div className="sm:text-right">
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Strikers</h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">Yet to bat</p>
                </div>
              </div>

            </div>
          </div>

          {/* Match Info Card (1 col) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 flex flex-col justify-between">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2.5">
              Match Info
            </h3>
            <div className="space-y-2.5 text-xs sm:text-sm font-medium pt-2">
              <div className="flex items-center justify-between text-slate-600">
                <span className="inline-flex items-center gap-2 text-slate-700 font-semibold">
                  <Calendar className="w-4 h-4 text-slate-700" /> Date
                </span>
                <span className="text-slate-700">Aug 12, 2025</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="inline-flex items-center gap-2 text-slate-700 font-semibold">
                  <Clock className="w-4 h-4 text-slate-700" /> Time
                </span>
                <span className="text-slate-700">02:00 PM (IST)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="inline-flex items-center gap-2 text-slate-700 font-semibold">
                  <MapPin className="w-4 h-4 text-slate-700" /> Venue
                </span>
                <span className="text-slate-700 truncate max-w-[170px] text-right">Greenfield Stadium, Mumbai</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="inline-flex items-center gap-2 text-slate-700 font-semibold">
                  <Trophy className="w-4 h-4 text-slate-700" /> Tournament
                </span>
                <span className="text-slate-700 truncate max-w-[170px] text-right">City Champions League</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="inline-flex items-center gap-2 text-slate-700 font-semibold">
                  <Activity className="w-4 h-4 text-slate-700" /> Format
                </span>
                <span className="text-slate-700">T20</span>
              </div>
            </div>
          </div>

        </div>

        {/* Navigation Tabs (Live, Scorecard, Commentary, Stats) */}
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

        {/* Middle Section: Batting, Bowling, and Over / Rate Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Batting Table (Col 1) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
            <div className="flex items-center gap-2 font-bold text-slate-900 pb-3 mb-1">
              <span className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs font-bold">🏏</span>
              <span>Batting</span>
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
                <tbody className="divide-y divide-slate-100 font-medium">
                  {batters.map((b, i) => (
                    <tr key={i}>
                      <td className="py-3 text-slate-900 font-bold">
                        {b.name} {b.isStriker && <span className="text-slate-900 font-normal"> *</span>}
                      </td>
                      <td className="py-3 text-right font-bold text-slate-900">{b.runs}</td>
                      <td className="py-3 text-right text-slate-600">{b.balls}</td>
                      <td className="py-3 text-right text-slate-600">{b.fours}</td>
                      <td className="py-3 text-right text-slate-600">{b.sixes}</td>
                      <td className="py-3 text-right text-slate-600">{b.sr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bowling Table (Col 2) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
            <div className="flex items-center gap-2 font-bold text-slate-900 pb-3 mb-1">
              <span className="w-6 h-6 rounded-md bg-rose-50 flex items-center justify-center text-rose-600 text-xs font-bold">🔴</span>
              <span>Bowling</span>
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
                <tbody className="divide-y divide-slate-100 font-medium">
                  {bowlers.map((bw, i) => (
                    <tr key={i}>
                      <td className="py-3 text-slate-900 font-semibold">{bw.name}</td>
                      <td className="py-3 text-right text-slate-600">{bw.overs}</td>
                      <td className="py-3 text-right text-slate-600">{bw.maidens}</td>
                      <td className="py-3 text-right text-slate-600">{bw.runs}</td>
                      <td className="py-3 text-right font-bold text-slate-900">{bw.wickets}</td>
                      <td className="py-3 text-right text-slate-600">{bw.eco}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Current Over & Stats (Col 3) */}
          <div className="space-y-4">
            
            {/* Current Over Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-4">
                <Target className="w-5 h-5 text-slate-800" />
                <span>Current Over (16.3)</span>
              </div>
              <div className="flex items-center justify-between gap-1 sm:gap-2">
                {currentOverBalls.map((item, idx) => (
                  <div
                    key={idx}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm ${item.bg} shadow-xs font-semibold`}
                  >
                    {item.runs}
                  </div>
                ))}
              </div>
            </div>

            {/* Run Rate & Target Mini Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Run Rate</div>
                  <div className="text-2xl font-black text-slate-900 leading-tight">7.84</div>
                  <div className="text-[10px] text-slate-400 font-medium">Current (CRR)</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 shrink-0">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Target</div>
                  <div className="text-2xl font-black text-slate-900 leading-tight">156</div>
                  <div className="text-[10px] text-slate-400 font-medium">To Win</div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Section: Recent Commentary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <span>Recent Commentary</span>
            </div>
            <button
              type="button"
              className="px-3.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {commentaryList.map((comm, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-bold text-blue-600 text-xs w-9 shrink-0">
                    {comm.over}
                  </span>
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${comm.badgeClass}`}
                  >
                    {comm.badge}
                  </span>
                  <span className="text-slate-700 truncate font-medium">
                    {comm.text}
                  </span>
                </div>
                <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">
                  {comm.time}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LiveScores;
