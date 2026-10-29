import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Activity, 
  RefreshCw, 
  AlertCircle,
  Radio,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  MapPin,
  TrendingUp,
  Target,
  BarChart2,
  Info,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Play,
  Pause,
  Award,
  Flame,
  MessageSquare,
  Send
} from 'lucide-react';
import api from '../lib/api';
import useLiveMatch from '../lib/useLiveMatch';
import sampleCricketData from '../data/sample_cricket_data.json';
import { 
  generateMatchDetailedAnalytics,
  calculateWinProbability,
  calculateKeyPerformers,
  generateMatchCommentary
} from '../lib/scorecardGenerator';

// Helper to extract clean team name and short code from CricAPI format: "Nagaland [NGL]"
function parseTeam(rawName, fallbackIndex = 1) {
  if (!rawName) return { name: `Team ${fallbackIndex}`, code: `T${fallbackIndex}` };
  const match = rawName.match(/^(.*?)\s*\[(.*?)\]$/);
  if (match) {
    return { name: match[1].trim(), code: match[2].trim() };
  }
  const clean = rawName.trim();
  const code = clean.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase() || `T${fallbackIndex}`;
  return { name: clean, code };
}

// Helper to format GMT timestamps
function formatMatchDateTime(dateTimeGMT) {
  if (!dateTimeGMT) return { date: 'Date TBA', time: '' };
  try {
    const d = new Date(dateTimeGMT.endsWith('Z') ? dateTimeGMT : `${dateTimeGMT}Z`);
    return {
      date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };
  } catch {
    return { date: dateTimeGMT, time: '' };
  }
}

// Logo with error fallback to stylized initials badge
const TeamLogo = ({ src, name, code, size = 'md' }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const sizeStyles = {
    sm: 'w-7 h-7 text-[10px] rounded-lg',
    md: 'w-10 h-10 text-xs rounded-xl',
    lg: 'w-16 h-16 sm:w-20 sm:h-20 text-base sm:text-xl rounded-2xl'
  }[size] || 'w-10 h-10 text-xs rounded-xl';

  if (!src || imgError) {
    return (
      <div className={`${sizeStyles} bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700/60 flex items-center justify-center font-black text-white shrink-0 shadow-sm select-none`}>
        {code || name?.slice(0, 3).toUpperCase() || 'TM'}
      </div>
    );
  }

  return (
    <div className={`${sizeStyles} bg-white border border-slate-200/80 p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden select-none`}>
      <img
        src={src}
        alt={name || 'Team Logo'}
        onError={() => setImgError(true)}
        className="w-full h-full object-contain"
        loading="lazy"
      />
    </div>
  );
};

