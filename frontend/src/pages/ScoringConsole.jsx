import React, { useState, useReducer } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ChevronRight,
  TrendingUp,
  Target,
  ArrowRightLeft,
  X,
  User,
  Shield,
  Clock,
  MapPin,
  Trophy,
  Calendar,
  AlertCircle
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import { RangersLogo, StrikersLogo } from '../components/TeamLogos';

// Initial Mock Match State matching Reference Images 1 & 2
const INITIAL_MATCH_STATE = {
  tournament: 'City Champions League • T20',
  venue: 'Greenfield Stadium, Mumbai',
  timestamp: 'Aug 16, 2025, 03:30 PM',
  team1: { name: 'Rangers', short: 'RAN' },
  team2: { name: 'Strikers', short: 'STR' },
  target: 156,
  totalRuns: 128,
  wickets: 4,
  overNumber: 16, // current over (16 complete, now in 17th over)
  ballInOver: 2,  // 16.2 overs
  
  // Active Batsmen
  batsmen: [
    { id: 1, name: 'Rohit S.', runs: 52, balls: 38, fours: 6, sixes: 2, isStriker: true, isOut: false },
    { id: 2, name: 'Virat K.', runs: 34, balls: 28, fours: 4, sixes: 1, isStriker: false, isOut: false },
  ],

  // Remaining squad to bat
  benchBatsmen: [
    'Hardik P.',
    'KL Rahul',
    'Ravindra J.',
    'Jasprit B.',
    'Mohammed S.'
  ],

  // Current Bowler
  currentBowler: {
    name: 'Arjun K.',
    overs: 3.2,
    maidens: 0,
    runs: 28,
    wickets: 1,
  },

  otherBowlers: ['Sameer R.', 'Dev M.', 'Suresh R.'],

  lastWicket: 'Virat K. (28) c & b Sameer R.',

  // Recent balls ribbon history (most recent last)
  recentBalls: ['1', '4', '0', '1', '6', '0'],

  // Recent balls detailed table log
  recentBallsLog: [
    { id: 101, over: 16, ball: 2, runs: 0, extras: '-', wicket: '-', batsman: 'Rohit S.', bowler: 'Arjun K.' },
    { id: 102, over: 16, ball: 1, runs: 6, extras: '-', wicket: '-', batsman: 'Rohit S.', bowler: 'Arjun K.' },
    { id: 103, over: 15, ball: 6, runs: 1, extras: '-', wicket: '-', batsman: 'Virat K.', bowler: 'Sameer R.' },
    { id: 104, over: 15, ball: 5, runs: 4, extras: '-', wicket: '-', batsman: 'Virat K.', bowler: 'Sameer R.' },
    { id: 105, over: 15, ball: 4, runs: 2, extras: '-', wicket: '-', batsman: 'Rohit S.', bowler: 'Sameer R.' },
    { id: 106, over: 15, ball: 3, runs: 0, extras: '-', wicket: '-', batsman: 'Rohit S.', bowler: 'Sameer R.' },
  ],

  historyStack: []
};

