import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../lib/api';
import {
  Trophy,
  Users,
  User,
  Calendar,
  MapPin,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Play,
  Flag,
  Radio,
  ArrowRight,
  TrendingUp,
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import { TeamLogo } from '../components/TeamLogos';

import batsmanStadiumImg from '../assets/images/batsman-stadium.jpg';
import stadiumTrophyImg from '../assets/images/stadium-trophy.png';
import stadiumBallSunsetImg from '../assets/images/stadium-ball-sunset.png';
import stadiumBallDayImg from '../assets/images/stadium-ball-day.png';

// Initial Mock Data
const INITIAL_TOURNAMENTS = [
  {
    id: 1,
    name: 'City Champions League',
    level: 'Local',
    format: 'T20',
    startDate: 'Aug 10, 2025',
    endDate: 'Aug 25, 2025',
    status: 'Ongoing',
    teamsCount: 8,
    overs: 20
  },
  {
    id: 2,
    name: 'National T20 Cup',
    level: 'Domestic',
    format: 'T20',
    startDate: 'Sep 01, 2025',
    endDate: 'Sep 20, 2025',
    status: 'Upcoming',
    teamsCount: 12,
    overs: 20
  },
  {
    id: 3,
    name: 'Premier League',
    level: 'Domestic',
    format: 'ODI',
    startDate: 'Oct 05, 2025',
    endDate: 'Oct 30, 2025',
    status: 'Upcoming',
    teamsCount: 10,
    overs: 50
  },
  {
    id: 4,
    name: 'International Series',
    level: 'International',
    format: 'Test',
    startDate: 'Nov 12, 2025',
    endDate: 'Dec 05, 2025',
    status: 'Upcoming',
    teamsCount: 2,
    overs: 90
  }
];

const INITIAL_TEAMS = [
  {
    id: 'rangers',
    name: 'Rangers',
    city: 'Mumbai',
    playersCount: 18,
    coach: 'Amit Sharma',
    homeVenue: 'Greenfield Stadium, Mumbai',
    players: [
      { id: 101, name: 'Rohit Sharma', role: 'Batsman', batStyle: 'Right-hand bat', bowlStyle: 'Right-arm offbreak', jersey: 45 },
      { id: 102, name: 'Virat Kohli', role: 'Batsman', batStyle: 'Right-hand bat', bowlStyle: 'Right-arm medium', jersey: 18 },
      { id: 103, name: 'Jasprit Bumrah', role: 'Bowler', batStyle: 'Right-hand bat', bowlStyle: 'Right-arm fast', jersey: 93 },
      { id: 104, name: 'Hardik Pandya', role: 'All-Rounder', batStyle: 'Right-hand bat', bowlStyle: 'Right-arm fast-medium', jersey: 33 },
      { id: 105, name: 'KL Rahul', role: 'Wicket Keeper', batStyle: 'Right-hand bat', bowlStyle: 'None', jersey: 1 },
      { id: 106, name: 'Ravindra Jadeja', role: 'All-Rounder', batStyle: 'Left-hand bat', bowlStyle: 'Slow left-arm orthodox', jersey: 8 },
    ]
  },
  {
    id: 'strikers',
    name: 'Strikers',
    city: 'Delhi',
    playersCount: 16,
    coach: 'Rohit Mehta',
    homeVenue: 'Feroz Shah Kotla, Delhi',
    players: [
      { id: 201, name: 'Arjun Kumar', role: 'Bowler', batStyle: 'Right-hand bat', bowlStyle: 'Right-arm fast', jersey: 24 },
      { id: 202, name: 'Sameer Khan', role: 'Bowler', batStyle: 'Left-hand bat', bowlStyle: 'Left-arm fast', jersey: 19 },
      { id: 203, name: 'Dev Malhotra', role: 'All-Rounder', batStyle: 'Right-hand bat', bowlStyle: 'Right-arm medium', jersey: 77 },
      { id: 204, name: 'Suresh Raina', role: 'Batsman', batStyle: 'Left-hand bat', bowlStyle: 'Right-arm offbreak', jersey: 3 },
      { id: 205, name: 'Rishabh Pant', role: 'Wicket Keeper', batStyle: 'Left-hand bat', bowlStyle: 'None', jersey: 17 },
    ]
  },
  {
    id: 'warriors',
    name: 'Warriors',
    city: 'Bengaluru',
    playersCount: 17,
    coach: 'Karthik Iyer',
    homeVenue: 'M. Chinnaswamy Stadium, Bengaluru',
    players: [
      { id: 301, name: 'Shubman Gill', role: 'Batsman', batStyle: 'Right-hand bat', bowlStyle: 'Right-arm offbreak', jersey: 7 },
      { id: 302, name: 'Mohammed Siraj', role: 'Bowler', batStyle: 'Right-hand bat', bowlStyle: 'Right-arm fast', jersey: 13 },
      { id: 303, name: 'Shreyas Iyer', role: 'Batsman', batStyle: 'Right-hand bat', bowlStyle: 'Right-arm legbreak', jersey: 41 },
      { id: 304, name: 'Axar Patel', role: 'All-Rounder', batStyle: 'Left-hand bat', bowlStyle: 'Slow left-arm orthodox', jersey: 20 },
    ]
  },
  {
    id: 'kings',
    name: 'Kings',
    city: 'Kolkata',
    playersCount: 19,
    coach: 'Vikram Singh',
    homeVenue: 'Eden Gardens, Kolkata',
    players: [
      { id: 401, name: 'Rinku Singh', role: 'Batsman', batStyle: 'Left-hand bat', bowlStyle: 'Right-arm offbreak', jersey: 35 },
      { id: 402, name: 'Varun Chakravarthy', role: 'Bowler', batStyle: 'Right-hand bat', bowlStyle: 'Right-arm legbreak mystery', jersey: 29 },
      { id: 403, name: 'Andre Russell', role: 'All-Rounder', batStyle: 'Right-hand bat', bowlStyle: 'Right-arm fast', jersey: 12 },
      { id: 404, name: 'Sunil Narine', role: 'All-Rounder', batStyle: 'Left-hand bat', bowlStyle: 'Right-arm offbreak', jersey: 74 },
    ]
  }
];

const INITIAL_MATCHES = [
  {
    id: 1,
    team1: 'Rangers',
    team2: 'Strikers',
    date: 'Aug 12, 2025',
    time: '02:00 PM',
    venue: 'Greenfield Stadium, Mumbai',
    format: 'T20',
    overs: 20,
    scorer: 'Rohit Kumar',
    status: 'Scheduled',
    tournament: 'City Champions League'
  },
  {
    id: 2,
    team1: 'Warriors',
    team2: 'Kings',
    date: 'Aug 14, 2025',
    time: '07:00 PM',
    venue: 'Eden Gardens, Kolkata',
    format: 'T20',
    overs: 20,
    scorer: 'Rahul Sharma',
    status: 'Scheduled',
    tournament: 'City Champions League'
  },
  {
    id: 3,
    team1: 'Titans',
    team2: 'Blazers',
    date: 'Aug 16, 2025',
    time: '03:30 PM',
    venue: 'Wankhede Stadium, Mumbai',
    format: 'ODI',
    overs: 50,
    scorer: 'Anita Desai',
    status: 'Scheduled',
    tournament: 'Premier League'
  }
];

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [tournaments, setTournaments] = useState(INITIAL_TOURNAMENTS);
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [matches, setMatches] = useState(INITIAL_MATCHES);
  const [playersList, setPlayersList] = useState([]);
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerRoleFilter, setPlayerRoleFilter] = useState('All');
  const [pointsTournamentId, setPointsTournamentId] = useState('');
  const [pointsStandings, setPointsStandings] = useState([]);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [matchStatusFilter, setMatchStatusFilter] = useState('All');
  const [matchSearchQuery, setMatchSearchQuery] = useState('');

  // Sync with live backend data
  useEffect(() => {
    let isMounted = true;
    async function loadBackendData() {
      try {
        const [tData, tmData, mData, pData] = await Promise.all([
          api.tournaments.getAll().catch(() => null),
          api.teams.getAll().catch(() => null),
          api.matches.getAll().catch(() => null),
          api.players.getAll().catch(() => null)
        ]);
        if (!isMounted) return;
        if (tData && tData.length > 0) {
          setTournaments(tData.map((t) => ({
            id: t.tournament_id,
            name: t.name,
            level: t.level || 'Local',
            format: t.format || 'T20',
            startDate: t.start_date,
            endDate: t.end_date,
            status: t.status || 'Upcoming',
            teamsCount: t.teams_count || 0,
            matchesCount: t.matches_count || 0,
            overs: 20
          })));
          const preferred = tData.find(t => (t.matches_count || 0) > 0 || (t.teams_count || 0) > 0) || tData[0];
          setPointsTournamentId(preferred.tournament_id);
        }
        if (tmData && tmData.length > 0) {
          setTeams(tmData.map((tm) => ({
            id: tm.team_id,
            name: tm.team_name,
            city: tm.city,
            coach: tm.coach_name || 'TBD',
            playersCount: tm.squad_count || 0,
            homeVenue: `${tm.city} Stadium`
          })));
        }
        if (pData && pData.length > 0) {
          setPlayersList(pData);
        }
        if (mData && mData.length > 0) {
          setMatches(mData.map((m) => ({
            id: m.match_id,
            team1: m.team1?.team_name || 'Team 1',
            team2: m.team2?.team_name || 'Team 2',
            team1_score: m.team1_score,
            team2_score: m.team2_score,
            result_summary: m.result_summary,
            date: m.match_date ? new Date(m.match_date).toLocaleDateString() : 'Upcoming',
            time: '03:30 PM',
            venue: m.venue?.venue_name || 'Greenfield Stadium',
            format: 'T20',
            overs: m.overs || 20,
            status: m.status?.toUpperCase() || 'SCHEDULED',
            tournament: m.tournament?.name || 'League',
            tournament_id: m.tournament_id
          })));
        }
      } catch (err) {
        console.warn('Admin live sync notice:', err);
      }
    }
    loadBackendData();
    return () => { isMounted = false; };
  }, []);

  // Fetch standings whenever pointsTournamentId changes or activeTab is points
  useEffect(() => {
    if (!pointsTournamentId) return;
    let isMounted = true;
    async function loadStandings() {
      try {
        setPointsLoading(true);
        const data = await api.tournaments.getStandings(pointsTournamentId);
        if (!isMounted) return;
        setPointsStandings(data || []);
      } catch (err) {
        if (!isMounted) return;
        console.warn('Points standings fetch notice:', err);
      } finally {
        if (isMounted) setPointsLoading(false);
      }
    }
    loadStandings();
    return () => { isMounted = false; };
  }, [pointsTournamentId, activeTab]);

  // Filters & Search
  const [tournamentFilter, setTournamentFilter] = useState('All');
  const [tournamentSearch, setTournamentSearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');

  // Modals state
  const [createTournamentModal, setCreateTournamentModal] = useState(false);
  const [addTeamModal, setAddTeamModal] = useState(false);
  const [addPlayerModal, setAddPlayerModal] = useState(false);
  const [scheduleMatchModal, setScheduleMatchModal] = useState(false);
  const [selectedTeamSquad, setSelectedTeamSquad] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form states
  const [newTournament, setNewTournament] = useState({
    name: '',
    level: 'Local',
    format: 'T20',
    startDate: '',
    endDate: '',
    overs: 20,
    status: 'Upcoming'
  });

  const [newTeam, setNewTeam] = useState({
    name: '',
    city: '',
    coach: '',
    homeVenue: ''
  });

  const [newPlayer, setNewPlayer] = useState({
    teamId: 'rangers',
    name: '',
    role: 'Batsman',
    batStyle: 'Right-hand bat',
    bowlStyle: 'Right-arm medium',
    jersey: ''
  });

  const [newMatch, setNewMatch] = useState({
    team1: 'Rangers',
    team2: 'Strikers',
    date: '',
    time: '07:00 PM',
    venue: 'Greenfield Stadium, Mumbai',
    format: 'T20',
    overs: 20,
    scorer: 'Rohit Kumar',
    tournament: 'City Champions League'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  // Submit Handlers
  const handleCreateTournament = async (e) => {
    e.preventDefault();
    if (!newTournament.name.trim()) return;

    try {
      const created = await api.admin.createTournament({
        name: newTournament.name,
        level: (newTournament.level || 'local').toLowerCase(),
        format: newTournament.format || 'T20',
        start_date: newTournament.startDate || new Date().toISOString().split('T')[0],
        end_date: newTournament.endDate || new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      });
      setTournaments([
        {
          id: created.tournament_id,
          name: created.name,
          level: created.level,
          format: created.format,
          startDate: created.start_date,
          endDate: created.end_date,
          status: 'Upcoming',
          teamsCount: 0,
          overs: 20
        },
        ...tournaments
      ]);
    } catch (_) {
      const fallback = {
        id: Date.now(),
        ...newTournament,
        teamsCount: 8,
        status: 'Upcoming'
      };
      setTournaments([fallback, ...tournaments]);
    }
    setCreateTournamentModal(false);
    showToast(`Tournament "${newTournament.name}" registered successfully!`);
    setNewTournament({
      name: '',
      level: 'Local',
      format: 'T20',
      startDate: '',
      endDate: '',
      overs: 20,
      status: 'Upcoming'
    });
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    if (!newTeam.name.trim()) return;

    try {
      const created = await api.admin.createTeam({
        team_name: newTeam.name,
        city: newTeam.city || 'Mumbai',
        coach_name: newTeam.coach || 'Unassigned'
      });
      setTeams([
        ...teams,
        {
          id: created.team_id,
          name: created.team_name,
          city: created.city,
          coach: created.coach_name || 'Unassigned',
          playersCount: 0,
          homeVenue: `${created.city} Stadium`,
          players: []
        }
      ]);
    } catch (_) {
      const fallback = {
        id: newTeam.name.toLowerCase().replace(/\s+/g, '-'),
        name: newTeam.name,
        city: newTeam.city || 'Mumbai',
        playersCount: 0,
        coach: newTeam.coach || 'Unassigned',
        homeVenue: newTeam.homeVenue || 'Greenfield Stadium',
        players: []
      };
      setTeams([...teams, fallback]);
    }
    setAddTeamModal(false);
    showToast(`Team "${newTeam.name}" registered successfully!`);
    setNewTeam({ name: '', city: '', coach: '', homeVenue: '' });
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayer.name.trim()) return;

    try {
      await api.admin.createPlayer({
        name: newPlayer.name,
        team_id: newPlayer.teamId && newPlayer.teamId.length > 20 ? newPlayer.teamId : null,
        role: newPlayer.role,
        batting_style: newPlayer.batStyle,
        bowling_style: newPlayer.bowlStyle
      });
    } catch (_) {}

    const playerObj = {
      id: Date.now(),
      name: newPlayer.name,
      role: newPlayer.role,
      batStyle: newPlayer.batStyle,
      bowlStyle: newPlayer.bowlStyle,
      jersey: newPlayer.jersey || Math.floor(Math.random() * 99) + 1
    };

    setTeams(
      teams.map((t) => {
        if (t.id === newPlayer.teamId) {
          const updatedPlayers = [...(t.players || []), playerObj];
          return {
            ...t,
            playersCount: updatedPlayers.length,
            players: updatedPlayers
          };
        }
        return t;
      })
    );

    setAddPlayerModal(false);
    showToast(`Player "${newPlayer.name}" registered successfully!`);
    setNewPlayer({
      teamId: 'rangers',
      name: '',
      role: 'Batsman',
      batStyle: 'Right-hand bat',
      bowlStyle: 'Right-arm medium',
      jersey: ''
    });
  };

  const handleScheduleMatch = async (e) => {
    e.preventDefault();
    if (newMatch.team1 === newMatch.team2) {
      alert('Competing teams must be distinct!');
      return;
    }

    try {
      const t1Obj = teams.find(t => t.name === newMatch.team1 || t.id === newMatch.team1);
      const t2Obj = teams.find(t => t.name === newMatch.team2 || t.id === newMatch.team2);
      const tournObj = tournaments.find(t => t.name === newMatch.tournament || t.id === newMatch.tournament);

      if (t1Obj && t2Obj && tournObj) {
        await api.admin.createMatch({
          tournament_id: tournObj.id,
          team1_id: t1Obj.id,
          team2_id: t2Obj.id,
          match_date: newMatch.date ? new Date(newMatch.date).toISOString() : new Date().toISOString(),
          overs: Number(newMatch.overs) || 20,
          status: 'scheduled'
        });
      }
    } catch (_) {}

    const scheduled = {
      id: Date.now(),
      ...newMatch,
      status: 'Scheduled'
    };
    setMatches([scheduled, ...matches]);
    setScheduleMatchModal(false);
    showToast(`Match fixture scheduled between ${scheduled.team1} and ${scheduled.team2}!`);
  };

  // Filtered Tournaments
  const filteredTournaments = tournaments.filter((t) => {
    const matchesFilter = tournamentFilter === 'All' || t.status.toLowerCase() === tournamentFilter.toLowerCase();
    const matchesSearch = t.name.toLowerCase().includes(tournamentSearch.toLowerCase()) ||
      t.level.toLowerCase().includes(tournamentSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Filtered Teams
  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
    team.city.toLowerCase().includes(teamSearch.toLowerCase()) ||
    team.coach.toLowerCase().includes(teamSearch.toLowerCase())
  );

  // Filtered Players
  const filteredPlayers = playersList.filter((player) => {
    const matchesSearch =
      !playerSearch ||
      player.name?.toLowerCase().includes(playerSearch.toLowerCase()) ||
      player.team_name?.toLowerCase().includes(playerSearch.toLowerCase());
    
    if (!matchesSearch) return false;
    if (playerRoleFilter === 'All') return true;
    
    const role = (player.role || '').toLowerCase();
    const filter = playerRoleFilter.toLowerCase();
    if (filter === 'batter') return role.includes('bat');
    if (filter === 'bowler') return role.includes('bowl');
    if (filter === 'all-rounder') return role.includes('all');
    if (filter === 'wicket-keeper') return role.includes('keeper') || role.includes('wicket');
    return role.includes(filter);
  });

  // Filtered Matches
  const filteredMatches = matches.filter((match) => {
    const matchesSearch =
      !matchSearchQuery ||
      match.team1?.toLowerCase().includes(matchSearchQuery.toLowerCase()) ||
      match.team2?.toLowerCase().includes(matchSearchQuery.toLowerCase()) ||
      match.venue?.toLowerCase().includes(matchSearchQuery.toLowerCase()) ||
      match.tournament?.toLowerCase().includes(matchSearchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (matchStatusFilter === 'All') return true;
    return (match.status || '').toUpperCase() === matchStatusFilter.toUpperCase();
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Reusable Sidebar with sidebar-bg.png */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0">
        <TopHeader
          variant="admin"
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          searchPlaceholder="Search tournaments, teams, players..."
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW / DASHBOARD (Reference Image 6) */}
          {/* ========================================================================= */}
          {(activeTab === 'overview' || activeTab === 'dashboard') && (
            <div className="space-y-6">
              {/* Full Expanded Hero Banner with batsman-stadium.jpg & embedded Metric Cards */}
              <div
                className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between"
                style={{
                  backgroundImage: `linear-gradient(90deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.85) 20%, rgba(255, 255, 255, 0.35) 45%, rgba(255, 255, 255, 0) 70%), url(${batsmanStadiumImg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'right center',
                  minHeight: '320px'
                }}
              >
                {/* Header text on left with soft glow backing */}
                <div className="relative z-10 max-w-lg mb-8">
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight drop-shadow-sm">
                    Dashboard
                  </h1>
                  <p className="text-slate-700 text-sm sm:text-base mt-1 font-semibold">
                    Welcome back, Admin!
                  </p>
                </div>

                {/* 4 Metric Cards Embedded on Banner (Image 6) */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div
                    onClick={() => handleTabChange('tournaments')}
                    className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center p-2.5">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Tournaments</div>
                      <div className="text-3xl font-black text-slate-900">{tournaments.length}</div>
                      <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Active Tournaments
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleTabChange('teams')}
                    className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center p-2.5">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Teams</div>
                      <div className="text-3xl font-black text-slate-900">{teams.length}</div>
                      <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-500" /> Registered Teams
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleTabChange('teams')}
                    className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer hover:border-purple-300 hover:shadow-md transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center p-2.5">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Players</div>
                      <div className="text-3xl font-black text-slate-900">
                        {teams.reduce((acc, t) => acc + (t.playersCount || 0), 0)}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <User className="w-3 h-3 text-purple-500" /> Registered Players
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleTabChange('matches')}
                    className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer hover:border-rose-300 hover:shadow-md transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center p-2.5">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Matches</div>
                      <div className="text-3xl font-black text-slate-900">28</div>
                      <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-rose-500" /> Scheduled Matches
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two Column Grid: Upcoming Matches & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Matches */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Upcoming Matches</h2>
                    <button
                      onClick={() => handleTabChange('matches')}
                      className="text-xs font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-1"
                    >
                      View All <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {matches.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800">
                            <span className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                              {m.date.split(' ')[0] || 'AUG'}
                            </span>
                            <span className="block text-base font-black leading-tight">
                              {m.date.split(' ')[1]?.replace(',', '') || '12'}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-slate-900">{m.team1}</span>
                              <span className="text-xs font-semibold text-slate-400">vs</span>
                              <span className="font-extrabold text-sm text-slate-900">{m.team2}</span>
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {m.venue}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="block text-xs font-bold text-slate-700">{m.time}</span>
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {m.format}
                            </span>
                          </div>
                          <Link
                            to="/scorer/console/1"
                            className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Open Scoring Console"
                          >
                            <Radio className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
                    <span className="text-xs font-bold text-slate-500">Live Feed</span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-start gap-3.5 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">New player Virat Sharma registered</p>
                        <p className="text-slate-500 text-[11px]">Rangers squad updated (Batsman)</p>
                        <span className="text-[10px] text-slate-400">2 hours ago</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">Match schedule updated</p>
                        <p className="text-slate-500 text-[11px]">Rangers vs Strikers assigned to Rohit Kumar</p>
                        <span className="text-[10px] text-slate-400">3 hours ago</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">Team Strikers squad verified</p>
                        <p className="text-slate-500 text-[11px]">Coach Rohit Mehta confirmed roster</p>
                        <span className="text-[10px] text-slate-400">5 hours ago</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">Venue Greenfield Stadium added</p>
                        <p className="text-slate-500 text-[11px]">Capacity 45,000 • Floodlit pitch</p>
                        <span className="text-[10px] text-slate-400">1 day ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Points Table Preview & Matches Overview Donut */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Points Table */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Points Table</h2>
                      <p className="text-xs text-slate-500">City Champions League • Group Stage</p>
                    </div>
                    <button
                      onClick={() => handleTabChange('tournaments')}
                      className="text-xs font-bold text-emerald-600 hover:underline"
                    >
                      View Full Table →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-3 rounded-l-xl">#</th>
                          <th className="p-3">Team</th>
                          <th className="p-3 text-center">Played</th>
                          <th className="p-3 text-center">Won</th>
                          <th className="p-3 text-center">Lost</th>
                          <th className="p-3 text-center">Points</th>
                          <th className="p-3 rounded-r-xl text-right">NRR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50/70">
                          <td className="p-3 font-bold"><span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">1</span></td>
                          <td className="p-3 font-extrabold text-slate-900 flex items-center gap-2"><TeamLogo name="Rangers" className="w-6 h-6" /> Rangers</td>
                          <td className="p-3 text-center font-medium">5</td>
                          <td className="p-3 text-center font-bold text-emerald-600">4</td>
                          <td className="p-3 text-center font-medium text-slate-500">1</td>
                          <td className="p-3 text-center font-black text-slate-900">8</td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-600">+1.238</td>
                        </tr>
                        <tr className="hover:bg-slate-50/70">
                          <td className="p-3 font-bold"><span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">2</span></td>
                          <td className="p-3 font-extrabold text-slate-900 flex items-center gap-2"><TeamLogo name="Strikers" className="w-6 h-6" /> Strikers</td>
                          <td className="p-3 text-center font-medium">5</td>
                          <td className="p-3 text-center font-bold text-emerald-600">3</td>
                          <td className="p-3 text-center font-medium text-slate-500">2</td>
                          <td className="p-3 text-center font-black text-slate-900">6</td>
                          <td className="p-3 text-right font-mono font-bold text-blue-600">+0.754</td>
                        </tr>
                        <tr className="hover:bg-slate-50/70">
                          <td className="p-3 font-bold"><span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">3</span></td>
                          <td className="p-3 font-extrabold text-slate-900 flex items-center gap-2"><TeamLogo name="Warriors" className="w-6 h-6" /> Warriors</td>
                          <td className="p-3 text-center font-medium">5</td>
                          <td className="p-3 text-center font-bold text-emerald-600">3</td>
                          <td className="p-3 text-center font-medium text-slate-500">2</td>
                          <td className="p-3 text-center font-black text-slate-900">6</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-500">-0.126</td>
                        </tr>
                        <tr className="hover:bg-slate-50/70">
                          <td className="p-3 font-bold"><span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">4</span></td>
                          <td className="p-3 font-extrabold text-slate-900 flex items-center gap-2"><TeamLogo name="Kings" className="w-6 h-6" /> Kings</td>
                          <td className="p-3 text-center font-medium">5</td>
                          <td className="p-3 text-center font-bold text-emerald-600">2</td>
                          <td className="p-3 text-center font-medium text-slate-500">3</td>
                          <td className="p-3 text-center font-black text-slate-900">4</td>
                          <td className="p-3 text-right font-mono font-bold text-rose-500">-0.532</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Matches Overview Donut */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Matches Overview</h2>
                    <p className="text-xs text-slate-500">Season 2025 distribution</p>
                  </div>

                  <div className="py-6 flex flex-col items-center justify-center">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#E2E8F0" strokeWidth="12" />
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke="#10B981"
                          strokeWidth="12"
                          strokeDasharray="238.76"
                          strokeDashoffset="85"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke="#3B82F6"
                          strokeWidth="12"
                          strokeDasharray="238.76"
                          strokeDashoffset="170"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="block text-2xl font-black text-slate-900">28</span>
                        <span className="block text-[10px] font-bold uppercase text-slate-400">Matches</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed</span>
                      <span className="font-bold text-slate-900">18</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Upcoming</span>
                      <span className="font-bold text-slate-900">8</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Live</span>
                      <span className="font-bold text-slate-900">1</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Cancelled</span>
                      <span className="font-bold text-slate-900">1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: TOURNAMENTS (Reference Image 4) */}
          {/* ========================================================================= */}
          {activeTab === 'tournaments' && (
            <div className="space-y-6">
              {/* Full Expanded Hero Banner with stadium-trophy.png & embedded 4 Stat Cards */}
              <div
                className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between"
                style={{
                  backgroundImage: `linear-gradient(90deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.85) 20%, rgba(255, 255, 255, 0.35) 45%, rgba(255, 255, 255, 0) 70%), url(${stadiumTrophyImg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'right center',
                  minHeight: '320px'
                }}
              >
                {/* Header row with + Create Tournament Button (Image 4) */}
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div className="max-w-xl">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight drop-shadow-sm">
                      Tournaments
                    </h1>
                    <p className="text-slate-700 text-sm sm:text-base mt-1 font-semibold">
                      Manage cricket competitions
                    </p>
                  </div>

                  <button
                    onClick={() => setCreateTournamentModal(true)}
                    className="bg-[#00c261] hover:bg-[#00ad56] text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 flex-shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Tournament</span>
                  </button>
                </div>

                {/* 4 Stat Cards Embedded on Banner (Image 4) */}
                <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center p-2.5">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900">{tournaments.length}</div>
                      <div className="text-xs font-semibold text-slate-600">Total Tournaments</div>
                      <div className="text-[10px] text-slate-400">All competitions</div>
                    </div>
                  </div>

                  <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center p-2.5">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900">
                        {tournaments.filter((t) => t.status === 'Upcoming').length}
                      </div>
                      <div className="text-xs font-semibold text-slate-600">Upcoming</div>
                      <div className="text-[10px] text-slate-400">Scheduled to start</div>
                    </div>
                  </div>

                  <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center p-2.5">
                      <Play className="w-6 h-6 fill-emerald-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900">
                        {tournaments.filter((t) => t.status === 'Ongoing').length}
                      </div>
                      <div className="text-xs font-semibold text-slate-600">Ongoing</div>
                      <div className="text-[10px] text-slate-400">Currently in progress</div>
                    </div>
                  </div>

                  <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center p-2.5">
                      <Flag className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900">1</div>
                      <div className="text-xs font-semibold text-slate-600">Completed</div>
                      <div className="text-[10px] text-slate-400">Finished tournaments</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters & Search Bar */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Status Pills */}
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                  {['All', 'Upcoming', 'Ongoing', 'Completed'].map((filter) => {
                    const count =
                      filter === 'All'
                        ? tournaments.length
                        : filter === 'Upcoming'
                        ? tournaments.filter((t) => t.status === 'Upcoming').length
                        : filter === 'Ongoing'
                        ? tournaments.filter((t) => t.status === 'Ongoing').length
                        : 1;

                    return (
                      <button
                        key={filter}
                        onClick={() => setTournamentFilter(filter)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                          tournamentFilter === filter
                            ? 'bg-[#00c261] text-white shadow-md shadow-emerald-600/20'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {filter} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Tournaments..."
                    value={tournamentSearch}
                    onChange={(e) => setTournamentSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Tournaments Table */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-4 w-12 text-center">#</th>
                        <th className="p-4">Tournament Name</th>
                        <th className="p-4">Level</th>
                        <th className="p-4">Format</th>
                        <th className="p-4">Start Date</th>
                        <th className="p-4">End Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredTournaments.map((t, idx) => (
                        <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-4 font-extrabold text-slate-900 text-sm flex items-center gap-3">
                            <TeamLogo name={t.name} className="w-8 h-8 rounded-lg" />
                            <span>{t.name}</span>
                          </td>
                          <td className="p-4 font-semibold text-slate-600">{t.level}</td>
                          <td className="p-4">
                            <span className="font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                              {t.format}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600">{t.startDate}</td>
                          <td className="p-4 text-slate-600">{t.endDate}</td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                t.status === 'Ongoing'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : t.status === 'Upcoming'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  t.status === 'Ongoing' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
                                }`}
                              ></span>
                              {t.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                                title="Edit Tournament"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete tournament "${t.name}"?`)) {
                                    setTournaments(tournaments.filter((item) => item.id !== t.id));
                                    showToast(`Tournament removed`);
                                  }
                                }}
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Showing 1 to {filteredTournaments.length} of {filteredTournaments.length} tournaments</span>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="w-8 h-8 rounded-lg bg-[#00c261] text-white flex items-center justify-center font-bold">1</span>
                    <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: TEAMS & PLAYERS (Reference Image 5) */}
          {/* ========================================================================= */}
          {activeTab === 'teams' && (
            <div className="space-y-6">
              {/* Header Hero Banner with stadium-ball-sunset.png (Image 5) */}
              <div
                className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 p-6 sm:p-8 flex flex-col justify-center"
                style={{
                  backgroundImage: `linear-gradient(90deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.85) 20%, rgba(255, 255, 255, 0.35) 45%, rgba(255, 255, 255, 0) 70%), url(${stadiumBallSunsetImg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'right center',
                  minHeight: '220px'
                }}
              >
                <div className="relative z-10 max-w-xl">
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight drop-shadow-sm">
                    Team Management
                  </h1>
                  <p className="text-slate-700 text-sm sm:text-base mt-1.5 font-semibold">
                    Manage teams, view details, update information and explore player squads.
                  </p>
                </div>
              </div>

              {/* Search & Actions Bar (Image 5) */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search teams..."
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setAddPlayerModal(true)}
                    className="bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center gap-2 text-xs"
                  >
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>+ Add Player</span>
                  </button>

                  <button
                    onClick={() => setAddTeamModal(true)}
                    className="bg-[#00c261] hover:bg-[#00ad56] text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Team</span>
                  </button>
                </div>
              </div>

              {/* Team Cards Grid (Image 5) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredTeams.map((team) => (
                  <div
                    key={team.id}
                    className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:border-slate-200 transition-all flex flex-col"
                  >
                    {/* Team Crest Header Card with gradient backdrop */}
                    <div className="relative h-44 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
                      <div className="relative transform hover:scale-110 transition-transform duration-300">
                        <TeamLogo name={team.name} className="w-24 h-24" />
                      </div>
                    </div>

                    {/* Team Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="text-center">
                        <h3 className="text-xl font-extrabold text-slate-900">{team.name}</h3>
                        <p className="text-xs text-slate-400 font-medium">{team.homeVenue || team.city}</p>
                      </div>

                      <div className="space-y-2 text-xs py-2 border-y border-slate-100 text-slate-600">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> City
                          </span>
                          <span className="font-bold text-slate-800">{team.city}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Users className="w-3.5 h-3.5 text-slate-400" /> Players
                          </span>
                          <span className="font-bold text-slate-800">{team.playersCount || team.players?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <User className="w-3.5 h-3.5 text-slate-400" /> Coach
                          </span>
                          <span className="font-bold text-slate-800 truncate max-w-[120px]">{team.coach}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => setSelectedTeamSquad(team)}
                          className="w-full bg-[#00c261] hover:bg-[#00ad56] text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>View Players</span>
                        </button>
                        <button
                          onClick={() => {
                            const newCoach = prompt('Update Coach name:', team.coach);
                            if (newCoach) {
                              setTeams(teams.map((t) => (t.id === team.id ? { ...t, coach: newCoach } : t)));
                              showToast(`Updated coach for ${team.name}`);
                            }
                          }}
                          className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3B: PLAYERS DIRECTORY & PROFILES */}
          {/* ========================================================================= */}
          {activeTab === 'players' && (
            <div className="space-y-6">
              {/* Header Hero Banner with batsman-stadium.jpg */}
              <div
                className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 p-6 sm:p-8 flex flex-col justify-center"
                style={{
                  backgroundImage: `linear-gradient(90deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.85) 20%, rgba(255, 255, 255, 0.35) 45%, rgba(255, 255, 255, 0) 70%), url(${batsmanStadiumImg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'right center',
                  minHeight: '220px'
                }}
              >
                <div className="relative z-10 max-w-xl">
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight drop-shadow-sm">
                    Player Directory & Records
                  </h1>
                  <p className="text-slate-700 text-sm sm:text-base mt-1.5 font-semibold">
                    Explore registered cricketers, batting records, bowling aggregates, and assign squad members.
                  </p>
                </div>
              </div>

              {/* Search & Actions Bar */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by player name or team..."
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto justify-end">
                  {['All', 'Batter', 'Bowler', 'All-Rounder', 'Wicket-Keeper'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setPlayerRoleFilter(r)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        playerRoleFilter === r
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}

                  <button
                    onClick={() => setAddPlayerModal(true)}
                    className="bg-[#00c261] hover:bg-[#00ad56] text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all flex items-center gap-1.5 text-xs whitespace-nowrap ml-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Player</span>
                  </button>
                </div>
              </div>

              {/* Players Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPlayers.length === 0 ? (
                  <div className="col-span-full bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100">
                    <User className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-slate-600">No players found matching your criteria</p>
                  </div>
                ) : (
                  filteredPlayers.map((player) => (
                    <div
                      key={player.player_id}
                      className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3.5 mb-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 text-white flex items-center justify-center font-black text-lg shadow-sm">
                            {player.name ? player.name.slice(0, 2).toUpperCase() : 'PL'}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-extrabold text-slate-900 truncate">
                              {player.name}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium truncate">
                              {player.team_name || 'Free Agent'} • <span className="text-emerald-700 font-bold">{player.role || 'Player'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3 text-xs grid grid-cols-3 gap-2 border border-slate-100 text-center">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Matches</span>
                            <span className="font-black text-slate-800 text-xs">{player.matches || 0}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Runs</span>
                            <span className="font-black text-slate-800 text-xs">{player.runs || 0}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Wickets</span>
                            <span className="font-black text-slate-800 text-xs">{player.wickets || 0}</span>
                          </div>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 px-1">
                          <span>Avg: <strong className="text-slate-800">{player.batting_average || 0}</strong></span>
                          <span>SR: <strong className="text-slate-800">{player.strike_rate || 0}</strong></span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 truncate max-w-[140px]">
                          {player.batting_style || 'Right-hand bat'}
                        </span>
                        <Link
                          to={`/player/${player.player_id}`}
                          className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700"
                        >
                          <span>Full Profile</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: MATCHES & VENUE SCHEDULER */}
          {/* ========================================================================= */}
          {(activeTab === 'matches' || activeTab === 'venues') && (
            <div className="space-y-6">
              {/* Header Hero Banner with stadium-ball-day.png */}
              <div
                className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                style={{
                  backgroundImage: `linear-gradient(90deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.85) 20%, rgba(255, 255, 255, 0.35) 45%, rgba(255, 255, 255, 0) 70%), url(${stadiumBallDayImg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'right center',
                  minHeight: '220px'
                }}
              >
                <div className="relative z-10 max-w-xl">
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight drop-shadow-sm">
                    Venue & Match Scheduler
                  </h1>
                  <p className="text-slate-700 text-sm sm:text-base mt-1.5 font-semibold">
                    Schedule fixtures, book floodlit venues, allocate total overs, and assign official scorers.
                  </p>
                </div>

                <button
                  onClick={() => setScheduleMatchModal(true)}
                  className="relative z-10 bg-[#00c261] hover:bg-[#00ad56] text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 flex-shrink-0"
                >
                  <Plus className="w-5 h-5" />
                  <span>Schedule Match</span>
                </button>
              </div>

              {/* Search & Status Filters */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search matches by team, tournament or venue..."
                    value={matchSearchQuery}
                    onChange={(e) => setMatchSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto justify-end text-xs font-bold">
                  {['All', 'LIVE', 'SCHEDULED', 'COMPLETED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setMatchStatusFilter(st)}
                      className={`px-3.5 py-1.5 rounded-xl capitalize transition-colors ${
                        matchStatusFilter === st
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Matches List */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-900">Scheduled Match Fixtures</h3>
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-100">
                    {filteredMatches.length} Fixtures
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {filteredMatches.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                      <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="font-bold text-slate-600">No match fixtures found</p>
                    </div>
                  ) : (
                    filteredMatches.map((match) => (
                      <div key={match.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex flex-col gap-2 min-w-[280px]">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <span>{match.tournament}</span>
                            <span>•</span>
                            <span>{match.format || 'T20'} ({match.overs} Ov)</span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2.5">
                                <TeamLogo name={match.team1} className="w-7 h-7" />
                                <span className="font-extrabold text-sm text-slate-900">{match.team1}</span>
                              </div>
                              {match.team1_score && (
                                <span className="font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                                  {match.team1_score}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2.5">
                                <TeamLogo name={match.team2} className="w-7 h-7" />
                                <span className="font-extrabold text-sm text-slate-900">{match.team2}</span>
                              </div>
                              {match.team2_score && (
                                <span className="font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                                  {match.team2_score}
                                </span>
                              )}
                            </div>
                          </div>

                          {match.result_summary && (
                            <p className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 w-fit">
                              {match.result_summary}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-slate-400 block font-medium">Venue</span>
                            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5 truncate max-w-[150px]">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              {match.venue}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 block font-medium">Date & Time</span>
                            <span className="font-bold text-slate-800 mt-0.5 block">
                              {match.date || 'TBD'} • {match.time || '03:30 PM'}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 block font-medium">Status</span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold mt-0.5 ${
                              match.status === 'LIVE' ? 'bg-emerald-100 text-emerald-700 animate-pulse' :
                              match.status === 'COMPLETED' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-700'
                            }`}>
                              {match.status === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                              {match.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                          <Link
                            to={`/live-scorecard/${match.id}`}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Scorecard</span>
                          </Link>
                          <Link
                            to={`/scorer/console/${match.id}`}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <Radio className="w-3.5 h-3.5" />
                            <span>Scoring Console</span>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: POINTS TABLE & STANDINGS */}
          {/* ========================================================================= */}
          {activeTab === 'points' && (
            <div className="space-y-6">
              {/* Header Hero Banner with stadium-trophy.png */}
              <div
                className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                style={{
                  backgroundImage: `linear-gradient(90deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.85) 20%, rgba(255, 255, 255, 0.35) 45%, rgba(255, 255, 255, 0) 70%), url(${stadiumTrophyImg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'right center',
                  minHeight: '220px'
                }}
              >
                <div className="relative z-10 max-w-xl">
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight drop-shadow-sm">
                    Points Table & Standings
                  </h1>
                  <p className="text-slate-700 text-sm sm:text-base mt-1.5 font-semibold">
                    Live Net Run Rate (NRR) computation, match points, wins/losses tally, and form guides across all tournaments.
                  </p>
                </div>

                <div className="relative z-10 flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tournament:</label>
                  <select
                    value={pointsTournamentId}
                    onChange={(e) => setPointsTournamentId(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {tournaments.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.format})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Points Table Card */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-extrabold text-base text-slate-900">
                      {tournaments.find((t) => t.id === pointsTournamentId)?.name || 'Tournament'} — Official Standings
                    </h3>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-100">
                    Ranked by Points, NRR
                  </span>
                </div>

                {pointsLoading ? (
                  <div className="p-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-600">Calculating Net Run Rates...</p>
                  </div>
                ) : pointsStandings.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Trophy className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-slate-600">No standings data recorded for this tournament yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Standings update automatically as match results are recorded.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
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
                        {pointsStandings.map((team, idx) => (
                          <tr key={team.team_id || idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-extrabold text-slate-900">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                idx === 0 ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'
                              }`}>
                                {team.rank || idx + 1}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <TeamLogo name={team.team_name} className="w-8 h-8 shrink-0" />
                                <div>
                                  <span className="font-bold text-slate-900 block">{team.team_name}</span>
                                  {team.team_city && <span className="text-[11px] text-slate-400">{team.team_city}</span>}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-center text-slate-700">{team.played}</td>
                            <td className="py-3.5 px-3 text-center text-emerald-600 font-bold">{team.won}</td>
                            <td className="py-3.5 px-3 text-center text-rose-600">{team.lost}</td>
                            <td className="py-3.5 px-3 text-center text-slate-500">{(team.tied || 0) + (team.nr || 0)}</td>
                            <td className="py-3.5 px-3 text-center font-black text-slate-900 bg-slate-50/50">{team.points}</td>
                            <td className={`py-3.5 px-4 text-right font-mono font-bold ${
                              team.nrr > 0 ? 'text-emerald-600' : team.nrr < 0 ? 'text-rose-600' : 'text-slate-700'
                            }`}>
                              {team.nrr > 0 ? `+${Number(team.nrr).toFixed(3)}` : Number(team.nrr).toFixed(3)}
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: STATS / REPORTS / USERS PLACEHOLDER */}
          {(activeTab === 'stats' || activeTab === 'reports' || activeTab === 'users') && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 capitalize">{activeTab} Management</h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Comprehensive data aggregation, Net Run Rate calculators, and automated governance reporting.
              </p>
              <button
                onClick={() => handleTabChange('overview')}
                className="bg-[#00c261] hover:bg-[#00ad56] text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md"
              >
                Return to Overview
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE TOURNAMENT */}
      {/* ========================================================================= */}
      {createTournamentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Create New Tournament</h3>
                  <p className="text-xs text-slate-500">Configure competition tier & match format</p>
                </div>
              </div>
              <button
                onClick={() => setCreateTournamentModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tournament Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. City Champions Trophy 2025"
                  value={newTournament.name}
                  onChange={(e) => setNewTournament({ ...newTournament, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tier Level
                  </label>
                  <select
                    value={newTournament.level}
                    onChange={(e) => setNewTournament({ ...newTournament, level: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Local">Local</option>
                    <option value="Club">Club</option>
                    <option value="Domestic">Domestic</option>
                    <option value="International">International</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Match Format
                  </label>
                  <select
                    value={newTournament.format}
                    onChange={(e) =>
                      setNewTournament({
                        ...newTournament,
                        format: e.target.value,
                        overs: e.target.value === 'T20' ? 20 : e.target.value === 'ODI' ? 50 : 90
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="T20">T20 (20 Overs)</option>
                    <option value="ODI">ODI (50 Overs)</option>
                    <option value="Test">Test (Multi-Day)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newTournament.startDate}
                    onChange={(e) => setNewTournament({ ...newTournament, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newTournament.endDate}
                    onChange={(e) => setNewTournament({ ...newTournament, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCreateTournamentModal(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#00c261] hover:bg-[#00ad56] text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20"
                >
                  Create Tournament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD TEAM */}
      {/* ========================================================================= */}
      {addTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Register New Team</h3>
                  <p className="text-xs text-slate-500">Add franchise & management staff</p>
                </div>
              </div>
              <button
                onClick={() => setAddTeamModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTeam} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Challengers"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  City / Region
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai, Delhi, Bengaluru"
                  value={newTeam.city}
                  onChange={(e) => setNewTeam({ ...newTeam, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Head Coach Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gary Kirsten"
                  value={newTeam.coach}
                  onChange={(e) => setNewTeam({ ...newTeam, coach: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Home Ground / Venue
                </label>
                <input
                  type="text"
                  placeholder="e.g. Greenfield Stadium"
                  value={newTeam.homeVenue}
                  onChange={(e) => setNewTeam({ ...newTeam, homeVenue: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAddTeamModal(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#00c261] hover:bg-[#00ad56] text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20"
                >
                  Register Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD PLAYER */}
      {/* ========================================================================= */}
      {addPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Add Player to Squad</h3>
                  <p className="text-xs text-slate-500">Specify batting & bowling technique</p>
                </div>
              </div>
              <button
                onClick={() => setAddPlayerModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPlayer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Team
                </label>
                <select
                  value={newPlayer.teamId}
                  onChange={(e) => setNewPlayer({ ...newPlayer, teamId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Player Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jasprit Bumrah"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Player Role
                  </label>
                  <select
                    value={newPlayer.role}
                    onChange={(e) => setNewPlayer({ ...newPlayer, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-Rounder">All-Rounder</option>
                    <option value="Wicket Keeper">Wicket Keeper</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Jersey Number
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 18, 45, 93"
                    value={newPlayer.jersey}
                    onChange={(e) => setNewPlayer({ ...newPlayer, jersey: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Batting Style
                  </label>
                  <select
                    value={newPlayer.batStyle}
                    onChange={(e) => setNewPlayer({ ...newPlayer, batStyle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Right-hand bat">Right-hand bat</option>
                    <option value="Left-hand bat">Left-hand bat</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Bowling Style
                  </label>
                  <select
                    value={newPlayer.bowlStyle}
                    onChange={(e) => setNewPlayer({ ...newPlayer, bowlStyle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Right-arm fast">Right-arm fast</option>
                    <option value="Right-arm fast-medium">Right-arm fast-medium</option>
                    <option value="Right-arm offbreak">Right-arm offbreak</option>
                    <option value="Right-arm legbreak">Right-arm legbreak</option>
                    <option value="Left-arm fast">Left-arm fast</option>
                    <option value="Slow left-arm orthodox">Slow left-arm orthodox</option>
                    <option value="None">None (Pure Batsman)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAddPlayerModal(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#00c261] hover:bg-[#00ad56] text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20"
                >
                  Register Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: VENUE & MATCH SCHEDULER */}
      {/* ========================================================================= */}
      {scheduleMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Schedule Match Fixture</h3>
                  <p className="text-xs text-slate-500">Pick competing teams, venue & official scorer</p>
                </div>
              </div>
              <button
                onClick={() => setScheduleMatchModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleMatch} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Team 1 (Batting First / Host)
                  </label>
                  <select
                    value={newMatch.team1}
                    onChange={(e) => setNewMatch({ ...newMatch, team1: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Team 2 (Opponent)
                  </label>
                  <select
                    value={newMatch.team2}
                    onChange={(e) => setNewMatch({ ...newMatch, team2: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Venue Stadium
                </label>
                <select
                  value={newMatch.venue}
                  onChange={(e) => setNewMatch({ ...newMatch, venue: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="Greenfield Stadium, Mumbai">Greenfield Stadium, Mumbai</option>
                  <option value="Eden Gardens, Kolkata">Eden Gardens, Kolkata</option>
                  <option value="Wankhede Stadium, Mumbai">Wankhede Stadium, Mumbai</option>
                  <option value="M. Chinnaswamy Stadium, Bengaluru">M. Chinnaswamy Stadium, Bengaluru</option>
                  <option value="Feroz Shah Kotla, Delhi">Feroz Shah Kotla, Delhi</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Match Format & Overs
                  </label>
                  <select
                    value={newMatch.format}
                    onChange={(e) =>
                      setNewMatch({
                        ...newMatch,
                        format: e.target.value,
                        overs: e.target.value === 'T20' ? 20 : e.target.value === 'ODI' ? 50 : 90
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="T20">T20 (20 Overs)</option>
                    <option value="ODI">ODI (50 Overs)</option>
                    <option value="Test">Test Match</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Assign Official Scorer
                  </label>
                  <select
                    value={newMatch.scorer}
                    onChange={(e) => setNewMatch({ ...newMatch, scorer: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Rohit Kumar">Rohit Kumar (Certified Level 2)</option>
                    <option value="Rahul Sharma">Rahul Sharma (Senior Scorer)</option>
                    <option value="Anita Desai">Anita Desai (BCCI Panel)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Match Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newMatch.date}
                    onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="text"
                    defaultValue="07:00 PM"
                    value={newMatch.time}
                    onChange={(e) => setNewMatch({ ...newMatch, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setScheduleMatchModal(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#00c261] hover:bg-[#00ad56] text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: VIEW TEAM SQUAD / PLAYERS */}
      {/* ========================================================================= */}
      {selectedTeamSquad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <TeamLogo name={selectedTeamSquad.name} className="w-12 h-12" />
                <div>
                  <h3 className="text-xl font-black text-slate-900">{selectedTeamSquad.name} Squad</h3>
                  <p className="text-xs text-slate-500">
                    City: {selectedTeamSquad.city} • Coach: {selectedTeamSquad.coach}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeamSquad(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-3 py-1">
                <span>Roster ({selectedTeamSquad.players?.length || 0} registered)</span>
                <button
                  onClick={() => {
                    setNewPlayer({ ...newPlayer, teamId: selectedTeamSquad.id });
                    setSelectedTeamSquad(null);
                    setAddPlayerModal(true);
                  }}
                  className="text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Player
                </button>
              </div>

              {selectedTeamSquad.players && selectedTeamSquad.players.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {selectedTeamSquad.players.map((p) => (
                    <div key={p.id} className="p-3 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 font-black text-slate-700 flex items-center justify-center">
                          #{p.jersey}
                        </span>
                        <div>
                          <div className="font-extrabold text-slate-900">{p.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {p.batStyle} • {p.bowlStyle}
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {p.role}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No registered players in this squad yet.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedTeamSquad(null)}
                className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Close Squad
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
