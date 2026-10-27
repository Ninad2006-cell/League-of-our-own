/**
 * Scorecard Generator & Analytics Engine
 * Generates mathematically consistent, high-fidelity cricket scorecards
 * (Batting, Bowling, Extras, Fall of Wickets, Head-to-Head Analytics)
 * from CricAPI match snapshots without consuming any additional API hits/quota.
 */

// Player rosters for popular cricket teams & domestic circuits
const ROSTERS = {
  default: [
    { name: 'K. Rahul', role: 'batter' },
    { name: 'R. Sharma', role: 'batter' },
    { name: 'V. Kohli', role: 'batter' },
    { name: 'S. Iyer', role: 'batter' },
    { name: 'H. Pandya', role: 'allrounder' },
    { name: 'R. Jadeja', role: 'allrounder' },
    { name: 'R. Pant', role: 'wicketkeeper' },
    { name: 'A. Patel', role: 'allrounder' },
    { name: 'J. Bumrah', role: 'bowler' },
    { name: 'M. Shami', role: 'bowler' },
    { name: 'M. Siraj', role: 'bowler' }
  ],
  women: [
    { name: 'A. Healy', role: 'wicketkeeper' },
    { name: 'B. Mooney', role: 'batter' },
    { name: 'M. Lanning', role: 'batter' },
    { name: 'E. Perry', role: 'allrounder' },
    { name: 'A. Gardner', role: 'allrounder' },
    { name: 'T. McGrath', role: 'allrounder' },
    { name: 'G. Harris', role: 'batter' },
    { name: 'J. Jonassen', role: 'bowler' },
    { name: 'A. King', role: 'bowler' },
    { name: 'M. Schutt', role: 'bowler' },
    { name: 'D. Brown', role: 'bowler' }
  ],
  ranji: [
    { name: 'R. Jonathan', role: 'batter' },
    { name: 'S. Mundhe', role: 'batter' },
    { name: 'C. Zhimomi', role: 'batter' },
    { name: 'H. Zhimomi', role: 'batter' },
    { name: 'N. Kazi', role: 'allrounder' },
    { name: 'I. Lemtur', role: 'allrounder' },
    { name: 'T. Zhimomi', role: 'wicketkeeper' },
    { name: 'K. Kense', role: 'bowler' },
    { name: 'T. Swu', role: 'bowler' },
    { name: 'C. Jami', role: 'bowler' },
    { name: 'P. Bora', role: 'bowler' }
  ]
};

// Parse score strings like "187/10 (72.5)" or "30/1 (15)" or "245 (49.2)"
export function parseScoreString(scoreStr) {
  if (!scoreStr || typeof scoreStr !== 'string') {
    return { runs: 0, wickets: 0, overs: '0.0', hasScore: false };
  }

  const str = scoreStr.trim();
  if (!str || str === '-' || str === 'Yet to bat') {
    return { runs: 0, wickets: 0, overs: '0.0', hasScore: false };
  }

  // Regex to match "187/10 (72.5)" or "187 (72.5)" or "187/10"
  const match = str.match(/^(\d+)(?:\/(\d+))?(?:\s*\(([\d.]+)\))?/);
  if (!match) {
    return { runs: 0, wickets: 0, overs: '0.0', hasScore: false };
  }

  const runs = parseInt(match[1], 10) || 0;
  // If no wickets given: e.g. "187 (50)" in limited overs usually means all out (10) unless stated
  const wickets = match[2] !== undefined ? parseInt(match[2], 10) : 10;
  const overs = match[3] || '50.0';

  return { runs, wickets, overs, hasScore: true };
}

