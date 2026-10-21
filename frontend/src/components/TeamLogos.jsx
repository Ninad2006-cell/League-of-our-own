import React from 'react';

// CDMS Cricket Ball Logo
export const CDMSLogo = ({ className = "w-9 h-9" }) => (
  <div className={`relative flex items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-green-400 shadow-md ${className}`}>
    <svg viewBox="0 0 40 40" className="w-full h-full p-1" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="url(#ballGrad)" />
      {/* Seam curves */}
      <path d="M7 13C12 17 12 23 7 27" stroke="white" strokeWidth="2" strokeDasharray="2 1.5" strokeLinecap="round" opacity="0.9" />
      <path d="M33 13C28 17 28 23 33 27" stroke="white" strokeWidth="2" strokeDasharray="2 1.5" strokeLinecap="round" opacity="0.9" />
      <path d="M12 7C17 12 23 12 28 7" stroke="white" strokeWidth="2" strokeDasharray="2 1.5" strokeLinecap="round" opacity="0.9" />
      <path d="M12 33C17 28 23 28 28 33" stroke="white" strokeWidth="2" strokeDasharray="2 1.5" strokeLinecap="round" opacity="0.9" />
      <defs>
        <linearGradient id="ballGrad" x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

// Rangers - Royal Lion Crest
export const RangersLogo = ({ className = "w-14 h-14" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 100 110" className="w-full h-full drop-shadow-md" fill="none">
      <path
        d="M50 5 L88 22 V58 C88 82 50 104 50 104 C50 104 12 82 12 58 V22 Z"
        fill="url(#rangersBg)"
        stroke="#F59E0B"
        strokeWidth="3"
      />
      <path
        d="M50 12 L82 26 V56 C82 77 50 96 50 96 C50 96 18 77 18 56 V26 Z"
        fill="#0F172A"
      />
      <circle cx="50" cy="46" r="16" fill="#3B82F6" opacity="0.3" />
      <path
        d="M50 30 C42 30 38 35 36 40 C34 45 35 52 38 56 C41 60 45 66 50 72 C55 66 59 60 62 56 C65 52 66 45 64 40 C62 35 58 30 50 30 Z"
        fill="#FFFFFF"
      />
      <path
        d="M44 44 L48 48 L44 52 M56 44 L52 48 L56 52"
        stroke="#1E293B"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M46 58 C48 61 52 61 54 58"
        stroke="#1E293B"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M40 32 L44 26 L50 29 L56 26 L60 32 Z"
        fill="#F59E0B"
      />
      <defs>
        <linearGradient id="rangersBg" x1="12" y1="5" x2="88" y2="104">
          <stop stopColor="#1E3A8A" />
          <stop offset="1" stopColor="#0F172A" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

// Strikers - Cyan Lightning Bolt Crest
export const StrikersLogo = ({ className = "w-14 h-14" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 100 110" className="w-full h-full drop-shadow-md" fill="none">
      <path
        d="M50 5 L88 22 V58 C88 82 50 104 50 104 C50 104 12 82 12 58 V22 Z"
        fill="url(#strikersBg)"
        stroke="#38BDF8"
        strokeWidth="3"
      />
      <path
        d="M50 12 L82 26 V56 C82 77 50 96 50 96 C50 96 18 77 18 56 V26 Z"
        fill="#042F2E"
      />
      <path
        d="M54 24 L34 54 H48 L44 84 L68 48 H52 L60 24 Z"
        fill="url(#strikeBolt)"
        stroke="#FFFFFF"
        strokeWidth="1.5"
      />
      <defs>
        <linearGradient id="strikersBg" x1="12" y1="5" x2="88" y2="104">
          <stop stopColor="#0891B2" />
          <stop offset="1" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="strikeBolt" x1="34" y1="24" x2="68" y2="84">
          <stop stopColor="#67E8F9" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

// Warriors - Golden Spartan Helmet
export const WarriorsLogo = ({ className = "w-14 h-14" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 100 110" className="w-full h-full drop-shadow-md" fill="none">
      <path
        d="M50 5 L88 22 V58 C88 82 50 104 50 104 C50 104 12 82 12 58 V22 Z"
        fill="url(#warriorsBg)"
        stroke="#F59E0B"
        strokeWidth="3"
      />
      <path
        d="M50 12 L82 26 V56 C82 77 50 96 50 96 C50 96 18 77 18 56 V26 Z"
        fill="#1C1917"
      />
      <path
        d="M50 26 C41 26 35 32 35 44 V62 L44 68 V54 H56 V68 L65 62 V44 C65 32 59 26 50 26 Z"
        fill="#D97706"
        stroke="#FCD34D"
        strokeWidth="2"
      />
      <path d="M48 20 C48 18 52 18 52 20 V38 H48 Z" fill="#DC2626" />
      <path d="M46 44 H54 V62 H46 Z" fill="#000000" />
      <path d="M38 48 H62 V52 H38 Z" fill="#000000" />
      <defs>
        <linearGradient id="warriorsBg" x1="12" y1="5" x2="88" y2="104">
          <stop stopColor="#78350F" />
          <stop offset="1" stopColor="#1C1917" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

// Kings - Royal Crimson & Golden Crown
export const KingsLogo = ({ className = "w-14 h-14" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 100 110" className="w-full h-full drop-shadow-md" fill="none">
      <path
        d="M50 5 L88 22 V58 C88 82 50 104 50 104 C50 104 12 82 12 58 V22 Z"
        fill="url(#kingsBg)"
        stroke="#F59E0B"
        strokeWidth="3"
      />
      <path
        d="M50 12 L82 26 V56 C82 77 50 96 50 96 C50 96 18 77 18 56 V26 Z"
        fill="#26080B"
      />
      <path
        d="M30 62 L34 40 L44 50 L50 32 L56 50 L66 40 L70 62 Z"
        fill="#FBBF24"
        stroke="#D97706"
        strokeWidth="2"
      />
      <circle cx="34" cy="38" r="3" fill="#EF4444" />
      <circle cx="50" cy="30" r="3.5" fill="#EF4444" />
      <circle cx="66" cy="38" r="3" fill="#EF4444" />
      <rect x="32" y="62" width="36" height="6" rx="2" fill="#F59E0B" />
      <defs>
        <linearGradient id="kingsBg" x1="12" y1="5" x2="88" y2="104">
          <stop stopColor="#991B1B" />
          <stop offset="1" stopColor="#450A0A" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

// Titans - Mountain/Shield
export const TitansLogo = ({ className = "w-14 h-14" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 100 110" className="w-full h-full drop-shadow-md" fill="none">
      <path
        d="M50 5 L88 22 V58 C88 82 50 104 50 104 C50 104 12 82 12 58 V22 Z"
        fill="#1E293B"
        stroke="#38BDF8"
        strokeWidth="3"
      />
      <path d="M50 25 L75 75 H25 Z" fill="#0284C7" stroke="#BAE6FD" strokeWidth="2" />
      <path d="M50 35 L68 75 H50 Z" fill="#0369A1" />
    </svg>
  </div>
);

// Blazers - Flame Crest
export const BlazersLogo = ({ className = "w-14 h-14" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 100 110" className="w-full h-full drop-shadow-md" fill="none">
      <path
        d="M50 5 L88 22 V58 C88 82 50 104 50 104 C50 104 12 82 12 58 V22 Z"
        fill="#3F1515"
        stroke="#F97316"
        strokeWidth="3"
      />
      <path
        d="M50 24 C45 38 35 48 42 66 C44 72 48 76 50 78 C52 76 56 72 58 66 C65 48 55 38 50 24 Z"
        fill="#EA580C"
      />
      <path
        d="M50 38 C47 46 42 54 46 66 C48 70 50 72 50 72 C50 72 52 70 54 66 C58 54 53 46 50 38 Z"
        fill="#FBBF24"
      />
    </svg>
  </div>
);

// Helper function to render a team logo dynamically by name
export const TeamLogo = ({ name = "", className = "w-12 h-12" }) => {
  const normalized = (name || "").toLowerCase();
  if (normalized.includes("ranger")) return <RangersLogo className={className} />;
  if (normalized.includes("striker")) return <StrikersLogo className={className} />;
  if (normalized.includes("warrior")) return <WarriorsLogo className={className} />;
  if (normalized.includes("king")) return <KingsLogo className={className} />;
  if (normalized.includes("titan")) return <TitansLogo className={className} />;
  if (normalized.includes("blazer")) return <BlazersLogo className={className} />;
  
  return (
    <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white font-bold text-xs uppercase shadow-md ${className}`}>
      {name.slice(0, 3)}
    </div>
  );
};
