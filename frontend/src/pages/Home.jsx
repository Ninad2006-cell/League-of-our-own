import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Activity, BarChart2, Users, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Trophy,
    title: 'Tournaments',
    subtitle: 'Manage cricket events',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    link: '/schedule-points',
  },
  {
    icon: Activity,
    title: 'Live Scoring',
    subtitle: 'Ball-by-ball updates',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
    link: '/live-scorecard/1',
    customIcon: (
      <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-rose-50 text-rose-500">
        <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 border-r-2 border-l-2 border-white/60 rounded-full scale-90 rotate-45" />
          <div className="w-full h-0.5 bg-white/40 rotate-45" />
        </div>
      </div>
    ),
  },
  {
    icon: BarChart2,
    title: 'Player Statistics',
    subtitle: 'Player profiles and performance',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
    link: '/player/1',
  },
  {
    icon: Users,
    title: 'Team Management',
    subtitle: 'Register and manage teams',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    link: '/schedule-points',
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative w-full min-h-[580px] lg:min-h-[640px] flex items-center bg-slate-950 overflow-hidden">
        {/* Background Image with Dark Overlay and Backdrop Blur */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/home_page_background.jpeg')` }}
        >
          <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px]" />
        </div>

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 w-full z-10">
          <div className="max-w-2xl lg:max-w-3xl space-y-6">
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Cricket Data{' '}
              <span className="text-emerald-400">Management</span> System
            </h1>

            {/* Tagline */}
            <p className="text-xl sm:text-2xl font-bold text-emerald-100/90 tracking-wide">
              Manage. Track. Score. Celebrate Cricket.
            </p>

            {/* Description Paragraph */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              A complete platform for managing cricket tournaments, teams, players, venues,
              live scores and statistics — from local matches to international events.
            </p>

            {/* Call-to-Action (CTA) Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link
                to="/live-scorecard/1"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 hover:-translate-y-0.5"
              >
                <span>View Live Scores</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/schedule-points"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-700 text-white font-semibold transition-all duration-200 backdrop-blur-md hover:border-slate-600 hover:-translate-y-0.5"
              >
                Explore Tournaments
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid (Overlapping Section) */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-16 sm:-mt-20 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Link
                to={feature.link}
                key={idx}
                className="group bg-white rounded-2xl p-5 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 border border-slate-100 flex items-center gap-4"
              >
                {/* Feature Icon Container */}
                {feature.customIcon ? (
                  feature.customIcon
                ) : (
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-xl ${feature.iconBg} ${feature.iconColor} transition-transform duration-300 group-hover:scale-105 shrink-0`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                )}

                {/* Card Text Content */}
                <div className="flex flex-col min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-emerald-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-normal truncate mt-0.5">
                    {feature.subtitle}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;