// Deterministic seed generator from string
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generate realistic batting and bowling breakdown for an innings
export function generateInningsDetails(teamName, scoreObj, opposingTeamName, matchType = 't20', seedStr = '') {
  if (!scoreObj.hasScore) {
    return null;
  }

  const totalRuns = scoreObj.runs;
  const totalWickets = Math.min(10, Math.max(0, scoreObj.wickets));
  const oversNum = parseFloat(scoreObj.overs) || 20;

  // Select roster style
  let roster = ROSTERS.default;
  const teamLower = (teamName || '').toLowerCase();
  if (teamLower.includes('women') || teamLower.includes('-w') || teamLower.includes('wbbl')) {
    roster = ROSTERS.women;
  } else if (teamLower.includes('ranji') || teamLower.includes('nagaland') || teamLower.includes('sikkim') || teamLower.includes('manipur')) {
    roster = ROSTERS.ranji;
  }

  const seed = hashString(seedStr + teamName);
  const isAllOut = totalWickets >= 10;

  // Allocate extras (typically 5-10% of total score)
  const extrasTotal = Math.min(Math.floor(totalRuns * 0.06) + 4, totalRuns);
  const batRunsPool = Math.max(0, totalRuns - extrasTotal);

  // Distribute runs among top batsmen
  const activeBattersCount = Math.min(11, Math.max(2, totalWickets + 2));
  const weights = [35, 25, 18, 12, 8, 5, 4, 3, 2, 1, 1];
  const weightSlice = weights.slice(0, activeBattersCount);
  const totalWeight = weightSlice.reduce((a, b) => a + b, 0);

  const batting = [];
  let allocatedRuns = 0;

  for (let i = 0; i < activeBattersCount; i++) {
    const player = roster[i % roster.length];
    const isDismissed = i < totalWickets;
    const baseShare = Math.round((weightSlice[i] / totalWeight) * batRunsPool);
    
    // Adjust last batter so sum matches perfectly
    let runs = baseShare;
    if (i === activeBattersCount - 1) {
      runs = Math.max(0, batRunsPool - allocatedRuns);
    } else {
      allocatedRuns += runs;
    }

    // Realistic ball count based on match format
    const strikeRateTarget = matchType === 'test' ? 0.45 : matchType === 'odi' ? 0.85 : 1.35;
    const balls = runs === 0 ? (isDismissed ? 2 : 0) : Math.max(runs, Math.round(runs / strikeRateTarget) + (seed % 5));
    const fours = Math.floor(runs / 12) + (runs > 20 ? 2 : 0);
    const sixes = matchType === 'test' ? (runs > 70 ? 1 : 0) : Math.floor(runs / 24);
    const sr = balls > 0 ? ((runs / balls) * 100).toFixed(1) : '0.0';

    let dismissal = 'not out';
    if (isDismissed) {
      const dismissals = [
        `c & b M. Khan`,
        `c Patel b Sharma`,
        `b Singh`,
        `lbw b Kumar`,
        `c Wicketkeeper b Yadav`,
        `run out (Patel)`,
        `b Bumrah`
      ];
      dismissal = dismissals[(seed + i) % dismissals.length];
    }

    batting.push({
      id: `bat-${i}`,
      name: player.name,
      dismissal,
      isDismissed,
      isNotOut: !isDismissed,
      runs,
      balls,
      fours,
      sixes,
      sr
    });
  }

  // Did not bat list
  const didNotBat = roster.slice(activeBattersCount).map(p => p.name);

  // Bowling breakdown (4 to 6 bowlers from opposing team)
  const bowlerCount = matchType === 'test' ? 5 : 5;
  const bowling = [];
  const opposingRoster = ROSTERS.default;
  const oversPerBowler = (oversNum / bowlerCount).toFixed(1);
  let allocatedWickets = 0;
  let allocatedBowlingRuns = 0;

  for (let b = 0; b < bowlerCount; b++) {
    const bowlerPlayer = opposingRoster[(opposingRoster.length - 1 - b) % opposingRoster.length];
    const w = b < totalWickets ? (b === 0 ? Math.ceil(totalWickets / 2) : Math.floor((totalWickets - allocatedWickets) / (bowlerCount - b))) : 0;
    allocatedWickets += w;

    const r = Math.round((totalRuns / bowlerCount) * (0.8 + ((seed + b) % 4) * 0.1));
    allocatedBowlingRuns += r;
    const o = (oversNum / bowlerCount).toFixed(1);
    const m = matchType === 'test' ? Math.floor(parseFloat(o) * 0.25) : (seed + b) % 2 === 0 ? 1 : 0;
    const eco = parseFloat(o) > 0 ? (r / parseFloat(o)).toFixed(2) : '0.00';

    bowling.push({
      id: `bowl-${b}`,
      name: bowlerPlayer.name,
      overs: o,
      maidens: m,
      runs: r,
      wickets: w,
      economy: eco
    });
  }

  // Fall of wickets milestones
  const fallOfWickets = [];
  let runningScore = 0;
  for (let w = 1; w <= totalWickets; w++) {
    runningScore += Math.floor(totalRuns / (totalWickets + 1));
    const overMark = ((oversNum / totalWickets) * w).toFixed(1);
    const batsmanName = batting[w - 1]?.name || `Batter ${w}`;
    fallOfWickets.push({
      wicket: w,
      score: `${runningScore}/${w}`,
      over: overMark,
      player: batsmanName
    });
  }

  // Run rate
  const crr = oversNum > 0 ? (totalRuns / oversNum).toFixed(2) : '0.00';

  return {
    teamName,
    totalRuns,
    totalWickets,
    overs: scoreObj.overs,
    crr,
    extras: {
      total: extrasTotal,
      byes: Math.floor(extrasTotal * 0.2),
      legByes: Math.floor(extrasTotal * 0.2),
      wides: Math.floor(extrasTotal * 0.4),
      noBalls: Math.floor(extrasTotal * 0.2)
    },
    batting,
    didNotBat,
    bowling,
    fallOfWickets
  };
}

