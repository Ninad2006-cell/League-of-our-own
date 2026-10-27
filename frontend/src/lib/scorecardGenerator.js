/**
 * Scorecard Generator & Analytics Engine
 * Generates mathematically consistent, high-fidelity cricket scorecards
 * (Batting, Bowling, Extras, Fall of Wickets, Head-to-Head Analytics)
 * tailored to each team's authentic squad and real match scores.
 */

import { getTeamRoster, getOpposingBowlers, getOpposingFielders } from './teamRosters';

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
  const roster = getTeamRoster(teamName, seedStr);

  if (!scoreObj || !scoreObj.hasScore) {
    return {
      hasScore: false,
      isProjected: true,
      teamName,
      squad: roster,
      totalRuns: 0,
      totalWickets: 0,
      overs: '0.0',
      crr: '0.00',
      batting: [],
      bowling: [],
      fallOfWickets: []
    };
  }

  const totalRuns = scoreObj.runs;
  const totalWickets = Math.min(10, Math.max(0, scoreObj.wickets));
  const oversNum = parseFloat(scoreObj.overs) || 20;

  // Retrieve opposing bowlers and fielders for authentic opposition actions
  const opposingBowlers = getOpposingBowlers(opposingTeamName, seedStr);
  const { keeper, fielders } = getOpposingFielders(opposingTeamName, seedStr);

  const seed = hashString(seedStr + teamName + opposingTeamName);

  // Allocate extras (typically 4-8% of total score)
  const extrasTotal = Math.min(Math.floor(totalRuns * 0.05) + 3, totalRuns);
  const batRunsPool = Math.max(0, totalRuns - extrasTotal);

  // Distribute runs among active batsmen using dynamic narrative patterns
  const activeBattersCount = Math.min(11, Math.max(2, totalWickets + 2));

  // Dynamic batting distribution patterns based on match seed
  const patternType = seed % 4;
  let rawWeights;
  if (patternType === 0) {
    // Top-order dominant (Openers flourish)
    rawWeights = [40, 30, 15, 8, 4, 2, 1, 1, 1, 1, 1];
  } else if (patternType === 1) {
    // Number 3 anchor century / high score
    rawWeights = [14, 16, 46, 12, 6, 3, 1, 1, 1, 1, 1];
  } else if (patternType === 2) {
    // Middle-order rescue (Top order collapsed)
    rawWeights = [6, 8, 12, 34, 26, 8, 4, 1, 1, 1, 1];
  } else {
    // Balanced contributions across the top 5
    rawWeights = [24, 22, 20, 18, 10, 4, 1, 1, 1, 1, 1];
  }

  const weightSlice = rawWeights.slice(0, activeBattersCount);
  const totalWeight = weightSlice.reduce((a, b) => a + b, 0);

  const batting = [];
  let allocatedRuns = 0;

  for (let i = 0; i < activeBattersCount; i++) {
    const player = roster[i % roster.length];
    const isDismissed = i < totalWickets;
    const baseShare = Math.round((weightSlice[i] / totalWeight) * batRunsPool);

    // Adjust last active batter so total runs match batRunsPool exactly
    let runs = baseShare;
    if (i === activeBattersCount - 1) {
      runs = Math.max(0, batRunsPool - allocatedRuns);
    } else {
      allocatedRuns += runs;
    }

    // Realistic ball count and boundaries based on match format
    const strikeRateTarget = matchType === 'test' ? 0.48 : matchType === 'odi' ? 0.88 : 1.38;
    const ballsVariation = ((seed + i * 7) % 7) - 3;
    const balls = runs === 0 
      ? (isDismissed ? Math.max(1, (seed + i) % 4) : 0) 
      : Math.max(runs > 10 ? Math.round(runs * 0.7) : 1, Math.round(runs / strikeRateTarget) + ballsVariation);

    const fours = Math.floor(runs / 14) + (runs > 25 ? ((seed + i) % 3) + 1 : 0);
    const sixes = matchType === 'test' ? (runs > 80 ? 1 : 0) : Math.floor(runs / 28) + (runs > 40 && (seed + i) % 2 === 0 ? 1 : 0);
    const sr = balls > 0 ? ((runs / balls) * 100).toFixed(1) : '0.0';

    // Authentic dismissals referencing the opposing team's actual bowlers & fielders
    let dismissal = 'not out';
    if (isDismissed) {
      const bowler = opposingBowlers[(seed + i) % opposingBowlers.length];
      const fielder = fielders[(seed + i * 2) % fielders.length];
      const dismissalStyles = [
        `c ${keeper} b ${bowler.name}`,
        `b ${bowler.name}`,
        `lbw b ${bowler.name}`,
        `c ${fielder} b ${bowler.name}`,
        `run out (${fielder})`,
        `c & b ${bowler.name}`,
        `st ${keeper} b ${bowler.name}`
      ];
      dismissal = dismissalStyles[(seed + i) % dismissalStyles.length];
    }

    batting.push({
      id: `bat-${i}`,
      name: player.name,
      role: player.role,
      style: player.style,
      captain: player.captain || false,
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

  // Bowling breakdown: 4 to 5 bowlers from the OPPOSING squad
  const bowlerCount = Math.min(5, opposingBowlers.length);
  const bowling = [];
  let allocatedWickets = 0;
  let allocatedBowlingRuns = 0;
  const bowlingRunsPool = Math.max(0, totalRuns - Math.floor(extrasTotal * 0.4));

  // Determine bowler wicket allocation
  const wktDistribution = [];
  let remainingWickets = totalWickets;
  for (let b = 0; b < bowlerCount; b++) {
    if (b === bowlerCount - 1) {
      wktDistribution.push(remainingWickets);
    } else {
      const take = Math.min(remainingWickets, Math.floor(((seed + b * 3) % 3)));
      wktDistribution.push(take);
      remainingWickets -= take;
    }
  }

  for (let b = 0; b < bowlerCount; b++) {
    const bowlerPlayer = opposingBowlers[b % opposingBowlers.length];
    const w = wktDistribution[b];
    allocatedWickets += w;

    // Conceded runs distribution
    let r = Math.round((bowlingRunsPool / bowlerCount) * (0.8 + ((seed + b * 2) % 5) * 0.1));
    if (b === bowlerCount - 1) {
      r = Math.max(0, bowlingRunsPool - allocatedBowlingRuns);
    } else {
      allocatedBowlingRuns += r;
    }

    const o = (oversNum / bowlerCount).toFixed(1);
    const m = matchType === 'test' ? Math.floor(parseFloat(o) * 0.2) : (seed + b) % 3 === 0 ? 1 : 0;
    const eco = parseFloat(o) > 0 ? (r / parseFloat(o)).toFixed(2) : '0.00';

    bowling.push({
      id: `bowl-${b}`,
      name: bowlerPlayer.name,
      role: bowlerPlayer.role,
      style: bowlerPlayer.style,
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

  // Current Run rate
  const crr = oversNum > 0 ? (totalRuns / oversNum).toFixed(2) : '0.00';

  return {
    hasScore: true,
    isProjected: false,
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

  const inn1 = generateInningsDetails(t1Name, score1, t2Name, match.matchType, (match.id || 'm') + '-inn1');
  const inn2 = generateInningsDetails(t2Name, score2, t1Name, match.matchType, (match.id || 'm') + '-inn2');

  // Boundaries calculation
  const inn1Fours = inn1 && inn1.hasScore ? inn1.batting.reduce((acc, b) => acc + b.fours, 0) : 0;
  const inn1Sixes = inn1 && inn1.hasScore ? inn1.batting.reduce((acc, b) => acc + b.sixes, 0) : 0;
  const inn2Fours = inn2 && inn2.hasScore ? inn2.batting.reduce((acc, b) => acc + b.fours, 0) : 0;
  const inn2Sixes = inn2 && inn2.hasScore ? inn2.batting.reduce((acc, b) => acc + b.sixes, 0) : 0;

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
      squad: getTeamRoster(t1Name, match.id),
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
      squad: getTeamRoster(t2Name, match.id),
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
  if (status.includes('won by') || status.includes('win by') || status.includes('beat')) {
    if (status.includes(t1Name.toLowerCase()) || status.includes(analytics.team1.code.toLowerCase())) {
      return { team1: 100, team2: 0, leader: `${t1Name} Won`, completed: true };
    }
    if (status.includes(t2Name.toLowerCase()) || status.includes(analytics.team2.code.toLowerCase())) {
      return { team1: 0, team2: 100, leader: `${t2Name} Won`, completed: true };
    }
  }

  const inn1 = analytics.team1.innings?.hasScore ? analytics.team1.innings : null;
  const inn2 = analytics.team2.innings?.hasScore ? analytics.team2.innings : null;

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

  if (analytics.team1.innings?.hasScore) {
    analytics.team1.innings.batting.forEach(b => allBatters.push({ ...b, team: analytics.team1.name }));
    analytics.team1.innings.bowling.forEach(b => allBowlers.push({ ...b, team: analytics.team2.name }));
  }
  if (analytics.team2.innings?.hasScore) {
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

  const inn = (analytics.team2.innings?.hasScore ? analytics.team2.innings : null) || 
              (analytics.team1.innings?.hasScore ? analytics.team1.innings : null);
  if (!inn || !inn.hasScore) return [];

  const battingTeam = inn.teamName;
  const opposingTeam = battingTeam === analytics.team1.name ? analytics.team2.name : analytics.team1.name;
  const opposingBowlers = inn.bowling || [];

  const commentaryList = [];
  const baseOver = parseFloat(inn.overs) || 20;

  // Wicket deliveries from fall of wickets with actual dismissed player
  if (inn.fallOfWickets && inn.fallOfWickets.length > 0) {
    inn.fallOfWickets.forEach((fow, idx) => {
      const strikeBowler = opposingBowlers[idx % opposingBowlers.length]?.name || 'the bowler';
      const wicketTexts = [
        `OUT! Clean bowled by ${strikeBowler}! What a peach of a delivery, nipping back in off the seam! ${fow.player} walks back to the pavilion.`,
        `OUT! Caught! ${strikeBowler} induces a loose drive outside off stump, safe hands taken in the field! Big wicket of ${fow.player}!`,
        `OUT! Trapped LBW by ${strikeBowler}! Roaring appeal and the umpire raises the finger! ${fow.player} departs.`,
        `OUT! Edged and taken! ${strikeBowler} finds the edge with extra bounce! Breakthrough for ${opposingTeam}!`
      ];

      commentaryList.push({
        id: `comm-wkt-${idx}`,
        over: fow.over,
        ballType: 'WICKET',
        score: fow.score,
        badgeColor: 'bg-rose-500 text-white',
        text: wicketTexts[idx % wicketTexts.length]
      });
    });
  }

  // Boundary balls with actual batters
  const leadBatter = inn.batting[0]?.name || 'The batter';
  const secondBatter = inn.batting[1]?.name || 'The non-striker';

  for (let i = 0; i < Math.min(8, inn.batting[0]?.fours || 5); i++) {
    const overTime = (Math.max(1, baseOver - (i * 3.5))).toFixed(1);
    const isSix = i % 3 === 0;
    const currentStriker = i % 2 === 0 ? leadBatter : secondBatter;

    const fourTexts = [
      `FOUR! Glorious shot from ${currentStriker}! Leans onto the front foot and punches it through covers with immaculate timing.`,
      `FOUR! Pulled away with authority by ${currentStriker}! Short delivery dispatched into the gap at deep midwicket.`,
      `FOUR! Exquisite timing! ${currentStriker} opens the face of the blade and steers it past backward point to the boundary fence.`
    ];

    const sixTexts = [
      `SIX! Massive hit from ${currentStriker}! Skips down the track and launches it high over long-on into the crowd!`,
      `SIX! Smoked into the stands! Clean swing of the bat from ${currentStriker} and that sails 88 meters beyond the ropes!`
    ];

    commentaryList.push({
      id: `comm-bdry-${i}`,
      over: overTime,
      ballType: isSix ? 'SIX' : 'FOUR',
      score: `${Math.round(inn.totalRuns * (0.35 + i * 0.08))}/${Math.min(inn.totalWickets, Math.floor(i / 2))}`,
      badgeColor: isSix ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white',
      text: isSix ? sixTexts[i % sixTexts.length] : fourTexts[i % fourTexts.length]
    });
  }

  // Regular running deliveries
  const singleTexts = [
    `Good length delivery on off stump, guided softly into the gap for a quick single.`,
    `Slower cutter on middle, pushed gently down to long-on to rotate the strike.`,
    `Well bowled outside off, beaten by the seam movement as the ball whistles through to the keeper.`,
    `Tossed up outside off stump, driven crisply to deep sweeper cover for one run.`
  ];

  for (let j = 0; j < 6; j++) {
    const overTime = (Math.max(0.1, baseOver - (j * 1.8))).toFixed(1);
    commentaryList.push({
      id: `comm-norm-${j}`,
      over: overTime,
      ballType: '1 RUN',
      score: `${Math.round(inn.totalRuns * (0.5 + j * 0.08))}/${Math.min(inn.totalWickets, 1 + Math.floor(j / 3))}`,
      badgeColor: 'bg-slate-100 text-slate-800 border border-slate-200',
      text: singleTexts[j % singleTexts.length]
    });
  }

  return commentaryList.sort((a, b) => parseFloat(b.over) - parseFloat(a.over));
}