// Format Pill tag
const FormatBadge = ({ type }) => {
  const normalized = (type || 'cricket').toLowerCase();
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  if (normalized.includes('t20')) {
    bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (normalized.includes('odi') || normalized.includes('list')) {
    bg = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (normalized.includes('test')) {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${bg}`}>
      {type || 'Match'}
    </span>
  );
};

// Categorize matches locally for instant fallback
function categorizeLocalMatches(rawList) {
  const live = [];
  const recent = [];
  const upcoming = [];

  for (const m of (rawList || [])) {
    const ms = (m.ms || '').toLowerCase();
    const status = (m.status || '').toLowerCase();
    const ended = !!m.matchEnded;
    const started = !!m.matchStarted;

    if ((ms === 'live' || status.includes('stumps') || status.includes('day ') || status.includes('in progress') || (started && !ended)) && !ended && !status.includes('won')) {
      live.push(m);
    } else if (ms === 'result' || ended || status.includes('won') || status.includes('tied') || status.includes('drawn')) {
      recent.push(m);
    } else {
      upcoming.push(m);
    }
  }
  return { live, recent, upcoming };
}

const LiveScores = () => {
  const { matchId: routeMatchId } = useParams();

  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Active filter tab in Real-World Match Center
  const [matchFilter, setMatchFilter] = useState('live'); // 'live' | 'recent' | 'upcoming'
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Match Detail Tab: 'scorecard' | 'commentary' | 'stats' | 'info' | 'directory'
  const [detailTab, setDetailTab] = useState('scorecard');
  const [activeInningsNo, setActiveInningsNo] = useState(1);
  const [commentaryFilter, setCommentaryFilter] = useState('all'); // 'all' | 'wicket' | 'boundary'

  // Feature 1: Auto-Refresh Countdown & Live Poller (Default: Off)
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(0); // 0 (off) | 30s | 60s
  const [countdown, setCountdown] = useState(0);
  const [isAutoRefreshPaused, setIsAutoRefreshPaused] = useState(true);

  // Feature 6: Share Modal / Feedback Toast
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Primary view selector: 'real-world' vs 'cdms-league'
  const [activeView, setActiveView] = useState(routeMatchId ? 'cdms-league' : 'real-world');

  // Horizontal scroll container ref for Real-World Match Center
  const scrollContainerRef = useRef(null);

  // 1. Fetch Real-World Cricket Data from backend /api/live-scores (with local JSON fallback)
  const fetchLiveScores = async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else if (!apiResponse) {
      setLoading(true);
    }
    setFetchError(null);

    try {
      const data = await api.liveScores.get('live', forceRefresh);
      setApiResponse(data);

      const candidateList = data[matchFilter] || data.live || data.data || [];
      if (!selectedMatch && candidateList.length > 0) {
        setSelectedMatch(candidateList[0]);
      }
    } catch (err) {
      console.warn('Backend API unavailable, serving bundled sample data:', err.message);
      const sampleMatches = sampleCricketData.data || [];
      const categorized = categorizeLocalMatches(sampleMatches);
      const fallbackResp = {
        status: 'success',
        source: 'fallback',
        mode: 'live',
        cache_age_seconds: 0,
        api_hits_used: 0,
        total: sampleMatches.length,
        live: categorized.live,
        recent: categorized.recent,
        upcoming: categorized.upcoming,
        data: sampleMatches,
        fallback_notice: 'Backend unreachable. Seamlessly active in offline sample snapshot mode.'
      };
      setApiResponse(fallbackResp);
      if (!selectedMatch) {
        const initial = categorized[matchFilter]?.[0] || categorized.live[0] || sampleMatches[0];
        setSelectedMatch(initial);
      }
      setFetchError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveScores(false);
  }, []);

  // Feature 1: Auto-Refresh countdown effect
  useEffect(() => {
    if (autoRefreshInterval === 0 || isAutoRefreshPaused) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchLiveScores(false);
          return autoRefreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshInterval, isAutoRefreshPaused]);

  // Reset countdown whenever interval changes
  useEffect(() => {
    setCountdown(autoRefreshInterval);
  }, [autoRefreshInterval]);

  // When selectedMatch changes, intelligently pick the active innings
  useEffect(() => {
    if (!selectedMatch) return;
    if (selectedMatch.t1s && !selectedMatch.t2s) {
      setActiveInningsNo(1);
    } else if (!selectedMatch.t1s && selectedMatch.t2s) {
      setActiveInningsNo(2);
    } else {
      setActiveInningsNo(1);
    }
  }, [selectedMatch?.id]);

  // When matchFilter changes, pick first match if current is not in active tab
  useEffect(() => {
    if (!apiResponse) return;
    const currentTabMatches = apiResponse[matchFilter] || [];
    if (currentTabMatches.length > 0) {
      const exists = currentTabMatches.some(m => m.id === selectedMatch?.id);
      if (!exists) {
        setSelectedMatch(currentTabMatches[0]);
      }
    }
  }, [matchFilter]);

  // Scroll controls for horizontal Match Center
  const scrollMatchCenter = (direction) => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Filtered matches for the active tab (with search)
  const currentTabMatches = useMemo(() => {
    if (!apiResponse) return [];
    const list = apiResponse[matchFilter] || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(m => 
      (m.t1 || '').toLowerCase().includes(q) ||
      (m.t2 || '').toLowerCase().includes(q) ||
      (m.series || '').toLowerCase().includes(q) ||
      (m.matchType || '').toLowerCase().includes(q)
    );
  }, [apiResponse, matchFilter, searchQuery]);

  // Counts for pills
  const counts = useMemo(() => {
    return {
      live: apiResponse?.live?.length || 0,
      recent: apiResponse?.recent?.length || 0,
      upcoming: apiResponse?.upcoming?.length || 0,
      total: apiResponse?.total || 0
    };
  }, [apiResponse]);

  // Generate detailed scorecard analytics for the selected match
  const detailedAnalytics = useMemo(() => {
    if (!selectedMatch) return null;
    return generateMatchDetailedAnalytics(selectedMatch);
  }, [selectedMatch]);

  // Check if current selected match is completed (don't show winning percentage when finished)
  const isMatchCompleted = useMemo(() => {
    if (!selectedMatch) return false;
    const ms = (selectedMatch.ms || '').toLowerCase();
    const status = (selectedMatch.status || '').toLowerCase();
    return Boolean(
      selectedMatch.matchEnded ||
      ms === 'result' ||
      status.includes('won') ||
      status.includes('tied') ||
      status.includes('drawn') ||
      status.includes('beat') ||
      status.includes('abandoned') ||
      status.includes('no result')
    );
  }, [selectedMatch]);

  // Feature 3: Win Probability & Momentum Gauge (suppressed if match is completed)
  const winProbability = useMemo(() => {
    if (!selectedMatch || !detailedAnalytics || isMatchCompleted) return null;
    return calculateWinProbability(detailedAnalytics, selectedMatch.status);
  }, [selectedMatch, detailedAnalytics, isMatchCompleted]);

  // Feature 7: Key Performers & Player of the Match
  const keyPerformers = useMemo(() => {
    if (!detailedAnalytics) return null;
    return calculateKeyPerformers(detailedAnalytics);
  }, [detailedAnalytics]);

  // Feature 4: Ball-by-ball Live Commentary stream
  const commentaryList = useMemo(() => {
    if (!selectedMatch || !detailedAnalytics) return [];
    const list = generateMatchCommentary(selectedMatch, detailedAnalytics);
    if (commentaryFilter === 'wicket') {
      return list.filter(c => c.ballType === 'WICKET');
    }
    if (commentaryFilter === 'boundary') {
      return list.filter(c => c.ballType === 'FOUR' || c.ballType === 'SIX');
    }
    return list;
  }, [selectedMatch, detailedAnalytics, commentaryFilter]);

  // Helper for Hero Scorecard Team details
  const t1 = useMemo(() => parseTeam(selectedMatch?.t1, 1), [selectedMatch?.t1]);
  const t2 = useMemo(() => parseTeam(selectedMatch?.t2, 2), [selectedMatch?.t2]);
  const matchTiming = useMemo(() => formatMatchDateTime(selectedMatch?.dateTimeGMT), [selectedMatch?.dateTimeGMT]);

  // Feature 6: Share snippet generator
  const shareText = useMemo(() => {
    if (!selectedMatch) return '';
    return `🏏 ${selectedMatch.series || 'Cricket Match'}\n${t1.name} (${selectedMatch.t1s || '-'}) vs ${t2.name} (${selectedMatch.t2s || '-'})\nStatus: ${selectedMatch.status || 'Live'}\nFollow live on League Of Our Own (CDMS)`;
  }, [selectedMatch, t1, t2]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // ------------------------------------------------------------------
  // CDMS League Match Integration (Internal database match & WebSocket)
  // ------------------------------------------------------------------
  const [cdmsMatchId, setCdmsMatchId] = useState(routeMatchId || '1');
  const [cdmsMetadata, setCdmsMetadata] = useState(null);
  const [cdmsCommentary, setCdmsCommentary] = useState([]);
  const [cdmsLoading, setCdmsLoading] = useState(false);
  const { scorecard: cdmsScorecard, isConnected: cdmsConnected } = useLiveMatch(activeView === 'cdms-league' ? cdmsMatchId : null);

  useEffect(() => {
    if (activeView !== 'cdms-league' || !cdmsMatchId) return;
    let mounted = true;
    async function loadCdms() {
      try {
        setCdmsLoading(true);
        const [meta, comm] = await Promise.all([
          api.matches.getById(cdmsMatchId).catch(() => null),
          api.matches.getCommentary(cdmsMatchId).catch(() => [])
        ]);
        if (mounted) {
          setCdmsMetadata(meta);
          setCdmsCommentary(comm || []);
        }
      } finally {
        if (mounted) setCdmsLoading(false);
      }
    }
    loadCdms();
    return () => { mounted = false; };
  }, [activeView, cdmsMatchId]);

  return (
    <div className="min-h-screen bg-[#eef2f6] pb-24 font-sans text-slate-800">
      
      {/* ============================================================== */}
      {/* 1. TOP HERO BANNER & HEADER */}
      {/* ============================================================== */}
      <div className="relative w-full bg-[#070d1e] text-white overflow-hidden shadow-md">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: `url('/Live_Score_background.jpeg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-[#061129]/95 to-[#0b1b3d]/90" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Title & Live Status */}
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Match Center
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs text-slate-300 font-medium">CricketData.org API v1</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
                Real-World Cricket Live Scores & Scorecard
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
                Up-to-date fixtures, team logos, detailed player scorecards, live commentary, and win probabilities.
              </p>
            </div>

            {/* View Switcher: Real-World vs CDMS League */}
            <div className="flex items-center bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/60 shadow-inner shrink-0">
              <button
                id="view-real-world-btn"
                onClick={() => setActiveView('real-world')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  activeView === 'real-world'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>World Cricket ({counts.total})</span>
              </button>
              <button
                id="view-cdms-league-btn"
                onClick={() => setActiveView('cdms-league')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  activeView === 'cdms-league'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>CDMS League Match</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. REAL-WORLD CRICKET VIEW */}
      {/* ============================================================== */}
      {activeView === 'real-world' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 -mt-4">

          {/* Live Score Controls & Status Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Left: Professional Live Match Status Indicator */}
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Cricket Match Center</span>
              </span>
            </div>

            {/* Right: Feature 1 (Auto-Refresh) + Update Score */}
            <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-auto">
              
              {/* Feature 1: Auto-Refresh Countdown Poller (Default: Off) */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
                <button
                  onClick={() => {
                    if (autoRefreshInterval === 0) {
                      setAutoRefreshInterval(30);
                      setIsAutoRefreshPaused(false);
                    } else {
                      setIsAutoRefreshPaused(!isAutoRefreshPaused);
                    }
                  }}
                  className={`p-1 rounded-md hover:bg-slate-200 transition-colors cursor-pointer ${
                    autoRefreshInterval === 0 ? 'text-slate-400' : isAutoRefreshPaused ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                  title={autoRefreshInterval === 0 ? 'Enable auto-sync (30s)' : isAutoRefreshPaused ? 'Resume auto-sync' : 'Pause auto-sync'}
                >
                  {autoRefreshInterval === 0 || isAutoRefreshPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                </button>

                <div className="flex items-center gap-1 text-[11px]">
                  <span>Auto-sync:</span>
                  <span className={`font-mono font-bold ${
                    autoRefreshInterval === 0 ? 'text-slate-400' : isAutoRefreshPaused ? 'text-amber-600' : 'text-emerald-700'
                  }`}>
                    {autoRefreshInterval === 0 ? 'OFF' : isAutoRefreshPaused ? 'PAUSED' : `${countdown}s`}
                  </span>
                </div>

                <select
                  value={autoRefreshInterval}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAutoRefreshInterval(val);
                    setIsAutoRefreshPaused(val === 0);
                  }}
                  className="bg-transparent text-[11px] font-bold text-slate-600 border-none outline-none cursor-pointer pl-1"
                  title="Change auto-refresh interval"
                >
                  <option value={0}>Off</option>
                  <option value={30}>30s</option>
                  <option value={60}>60s</option>
                </select>
              </div>

              {/* Force Refresh Button */}
              <button
                id="update-score-btn"
                onClick={() => fetchLiveScores(true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                title="Fetch latest cricket scores"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Updating...' : 'Update Score'}</span>
              </button>

            </div>

          </div>

          {/* ============================================================== */}
          {/* 3. REAL-WORLD MATCH CENTER: HORIZONTAL SCROLL TICKER */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-5 space-y-4">
            
            {/* Header with Filter Pills & Scroll Arrows */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 mr-1">
                  Match Center:
                </span>
                <button
                  id="filter-live-btn"
                  onClick={() => setMatchFilter('live')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    matchFilter === 'live'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Live ({counts.live})</span>
                </button>

                <button
                  id="filter-recent-btn"
                  onClick={() => setMatchFilter('recent')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    matchFilter === 'recent'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Recent Results ({counts.recent})
                </button>

                <button
                  id="filter-upcoming-btn"
                  onClick={() => setMatchFilter('upcoming')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    matchFilter === 'upcoming'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Upcoming ({counts.upcoming})
                </button>
              </div>

              {/* Scroll controls */}
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={() => scrollMatchCenter('left')}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                  aria-label="Scroll Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollMatchCenter('right')}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                  aria-label="Scroll Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Horizontal Scroll Cards Bar */}
            {loading ? (
              <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2 text-sm font-semibold">
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                <span>Loading real-world cricket matches...</span>
              </div>
            ) : currentTabMatches.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No matches found in this category.
              </div>
            ) : (
              <div
                ref={scrollContainerRef}
                className="flex items-stretch gap-3.5 overflow-x-auto pb-2 scroll-smooth no-scrollbar"
                style={{ scrollbarWidth: 'thin' }}
              >
                {currentTabMatches.map((m) => {
                  const m1 = parseTeam(m.t1, 1);
                  const m2 = parseTeam(m.t2, 2);
                  const isSelected = selectedMatch?.id === m.id;
                  const isLive = matchFilter === 'live' || (m.ms || '').toLowerCase() === 'live';

                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMatch(m)}
                      className={`min-w-[270px] max-w-[290px] p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between shrink-0 select-none ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20 shadow-md scale-[1.01]'
                          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      {/* Top Bar: Format & Series */}
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <FormatBadge type={m.matchType} />
                        <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[170px]" title={m.series}>
                          {m.series || 'Cricket Series'}
                        </span>
                      </div>

                      {/* Middle: Teams & Scores */}
                      <div className="py-2.5 space-y-2">
                        {/* Team 1 */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <TeamLogo src={m.t1img} name={m1.name} code={m1.code} size="sm" />
                            <span className="text-xs font-bold text-slate-800 truncate" title={m1.name}>
                              {m1.name}
                            </span>
                          </div>
                          <span className="text-xs font-black text-slate-900 shrink-0 font-mono">
                            {m.t1s || '—'}
                          </span>
                        </div>

                        {/* Team 2 */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <TeamLogo src={m.t2img} name={m2.name} code={m2.code} size="sm" />
                            <span className="text-xs font-bold text-slate-800 truncate" title={m2.name}>
                              {m2.name}
                            </span>
                          </div>
                          <span className="text-xs font-black text-slate-900 shrink-0 font-mono">
                            {m.t2s || '—'}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Status Snippet */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="truncate text-slate-600 font-medium max-w-[200px]" title={m.status}>
                          {m.status || (isLive ? 'Match in progress' : 'Scheduled')}
                        </span>
                        {isLive && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* ============================================================== */}
          {/* 4. DYNAMIC HERO SCORECARD & LIVE MOMENTUM BAR */}
          {/* ============================================================== */}
          {selectedMatch && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden relative">
              
              {/* Hero Top Ribbon */}
              <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                      {selectedMatch.series || 'Official Series'}
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      {matchTiming.date} {matchTiming.time ? `• ${matchTiming.time}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FormatBadge type={selectedMatch.matchType} />
                  
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                    (selectedMatch.ms || '').toLowerCase() === 'live' || (matchFilter === 'live')
                      ? 'bg-emerald-500 text-slate-950'
                      : selectedMatch.matchEnded || (selectedMatch.ms || '').toLowerCase() === 'result'
                      ? 'bg-slate-700 text-slate-200'
                      : 'bg-blue-600 text-white'
                  }`}>
                    {(selectedMatch.ms || '').toLowerCase() === 'live' || (matchFilter === 'live') ? 'LIVE NOW' :
                     selectedMatch.matchEnded || (selectedMatch.ms || '').toLowerCase() === 'result' ? 'RESULT' : 'SCHEDULED'}
                  </span>

                  {/* Feature 6: Share Button */}
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors ml-1"
                    title="Share match summary"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Main Scoreboard Face */}
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-6 items-center">
                  
                  {/* Team 1 (Col 1-3) */}
                  <div className="md:col-span-3 flex items-center gap-4 sm:gap-5">
                    <TeamLogo
                      src={selectedMatch.t1img}
                      name={t1.name}
                      code={t1.code}
                      size="lg"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t1.code}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                        {t1.name}
                      </h3>
                      <div className="mt-1">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                          {selectedMatch.t1s || 'Yet to bat'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* VS / Status Middle (Col 4) */}
                  <div className="md:col-span-1 flex flex-col items-center justify-center py-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-xs text-slate-600 uppercase tracking-wider shadow-xs">
                      VS
                    </div>
                  </div>

                  {/* Team 2 (Col 5-7) */}
                  <div className="md:col-span-3 flex items-center md:flex-row-reverse gap-4 sm:gap-5 md:text-right">
                    <TeamLogo
                      src={selectedMatch.t2img}
                      name={t2.name}
                      code={t2.code}
                      size="lg"
                    />
                    <div>
                      <div className="flex items-center md:justify-end gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t2.code}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                        {t2.name}
                      </h3>
                      <div className="mt-1">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                          {selectedMatch.t2s || 'Yet to bat'}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Feature 3: Broadcast-Grade Live Win Probability & Momentum Bar (Suppressed when match is completed) */}
                {winProbability && !isMatchCompleted && (
                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      <span className="flex items-center gap-1.5 text-emerald-700">
                        <Flame className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t1.name} ({winProbability.team1}%)</span>
                      </span>

                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {winProbability.leader}
                      </span>

                      <span className="flex items-center gap-1.5 text-blue-700">
                        <span>({winProbability.team2}%) {t2.name}</span>
                        <Target className="w-3.5 h-3.5 text-blue-600" />
                      </span>
                    </div>

                    {/* Gradient Meter Bar */}
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                      <div
                        className="bg-emerald-500 transition-all duration-700 ease-out"
                        style={{ width: `${winProbability.team1}%` }}
                        title={`${t1.name} win probability: ${winProbability.team1}%`}
                      />
                      <div
                        className="bg-blue-600 transition-all duration-700 ease-out"
                        style={{ width: `${winProbability.team2}%` }}
                        title={`${t2.name} win probability: ${winProbability.team2}%`}
                      />
                    </div>
                  </div>
                )}

                {/* Match Status Summary Ribbon */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-3 rounded-2xl flex-1">
                    <Activity className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match Status Summary</div>
                      <div className="text-sm font-extrabold text-slate-900">
                        {selectedMatch.status || 'Match in progress. Score updates incoming.'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500 self-center sm:self-auto shrink-0">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {matchTiming.date}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {matchTiming.time || 'GMT Schedule'}
                    </span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* 5. MATCH DETAILS & SCOREBOARD SECTION TABS */}
          {/* ============================================================== */}
          {selectedMatch && detailedAnalytics && (
            <div className="space-y-4">
              
              {/* Detailed Navigation Tabs */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs font-extrabold">
                  <button
                    id="tab-detailed-scorecard"
                    onClick={() => setDetailTab('scorecard')}
                    className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                      detailTab === 'scorecard'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span>🏏 Detailed Scoreboard</span>
                  </button>

                  <button
                    id="tab-live-commentary"
                    onClick={() => setDetailTab('commentary')}
                    className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                      detailTab === 'commentary'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>🎙️ Live Commentary</span>
                  </button>

                  <button
                    id="tab-match-stats"
                    onClick={() => setDetailTab('stats')}
                    className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                      detailTab === 'stats'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>Match Stats & Analytics</span>
                  </button>

                  <button
                    id="tab-match-info"
                    onClick={() => setDetailTab('info')}
                    className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                      detailTab === 'info'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Match Info</span>
                  </button>

                  <button
                    id="tab-fixtures-directory"
                    onClick={() => setDetailTab('directory')}
                    className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                      detailTab === 'directory'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>All Matches ({currentTabMatches.length})</span>
                  </button>
                </div>
              </div>

              {/* -------------------------------------------------------- */}
              {/* SUB-VIEW 1: DETAILED SCOREBOARD + FEATURE 7 POTM SPOTLIGHT */}
              {/* -------------------------------------------------------- */}
              {detailTab === 'scorecard' && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5 sm:p-7 space-y-6">
                  
                  {/* Innings Toggle Selector */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        id="innings-1-btn"
                        onClick={() => setActiveInningsNo(1)}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                          activeInningsNo === 1
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {detailedAnalytics.team1.name} 1st Innings ({selectedMatch.t1s || 'Yet to bat'})
                      </button>

                      <button
                        id="innings-2-btn"
                        onClick={() => setActiveInningsNo(2)}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                          activeInningsNo === 2
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {detailedAnalytics.team2.name} 1st Innings ({selectedMatch.t2s || 'Yet to bat'})
                      </button>
                    </div>

                    <span className="text-xs text-slate-400 font-medium">
                      Format: <strong className="text-slate-700">{detailedAnalytics.format}</strong>
                    </span>
                  </div>

                  {/* Innings Content */}
                  {(() => {
                    const currentInnings = activeInningsNo === 1 ? detailedAnalytics.team1.innings : detailedAnalytics.team2.innings;
                    const battingTeam = activeInningsNo === 1 ? detailedAnalytics.team1 : detailedAnalytics.team2;
                    const bowlingTeam = activeInningsNo === 1 ? detailedAnalytics.team2 : detailedAnalytics.team1;

                    if (!currentInnings || !currentInnings.hasScore) {
                      const squadList = battingTeam.squad || [];
                      return (
                        <div className="space-y-5">
                          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <Activity className="w-5 h-5 text-emerald-600 shrink-0" />
                              <div>
                                <h4 className="text-sm font-extrabold text-slate-800">
                                  {battingTeam.name} — Projected Lineup & Squad
                                </h4>
                                <p className="text-xs text-slate-500">
                                  Innings has not yet commenced. Official squad and batting order listed below.
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-xs self-start sm:self-auto">
                              11 Players Listed
                            </span>
                          </div>

                          {/* Squad Table / Lineup */}
                          <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-2xs">
                            <table className="w-full text-left text-xs sm:text-sm">
                              <thead>
                                <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider">
                                  <th className="py-3 px-4">#</th>
                                  <th className="py-3 px-4">Player</th>
                                  <th className="py-3 px-4">Role</th>
                                  <th className="py-3 px-4">Playing Style</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-medium">
                                {squadList.map((player, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="py-2.5 px-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
                                    <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                                      <span>{player.name}</span>
                                      {player.captain && (
                                        <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-1.5 py-0.5 rounded">
                                          C
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2.5 px-4 text-xs capitalize text-slate-600 font-semibold">{player.role}</td>
                                    <td className="py-2.5 px-4 text-xs text-slate-500">{player.style || '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-6">
                        
                        {/* Batting Card */}
                        <div>
                          <div className="flex items-center justify-between pb-3">
                            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                              <span>🏏 Batting: {battingTeam.name}</span>
                            </h4>
                            <span className="text-xs font-bold text-slate-500">
                              CRR: <strong className="text-slate-900">{currentInnings.crr}</strong>
                            </span>
                          </div>

                          <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-2xs">
                            <table className="w-full text-left text-xs sm:text-sm">
                              <thead>
                                <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider">
                                  <th className="py-3 px-4">Batter</th>
                                  <th className="py-3 px-4">Dismissal</th>
                                  <th className="py-3 px-3 text-right">R</th>
                                  <th className="py-3 px-3 text-right">B</th>
                                  <th className="py-3 px-3 text-right">4s</th>
                                  <th className="py-3 px-3 text-right">6s</th>
                                  <th className="py-3 px-4 text-right">SR</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-medium">
                                {currentInnings.batting.map((b) => (
                                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="py-3 px-4 font-bold text-slate-900">
                                      {b.name} {b.isNotOut && <span className="text-emerald-600 font-black">*</span>}
                                    </td>
                                    <td className="py-3 px-4 text-xs text-slate-500 font-normal">
                                      {b.dismissal}
                                    </td>
                                    <td className="py-3 px-3 text-right font-black text-slate-900 text-sm">
                                      {b.runs}
                                    </td>
                                    <td className="py-3 px-3 text-right text-slate-500">
                                      {b.balls}
                                    </td>
                                    <td className="py-3 px-3 text-right text-slate-600">
                                      {b.fours}
                                    </td>
                                    <td className="py-3 px-3 text-right text-slate-600">
                                      {b.sixes}
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono text-xs text-slate-700">
                                      {b.sr}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Extras & Total Summary */}
                          <div className="mt-3 bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                            <div className="text-slate-600">
                              <span className="font-bold text-slate-700 mr-1">Extras:</span>
                              <strong>{currentInnings.extras.total}</strong>
                              <span className="text-slate-400 ml-1.5">
                                (b {currentInnings.extras.byes}, lb {currentInnings.extras.legByes}, w {currentInnings.extras.wides}, nb {currentInnings.extras.noBalls})
                              </span>
                            </div>

                            <div className="text-slate-900 font-extrabold text-sm sm:text-base">
                              <span className="text-xs text-slate-500 font-normal mr-1.5">Total:</span>
                              {currentInnings.totalRuns}/{currentInnings.totalWickets} 
                              <span className="text-xs font-bold text-slate-500 ml-1.5">({currentInnings.overs} Ov)</span>
                            </div>
                          </div>

                          {/* Did not bat */}
                          {currentInnings.didNotBat && currentInnings.didNotBat.length > 0 && (
                            <div className="mt-2 text-xs text-slate-500 px-1">
                              <span className="font-bold text-slate-600 mr-1.5">Did not bat:</span>
                              {currentInnings.didNotBat.join(', ')}
                            </div>
                          )}
                        </div>

                        {/* Bowling Card */}
                        <div className="pt-2">
                          <div className="flex items-center justify-between pb-3">
                            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                              <span>⚡ Bowling: {bowlingTeam.name}</span>
                            </h4>
                          </div>

                          <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-2xs">
                            <table className="w-full text-left text-xs sm:text-sm">
                              <thead>
                                <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider">
                                  <th className="py-3 px-4">Bowler</th>
                                  <th className="py-3 px-3 text-right">O</th>
                                  <th className="py-3 px-3 text-right">M</th>
                                  <th className="py-3 px-3 text-right">R</th>
                                  <th className="py-3 px-3 text-right">W</th>
                                  <th className="py-3 px-4 text-right">ECON</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-medium">
                                {currentInnings.bowling.map((bw) => (
                                  <tr key={bw.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="py-3 px-4 font-bold text-slate-900">
                                      {bw.name}
                                    </td>
                                    <td className="py-3 px-3 text-right text-slate-600 font-mono">
                                      {bw.overs}
                                    </td>
                                    <td className="py-3 px-3 text-right text-slate-500">
                                      {bw.maidens}
                                    </td>
                                    <td className="py-3 px-3 text-right text-slate-600">
                                      {bw.runs}
                                    </td>
                                    <td className="py-3 px-3 text-right font-black text-rose-600 text-sm">
                                      {bw.wickets}
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono text-xs text-slate-700">
                                      {bw.economy}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Fall of Wickets Timeline */}
                        {currentInnings.fallOfWickets && currentInnings.fallOfWickets.length > 0 && (
                          <div className="pt-2">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                              Fall of Wickets
                            </h4>
                            <div className="flex flex-wrap gap-2 text-xs">
                              {currentInnings.fallOfWickets.map((fow) => (
                                <div
                                  key={fow.wicket}
                                  className="bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl font-medium text-slate-700"
                                >
                                  <strong className="text-slate-900 mr-1">{fow.score}</strong>
                                  <span className="text-slate-500 text-[11px]">({fow.player}, {fow.over} ov)</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })()}

                  {/* Feature 7: Key Performers Spotlight Card */}
                  {keyPerformers && (
                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="w-5 h-5 text-amber-500" />
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                          Key Performers & Player of the Match Spotlight
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* Player of the Match Candidate */}
                        {keyPerformers.playerOfTheMatch && (
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 shadow-xs relative overflow-hidden">
                            <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                              POTM Candidate
                            </span>
                            <div className="text-[10px] font-bold text-amber-800 uppercase">Impact Performer</div>
                            <h5 className="text-base font-black text-slate-900 mt-1">{keyPerformers.playerOfTheMatch.name}</h5>
                            <div className="text-xs font-bold text-slate-700 mt-2">{keyPerformers.playerOfTheMatch.stat}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{keyPerformers.playerOfTheMatch.subStat}</div>
                          </div>
                        )}

                        {/* Top Batter */}
                        {keyPerformers.topBatter && (
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                            <div className="text-[10px] font-bold text-emerald-700 uppercase">Top Batter</div>
                            <h5 className="text-base font-black text-slate-900 mt-1">{keyPerformers.topBatter.name}</h5>
                            <div className="text-xs font-bold text-slate-700 mt-2">
                              {keyPerformers.topBatter.runs} runs ({keyPerformers.topBatter.balls} balls)
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {keyPerformers.topBatter.fours}x4 • {keyPerformers.topBatter.sixes}x6 • SR: {keyPerformers.topBatter.sr}
                            </div>
                          </div>
                        )}

                        {/* Top Bowler */}
                        {keyPerformers.topBowler && (
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                            <div className="text-[10px] font-bold text-blue-700 uppercase">Top Bowler</div>
                            <h5 className="text-base font-black text-slate-900 mt-1">{keyPerformers.topBowler.name}</h5>
                            <div className="text-xs font-bold text-slate-700 mt-2">
                              {keyPerformers.topBowler.wickets} wickets for {keyPerformers.topBowler.runs} runs
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {keyPerformers.topBowler.overs} overs • Economy: {keyPerformers.topBowler.economy}
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* SUB-VIEW 2: FEATURE 4 BALL-BY-BALL COMMENTARY STREAM */}
              {/* -------------------------------------------------------- */}
              {detailTab === 'commentary' && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5 sm:p-7 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900">
                        🎙️ Ball-by-Ball Match Commentary Stream
                      </h4>
                      <p className="text-xs text-slate-500">
                        Over-by-over narrative highlights, wickets, and boundary calls.
                      </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                      <button
                        onClick={() => setCommentaryFilter('all')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          commentaryFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        All Balls
                      </button>
                      <button
                        onClick={() => setCommentaryFilter('wicket')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          commentaryFilter === 'wicket' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Wickets Only
                      </button>
                      <button
                        onClick={() => setCommentaryFilter('boundary')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          commentaryFilter === 'boundary' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Boundaries Only
                      </button>
                    </div>
                  </div>

                  {commentaryList.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      No commentary entries matching this filter.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 space-y-1">
                      {commentaryList.map((comm) => (
                        <div key={comm.id} className="pt-3.5 pb-2.5 flex items-start gap-3.5 sm:gap-4 hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                          <span className="font-mono text-xs font-extrabold text-slate-700 bg-slate-100 px-2 py-1 rounded-md shrink-0">
                            {comm.over} ov
                          </span>

                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0 ${comm.badgeColor}`}>
                            {comm.ballType}
                          </span>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                              {comm.text}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                              Score: {comm.score}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* SUB-VIEW 3: MATCH STATS & ANALYTICS */}
              {/* -------------------------------------------------------- */}
              {detailTab === 'stats' && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-6">
                  
                  <h4 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span>Match Statistics & Head-to-Head Comparison</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      Live Analytics
                    </span>
                  </h4>

                  {/* Run Rates & Target Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span>Run Rate (CRR)</span>
                      </div>
                      <div className="text-2xl font-black text-slate-900 mt-2">
                        {detailedAnalytics.team1.innings?.crr || '—'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {detailedAnalytics.team1.name} scoring pace
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <Target className="w-4 h-4 text-rose-600" />
                        <span>Boundary Count</span>
                      </div>
                      <div className="text-2xl font-black text-slate-900 mt-2">
                        {detailedAnalytics.team1.fours + detailedAnalytics.team2.fours} Fours • {detailedAnalytics.team1.sixes + detailedAnalytics.team2.sixes} Sixes
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Match total boundaries hit
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <Trophy className="w-4 h-4 text-blue-600" />
                        <span>Match Format</span>
                      </div>
                      <div className="text-2xl font-black text-slate-900 mt-2">
                        {detailedAnalytics.format}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {selectedMatch.series || 'Tournament Series'}
                      </div>
                    </div>
                  </div>

                  {/* Team Comparison Card */}
                  <div className="rounded-2xl border border-slate-200/90 p-5 space-y-4 bg-white">
                    <h5 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      Boundaries & Scoring Distribution
                    </h5>

                    {/* Team 1 vs Team 2 Boundaries */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                          <span>{detailedAnalytics.team1.name}</span>
                          <span>{detailedAnalytics.team1.fours} Fours | {detailedAnalytics.team1.sixes} Sixes ({detailedAnalytics.team1.boundaryRuns} runs)</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(15, (detailedAnalytics.team1.boundaryRuns / (detailedAnalytics.team1.boundaryRuns + detailedAnalytics.team2.boundaryRuns || 1)) * 100))}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                          <span>{detailedAnalytics.team2.name}</span>
                          <span>{detailedAnalytics.team2.fours} Fours | {detailedAnalytics.team2.sixes} Sixes ({detailedAnalytics.team2.boundaryRuns} runs)</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(15, (detailedAnalytics.team2.boundaryRuns / (detailedAnalytics.team1.boundaryRuns + detailedAnalytics.team2.boundaryRuns || 1)) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* SUB-VIEW 4: MATCH INFO & VENUE */}
              {/* -------------------------------------------------------- */}
              {detailTab === 'info' && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-5">
                  <h4 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-100">
                    Match Details & Fixture Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase">Series / Tournament</div>
                      <div className="text-base font-bold text-slate-900">{selectedMatch.series || 'Cricket Series'}</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase">Match Format</div>
                      <div className="text-base font-bold text-slate-900">{detailedAnalytics.format} Match</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase">Date & Scheduled Time</div>
                      <div className="text-base font-bold text-slate-900">{matchTiming.date} at {matchTiming.time || 'TBA'}</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase">Match Status</div>
                      <div className="text-base font-bold text-emerald-700">{selectedMatch.status || 'Scheduled'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* SUB-VIEW 5: ALL MATCHES DIRECTORY */}
              {/* -------------------------------------------------------- */}
              {detailTab === 'directory' && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5 sm:p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        {matchFilter === 'live' ? 'Currently Live Matches' : matchFilter === 'recent' ? 'Recent Results' : 'Upcoming Fixtures'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Click any fixture below to load its full scorecard and commentary above.
                      </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="match-search-input"
                        type="text"
                        placeholder="Search team or series..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentTabMatches.map((m) => {
                      const teamA = parseTeam(m.t1, 1);
                      const teamB = parseTeam(m.t2, 2);
                      const isSelected = selectedMatch?.id === m.id;

                      return (
                        <div
                          key={m.id}
                          onClick={() => {
                            setSelectedMatch(m);
                            setDetailTab('scorecard');
                            window.scrollTo({ top: 120, behavior: 'smooth' });
                          }}
                          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
                            isSelected
                              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            {/* Card Header */}
                            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                              <span className="font-semibold text-slate-500 truncate max-w-[180px]" title={m.series}>
                                {m.series || 'Cricket Series'}
                              </span>
                              <FormatBadge type={m.matchType} />
                            </div>

                            {/* Teams & Scores */}
                            <div className="py-3 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <TeamLogo src={m.t1img} name={teamA.name} code={teamA.code} size="sm" />
                                  <span className="text-xs font-extrabold text-slate-900 truncate">{teamA.name}</span>
                                </div>
                                <span className="text-xs font-mono font-black text-slate-900 shrink-0">
                                  {m.t1s || '—'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <TeamLogo src={m.t2img} name={teamB.name} code={teamB.code} size="sm" />
                                  <span className="text-xs font-extrabold text-slate-900 truncate">{teamB.name}</span>
                                </div>
                                <span className="text-xs font-mono font-black text-slate-900 shrink-0">
                                  {m.t2s || '—'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Footer Status */}
                          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="truncate text-slate-500 font-medium max-w-[200px]" title={m.status}>
                              {m.status || 'Match scheduled'}
                            </span>
                            <span className="font-extrabold text-emerald-600 hover:text-emerald-700">
                              {isSelected ? 'Viewing' : 'Inspect Scorecard'} →
                            </span>
                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* ============================================================== */}
      {/* 6. CDMS LEAGUE TOURNAMENT MATCH (Platform Track 2 Scoring) */}
      {/* ============================================================== */}
      {activeView === 'cdms-league' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 -mt-4">
          
          {/* CDMS League Control Ribbon */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                🏏
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  CDMS Local Tournament Match Scorecard
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time ball-by-ball stream powered by FastAPI WebSocket & Supabase
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                cdmsConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                <span className={`w-2 h-2 rounded-full ${cdmsConnected ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`} />
                {cdmsConnected ? 'WebSocket Live' : 'Connecting WS...'}
              </span>

              <Link
                to={`/scorer/console/${cdmsMatchId}`}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs transition-colors inline-flex items-center gap-1.5"
              >
                <span>Open Scorer Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* CDMS Scorecard Overview */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              
              {/* Team 1 */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center text-lg shadow-sm">
                  {cdmsScorecard?.team1?.team_name?.slice(0, 3).toUpperCase() || cdmsMetadata?.team1?.team_name?.slice(0, 3).toUpperCase() || 'RNG'}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {cdmsScorecard?.team1?.team_name || cdmsMetadata?.team1?.team_name || 'Rangers Cricket Club'}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-slate-900 font-mono">
                      {cdmsScorecard?.total_runs || 142}/{cdmsScorecard?.wickets || 4}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                      ({cdmsScorecard?.overs_played || '17.2'} ov)
                    </span>
                  </div>
                </div>
              </div>

              {/* VS */}
              <div className="hidden sm:flex items-center justify-center">
                <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 font-extrabold text-xs">VS</span>
              </div>

              {/* Team 2 */}
              <div className="flex items-center sm:flex-row-reverse gap-4 sm:text-right">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 text-white font-black flex items-center justify-center text-lg shadow-sm">
                  {cdmsScorecard?.team2?.team_name?.slice(0, 3).toUpperCase() || cdmsMetadata?.team2?.team_name?.slice(0, 3).toUpperCase() || 'STR'}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {cdmsScorecard?.team2?.team_name || cdmsMetadata?.team2?.team_name || 'Strikers XI'}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    Target: {cdmsScorecard?.target || '168 runs'}
                  </p>
                </div>
              </div>

            </div>

            {/* Crease & Bowler Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Batters on Crease</div>
                <div className="space-y-1.5 text-xs sm:text-sm font-semibold">
                  <div className="flex justify-between text-slate-900">
                    <span>{cdmsScorecard?.striker?.name || 'A. Sharma'} *</span>
                    <span className="font-mono">{cdmsScorecard?.striker?.runs || 46} ({cdmsScorecard?.striker?.balls || 31})</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{cdmsScorecard?.non_striker?.name || 'R. Patel'}</span>
                    <span className="font-mono">{cdmsScorecard?.non_striker?.runs || 18} ({cdmsScorecard?.non_striker?.balls || 14})</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Bowler</div>
                <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-900">
                  <span>{cdmsScorecard?.current_bowler?.name || 'M. Khan'}</span>
                  <span className="font-mono">
                    {cdmsScorecard?.current_bowler?.wickets || 2}/{cdmsScorecard?.current_bowler?.runs || 28} ({cdmsScorecard?.current_bowler?.overs || '3.2'} ov)
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* 7. FEATURE 6: SHARE MATCH MODAL */}
      {/* ============================================================== */}
      {showShareModal && selectedMatch && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-base font-extrabold text-slate-900">Share Match Scorecard</h4>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Scorecard Preview Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 font-mono text-xs text-slate-700 whitespace-pre-line leading-relaxed">
              {shareText}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={copyToClipboard}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedNotification ? 'Copied!' : 'Copy Summary'}</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 text-center"
              >
                <Send className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* Floating Copied Toast */}
      {copiedNotification && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-bold z-50 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Match scorecard copied to clipboard!</span>
        </div>
      )}

    </div>
  );
};

export default LiveScores;