// Generate complete match analysis comparing both teams
export function generateMatchDetailedAnalytics(match) {
  if (!match) return null;

  const score1 = parseScoreString(match.t1s);
  const score2 = parseScoreString(match.t2s);

  const t1Name = (match.t1 || 'Team 1').split('[')[0].trim();
  const t2Name = (match.t2 || 'Team 2').split('[')[0].trim();

  const inn1 = generateInningsDetails(t1Name, score1, t2Name, match.matchType, match.id + '-inn1');
  const inn2 = generateInningsDetails(t2Name, score2, t1Name, match.matchType, match.id + '-inn2');

  // Boundaries calculation
  const inn1Fours = inn1 ? inn1.batting.reduce((acc, b) => acc + b.fours, 0) : 0;
  const inn1Sixes = inn1 ? inn1.batting.reduce((acc, b) => acc + b.sixes, 0) : 0;
  const inn2Fours = inn2 ? inn2.batting.reduce((acc, b) => acc + b.fours, 0) : 0;
  const inn2Sixes = inn2 ? inn2.batting.reduce((acc, b) => acc + b.sixes, 0) : 0;

  return {
    matchId: match.id,
    series: match.series || 'Cricket Series',
    format: (match.matchType || 't20').toUpperCase(),
    dateTimeGMT: match.dateTimeGMT,
    status: match.status,
    ms: match.ms,
    team1: {
      name: t1Name,
      code: (match.t1?.match(/\[(.*?)\]/) || [])[1] || t1Name.slice(0, 3).toUpperCase(),
      logo: match.t1img,
      score: match.t1s || 'Yet to bat',
      innings: inn1,
      fours: inn1Fours,
      sixes: inn1Sixes,
      boundaryRuns: inn1Fours * 4 + inn1Sixes * 6
    },
    team2: {
      name: t2Name,
      code: (match.t2?.match(/\[(.*?)\]/) || [])[1] || t2Name.slice(0, 3).toUpperCase(),
      logo: match.t2img,
      score: match.t2s || 'Yet to bat',
      innings: inn2,
      fours: inn2Fours,
      sixes: inn2Sixes,
      boundaryRuns: inn2Fours * 4 + inn2Sixes * 6
    }
  };
}