export default function ScoringConsole() {
  const { matchId } = useParams();
  const [matchState, setMatchState] = useState(INITIAL_MATCH_STATE);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Form Inputs in Console
  const [selectedRuns, setSelectedRuns] = useState(4);
  const [selectedExtras, setSelectedExtras] = useState('None');
  const [selectedWicketType, setSelectedWicketType] = useState('Select');
  const [liveUpdatesActive, setLiveUpdatesActive] = useState(true);

  // Dismissal Modal State
  const [isWicketModalOpen, setIsWicketModalOpen] = useState(false);
  const [wicketDetails, setWicketDetails] = useState({
    dismissalMode: 'Bowled',
    dismissedPlayer: 'Rohit S.',
    fielder: '',
    nextBatsman: 'Hardik P.'
  });

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const runsOptions = [0, 1, 2, 3, 4, 6];

  // Current Run Rate calculation
  const totalCompletedOvers = matchState.overNumber + matchState.ballInOver / 6;
  const currentRunRate = totalCompletedOvers > 0 ? (matchState.totalRuns / totalCompletedOvers).toFixed(2) : '0.00';

  const striker = matchState.batsmen.find((b) => b.isStriker) || matchState.batsmen[0];
  const nonStriker = matchState.batsmen.find((b) => !b.isStriker) || matchState.batsmen[1];

  // =========================================================================
  // SCORING ENGINE: SUBMIT BALL
  // =========================================================================
  const handleSubmitBall = () => {
    // If a wicket was selected from the dropdown, trigger the modal if not yet filled
    if (selectedWicketType !== 'Select' && !isWicketModalOpen) {
      setWicketDetails((prev) => ({
        ...prev,
        dismissalMode: selectedWicketType,
        dismissedPlayer: striker.name,
        nextBatsman: matchState.benchBatsmen[0] || 'Next Batsman'
      }));
      setIsWicketModalOpen(true);
      return;
    }

    processBall({
      runs: selectedRuns,
      extras: selectedExtras,
      wicketType: selectedWicketType,
      dismissedPlayer: null,
      nextBatsmanName: null
    });
  };

  const processBall = ({ runs, extras, wicketType, dismissedPlayer, nextBatsmanName }) => {
    // Save snapshot to historyStack for undo
    const snapshot = JSON.parse(JSON.stringify(matchState));

    let newTotalRuns = matchState.totalRuns;
    let newWickets = matchState.wickets;
    let newBallInOver = matchState.ballInOver;
    let newOverNumber = matchState.overNumber;

    let extrasRuns = 0;
    let isLegalBall = true;
    let batsmanRuns = runs;

    // Handle Extras logic
    if (extras === 'Wide') {
      extrasRuns = 1 + runs;
      isLegalBall = false;
      batsmanRuns = 0; // runs don't count towards batsman on wides
    } else if (extras === 'No Ball') {
      extrasRuns = 1;
      isLegalBall = false;
      // batsman gets credit for runs scored off no-ball
    } else if (extras === 'Bye' || extras === 'Leg Bye') {
      extrasRuns = runs;
      isLegalBall = true;
      batsmanRuns = 0; // extra runs, not batsman runs
    }

    newTotalRuns += batsmanRuns + extrasRuns;

    // Is it a wicket?
    const isWicket = wicketType && wicketType !== 'Select';
    if (isWicket) {
      newWickets += 1;
    }

    // Advance ball / over count if legal delivery
    let overCompleted = false;
    if (isLegalBall) {
      newBallInOver += 1;
      if (newBallInOver >= 6) {
        newOverNumber += 1;
        newBallInOver = 0;
        overCompleted = true;
      }
    }

    // Update active striker and non-striker
    let updatedBatsmen = matchState.batsmen.map((b) => {
      if (b.isStriker) {
        if (isWicket && (!dismissedPlayer || dismissedPlayer === b.name)) {
          return {
            ...b,
            runs: b.runs + batsmanRuns,
            balls: b.balls + (isLegalBall || extras === 'No Ball' ? 1 : 0),
            fours: b.fours + (batsmanRuns === 4 ? 1 : 0),
            sixes: b.sixes + (batsmanRuns === 6 ? 1 : 0),
            isOut: true,
            dismissal: `${wicketType} b ${matchState.currentBowler.name}`
          };
        }
        return {
          ...b,
          runs: b.runs + batsmanRuns,
          balls: b.balls + (isLegalBall || extras === 'No Ball' ? 1 : 0),
          fours: b.fours + (batsmanRuns === 4 ? 1 : 0),
          sixes: b.sixes + (batsmanRuns === 6 ? 1 : 0),
        };
      }
      return b;
    });

    // Replace out batsman with next batsman
    let updatedBench = [...matchState.benchBatsmen];
    if (isWicket) {
      const outIdx = updatedBatsmen.findIndex((b) => b.isOut);
      if (outIdx !== -1) {
        const newPlayerName = nextBatsmanName || updatedBench[0] || 'Incoming Batsman';
        updatedBench = updatedBench.filter((n) => n !== newPlayerName);
        updatedBatsmen[outIdx] = {
          id: Date.now(),
          name: newPlayerName,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          isStriker: true,
          isOut: false
        };
      }
    }

    // Strike Rotation logic:
    // If odd batsman runs (1, 3) or byes/leg-byes, swap striker and non-striker
    const shouldRotateStrikeFromRuns = (batsmanRuns % 2 === 1) || (extrasRuns % 2 === 1 && (extras === 'Bye' || extras === 'Leg Bye'));
    
    // Also at end of over (6 legal balls), rotate strike
    const shouldRotate = shouldRotateStrikeFromRuns !== overCompleted;

    if (shouldRotate) {
      updatedBatsmen = updatedBatsmen.map((b) => ({
        ...b,
        isStriker: !b.isStriker
      }));
    }

    // Update bowler figures
    const totalRunsConcededOnBall = batsmanRuns + (extras === 'Wide' || extras === 'No Ball' ? extrasRuns : 0);
    const updatedBowler = {
      ...matchState.currentBowler,
      runs: matchState.currentBowler.runs + totalRunsConcededOnBall,
      wickets: matchState.currentBowler.wickets + (isWicket ? 1 : 0),
      overs: Number((newOverNumber + newBallInOver / 10).toFixed(1))
    };

    // Recent ball label
    let ballDisplay = runs.toString();
    if (isWicket) ballDisplay = 'W';
    else if (extras === 'Wide') ballDisplay = `${runs}wd`;
    else if (extras === 'No Ball') ballDisplay = `${runs}nb`;
    else if (extras === 'Bye') ballDisplay = `${runs}b`;
    else if (extras === 'Leg Bye') ballDisplay = `${runs}lb`;

    // New log row
    const newLogRow = {
      id: Date.now(),
      over: isLegalBall ? (newBallInOver === 0 ? newOverNumber - 1 : newOverNumber) : newOverNumber,
      ball: isLegalBall ? (newBallInOver === 0 ? 6 : newBallInOver) : `${newBallInOver}+`,
      runs: isWicket ? 'W' : runs,
      extras: extras !== 'None' ? extras : '-',
      wicket: isWicket ? wicketType : '-',
      batsman: striker.name,
      bowler: matchState.currentBowler.name
    };

    setMatchState({
      ...matchState,
      totalRuns: newTotalRuns,
      wickets: newWickets,
      overNumber: newOverNumber,
      ballInOver: newBallInOver,
      batsmen: updatedBatsmen,
      benchBatsmen: updatedBench,
      currentBowler: updatedBowler,
      lastWicket: isWicket ? `${dismissedPlayer || striker.name} (${striker.runs}) ${wicketType} b ${matchState.currentBowler.name}` : matchState.lastWicket,
      recentBalls: [...matchState.recentBalls.slice(1), ballDisplay],
      recentBallsLog: [newLogRow, ...matchState.recentBallsLog],
      historyStack: [...matchState.historyStack, snapshot]
    });

    // Reset controls
    setSelectedRuns(0);
    setSelectedExtras('None');
    setSelectedWicketType('Select');
    setIsWicketModalOpen(false);

    if (overCompleted) {
      showToast(`Over ${newOverNumber} completed! Strike rotated.`);
    } else if (isWicket) {
      showToast(`Wicket! ${dismissedPlayer || striker.name} dismissed.`);
    } else {
      showToast(`Ball recorded: ${ballDisplay}`);
    }
  };

  // =========================================================================
  // CONTROL ACTIONS: UNDO, ROTATE STRIKE, END OVER, END INNINGS
  // =========================================================================
  const handleUndo = () => {
    if (matchState.historyStack.length === 0) {
      alert('No previous deliveries to undo!');
      return;
    }
    const previous = matchState.historyStack[matchState.historyStack.length - 1];
    setMatchState({
      ...previous,
      historyStack: matchState.historyStack.slice(0, -1)
    });
    showToast('Last ball undone successfully.');
  };

  const handleRotateStrike = () => {
    setMatchState({
      ...matchState,
      batsmen: matchState.batsmen.map((b) => ({
        ...b,
        isStriker: !b.isStriker
      }))
    });
    showToast('Strike rotated manually.');
  };

  const handleEndOver = () => {
    // Round to next over
    const newOver = matchState.overNumber + 1;
    setMatchState({
      ...matchState,
      overNumber: newOver,
      ballInOver: 0,
      batsmen: matchState.batsmen.map((b) => ({
        ...b,
        isStriker: !b.isStriker
      }))
    });
    showToast(`Over ${newOver} ended. Strike rotated.`);
  };

  const handleEndInnings = () => {
    if (confirm('Are you sure you want to declare/end this innings?')) {
      showToast(`Innings ended! Rangers scored ${matchState.totalRuns}/${matchState.wickets} in ${matchState.overNumber}.${matchState.ballInOver} overs.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar with sidebar-bg.png */}
      <Sidebar
        activeTab="live-scoring"
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Scoring Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0">
        <TopHeader
          variant="scorer"
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* ========================================================================= */}
          {/* 1. TOP MATCH STATUS & MAIN SCORECARD BOX (Image 1 & 2) */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-6">
            {/* Top Match Tag & Venue Ribbon */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  {matchState.tournament}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {matchState.venue}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {matchState.timestamp}
                </span>
              </div>
            </div>

            {/* Main Scorecard Core Section */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Team 1 Score (Rangers) */}
              <div className="flex items-center gap-4 sm:gap-6 flex-1">
                <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                  <RangersLogo className="w-16 h-16 sm:w-20 sm:h-20" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {matchState.team1.name}
                  </h2>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 tracking-tight">
                      {matchState.totalRuns}/{matchState.wickets}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-slate-500">
                      ({matchState.overNumber}.{matchState.ballInOver})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-bold mt-1.5">
                    <span>CRR: <span className="text-slate-800">{currentRunRate}</span></span>
                    <span className="text-slate-300">|</span>
                    <span>Target: <span className="text-slate-800">{matchState.target}</span></span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                      Need {Math.max(0, matchState.target - matchState.totalRuns)} from {Math.max(0, 120 - (matchState.overNumber * 6 + matchState.ballInOver))} balls
                    </span>
                  </div>
                </div>
              </div>

              {/* VS Divider */}
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 font-black text-xs flex items-center justify-center border border-slate-200">
                VS
              </div>

              {/* Team 2 Indicator (Strikers) */}
              <div className="flex items-center gap-4 sm:gap-6 flex-1 justify-end">
                <div className="text-right">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {matchState.team2.name}
                  </h2>
                  <span className="inline-block mt-1 text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                    Yet to Bat
                  </span>
                </div>
                <div className="p-2 rounded-2xl bg-cyan-50/50 border border-cyan-100 shadow-sm">
                  <StrikersLogo className="w-16 h-16 sm:w-20 sm:h-20" />
                </div>
              </div>
            </div>

            {/* Horizontal Recent Balls Ribbon */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Recent Balls:
                </span>
                <div className="flex items-center gap-2">
                  {matchState.recentBalls.map((ball, idx) => {
                    const isFour = ball === '4';
                    const isSix = ball === '6';
                    const isWicket = ball === 'W';
                    const isWideOrNb = ball.includes('wd') || ball.includes('nb');

                    let badgeColor = 'bg-slate-200 text-slate-800';
                    if (isFour) badgeColor = 'bg-[#00c261] text-white shadow-sm';
                    else if (isSix) badgeColor = 'bg-blue-600 text-white shadow-sm';
                    else if (isWicket) badgeColor = 'bg-rose-600 text-white shadow-sm';
                    else if (isWideOrNb) badgeColor = 'bg-amber-500 text-white shadow-sm';

                    return (
                      <span
                        key={idx}
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-transform hover:scale-110 ${badgeColor}`}
                      >
                        {ball}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="text-xs text-slate-500 font-semibold flex items-center gap-2">
                <span>Over {matchState.overNumber}:</span>
                <span className="font-mono text-slate-700">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span
                      key={i}
                      className={`inline-block px-1.5 py-0.5 rounded text-[11px] mr-1 ${
                        i < matchState.ballInOver ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-300'
                      }`}
                    >
                      {i + 1}
                    </span>
                  ))}
                </span>
              </div>
            </div>

            {/* Active Players Live Summary Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
              {/* Batting Striker */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-extrabold text-slate-900 text-sm">{striker.name} ★</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">STRIKER</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {striker.fours}x4, {striker.sixes}x6 • SR: {((striker.runs / (striker.balls || 1)) * 100).toFixed(1)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-black text-slate-900 text-base">{striker.runs}</div>
                  <div className="text-slate-400 text-[11px]">({striker.balls} balls)</div>
                </div>
              </div>

              {/* Batting Non-Striker */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{nonStriker.name}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">NON-STRIKER</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {nonStriker.fours}x4, {nonStriker.sixes}x6 • SR: {((nonStriker.runs / (nonStriker.balls || 1)) * 100).toFixed(1)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-black text-slate-900 text-base">{nonStriker.runs}</div>
                  <div className="text-slate-400 text-[11px]">({nonStriker.balls} balls)</div>
                </div>
              </div>

              {/* Bowler Stats */}
              <div className="p-3.5 rounded-2xl bg-cyan-50/40 border border-cyan-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{matchState.currentBowler.name}</span>
                    <span className="text-[10px] bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-bold">BOWLER</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Econ: {(matchState.currentBowler.runs / (matchState.currentBowler.overs || 1)).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-black text-slate-900 text-base">
                    {matchState.currentBowler.wickets}/{matchState.currentBowler.runs}
                  </div>
                  <div className="text-slate-400 text-[11px]">({matchState.currentBowler.overs} ov)</div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. CONTROL ACTIONS ROW (Undo, Rotate Strike, End Over, End Innings, Wicket) */}
          {/* ========================================================================= */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-bold text-xs flex items-center gap-2 transition-all"
                title="Undo last delivery"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Undo Last Ball</span>
              </button>

              <button
                onClick={handleRotateStrike}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-bold text-xs flex items-center gap-2 transition-all"
                title="Swap Striker and Non-striker"
              >
                <ArrowRightLeft className="w-4 h-4 text-slate-500" />
                <span>Rotate Strike</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setWicketDetails({
                    dismissalMode: 'Caught',
                    dismissedPlayer: striker.name,
                    fielder: '',
                    nextBatsman: matchState.benchBatsmen[0] || 'Next Batsman'
                  });
                  setIsWicketModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Wicket Modal</span>
              </button>

              <button
                onClick={handleEndOver}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-all"
              >
                End Over
              </button>

              <button
                onClick={handleEndInnings}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs transition-all"
              >
                End Innings
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. TWO-COLUMN INTERACTIVE SCORING GRID (Image 1 & 2) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN: ENTER BALL DETAILS BOX */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200/80 space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>✏️</span> Enter Ball Details
                  </h3>
                  <span className="text-xs font-semibold text-slate-400">
                    Striker: <span className="text-emerald-700 font-bold">{striker.name}</span>
                  </span>
                </div>

                {/* Runs Selector */}
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Runs Scored Off Bat
                    </label>
                    <span className="text-xs text-slate-400 font-medium">Click to select</span>
                  </div>

                  <div className="grid grid-cols-6 gap-2">
                    {runsOptions.map((run) => {
                      const isSelected = selectedRuns === run;
                      let activeStyle = isSelected
                        ? run === 4
                          ? 'bg-[#00c261] text-white border-[#00c261] shadow-lg shadow-emerald-600/25 scale-[1.03]'
                          : run === 6
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/25 scale-[1.03]'
                          : 'bg-[#00c261] text-white border-[#00c261] shadow-md scale-[1.03]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300';

                      return (
                        <button
                          key={run}
                          type="button"
                          onClick={() => setSelectedRuns(run)}
                          className={`py-3.5 rounded-2xl font-black text-lg sm:text-xl border transition-all flex items-center justify-center ${activeStyle}`}
                        >
                          {run}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Extras & Wicket Type Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Extras
                    </label>
                    <select
                      value={selectedExtras}
                      onChange={(e) => setSelectedExtras(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    >
                      <option value="None">None</option>
                      <option value="Wide">Wide (+1 run)</option>
                      <option value="No Ball">No Ball (+1 run)</option>
                      <option value="Bye">Bye</option>
                      <option value="Leg Bye">Leg Bye</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Wicket Type
                    </label>
                    <select
                      value={selectedWicketType}
                      onChange={(e) => setSelectedWicketType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    >
                      <option value="Select">Select (No Wicket)</option>
                      <option value="Bowled">Bowled</option>
                      <option value="Caught">Caught</option>
                      <option value="LBW">LBW</option>
                      <option value="Run Out">Run Out</option>
                      <option value="Stumped">Stumped</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Ball Button */}
              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleSubmitBall}
                  className="w-full bg-[#00c261] hover:bg-[#00ad56] active:scale-[0.99] text-white font-extrabold py-4 px-6 rounded-2xl transition-all shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2.5 text-base tracking-wide"
                >
                  <span className="text-xl">🏏</span>
                  <span>Submit Ball</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: RECENT BALLS LOG TABLE */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>📋</span> Recent Balls Log
                  </h3>
                  <button
                    onClick={() => setLiveUpdatesActive(!liveUpdatesActive)}
                    className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5 transition-colors"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        liveUpdatesActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                      }`}
                    ></span>
                    Live Updates
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 uppercase text-[11px] font-bold tracking-wider">
                      <tr>
                        <th className="p-3 rounded-l-xl">Over</th>
                        <th className="p-3">Ball</th>
                        <th className="p-3">Runs</th>
                        <th className="p-3">Extras</th>
                        <th className="p-3">Wicket</th>
                        <th className="p-3">Batsman</th>
                        <th className="p-3 rounded-r-xl">Bowler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {matchState.recentBallsLog.slice(0, 8).map((log) => {
                        const isFour = log.runs === 4;
                        const isSix = log.runs === 6;
                        const isWicket = log.runs === 'W' || log.wicket !== '-';

                        let badge = 'bg-slate-100 text-slate-700';
                        if (isFour) badge = 'bg-emerald-100 text-emerald-700 font-black';
                        else if (isSix) badge = 'bg-blue-100 text-blue-700 font-black';
                        else if (isWicket) badge = 'bg-rose-100 text-rose-700 font-black';

                        return (
                          <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-bold text-slate-900">{log.over}</td>
                            <td className="p-3 font-semibold text-slate-500">{log.ball}</td>
                            <td className="p-3">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-block text-center min-w-[24px] ${badge}`}>
                                {log.runs}
                              </span>
                            </td>
                            <td className="p-3 font-medium text-slate-500">{log.extras}</td>
                            <td className="p-3 font-bold text-rose-600">{log.wicket}</td>
                            <td className="p-3 font-semibold text-slate-800">{log.batsman}</td>
                            <td className="p-3 font-semibold text-slate-700">{log.bowler}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Displaying latest {Math.min(8, matchState.recentBallsLog.length)} balls</span>
                <span className="font-semibold text-emerald-600">Sync: Active</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 4. DISMISSAL / WICKET MODAL */}
      {/* ========================================================================= */}
      {isWicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Record Wicket Dismissal</h3>
                  <p className="text-xs text-slate-500">Specify mode, batsman & incoming player</p>
                </div>
              </div>
              <button
                onClick={() => setIsWicketModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Dismissed Batsman */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Dismissed Batsman
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWicketDetails({ ...wicketDetails, dismissedPlayer: striker.name })}
                    className={`p-3 rounded-xl border text-left font-bold transition-all ${
                      wicketDetails.dismissedPlayer === striker.name
                        ? 'bg-rose-50 border-rose-400 text-rose-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div>{striker.name} ★</div>
                    <span className="text-[10px] text-slate-400 font-normal">Striker</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWicketDetails({ ...wicketDetails, dismissedPlayer: nonStriker.name })}
                    className={`p-3 rounded-xl border text-left font-bold transition-all ${
                      wicketDetails.dismissedPlayer === nonStriker.name
                        ? 'bg-rose-50 border-rose-400 text-rose-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div>{nonStriker.name}</div>
                    <span className="text-[10px] text-slate-400 font-normal">Non-Striker (Run-Out)</span>
                  </button>
                </div>
              </div>

              {/* Dismissal Mode */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Dismissal Mode
                </label>
                <select
                  value={wicketDetails.dismissalMode}
                  onChange={(e) => setWicketDetails({ ...wicketDetails, dismissalMode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="Bowled">Bowled</option>
                  <option value="Caught">Caught</option>
                  <option value="LBW">LBW</option>
                  <option value="Run Out">Run Out</option>
                  <option value="Stumped">Stumped</option>
                  <option value="Hit Wicket">Hit Wicket</option>
                </select>
              </div>

              {/* Fielder Involved (for Caught, Run Out, Stumped) */}
              {(wicketDetails.dismissalMode === 'Caught' ||
                wicketDetails.dismissalMode === 'Run Out' ||
                wicketDetails.dismissalMode === 'Stumped') && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Fielder Involved
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sameer R., Arjun K."
                    value={wicketDetails.fielder}
                    onChange={(e) => setWicketDetails({ ...wicketDetails, fielder: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Incoming Batsman */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Next Incoming Batsman
                </label>
                <select
                  value={wicketDetails.nextBatsman}
                  onChange={(e) => setWicketDetails({ ...wicketDetails, nextBatsman: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {matchState.benchBatsmen.map((player) => (
                    <option key={player} value={player}>
                      {player}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsWicketModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    processBall({
                      runs: selectedRuns,
                      extras: selectedExtras,
                      wicketType: wicketDetails.dismissalMode,
                      dismissedPlayer: wicketDetails.dismissedPlayer,
                      nextBatsmanName: wicketDetails.nextBatsman
                    });
                  }}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-600/20"
                >
                  Confirm Wicket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
