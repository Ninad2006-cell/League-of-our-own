import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Activity, 
  RefreshCw, 
  AlertCircle,
  Database,
  Radio,
  Search,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import api from '../lib/api';
import useLiveMatch from '../lib/useLiveMatch';
import sampleCricketData from '../data/sample_cricket_data.json';

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

  // Reset error when src changes
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

  // Mode: 'live' (5m cache safeguard) vs 'sample' (0 external hits)
  const [dataMode, setDataMode] = useState('live');
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Active filter tab in Real-World Match Center
  const [matchFilter, setMatchFilter] = useState('live'); // 'live' | 'recent' | 'upcoming'
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Primary view selector: 'real-world' vs 'cdms-league'
  const [activeView, setActiveView] = useState(routeMatchId ? 'cdms-league' : 'real-world');

  // Horizontal scroll container ref for Real-World Match Center
  const scrollContainerRef = useRef(null);

  // 1. Fetch Real-World Cricket Data from backend /api/live-scores (with local JSON fallback)
  const fetchLiveScores = async (mode = dataMode, forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setFetchError(null);

    try {
      const data = await api.liveScores.get(mode, forceRefresh);
      setApiResponse(data);

      // Auto-select first match if none selected or current not in list
      const candidateList = data[matchFilter] || data.live || data.data || [];
      if (!selectedMatch && candidateList.length > 0) {
        setSelectedMatch(candidateList[0]);
      }
    } catch (err) {
      console.warn('Backend API unavailable, serving bundled sample data:', err.message);
      // Seamless offline fallback to sample_cricket_data.json
      const sampleMatches = sampleCricketData.data || [];
      const categorized = categorizeLocalMatches(sampleMatches);
      const fallbackResp = {
        status: 'success',
        source: 'fallback',
        mode: mode,
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
    fetchLiveScores(dataMode, false);
  }, [dataMode]);

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

  // Helper for Hero Scorecard Team details
  const t1 = useMemo(() => parseTeam(selectedMatch?.t1, 1), [selectedMatch?.t1]);
  const t2 = useMemo(() => parseTeam(selectedMatch?.t2, 2), [selectedMatch?.t2]);
  const matchTiming = useMemo(() => formatMatchDateTime(selectedMatch?.dateTimeGMT), [selectedMatch?.dateTimeGMT]);

  return (
    <div className="min-h-screen bg-[#eef2f6] pb-20 font-sans text-slate-800">
      
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
                Real-World Cricket Live Scores
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
                Up-to-date fixtures, team logos, and live scores across Ranji Trophy, WBBL, ICC & International cricket.
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

          {/* Quota Safeguard & API Status Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Left: Source, Cache Age & Quota Badge */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold border ${
                apiResponse?.source === 'live' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : apiResponse?.source === 'cache'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : apiResponse?.source === 'sample'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {apiResponse?.source === 'live' && <Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
                {apiResponse?.source === 'cache' && <Clock className="w-3.5 h-3.5 text-blue-600" />}
                {apiResponse?.source === 'sample' && <Database className="w-3.5 h-3.5 text-purple-600" />}
                {apiResponse?.source === 'fallback' && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                <span>
                  {apiResponse?.source === 'cache' && `Cached ${apiResponse?.cache_age_seconds || 0}s ago (0 API hits used)`}
                  {apiResponse?.source === 'live' && 'Fresh from CricketData.org (1 API hit used)'}
                  {apiResponse?.source === 'sample' && 'Sample Mode Active (0 API hits used)'}
                  {apiResponse?.source === 'fallback' && 'Offline Fallback Snapshot (0 hits used)'}
                  {!apiResponse?.source && 'Checking API cache status...'}
                </span>
              </span>

              <span className="hidden sm:inline-flex items-center gap-1 text-slate-500 text-[11px] font-medium bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                100 Hits/Day Quota Safeguarded
              </span>
            </div>

            {/* Right: Mode Toggle & Refresh Button */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              
              {/* Mode Toggle: Live API vs Sample */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-bold">
                <button
                  id="mode-live-btn"
                  onClick={() => setDataMode('live')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    dataMode === 'live'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Uses live CricketData API with 5-minute memory cache"
                >
                  Live API Active
                </button>
                <button
                  id="mode-sample-btn"
                  onClick={() => setDataMode('sample')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    dataMode === 'sample'
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Loads local saved snapshot (consumes 0 API hits)"
                >
                  Sample Mode (0 hits)
                </button>
              </div>

              {/* Force Refresh Button (Consumes 1 Hit) */}
              <button
                id="update-score-btn"
                onClick={() => fetchLiveScores('live', true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                title="Bypass 5-minute cache and fetch latest scores (consumes 1 API hit)"
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
          {/* 4. DYNAMIC HERO SCORECARD */}
          {/* ============================================================== */}
          {selectedMatch && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden">
              
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

                {/* Match Status Summary Ribbon */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          {/* 5. MATCH DIRECTORY / SEARCHABLE GRID */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 space-y-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {matchFilter === 'live' ? 'Currently Live Matches' : matchFilter === 'recent' ? 'Recent Results' : 'Upcoming Fixtures'}
                </h3>
                <p className="text-xs text-slate-500">
                  Click any fixture below to load its full scorecard into the Hero card above.
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
                        {isSelected ? 'Viewing' : 'Inspect'} →
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

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

    </div>
  );
};

export default LiveScores;
