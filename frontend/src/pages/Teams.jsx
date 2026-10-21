import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Trophy, 
  TrendingUp, 
  MapPin, 
  ChevronRight,
  Medal,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { RangersLogo, StrikersLogo } from '../components/TeamLogos';

const Teams = () => {
  const [selectedTournament, setSelectedTournament] = useState('City Champions League');

  const teamsList = [
    {
      id: 'rangers',
      name: 'Rangers',
      shortName: 'RAN',
      city: 'Mumbai',
      captain: 'Arjun Sharma',
      coach: 'Rahul Dravid',
      matches: 7,
      won: 5,
      lost: 2,
      points: 10,
      nrr: '+0.884',
      primaryColor: 'rose-500',
      logo: <RangersLogo size={56} />,
      form: ['W', 'W', 'L', 'W', 'W'],
    },
    {
      id: 'strikers',
      name: 'Strikers',
      shortName: 'STR',
      city: 'Delhi',
      captain: 'Dev Malhotra',
      coach: 'Gautam Gambhir',
      matches: 7,
      won: 5,
      lost: 2,
      points: 10,
      nrr: '+0.607',
      primaryColor: 'blue-500',
      logo: <StrikersLogo size={56} />,
      form: ['W', 'L', 'W', 'W', 'W'],
    },
    {
      id: 'titans',
      name: 'Titans',
      shortName: 'TIT',
      city: 'Ahmedabad',
      captain: 'Hardik Roy',
      coach: 'Ashish Nehra',
      matches: 7,
      won: 4,
      lost: 3,
      points: 8,
      nrr: '+0.198',
      primaryColor: 'amber-500',
      logo: (
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-500 text-lg">
          TIT
        </div>
      ),
      form: ['L', 'W', 'W', 'L', 'W'],
    },
    {
      id: 'royals',
      name: 'Royals',
      shortName: 'ROY',
      city: 'Jaipur',
      captain: 'Sanju Varma',
      coach: 'Kumar S.',
      matches: 7,
      won: 3,
      lost: 4,
      points: 6,
      nrr: '-0.225',
      primaryColor: 'purple-500',
      logo: (
        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-black text-purple-500 text-lg">
          ROY
        </div>
      ),
      form: ['L', 'L', 'W', 'W', 'L'],
    },
    {
      id: 'warriors',
      name: 'Warriors',
      shortName: 'WAR',
      city: 'Bengaluru',
      captain: 'Virat Sen',
      coach: 'Andy Flower',
      matches: 7,
      won: 2,
      lost: 5,
      points: 4,
      nrr: '-0.912',
      primaryColor: 'emerald-500',
      logo: (
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-500 text-lg">
          WAR
        </div>
      ),
      form: ['W', 'L', 'L', 'L', 'L'],
    },
    {
      id: 'knights',
      name: 'Knights',
      shortName: 'KNI',
      city: 'Kolkata',
      captain: 'Shreyas I.',
      coach: 'Chandrakant P.',
      matches: 7,
      won: 1,
      lost: 6,
      points: 2,
      nrr: '-1.670',
      primaryColor: 'slate-500',
      logo: (
        <div className="w-14 h-14 rounded-2xl bg-slate-500/10 border border-slate-500/30 flex items-center justify-center font-black text-slate-500 text-lg">
          KNI
        </div>
      ),
      form: ['L', 'L', 'L', 'L', 'W'],
    },
  ];

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
              Participating Teams & Standings
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Explore franchises, player squads, net run rates, points standings, and team leadership.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 -mt-6">

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teamsList.map((team, idx) => (
            <div
              key={team.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-xs">
                    {team.logo}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">{team.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {team.city}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900">{team.points} <span className="text-xs font-bold text-slate-400">PTS</span></div>
                  <span className={`text-xs font-bold ${team.nrr.startsWith('+') ? 'text-emerald-600' : 'text-rose-500'}`}>
                    NRR {team.nrr}
                  </span>
                </div>
              </div>

              {/* Stats & Leadership */}
              <div className="py-4 space-y-2.5 text-xs text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-400">Captain</span>
                  <span className="font-bold text-slate-800">{team.captain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Head Coach</span>
                  <span className="font-bold text-slate-800">{team.coach}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Record (W-L)</span>
                  <span className="font-bold text-slate-800">{team.won} Won • {team.lost} Lost</span>
                </div>
              </div>

              {/* Form & Link */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-semibold text-slate-400 mr-1">Form:</span>
                  {team.form.map((res, i) => (
                    <span
                      key={i}
                      className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center ${
                        res === 'W'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {res}
                    </span>
                  ))}
                </div>

                <Link
                  to="/player/1"
                  className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <span>View Squad</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Teams;
