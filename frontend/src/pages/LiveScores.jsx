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

const LiveScores = () => {
  const [activeTab, setActiveTab] = useState('Live');

  const tabs = ['Live', 'Scorecard', 'Commentary', 'Stats'];

  // Current over balls (16.3 over status)
  const currentOverBalls = [
    { ball: '1', runs: '1', type: 'single', bg: 'bg-slate-100 text-slate-800' },
    { ball: '2', runs: '4', type: 'four', bg: 'bg-emerald-100 text-emerald-700 font-bold' },
    { ball: '3', runs: '0', type: 'dot', bg: 'bg-slate-100 text-slate-800' },
    { ball: '4', runs: '1', type: 'single', bg: 'bg-slate-100 text-slate-800' },
    { ball: '5', runs: '6', type: 'six', bg: 'bg-blue-100 text-blue-700 font-bold' },
    { ball: '6', runs: '0', type: 'dot', bg: 'bg-slate-100 text-slate-800' },
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
      badgeClass: 'bg-blue-500 text-white font-bold',
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
      badgeClass: 'bg-emerald-500 text-white font-bold',
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
    <div className="min-h-screen bg-[#f3f6fb] pb-16">
      {/* Top Banner / Match Header */}
      <div className="relative w-full bg-[#0a1224] text-white overflow-hidden shadow-md">
        {/* Stadium background overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: `url('/home_page_background.jpeg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070c18] via-[#09162e]/90 to-[#0e1d3d]/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 z-10">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                City Champions League
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 font-medium">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                Greenfield Stadium, Mumbai
              </span>
              <span className="text-slate-500">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                T20
              </span>
            </div>
          </div>

          {/* Right Cricket Ball Graphic */}
          <div className="hidden lg:flex items-center justify-center pr-4">
            <div className="relative w-28 h-28 rounded-full shadow-2xl bg-gradient-to-tr from-red-900 via-rose-600 to-red-500 flex items-center justify-center ring-4 ring-rose-950/40">
              <div className="w-full h-1 bg-white/70 rotate-45" />
              <div className="absolute inset-0 rounded-full border-2 border-white/30 rotate-45" />
              <div className="absolute top-2 right-4 w-6 h-6 rounded-full bg-white/30 blur-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 space-y-6">
        
        {/* Top Cards: Scorecard Summary & Match Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
          
          {/* Main Teams Match Overview Card (Spans 2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-2">
              
              {/* Team 1: Rangers */}
              <div className="flex items-center gap-4">
                {/* Team Logo Badge */}
                <div className="w-16 h-16 rounded-xl bg-slate-900 flex flex-col items-center justify-center p-2 text-white border-2 border-rose-500 shadow-sm shrink-0">
                  <div className="text-[10px] uppercase font-black tracking-widest text-rose-500 leading-none">★ ★ ★</div>
                  <div className="text-xs font-black tracking-tighter mt-1 text-white">RANGERS</div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Rangers</h2>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      128/4
                    </span>
                    <span className="text-sm font-semibold text-slate-500">(16.2)</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 font-medium mt-1">
                    <span>CRR: <strong className="text-slate-800">7.84</strong></span>
                    <span>|</span>
                    <span>Target: <strong className="text-slate-800">156</strong></span>
                  </div>
                </div>
              </div>

              {/* VS Badge */}
              <div className="hidden sm:flex items-center justify-center">
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider">
                  VS
                </span>
              </div>

              {/* Team 2: Strikers */}
              <div className="flex items-center sm:flex-row-reverse gap-4">
                {/* Team Logo Badge */}
                <div className="w-16 h-16 rounded-xl bg-slate-900 flex flex-col items-center justify-center p-2 text-white border-2 border-blue-500 shadow-sm shrink-0">
                  <div className="text-[10px] uppercase font-black tracking-widest text-amber-400 leading-none">⚡ ⚡ ⚡</div>
                  <div className="text-xs font-black tracking-tighter mt-1 text-blue-400">STRIKERS</div>
                </div>
                <div className="sm:text-right">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Strikers</h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">Yet to bat</p>
                </div>
              </div>

            </div>
          </div>

          {/* Match Info Card (1 col) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-3">
              Match Info
            </h3>
            <div className="space-y-3 text-xs sm:text-sm font-medium">
              <div className="flex items-center justify-between text-slate-600">
                <span className="inline-flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4 text-slate-400" /> Date
                </span>
                <span className="font-semibold text-slate-800">Aug 12, 2025</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="inline-flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4 text-slate-400" /> Time
                </span>
                <span className="font-semibold text-slate-800">02:00 PM (IST)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="inline-flex items-center gap-2 text-slate-400">
                  <MapPin className="w-4 h-4 text-slate-400" /> Venue
                </span>
                <span className="font-semibold text-slate-800 truncate max-w-[170px] text-right">Greenfield Stadium, Mumbai</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="inline-flex items-center gap-2 text-slate-400">
                  <Trophy className="w-4 h-4 text-slate-400" /> Tournament
                </span>
                <span className="font-semibold text-slate-800 truncate max-w-[170px] text-right">City Champions League</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="inline-flex items-center gap-2 text-slate-400">
                  <Activity className="w-4 h-4 text-slate-400" /> Format
                </span>
                <span className="font-semibold text-slate-800">T20</span>
              </div>
            </div>
          </div>

        </div>

        {/* Navigation Tabs (Live, Scorecard, Commentary, Stats) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 px-2 flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-bold transition-all relative ${
                activeTab === tab
                  ? 'text-emerald-600 after:content-[""] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-emerald-500'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Middle Section: Batting, Bowling, and Over / Rate Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Batting Table (Col 1) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
            <div className="flex items-center gap-2 font-bold text-slate-900 pb-3 mb-1">
              <span className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs">🏏</span>
              <span>Batting</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 text-[11px] font-semibold uppercase">
                    <th className="py-2 font-semibold">Batter</th>
                    <th className="py-2 text-right">R</th>
                    <th className="py-2 text-right">B</th>
                    <th className="py-2 text-right">4s</th>
                    <th className="py-2 text-right">6s</th>
                    <th className="py-2 text-right">SR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-3 text-slate-900 font-bold">
                      Arjun Sharma <span className="text-emerald-600 font-black">*</span>
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900">52</td>
                    <td className="py-3 text-right text-slate-600">38</td>
                    <td className="py-3 text-right text-slate-600">6</td>
                    <td className="py-3 text-right text-slate-600">2</td>
                    <td className="py-3 text-right text-slate-600">136.8</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-800">Rohit Verma</td>
                    <td className="py-3 text-right font-bold text-slate-900">34</td>
                    <td className="py-3 text-right text-slate-600">28</td>
                    <td className="py-3 text-right text-slate-600">4</td>
                    <td className="py-3 text-right text-slate-600">1</td>
                    <td className="py-3 text-right text-slate-600">121.4</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-800">Kunal Patel</td>
                    <td className="py-3 text-right font-bold text-slate-900">18</td>
                    <td className="py-3 text-right text-slate-600">12</td>
                    <td className="py-3 text-right text-slate-600">2</td>
                    <td className="py-3 text-right text-slate-600">1</td>
                    <td className="py-3 text-right text-slate-600">150.0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bowling Table (Col 2) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
            <div className="flex items-center gap-2 font-bold text-slate-900 pb-3 mb-1">
              <span className="w-6 h-6 rounded-md bg-rose-50 flex items-center justify-center text-rose-600 text-xs">🔴</span>
              <span>Bowling</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 text-[11px] font-semibold uppercase">
                    <th className="py-2 font-semibold">Bowler</th>
                    <th className="py-2 text-right">O</th>
                    <th className="py-2 text-right">M</th>
                    <th className="py-2 text-right">R</th>
                    <th className="py-2 text-right">W</th>
                    <th className="py-2 text-right">ECO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-3 text-slate-900 font-semibold">Sameer Khan</td>
                    <td className="py-3 text-right text-slate-600">3.2</td>
                    <td className="py-3 text-right text-slate-600">0</td>
                    <td className="py-3 text-right text-slate-600">28</td>
                    <td className="py-3 text-right font-bold text-slate-900">1</td>
                    <td className="py-3 text-right text-slate-600">8.40</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-900 font-semibold">Dev Malhotra</td>
                    <td className="py-3 text-right text-slate-600">4.0</td>
                    <td className="py-3 text-right text-slate-600">0</td>
                    <td className="py-3 text-right text-slate-600">24</td>
                    <td className="py-3 text-right font-bold text-slate-900">2</td>
                    <td className="py-3 text-right text-slate-600">6.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Current Over & Stats (Col 3) */}
          <div className="space-y-4">
            
            {/* Current Over Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-4">
                <Target className="w-5 h-5 text-slate-700" />
                <span>Current Over (16.3)</span>
              </div>
              <div className="flex items-center justify-between gap-1 sm:gap-2">
                {currentOverBalls.map((item, idx) => (
                  <div
                    key={idx}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm ${item.bg} shadow-sm border border-slate-200/60`}
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
                  <div className="text-xs font-semibold text-slate-500">Run Rate</div>
                  <div className="text-xl font-black text-slate-900 leading-tight">7.84</div>
                  <div className="text-[10px] text-slate-400 font-medium">Current (CRR)</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 shrink-0">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Target</div>
                  <div className="text-xl font-black text-slate-900 leading-tight">156</div>
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