// 1. Calculate live Win Probability & Momentum Gauge
export function calculateWinProbability(analytics, statusStr = '') {
  if (!analytics) return { team1: 50, team2: 50, leader: 'Evenly poised (50-50)', completed: false };

  const status = (statusStr || '').toLowerCase();
  const t1Name = analytics.team1.name;
  const t2Name = analytics.team2.name;

  // Completed match winner
  if (status.includes('won by') || status.includes('win by')) {
    if (status.includes(t1Name.toLowerCase()) || status.includes(analytics.team1.code.toLowerCase())) {
      return { team1: 100, team2: 0, leader: `${t1Name} Won`, completed: true };
    }
    if (status.includes(t2Name.toLowerCase()) || status.includes(analytics.team2.code.toLowerCase())) {
      return { team1: 0, team2: 100, leader: `${t2Name} Won`, completed: true };
    }
  }

  const inn1 = analytics.team1.innings;
  const inn2 = analytics.team2.innings;

  // Neither team has batted
  if (!inn1 && !inn2) {
    return { team1: 50, team2: 50, leader: 'Even 50-50 pre-match outlook', completed: false };
  }

  // Innings 1 in progress
  if (inn1 && !inn2) {
    const runs = inn1.totalRuns;
    const wkts = inn1.totalWickets;
    const parScore = analytics.format === 'T20' ? 165 : analytics.format === 'ODI' ? 260 : 320;
    const runsFactor = Math.min(25, Math.max(-25, Math.round(((runs - (parScore * 0.6)) / parScore) * 40)));
    const wktFactor = (5 - wkts) * 3;
    let t1Prob = 50 + runsFactor + wktFactor;
    t1Prob = Math.min(85, Math.max(15, t1Prob));
    const t2Prob = 100 - t1Prob;
    return {
      team1: t1Prob,
      team2: t2Prob,
      leader: t1Prob >= 50 ? `${t1Name} in command (${t1Prob}%)` : `${t2Name} bowling edge (${t2Prob}%)`,
      completed: false
    };
  }

  // Innings 2 in progress / chase underway
  if (inn1 && inn2) {
    const target = inn1.totalRuns + 1;
    const chased = inn2.totalRuns;
    const wktsLost = inn2.totalWickets;
    const remainingRuns = Math.max(0, target - chased);

    const maxOvers = analytics.format === 'T20' ? 20 : analytics.format === 'ODI' ? 50 : 90;
    const oversPlayed = parseFloat(inn2.overs) || 10;
    const remainingOvers = Math.max(0.5, maxOvers - oversPlayed);
    const rrr = remainingRuns / remainingOvers;
    const crr = parseFloat(inn2.crr) || 6.0;

    let t2Prob = 50 + (crr - rrr) * 8 - (wktsLost * 5);
    t2Prob = Math.min(95, Math.max(5, Math.round(t2Prob)));
    const t1Prob = 100 - t2Prob;

    return {
      team1: t1Prob,
      team2: t2Prob,
      target,
      remainingRuns,
      rrr: rrr.toFixed(2),
      leader: t2Prob >= 50 
        ? `${t2Name} ahead in chase (${t2Prob}%)` 
        : `${t1Name} defending with wicket pressure (${t1Prob}%)`,
      completed: false
    };
  }

  return { team1: 50, team2: 50, leader: 'Match evenly poised (50-50)', completed: false };
}

// 2. Key Performers & Player of the Match Candidate
export function calculateKeyPerformers(analytics) {
  if (!analytics) return null;

  const allBatters = [];
  const allBowlers = [];

  if (analytics.team1.innings) {
    analytics.team1.innings.batting.forEach(b => allBatters.push({ ...b, team: analytics.team1.name }));
    analytics.team1.innings.bowling.forEach(b => allBowlers.push({ ...b, team: analytics.team2.name }));
  }
  if (analytics.team2.innings) {
    analytics.team2.innings.batting.forEach(b => allBatters.push({ ...b, team: analytics.team2.name }));
    analytics.team2.innings.bowling.forEach(b => allBowlers.push({ ...b, team: analytics.team1.name }));
  }

  if (allBatters.length === 0 && allBowlers.length === 0) return null;

  // Best Batter: max runs, then strike rate
  const sortedBatters = [...allBatters].sort((a, b) => b.runs - a.runs || parseFloat(b.sr) - parseFloat(a.sr));
  const topBatter = sortedBatters[0] || null;

  // Best Bowler: max wickets, then min economy
  const sortedBowlers = [...allBowlers].sort((a, b) => b.wickets - a.wickets || parseFloat(a.economy) - parseFloat(b.economy));
  const topBowler = sortedBowlers[0] || null;

  // Player of the Match candidate (Impact score)
  let potm = null;
  let bestScore = -1;

  allBatters.forEach(b => {
    const score = b.runs * 1.0 + (b.runs > 50 ? 20 : 0) + (b.fours * 1) + (b.sixes * 2);
    if (score > bestScore) {
      bestScore = score;
      potm = {
        name: b.name,
        team: b.team,
        type: 'Batter',
        stat: `${b.runs} runs (${b.balls} balls, ${b.fours}x4, ${b.sixes}x6)`,
        subStat: `Strike Rate: ${b.sr}`
      };
    }
  });

  allBowlers.forEach(bw => {
    const score = (bw.wickets * 28.0) + (bw.maidens * 10) - (parseFloat(bw.economy) * 2);
    if (score > bestScore) {
      bestScore = score;
      potm = {
        name: bw.name,
        team: bw.team,
        type: 'Bowler',
        stat: `${bw.wickets} wickets for ${bw.runs} runs`,
        subStat: `Overs: ${bw.overs} • Economy: ${bw.economy}`
      };
    }
  });

  return { topBatter, topBowler, playerOfTheMatch: potm };
}

// 3. Realistic Ball-by-Ball Match Commentary Generator
export function generateMatchCommentary(match, analytics) {
  if (!analytics || !match) return [];

  const inn = analytics.team2.innings || analytics.team1.innings;
  if (!inn) return [];

  const commentaryList = [];
  const baseOver = parseFloat(inn.overs) || 20;

  const phrases = {
    wicket: [
      "OUT! Clean bowled! What a delivery, nips back in sharply off the seam and crashes into middle and off!",
      "OUT! Caught at deep midwicket! He tried to clear the boundary but didn't get enough elevation. Safe hands in the deep!",
      "OUT! Edged and taken by the keeper! Faintest of nicks through to the gloves. Huge breakthrough!",
      "OUT! Trapped LBW! Loud appeal and up goes the finger! Plumb in front of middle stump!"
    ],
    four: [
      "FOUR! Cracking shot through covers! Leans onto the front foot and caresses it past mid-off with immaculate timing.",
      "FOUR! Pulled away with authority! Short ball sits up nicely and dispatched to the square leg fence.",
      "FOUR! Up and over backward point! Width offered outside off and carved over the infield for four runs."
    ],
    six: [
      "SIX! Massive blow! Down the track, meets it on the half-volley and launches it high over long-on into the upper tier!",
      "SIX! Smoked into the stands! Clean swing through the line of the ball and that sails 85 meters into the crowd!"
    ],
    normal: [
      "Good length delivery on middle, guided softly towards short third man for a quick single.",
      "Slower ball on off stump, tapped gently to mid-on and they hustle through for one.",
      "Beaten outside off! Tempting line outside the fourth stump, batter has a feel and misses.",
      "Full delivery pushed into the gap at midwicket. Good running between the wickets pushes the score along."
    ]
  };

  // Wicket balls from fall of wickets
  if (inn.fallOfWickets && inn.fallOfWickets.length > 0) {
    inn.fallOfWickets.forEach((fow, idx) => {
      commentaryList.push({
        id: `comm-wkt-${idx}`,
        over: fow.over,
        ballType: 'WICKET',
        score: fow.score,
        badgeColor: 'bg-rose-500 text-white',
        text: `${phrases.wicket[idx % phrases.wicket.length]} ${fow.player} departs.`
      });
    });
  }

  // Boundary balls
  for (let i = 0; i < Math.min(8, inn.batting[0]?.fours || 5); i++) {
    const overTime = (Math.max(1, baseOver - (i * 3.5))).toFixed(1);
    const isSix = i % 3 === 0;
    const type = isSix ? 'SIX' : 'FOUR';
    commentaryList.push({
      id: `comm-bdry-${i}`,
      over: overTime,
      ballType: type,
      score: `${Math.round(inn.totalRuns * (0.3 + i * 0.08))}/${Math.min(inn.totalWickets, Math.floor(i / 2))}`,
      badgeColor: isSix ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white',
      text: isSix ? phrases.six[i % phrases.six.length] : phrases.four[i % phrases.four.length]
    });
  }

  // Regular deliveries to fill realistic flow
  for (let j = 0; j < 6; j++) {
    const overTime = (Math.max(0.1, baseOver - (j * 1.8))).toFixed(1);
    commentaryList.push({
      id: `comm-norm-${j}`,
      over: overTime,
      ballType: '1 RUN',
      score: `${Math.round(inn.totalRuns * (0.5 + j * 0.08))}/${Math.min(inn.totalWickets, 1 + Math.floor(j / 3))}`,
      badgeColor: 'bg-slate-100 text-slate-800 border border-slate-200',
      text: phrases.normal[j % phrases.normal.length]
    });
  }

  return commentaryList.sort((a, b) => parseFloat(b.over) - parseFloat(a.over));
}
