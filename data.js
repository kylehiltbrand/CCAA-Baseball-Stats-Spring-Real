// ============================================================
// CCAA Baseball 2025-26 — data.js
// ============================================================
// THIS IS THE ONLY FILE YOU NEED TO UPDATE EACH WEEK.
//
// To update stats:
//   1. Upload new MaxPreps PDFs to Claude
//   2. Claude replaces the batters[] and pitchers[] arrays below
//   3. Also update team records in the standings/teams objects if needed
//   4. Replace this file in GitHub → Vercel auto-deploys
//
// DO NOT edit stats.html, standings.html, teams.html, or index.html
// unless you're changing the site layout/design.
// ============================================================

// wOBA weights (standard)
const wBB = 0.69, wHBP = 0.72, w1B = 0.88, w2B = 1.24, w3B = 1.56, wHR = 2.00;

// ── CCAA League Constants (derived from 13-team 2025-26 data) ──
const LG_WOBA       = 0.358;  // CCAA league avg wOBA
const WOBA_SCALE    = 0.892;  // wOBA/lgOBP ratio for this run environment
const LG_R_PA       = 0.193;  // runs per PA (CCAA avg; MLB≈0.115)
const LG_ERA        = 4.44;   // CCAA league ERA
const RUNS_PER_WIN  = 6.0;    // scaled for HS run environment — produces meaningful WAR per short season
const REPL_RUNS_600 = -33.4;  // replacement-level runs per 600 PA (scaled)
const RAA_PER_600   = 95.1;   // runs above avg per 600 PA swing
// Regression anchors — full credibility at these thresholds
const WRC_FULL_PA   = 80;     // PA for full wRC+ credibility
const ERA_FULL_IP   = 40;     // IP for full ERA+ credibility
const REPL_WRC      = 65;     // wRC+ at replacement level — below this = negative oWAR
const WAR_FULL_PA   = 80;     // PA for full oWAR credibility
const WAR_FULL_IP   = 30;     // IP for full pWAR credibility

function calcWOBA(bb, hbp, h, doubles, triples, hr, ab, sf) {
  const singles = h - doubles - triples - hr;
  const num = wBB*bb + wHBP*hbp + w1B*singles + w2B*doubles + w3B*triples + wHR*hr;
  const den = ab + bb + (sf||0) + hbp;
  return den > 0 ? num / den : 0;
}

function calcWRC_plus(woba, pa) {
  if (!pa || pa < 10) return null;
  const wRC = ((woba - LG_WOBA) / WOBA_SCALE + LG_R_PA) * pa;
  const lgWRC = LG_R_PA * pa;
  const raw = lgWRC > 0 ? (wRC / lgWRC) * 100 : 100;
  // Asymmetric regression: above-avg → anchor 100, below-avg → anchor replacement level (65)
  // This lets poor hitters show negative WAR rather than getting pulled to average
  const weight = Math.min(pa / WRC_FULL_PA, 1.0);
  const anchor = raw >= 100 ? 100 : REPL_WRC;
  return Math.round(raw * weight + anchor * (1 - weight));
}

function calcOWAR(wRC_plus, pa) {
  if (wRC_plus === null || pa < 15) return null;
  const weight = Math.min(pa / WAR_FULL_PA, 1.0);
  // runs above average (negative if below-avg hitter)
  const raa = ((wRC_plus - 100) / 100) * (pa / 600) * RAA_PER_600;
  // runs above replacement (replacement is below average, so this adds value)
  const rar = raa - REPL_RUNS_600 * (pa / 600);
  const raw = rar / RUNS_PER_WIN;
  return Math.round(raw * weight * 10) / 10;
}

function calcKper9(k, ip) {
  return ip > 0 ? Math.round((k / ip) * 9 * 10) / 10 : null;
}

function calcKBB(k, bb) {
  return bb > 0 ? Math.round((k / bb) * 100) / 100 : null;
}

function calcERA_plus(era, ip) {
  if (!era || era <= 0 || !ip) return null;
  const raw = (LG_ERA / era) * 100;
  // Regress toward 100 for small IP samples
  const weight = Math.min(ip / ERA_FULL_IP, 1.0);
  return Math.round(raw * weight + 100 * (1 - weight));
}

function calcPWAR(era, ip) {
  if (ip < 5) return null;
  const weight = Math.min(ip / WAR_FULL_IP, 1.0);
  const raa = (LG_ERA - era) / 9 * ip;
  const rar = raa + (0.03 * ip); // replacement bump
  const raw = rar / RUNS_PER_WIN;
  return Math.round(raw * weight * 10) / 10;
}

function calcBBK(bb, k) {
  return k > 0 ? Math.round((bb / k) * 100) / 100 : null;
}

// ===================== TEAMS =====================
const teams = [
  {
    id: "st-joseph",
    name: "St. Joseph",
    mascot: "Knights",
    location: "Santa Maria, CA",
    coach: "Tino Estrada",
    colors: "Black, Green, Yellow",
    league: "CCAA - Mountain",
    overall: "13-4-1",
    leagueRecord: "6-1",
    wins: 13, losses: 4, ties: 1,
    leagueWins: 6, leagueLosses: 1,
    caRank: 34,
    gp: 18,
    teamBavg: .279, teamOBP: .400, teamSLG: .389,
    teamERA: 2.72, teamIP: 121
  },
  {
    id: "arroyo-grande",
    name: "Arroyo Grande",
    mascot: "Eagles",
    location: "Arroyo Grande, CA",
    coach: "N/A",
    colors: "Blue, Gold",
    league: "CCAA - Mountain",
    overall: "14-4",
    leagueRecord: "5-2",
    wins: 14, losses: 4, ties: 0,
    leagueWins: 5, leagueLosses: 2,
    caRank: 54,
    gp: 18,
    teamBavg: .360, teamOBP: .444, teamSLG: .523,
    teamERA: 1.75, teamIP: 116
  },
  {
    id: "santa-ynez",
    name: "Santa Ynez",
    mascot: "Pirates",
    location: "Santa Ynez, CA",
    coach: "Craig Gladstone",
    colors: "Orange, Black",
    league: "CCAA - Ocean",
    overall: "11-3",
    leagueRecord: "2-1",
    wins: 11, losses: 3, ties: 0,
    leagueWins: 2, leagueLosses: 1,
    caRank: 388,
    gp: 14,
    teamBavg: .384, teamOBP: .486, teamSLG: .501,
    teamERA: 2.55, teamIP: 93.1
  },
  {
    id: "pioneer-valley",
    name: "Pioneer Valley",
    mascot: "Panthers",
    location: "Santa Maria, CA",
    coach: "Cody Smith",
    colors: "Teal, Black",
    league: "CCAA - Ocean",
    overall: "10-6-1",
    leagueRecord: "4-1",
    wins: 10, losses: 6, ties: 1,
    leagueWins: 4, leagueLosses: 1,
    caRank: 415,
    gp: 14,
    teamBavg: .281, teamOBP: .400, teamSLG: .348,
    teamERA: 2.61, teamIP: 94
  },
  {
    id: "nipomo",
    name: "Nipomo",
    mascot: "Titans",
    location: "Nipomo, CA",
    coach: "Caleb Buendia",
    colors: "Black, Cardinal, Silver",
    league: "CCAA - Ocean",
    overall: "9-7",
    leagueRecord: "2-1",
    wins: 9, losses: 7, ties: 0,
    leagueWins: 2, leagueLosses: 1,
    caRank: 406,
    gp: 16,
    teamBavg: .312, teamOBP: .393, teamSLG: .361,
    teamERA: 4.95, teamIP: 99
  },
  {
    id: "paso-robles",
    name: "Paso Robles",
    mascot: "Bearcats",
    location: "Paso Robles, CA",
    coach: "N/A",
    colors: "Crimson, White",
    league: "CCAA - Sunset",
    overall: "9-7-1",
    leagueRecord: "5-1",
    wins: 9, losses: 7, ties: 1,
    leagueWins: 5, leagueLosses: 1,
    caRank: 169,
    gp: 17,
    teamBavg: .327, teamOBP: .403, teamSLG: .447,
    teamERA: 2.60, teamIP: 99.2
  },
  {
    id: "slo",
    name: "San Luis Obispo",
    mascot: "Tigers",
    location: "San Luis Obispo, CA",
    coach: "Sean Gabriel",
    colors: "Black, Gold",
    league: "CCAA - Sunset",
    overall: "9-6",
    leagueRecord: "5-1",
    wins: 9, losses: 6, ties: 0,
    leagueWins: 5, leagueLosses: 1,
    caRank: 270,
    gp: 15,
    teamBavg: .293, teamOBP: .396, teamSLG: .375,
    teamERA: 3.63, teamIP: 106
  },
  {
    id: "righetti",
    name: "Righetti",
    mascot: "Warriors",
    location: "Santa Maria, CA",
    coach: "Kyle Tognazzini",
    colors: "Purple, Gold",
    league: "CCAA - Mountain",
    overall: "11-5",
    leagueRecord: "4-3",
    wins: 11, losses: 5, ties: 0,
    leagueWins: 4, leagueLosses: 3,
    caRank: 143,
    gp: 15,
    teamBavg: .358, teamOBP: .469, teamSLG: .509,
    teamERA: 3.29, teamIP: 95.2
  },
  {
    id: "morro-bay",
    name: "Morro Bay",
    mascot: "Pirates",
    location: "Morro Bay, CA",
    coach: "Jarred Zill",
    colors: "Royal Blue, White",
    league: "CCAA - Mountain",
    overall: "10-5",
    leagueRecord: "3-4",
    wins: 10, losses: 5, ties: 0,
    leagueWins: 3, leagueLosses: 4,
    caRank: 146,
    gp: 15,
    teamBavg: .298, teamOBP: .384, teamSLG: .411,
    teamERA: 4.19, teamIP: 97
  },
  {
    id: "lompoc",
    name: "Lompoc",
    mascot: "Braves",
    location: "Lompoc, CA",
    coach: "J. Carlson",
    colors: "Navy, Gold",
    league: "CCAA - Mountain",
    overall: "7-8",
    leagueRecord: "1-6",
    wins: 7, losses: 8, ties: 0,
    leagueWins: 1, leagueLosses: 6,
    caRank: 251,
    gp: null,
    teamBavg: null, teamOBP: null, teamSLG: null,
    teamERA: null, teamIP: null,
    noStats: true
  },
  {
    id: "templeton",
    name: "Templeton",
    mascot: "Eagles",
    location: "Templeton, CA",
    coach: "N/A",
    colors: "Green, Silver, White",
    league: "CCAA - Sunset",
    overall: "6-9",
    leagueRecord: "1-3",
    wins: 6, losses: 9, ties: 0,
    leagueWins: 1, leagueLosses: 3,
    caRank: 583,
    gp: 15,
    teamBavg: .271, teamOBP: .377, teamSLG: .348,
    teamERA: 4.09, teamIP: 101
  },
  {
    id: "mission-prep",
    name: "Mission College Prep",
    mascot: "Royals",
    location: "San Luis Obispo, CA",
    coach: "E. Stewart",
    colors: "Navy, White",
    league: "CCAA - Mountain",
    overall: "5-7",
    leagueRecord: "2-5",
    wins: 5, losses: 7, ties: 0,
    leagueWins: 2, leagueLosses: 5,
    caRank: 296,
    gp: null,
    teamBavg: null, teamOBP: null, teamSLG: null,
    teamERA: null, teamIP: null,
    noStats: true
  },
  {
    id: "atascadero",
    name: "Atascadero",
    mascot: "Greyhounds",
    location: "Atascadero, CA",
    coach: "Samm Spears",
    colors: "Orange, Gray",
    league: "CCAA - Sunset",
    overall: "5-11",
    leagueRecord: "2-4",
    wins: 5, losses: 11, ties: 0,
    leagueWins: 2, leagueLosses: 4,
    caRank: 608,
    gp: 16,
    teamBavg: .214, teamOBP: .382, teamSLG: .285,
    teamERA: 4.83, teamIP: 104.1
  },
  {
    id: "santa-maria",
    name: "Santa Maria",
    mascot: "Saints",
    location: "Santa Maria, CA",
    coach: "N/A",
    colors: "Red, White",
    league: "CCAA - Ocean",
    overall: "4-7",
    leagueRecord: "0-5",
    wins: 4, losses: 7, ties: 0,
    leagueWins: 0, leagueLosses: 5,
    caRank: 768,
    gp: 11,
    teamBavg: .309, teamOBP: .418, teamSLG: .349,
    teamERA: 4.47, teamIP: 72
  },
  {
    id: "cabrillo",
    name: "Cabrillo",
    mascot: "Conquistadores",
    location: "Lompoc, CA",
    coach: "Cole Osborne",
    colors: "Black, Gold, White",
    league: "CCAA - Sunset",
    overall: "3-14",
    leagueRecord: "1-5",
    wins: 3, losses: 14, ties: 0,
    leagueWins: 1, leagueLosses: 5,
    caRank: 729,
    gp: 17,
    teamBavg: .227, teamOBP: .314, teamSLG: .276,
    teamERA: 6.17, teamIP: 110
  }
];

// ===================== PLAYER STATS =====================
// Full batting and pitching rosters with advanced stat calculations

function buildBatter(team, name, year, gp, avg, pa, ab, r, h, rbi, doubles, triples, hr, bb, k, hbp, sf, obp, slg, ops) {
  const woba = calcWOBA(bb, hbp, h, doubles, triples, hr, ab, sf||0);
  const wrc = calcWRC_plus(woba, pa);
  const owar = calcOWAR(wrc, pa);
  const bbk = calcBBK(bb, k);
  return { team, name, year, gp, avg, pa, ab, r, h, rbi, doubles, triples, hr, bb, k, hbp, sf:sf||0, obp, slg, ops, woba: Math.round(woba*1000)/1000, wrc_plus: wrc, owar, bbk };
}

function buildPitcher(team, name, year, era, w, l, ip, h, r, er, bb, k, app) {
  const k9 = calcKper9(k, ip);
  const kbb = calcKBB(k, bb);
  const era_plus = calcERA_plus(era, ip);
  const pwar = calcPWAR(era, ip);
  // K% = K / estimated batters faced (K + (IP*~4.3 batters/inn approx))
  // Better: use actual BF proxy = AB_faced ≈ IP*3 + H + BB
  const bf_est = ip > 0 ? (ip * 3 + h + bb) : null;
  const kpct = bf_est && bf_est > 0 ? (k / bf_est) * 100 : null;
  return { team, name, year, era, w, l, ip, h, r, er, bb, k, app, k9, kbb, era_plus, pwar, kpct };
}

const batters = [
  // ARROYO GRANDE
  buildBatter("Arroyo Grande","A. Winter","Jr",16,.613,39,31,10,19,7,1,0,0,2,1,5,1,.667,.645,1.312),
  buildBatter("Arroyo Grande","R. Servin","Jr",18,.509,73,55,22,28,16,9,0,3,16,6,1,1,.616,.836,1.452),
  buildBatter("Arroyo Grande","O. King","Jr",10,.375,10,8,3,3,1,0,0,0,2,4,0,0,.500,.375,.875),
  buildBatter("Arroyo Grande","T. Bournonville","Sr",17,.370,62,54,13,20,17,1,0,4,4,7,3,1,.435,.611,1.046),
  buildBatter("Arroyo Grande","T. Kurth","Sr",15,.348,54,46,9,16,14,6,0,2,5,6,1,1,.415,.609,1.024),
  buildBatter("Arroyo Grande","C. Gotchal","Jr",16,.344,40,32,7,11,4,3,0,0,4,4,1,0,.432,.438,.870),
  buildBatter("Arroyo Grande","M. Richwine","Sr",16,.333,42,36,9,12,8,2,0,1,4,8,0,2,.400,.472,.872),
  buildBatter("Arroyo Grande","B. Paz","Fr",16,.344,36,32,9,11,11,2,0,3,3,9,0,1,.389,.688,1.076),
  buildBatter("Arroyo Grande","J. Stumph","Jr",15,.293,54,41,13,12,7,3,0,0,10,4,1,2,.442,.366,.808),
  buildBatter("Arroyo Grande","J. Kreowski","Sr",16,.314,40,35,9,11,7,2,0,1,5,8,0,0,.400,.457,.857),
  buildBatter("Arroyo Grande","T. Winterberg","Jr",14,.235,21,17,1,4,3,1,0,0,4,9,0,0,.381,.294,.675),
  buildBatter("Arroyo Grande","J. Ralph","Jr",18,.333,74,66,14,22,9,4,0,1,5,5,2,1,.392,.439,.831),
  buildBatter("Arroyo Grande","K. Warwick","Jr",13,.160,26,25,3,4,1,0,1,0,0,10,0,1,.160,.240,.400),
  buildBatter("Arroyo Grande","C. Jaynes","Jr",10,.357,17,14,7,5,4,0,0,0,2,4,1,0,.471,.357,.828),
  buildBatter("Arroyo Grande","R. Bronson","Sr",12,.318,25,22,3,7,6,0,0,1,2,5,0,1,.375,.455,.830),

  // ATASCADERO
  buildBatter("Atascadero","M. Cullen","Jr",10,.500,2,2,0,1,0,0,0,0,0,0,0,0,.500,.500,1.000),
  buildBatter("Atascadero","W. Witt","Sr",15,.275,61,40,14,11,5,4,0,1,20,14,1,0,.525,.450,.975),
  buildBatter("Atascadero","A. Donaldson","So",11,.217,33,23,4,5,1,0,0,0,8,8,1,0,.438,.217,.655),
  buildBatter("Atascadero","W. Litten","Sr",16,.340,60,47,7,16,14,4,1,0,6,10,7,0,.483,.468,.951),
  buildBatter("Atascadero","S. Ernst","Sr",11,.233,33,30,4,7,3,1,0,0,3,16,0,0,.303,.267,.570),
  buildBatter("Atascadero","D. Mitchell","Sr",11,.200,44,40,6,8,5,2,1,0,2,8,2,0,.273,.300,.573),
  buildBatter("Atascadero","E. Wanner","Sr",15,.158,58,38,10,6,5,0,0,0,14,5,2,3,.400,.158,.558),
  buildBatter("Atascadero","W. Azelton","So",16,.171,57,41,6,7,9,2,1,0,9,14,5,2,.368,.268,.636),
  buildBatter("Atascadero","M. Beck","Jr",16,.174,28,23,7,4,2,0,0,0,4,6,1,0,.321,.174,.495),
  buildBatter("Atascadero","J. Litten","So",16,.211,50,38,5,8,6,2,0,0,6,13,3,2,.347,.263,.610),
  buildBatter("Atascadero","M. Zepeda","Sr",16,.189,49,37,5,7,5,2,1,0,8,9,0,4,.333,.297,.630),
  buildBatter("Atascadero","R. Brown","Sr",12,.154,13,13,2,2,0,0,0,0,0,4,0,0,.154,.154,.308),
  buildBatter("Atascadero","V. Rivera","Sr",5,.250,5,4,1,1,1,0,0,0,1,2,0,0,.400,.250,.650),

  // CABRILLO
  buildBatter("Cabrillo","M. Koff","Sr",16,.351,46,37,8,13,5,5,0,0,4,3,2,0,.429,.486,.915),
  buildBatter("Cabrillo","J. Clark","So",16,.333,39,30,6,10,5,1,0,0,4,13,1,1,.417,.367,.784),
  buildBatter("Cabrillo","J. Low","Sr",15,.174,29,23,2,4,2,2,0,0,4,4,0,2,.345,.261,.606),
  buildBatter("Cabrillo","L. Vorce","Jr",12,.281,36,32,3,9,2,0,0,0,3,1,0,1,.343,.281,.624),
  buildBatter("Cabrillo","F. Lopez","Sr",17,.244,54,45,6,11,4,2,0,0,5,15,2,1,.340,.289,.629),
  buildBatter("Cabrillo","G. Barraza","Sr",17,.260,57,50,10,13,2,0,0,0,5,8,2,0,.351,.260,.611),
  buildBatter("Cabrillo","C. Powell","Jr",17,.208,59,53,9,11,3,4,0,0,6,7,0,0,.288,.283,.571),
  buildBatter("Cabrillo","F. Hernandez","Jr",17,.212,57,52,7,11,2,2,1,0,3,12,2,0,.281,.288,.569),
  buildBatter("Cabrillo","L. Ragoza","Jr",13,.188,19,16,2,3,0,0,0,0,2,7,1,0,.316,.188,.504),
  buildBatter("Cabrillo","C. Sunndeniyage","Jr",16,.154,28,26,0,4,0,0,0,0,1,7,0,1,.185,.154,.339),
  buildBatter("Cabrillo","I. Lopez","So",10,.042,29,24,1,1,2,0,0,0,3,6,1,1,.179,.042,.221),
  buildBatter("Cabrillo","A. Torres","Sr",9,.125,16,16,0,2,1,0,0,1,0,5,0,0,.125,.250,.375),

  // MORRO BAY
  buildBatter("Morro Bay","Q. Crotts","Sr",15,.476,57,42,23,20,14,6,1,4,8,5,7,0,.614,.952,1.566),
  buildBatter("Morro Bay","C. White","Sr",14,.463,60,41,13,19,18,2,0,2,7,2,0,12,.433,.659,1.092),
  buildBatter("Morro Bay","E. Brown","Sr",14,.432,37,37,10,16,7,0,0,0,0,0,0,0,.432,.432,.864),
  buildBatter("Morro Bay","C. Wilkinson","Sr",15,.400,55,45,10,18,12,6,1,0,10,9,0,0,.509,.578,1.087),
  buildBatter("Morro Bay","T. Gray","Sr",15,.318,51,44,5,14,8,3,0,0,2,7,4,1,.392,.386,.778),
  buildBatter("Morro Bay","J. Deovlet","So",15,.220,52,41,6,9,11,2,0,0,7,3,2,2,.346,.268,.614),
  buildBatter("Morro Bay","E. Davis","Sr",12,.200,38,35,6,7,5,2,0,0,2,8,0,1,.237,.257,.494),
  buildBatter("Morro Bay","C. Waldon","Jr",13,.125,45,40,6,5,3,0,0,0,3,10,2,0,.222,.125,.347),
  buildBatter("Morro Bay","J. Skaggs","Sr",12,.167,25,24,3,4,1,1,0,0,0,5,1,0,.200,.208,.408),

  // NIPOMO
  buildBatter("Nipomo","J. Anderson","Sr",5,.667,3,3,1,2,0,0,0,0,0,1,0,0,.667,.667,1.334),
  buildBatter("Nipomo","B. Hageman","So",15,.500,61,50,17,25,7,1,0,0,4,5,2,1,.544,.520,1.064),
  buildBatter("Nipomo","E. Silveira","Sr",15,.340,57,47,7,16,12,2,0,0,6,7,4,0,.456,.383,.839),
  buildBatter("Nipomo","G. Groshart","Sr",14,.353,56,51,6,18,24,7,0,0,3,4,1,1,.393,.490,.883),
  buildBatter("Nipomo","L. Hobbs","Sr",15,.347,61,49,23,17,4,1,0,0,3,2,8,1,.459,.367,.826),
  buildBatter("Nipomo","L. Hobbs","Fr",15,.268,50,41,5,11,8,2,0,0,7,4,1,0,.388,.317,.705),
  buildBatter("Nipomo","C. Moulden","So",15,.360,55,50,10,18,15,6,0,0,3,7,2,0,.418,.480,.898),
  buildBatter("Nipomo","E. Silveira","Sr",15,.279,45,43,6,12,6,1,0,0,1,5,0,1,.289,.302,.591),
  buildBatter("Nipomo","T. Oxley","Sr",14,.172,40,29,6,5,2,1,0,0,9,14,1,1,.375,.207,.582),
  buildBatter("Nipomo","T. Barr","Sr",12,.214,31,28,2,6,3,0,0,0,1,10,1,1,.258,.214,.472),
  buildBatter("Nipomo","H. Roesner","Jr",12,.167,14,12,4,2,1,0,0,0,2,4,0,0,.286,.167,.453),
  buildBatter("Nipomo","K. Simonson","So",13,.136,23,22,2,3,1,0,0,0,0,4,0,1,.130,.136,.266),
  buildBatter("Nipomo","A. Mendoza","Jr",9,.000,4,3,0,0,0,0,0,0,1,2,0,0,.250,.000,.250),
  buildBatter("Nipomo","J. Lanier","Sr",5,.000,2,2,1,0,0,0,0,0,0,1,0,0,.000,.000,.000),
  buildBatter("Nipomo","Z. Garibay","Sr",4,.000,1,1,0,0,0,0,0,0,0,1,0,0,.000,.000,.000),

  // PASO ROBLES
  buildBatter("Paso Robles","M. Garcia","Sr",15,.420,60,50,22,21,9,4,1,0,9,3,1,0,.517,.540,1.057),
  buildBatter("Paso Robles","B. Lowry","Jr",15,.426,59,47,13,20,18,3,1,0,9,7,0,3,.492,.532,1.024),
  buildBatter("Paso Robles","T. Freitas","Sr",15,.340,57,50,13,17,11,6,0,0,3,0,3,1,.404,.460,.864),
  buildBatter("Paso Robles","C. Prieto","Jr",15,.348,53,46,12,16,10,5,0,0,3,6,1,2,.385,.457,.842),
  buildBatter("Paso Robles","K. Magdaleno","Jr",7,.500,7,6,5,3,1,1,0,0,1,0,0,0,.571,.667,1.238),
  buildBatter("Paso Robles","E. Dobroth","Jr",15,.340,59,50,15,17,14,2,1,0,5,8,4,0,.441,.420,.861),
  buildBatter("Paso Robles","E. Rendon","So",14,.300,55,50,11,15,11,3,1,2,1,6,3,1,.345,.520,.865),
  buildBatter("Paso Robles","X. Hermanson","Jr",14,.300,46,40,7,12,10,5,0,0,4,5,1,0,.378,.425,.803),
  buildBatter("Paso Robles","J. Soboleski","Jr",15,.318,51,44,10,14,8,6,1,0,6,9,1,0,.412,.500,.912),
  buildBatter("Paso Robles","G. Berlingeri","Sr",2,.600,5,5,2,3,0,0,0,0,0,1,0,0,.600,.600,1.200),

  // PIONEER VALLEY
  buildBatter("Pioneer Valley","I. Enriquez","Jr",13,.514,49,37,13,19,15,2,0,1,8,3,3,1,.612,.649,1.261),
  buildBatter("Pioneer Valley","K. Milner","Jr",11,.515,41,33,6,17,14,5,0,1,7,5,1,0,.610,.758,1.368),
  buildBatter("Pioneer Valley","L. Dreier","Jr",8,.375,12,8,4,3,1,0,0,0,3,1,1,0,.583,.375,.958),
  buildBatter("Pioneer Valley","D. Cortez","So",14,.311,55,45,12,14,7,6,0,0,10,9,0,0,.436,.444,.880),
  buildBatter("Pioneer Valley","M. Rosas","Sr",12,.323,39,31,7,10,3,1,0,0,4,8,3,1,.447,.355,.802),
  buildBatter("Pioneer Valley","I. Martinez","Sr",9,.231,17,13,2,3,3,0,0,0,4,4,1,0,.412,.231,.643),
  buildBatter("Pioneer Valley","I. Garcia","Jr",7,.400,5,5,2,2,1,0,0,0,0,0,0,0,.400,.400,.800),
  buildBatter("Pioneer Valley","U. Ponce","Jr",13,.200,38,35,6,7,4,1,0,0,1,16,1,1,.243,.229,.472),
  buildBatter("Pioneer Valley","E. Ponce","Sr",14,.267,57,45,19,12,1,1,0,1,7,5,4,1,.411,.311,.722),
  buildBatter("Pioneer Valley","J. Lopez","Sr",14,.167,46,42,6,7,7,1,0,1,2,12,1,2,.205,.214,.419),
  buildBatter("Pioneer Valley","K. Owen","Sr",11,.167,35,30,2,5,2,0,0,0,2,4,2,1,.257,.167,.424),
  buildBatter("Pioneer Valley","J. Medina","Jr",8,.182,14,11,1,2,2,0,0,0,2,6,0,1,.308,.182,.490),
  buildBatter("Pioneer Valley","J. Valdez","Jr",10,.182,14,11,4,2,0,0,0,0,2,4,1,0,.357,.182,.539),
  buildBatter("Pioneer Valley","M. Andrade","Jr",11,.091,31,22,4,2,4,0,0,0,7,8,0,2,.310,.091,.401),

  // RIGHETTI
  buildBatter("Righetti","K. Walker","Jr",15,.531,56,49,19,26,16,8,0,3,6,3,0,1,.571,.878,1.449),
  buildBatter("Righetti","G. Cole","So",15,.435,57,46,16,20,5,3,0,0,7,7,0,1,.500,.500,1.000),
  buildBatter("Righetti","N. Kesner","Sr",15,.462,55,39,14,18,13,2,1,0,13,9,1,1,.593,.564,1.157),
  buildBatter("Righetti","N. Roberts","Sr",15,.439,55,41,13,18,15,4,1,1,11,4,1,2,.545,.659,1.204),
  buildBatter("Righetti","M. Villegas","So",12,.333,33,24,8,8,6,1,1,1,9,12,0,0,.515,.583,1.098),
  buildBatter("Righetti","M. Anderson","Sr",15,.364,62,55,12,20,8,1,0,1,5,8,2,0,.435,.436,.871),
  buildBatter("Righetti","Z. Andersen","So",14,.242,45,33,5,8,10,3,0,3,9,11,2,1,.432,.606,1.038),
  buildBatter("Righetti","N. Verduzco","So",15,.250,48,36,11,9,6,1,0,0,10,8,0,2,.413,.278,.691),
  buildBatter("Righetti","D. Nevarez","Sr",15,.211,47,38,5,8,9,3,0,0,6,11,3,0,.362,.289,.651),
  buildBatter("Righetti","M. Andersen","Jr",9,.273,13,11,2,3,2,1,0,0,1,2,0,1,.333,.364,.697),

  // SAN LUIS OBISPO
  buildBatter("San Luis Obispo","J. Riley","Jr",15,.458,59,48,6,22,10,2,0,0,9,6,1,1,.542,.500,1.042),
  buildBatter("San Luis Obispo","J. Goodwin","Sr",15,.341,53,44,10,15,10,1,0,0,4,11,4,1,.442,.364,.806),
  buildBatter("San Luis Obispo","J. Taylor","Sr",14,.258,36,31,5,8,7,1,0,2,5,9,0,0,.361,.484,.845),
  buildBatter("San Luis Obispo","L. Drenckpohl","Sr",15,.321,59,53,9,17,9,3,1,0,5,10,0,0,.379,.415,.794),
  buildBatter("San Luis Obispo","C. Stephens","Jr",15,.319,56,47,11,15,9,3,1,0,9,8,0,0,.429,.426,.855),
  buildBatter("San Luis Obispo","T. Blaney","So",15,.303,42,33,10,10,4,2,0,1,9,8,0,0,.452,.455,.907),
  buildBatter("San Luis Obispo","G. Bramble","Sr",15,.263,62,57,13,15,9,5,0,1,5,11,0,0,.323,.404,.727),
  buildBatter("San Luis Obispo","P. Wyatt","Jr",15,.213,58,47,9,10,9,1,0,0,6,4,3,1,.333,.234,.567),

  // SANTA MARIA
  buildBatter("Santa Maria","O. Sedano","So",2,1.000,3,2,1,2,2,0,0,0,1,0,0,0,1.000,1.000,2.000),
  buildBatter("Santa Maria","B. Alejo","Jr",11,.421,42,38,5,16,11,3,0,0,0,3,4,0,.476,.500,.976),
  buildBatter("Santa Maria","J. Calderon","Sr",11,.432,42,37,7,16,6,0,0,0,2,2,1,1,.463,.432,.895),
  buildBatter("Santa Maria","J. Medina","Sr",11,.375,43,32,13,12,5,1,0,0,11,7,0,0,.535,.406,.941),
  buildBatter("Santa Maria","D. Martin","Sr",11,.324,43,34,12,11,6,3,0,0,7,3,2,0,.465,.412,.877),
  buildBatter("Santa Maria","A. Ybarra","Sr",11,.281,40,32,5,9,5,2,0,0,7,7,1,0,.425,.344,.769),
  buildBatter("Santa Maria","A. Rice","So",11,.306,40,36,6,11,9,0,0,0,2,5,2,0,.375,.306,.681),
  buildBatter("Santa Maria","A. Rice","Fr",10,.240,28,25,3,6,7,2,0,0,3,6,0,0,.321,.320,.641),
  buildBatter("Santa Maria","J. Medina","Sr",11,.235,38,34,5,8,5,1,0,0,4,8,0,0,.316,.265,.581),

  // SANTA YNEZ
  buildBatter("Santa Ynez","J. Glover","Jr",14,.483,63,58,20,28,26,4,2,2,3,8,1,1,.508,.724,1.232),
  buildBatter("Santa Ynez","K. Heiduk","So",14,.449,61,49,22,22,13,3,1,0,11,10,1,0,.557,.551,1.108),
  buildBatter("Santa Ynez","D. Pulido","Sr",14,.413,62,46,21,19,15,5,0,1,11,4,4,1,.548,.587,1.135),
  buildBatter("Santa Ynez","D. Aquistapace","Sr",14,.386,61,44,17,17,13,6,1,0,13,5,4,0,.557,.568,1.125),
  buildBatter("Santa Ynez","E. Roberts","So",13,.425,50,40,11,17,11,6,0,0,7,8,2,1,.520,.575,1.095),
  buildBatter("Santa Ynez","B. Cram","So",14,.386,53,44,15,17,6,0,0,0,7,6,1,0,.481,.386,.867),
  buildBatter("Santa Ynez","T. Jeckell","Jr",14,.413,50,46,17,19,17,5,0,0,4,2,0,0,.460,.522,.982),
  buildBatter("Santa Ynez","M. Skidmore","Sr",14,.304,63,56,19,17,12,5,0,0,5,10,1,0,.371,.393,.764),
  buildBatter("Santa Ynez","S. Rhea","Jr",14,.286,54,42,14,12,10,1,0,0,5,11,4,1,.404,.310,.714),

  // ST. JOSEPH
  buildBatter("St. Joseph","A. Bluem","Jr",18,.468,72,62,26,29,14,7,0,5,7,2,3,0,.542,.823,1.365),
  buildBatter("St. Joseph","E. Hendricks","So",14,.353,23,17,10,6,0,1,0,0,6,1,0,0,.522,.412,.934),
  buildBatter("St. Joseph","C. Chanley","Sr",18,.353,69,51,13,18,11,4,1,1,7,1,9,2,.493,.529,1.022),
  buildBatter("St. Joseph","L. Woodruff","So",16,.294,38,34,6,10,14,3,0,1,2,9,1,0,.351,.471,.822),
  buildBatter("St. Joseph","C. Goncalves","Jr",18,.321,64,53,9,17,16,3,0,0,5,10,4,2,.406,.377,.783),
  buildBatter("St. Joseph","M. Majewski","Jr",17,.256,49,39,7,10,7,3,0,0,8,9,2,0,.408,.333,.741),
  buildBatter("St. Joseph","M. O'Keefe","Jr",16,.273,42,33,5,9,7,1,0,1,7,9,1,1,.405,.394,.799),
  buildBatter("St. Joseph","S. Covarrubias","Sr",16,.140,62,43,15,6,1,1,0,0,17,12,1,0,.393,.163,.556),
  buildBatter("St. Joseph","M. Kon","Sr",11,.321,34,28,1,9,8,0,0,0,4,5,1,1,.412,.321,.733),
  buildBatter("St. Joseph","X. Horta","So",17,.190,53,42,3,8,7,1,0,0,6,7,0,3,.275,.214,.489),
  buildBatter("St. Joseph","R. Roemling","Sr",14,.148,34,27,2,4,0,1,0,0,5,7,1,1,.303,.185,.488),

  // TEMPLETON
  buildBatter("Templeton","L. Stetz","Sr",13,.409,50,44,10,18,8,3,3,0,3,6,3,0,.480,.614,1.094),
  buildBatter("Templeton","C. Sims","Jr",14,.400,55,50,14,20,3,1,1,0,2,6,3,0,.455,.460,.915),
  buildBatter("Templeton","L. Rivera","Jr",14,.319,57,47,11,15,11,1,0,0,6,6,1,2,.393,.340,.733),
  buildBatter("Templeton","N. Argain","Sr",12,.273,24,22,3,6,3,1,0,0,1,4,0,0,.304,.318,.622),
  buildBatter("Templeton","W. Patch","Sr",7,.273,13,11,3,3,1,1,0,0,2,4,0,0,.385,.364,.749),
  buildBatter("Templeton","L. Olsen","Sr",15,.244,61,45,14,11,4,5,0,0,13,11,3,0,.443,.356,.799),
  buildBatter("Templeton","J. Beckwith","So",15,.250,42,32,6,8,7,1,0,0,6,8,1,0,.385,.281,.666),
  buildBatter("Templeton","N. Capaci","Jr",14,.258,38,31,4,8,3,1,0,0,5,15,1,1,.368,.290,.658),
  buildBatter("Templeton","R. Garcia","Jr",13,.240,27,25,4,6,3,0,1,1,2,8,0,0,.296,.440,.736),
  buildBatter("Templeton","C. Hamilton","So",14,.207,40,29,3,6,6,1,0,0,8,14,2,1,.400,.241,.641),

  // MISSION COLLEGE PREP
  buildBatter("Mission College Prep","A. Johnson","Jr",9,0.520,31,25,5,13,8,3,0,0,4,0,0,1,0.567,0.640,1.207),
  buildBatter("Mission College Prep","R. Engle","So",12,0.400,47,40,10,16,9,4,0,2,4,10,1,0,0.467,0.650,1.117),
  buildBatter("Mission College Prep","H. Drake","Sr",12,0.381,50,42,9,16,3,2,0,0,8,4,0,0,0.480,0.429,0.909),
  buildBatter("Mission College Prep","J. Villa","Sr",12,0.375,52,48,12,18,5,2,0,0,2,5,1,1,0.404,0.417,0.821),
  buildBatter("Mission College Prep","B. Augustine","Jr",7,0.333,9,9,0,3,2,0,1,0,0,2,0,0,0.333,0.556,0.889),
  buildBatter("Mission College Prep","N. Bender","So",2,0.333,3,3,1,1,4,0,0,1,0,0,0,0,0.333,1.333,1.667),
  buildBatter("Mission College Prep","T. Bernal","Jr",6,0.316,21,19,4,6,5,0,0,1,2,3,0,0,0.381,0.474,0.855),
  buildBatter("Mission College Prep","C. Mott","Jr",11,0.269,33,26,5,7,1,3,0,0,5,4,0,0,0.387,0.385,0.772),
  buildBatter("Mission College Prep","J. Esparza","Jr",12,0.268,46,41,6,11,10,2,0,0,3,3,0,0,0.318,0.317,0.635),
  buildBatter("Mission College Prep","B. May","Jr",10,0.238,26,21,3,5,2,1,0,1,4,8,1,0,0.385,0.429,0.813),
  buildBatter("Mission College Prep","J. Cortez","Sr",11,0.226,39,31,4,7,2,1,0,0,7,14,1,0,0.385,0.258,0.643),
  buildBatter("Mission College Prep","B. Orfila","Jr",10,0.208,29,24,3,5,5,2,0,1,4,6,0,0,0.321,0.417,0.738),
  buildBatter("Mission College Prep","C. Treanor","Jr",4,0.000,8,7,2,0,0,0,0,0,1,1,0,0,0.125,0.000,0.125),
  buildBatter("Mission College Prep","B. Burt","Jr",4,0.000,4,4,0,0,0,0,0,0,0,2,0,0,0.000,0.000,0.000),
  buildBatter("Mission College Prep","J. Marsalek","So",2,0.000,5,5,0,0,0,0,0,0,0,3,0,0,0.000,0.000,0.000),
  buildBatter("Mission College Prep","R. Cordova","So",1,0.000,1,1,0,0,0,0,0,0,0,1,0,0,0.000,0.000,0.000),
  buildBatter("Mission College Prep","E. Engle","Jr",6,0.000,5,4,2,0,0,0,0,0,1,1,0,0,0.200,0.000,0.200),
];

const pitchers = [
  // ARROYO GRANDE
  buildPitcher("Arroyo Grande","T. Winterberg","Jr",0.88,0,0,24,13,6,3,4,23,5),
  buildPitcher("Arroyo Grande","Z. Johnson","Jr",0.40,0,0,17.2,9,4,1,6,9,8),
  buildPitcher("Arroyo Grande","G. Pope","Sr",1.12,0,0,25,14,9,4,9,18,7),
  buildPitcher("Arroyo Grande","M. Hicks","Sr",0.00,0,0,3.1,4,0,0,2,4,3),
  buildPitcher("Arroyo Grande","O. King","Jr",2.62,0,0,8,8,5,3,4,11,4),
  buildPitcher("Arroyo Grande","T. Bournonville","Sr",2.55,0,0,22,12,8,8,8,17,6),
  buildPitcher("Arroyo Grande","J. Kreowski","Sr",3.50,0,0,16,15,15,8,13,8,5),
  buildPitcher("Arroyo Grande","R. Bronson","Sr",0.00,0,0,0,2,2,1,0,0,1),

  // ATASCADERO
  buildPitcher("Atascadero","W. Azelton","So",3.09,2,2,31.2,38,20,14,9,29,8),
  buildPitcher("Atascadero","W. Witt","Sr",4.15,1,3,27,29,23,16,15,17,9),
  buildPitcher("Atascadero","D. Mitchell","Sr",4.73,1,2,13.1,21,16,9,4,7,4),
  buildPitcher("Atascadero","J. Litten","So",1.40,0,0,5,4,1,1,3,5,2),
  buildPitcher("Atascadero","M. Cullen","Jr",9.00,0,0,9.1,15,14,12,5,6,9),
  buildPitcher("Atascadero","C. Knoph","Jr",8.84,0,2,6.1,7,8,8,7,3,4),
  buildPitcher("Atascadero","A. Madrigal","Sr",8.75,1,1,8,9,12,10,10,4,5),
  buildPitcher("Atascadero","V. Rivera","Sr",7.64,0,0,3.2,6,4,4,3,2,3),

  // CABRILLO
  buildPitcher("Cabrillo","J. Low","Sr",4.20,2,5,33.1,26,26,20,17,25,8),
  buildPitcher("Cabrillo","J. Heidt","Jr",6.10,1,1,10.1,16,12,9,3,2,4),
  buildPitcher("Cabrillo","C. Powell","Jr",6.12,0,1,16,23,18,14,4,9,6),
  buildPitcher("Cabrillo","J. Clark","So",3.59,0,0,13.2,15,11,7,8,13,7),
  buildPitcher("Cabrillo","F. Lopez","Sr",7.45,0,5,20.2,28,35,22,25,11,7),
  buildPitcher("Cabrillo","M. Koff","Sr",9.33,0,0,9,14,13,12,9,12,7),
  buildPitcher("Cabrillo","I. Lopez","So",10.50,0,1,6,12,13,9,4,5,3),
  buildPitcher("Cabrillo","L. Vorce","Jr",28.00,0,1,1,1,5,4,5,0,1),

  // MORRO BAY
  buildPitcher("Morro Bay","E. Brown","Sr",2.96,3,2,28.1,28,15,12,8,30,9),
  buildPitcher("Morro Bay","C. Wilkinson","Sr",2.43,3,1,23,19,13,8,5,21,7),
  buildPitcher("Morro Bay","E. Davis","Sr",6.30,3,2,20,26,22,18,10,10,6),
  buildPitcher("Morro Bay","C. White","Sr",5.79,1,0,9.2,12,8,8,2,9,7),
  buildPitcher("Morro Bay","Q. Crotts","Sr",0.00,0,0,2,0,0,0,0,3,1),
  buildPitcher("Morro Bay","J. Skaggs","Sr",2.33,0,0,3,2,1,1,2,1,2),

  // NIPOMO
  buildPitcher("Nipomo","E. Silveira","Sr",2.79,5,2,32.2,23,22,13,20,34,8),
  buildPitcher("Nipomo","E. Silveira","Sr",4.82,2,1,20.1,21,23,14,18,25,7),
  buildPitcher("Nipomo","A. Mendoza","Jr",6.50,0,1,14,17,14,13,12,10,7),
  buildPitcher("Nipomo","G. Groshart","Sr",4.74,0,1,10.1,10,12,7,11,11,4),
  buildPitcher("Nipomo","L. Hobbs","Sr",6.12,1,1,8,10,8,7,10,3,4),
  buildPitcher("Nipomo","K. Simonson","So",6.00,0,0,2.1,1,2,2,3,2,2),
  buildPitcher("Nipomo","L. Hobbs","Fr",5.60,0,0,5,13,4,4,4,1,3),
  buildPitcher("Nipomo","Z. Garibay","Sr",8.40,0,0,1.2,3,2,2,0,0,2),
  buildPitcher("Nipomo","F. Callaghan","Jr",5.25,0,0,4,5,3,3,4,3,2),

  // PASO ROBLES
  buildPitcher("Paso Robles","E. Rendon","So",1.50,4,0,23.1,9,6,5,27,43,8),
  buildPitcher("Paso Robles","M. Garcia","Sr",1.56,0,0,9,3,2,2,5,16,7),
  buildPitcher("Paso Robles","N. Contreras","Jr",2.24,2,1,25,25,15,8,9,26,6),
  buildPitcher("Paso Robles","T. Freitas","Sr",2.68,1,0,15.2,11,13,6,9,15,5),
  buildPitcher("Paso Robles","B. Lowry","Jr",5.83,0,0,12,12,13,10,4,16,6),
  buildPitcher("Paso Robles","S. Roby","Sr",4.90,0,0,10,12,9,7,6,6,4),

  // PIONEER VALLEY
  buildPitcher("Pioneer Valley","I. Garcia","Jr",0.54,2,0,13,7,2,1,3,8,4),
  buildPitcher("Pioneer Valley","J. Valdez","Jr",1.53,2,0,18.1,16,8,4,7,20,6),
  buildPitcher("Pioneer Valley","K. Owen","Sr",1.27,1,0,11,10,7,2,6,10,3),
  buildPitcher("Pioneer Valley","D. Cortez","So",1.91,1,0,7.1,8,5,2,4,7,6),
  buildPitcher("Pioneer Valley","M. Botello","Jr",0.00,0,0,2,3,0,0,0,2,2),
  buildPitcher("Pioneer Valley","J. Beltran","Jr",2.75,3,1,20.1,22,12,8,7,15,7),
  buildPitcher("Pioneer Valley","J. Rojas","Sr",3.65,1,1,15.1,12,9,8,5,12,5),
  buildPitcher("Pioneer Valley","I. Martinez","Sr",3.82,0,1,3.2,8,8,2,3,2,2),
  buildPitcher("Pioneer Valley","J. Medina","Jr",14.00,0,1,1,2,2,2,1,3,1),
  buildPitcher("Pioneer Valley","J. Lopez","Sr",21.00,0,0,2,6,8,6,2,3,1),

  // RIGHETTI
  buildPitcher("Righetti","I. Rocha","So",2.05,3,1,27.1,32,9,8,8,19,5),
  buildPitcher("Righetti","K. Walker","Jr",2.33,2,0,12,11,7,4,4,11,4),
  buildPitcher("Righetti","G. Rodriguez","Sr",3.69,2,0,24.2,23,17,13,9,10,9),
  buildPitcher("Righetti","M. Andersen","Jr",3.50,0,0,2,2,3,1,2,1,1),
  buildPitcher("Righetti","N. Lancor","Sr",3.92,3,2,19.2,19,15,11,10,14,8),
  buildPitcher("Righetti","E. Barcenas","Sr",7.00,0,0,2,0,2,2,3,3,1),
  buildPitcher("Righetti","G. Cole","So",10.50,0,1,4,7,6,6,4,4,2),

  // SAN LUIS OBISPO
  buildPitcher("San Luis Obispo","J. Riley","Jr",0.88,1,0,16,8,5,2,5,15,5),
  buildPitcher("San Luis Obispo","G. Bramble","Sr",3.54,5,1,29.2,29,18,15,10,19,6),
  buildPitcher("San Luis Obispo","J. Taylor","Sr",3.18,3,3,33,39,23,15,12,40,7),
  buildPitcher("San Luis Obispo","F. Avrett","Jr",4.38,0,1,16,24,20,10,7,16,6),
  buildPitcher("San Luis Obispo","D. Wilson","Jr",7.00,0,0,5,6,6,5,3,4,4),
  buildPitcher("San Luis Obispo","J. Giordano","Jr",0.00,0,0,3,3,3,0,1,0,4),

  // SANTA MARIA
  buildPitcher("Santa Maria","B. Alejo","Jr",0.88,0,0,8,4,1,1,1,5,3),
  buildPitcher("Santa Maria","A. Rice","Fr",2.10,0,0,3.1,5,4,1,3,2,2),
  buildPitcher("Santa Maria","D. Martin","Sr",4.50,0,0,23.1,32,16,15,6,30,6),
  buildPitcher("Santa Maria","J. Medina","Sr",4.96,0,0,18.1,21,23,13,22,31,8),
  buildPitcher("Santa Maria","J. Medina","Sr",6.42,0,0,12,17,11,11,11,15,5),
  buildPitcher("Santa Maria","U. Rodriguez","Fr",4.20,0,0,5,3,3,3,3,6,2),

  // SANTA YNEZ
  buildPitcher("Santa Ynez","C. Palmer","Jr",1.71,3,0,16.1,5,5,4,11,22,4),
  buildPitcher("Santa Ynez","K. Heiduk","So",1.83,1,0,7.2,5,2,2,4,9,6),
  buildPitcher("Santa Ynez","E. Roberts","So",2.03,2,0,20.2,21,6,6,5,29,6),
  buildPitcher("Santa Ynez","T. Jeckell","Jr",2.52,3,2,33.1,24,20,12,17,57,7),
  buildPitcher("Santa Ynez","J. Glover","Jr",3.36,0,0,8.1,8,7,4,7,16,4),
  buildPitcher("Santa Ynez","S. Rhea","Jr",4.67,0,0,3,1,2,2,4,4,2),

  // ST. JOSEPH
  buildPitcher("St. Joseph","A. Bluem","Jr",0.00,0,0,2,2,0,0,0,1,2),
  buildPitcher("St. Joseph","R. Aparicio","Sr",0.66,0,0,10.2,6,9,1,9,7,7),
  buildPitcher("St. Joseph","L. Woodruff","So",2.10,3,0,23.1,17,9,7,7,18,8),
  buildPitcher("St. Joseph","M. Majewski","Jr",3.13,4,2,31.1,32,21,14,8,41,7),
  buildPitcher("St. Joseph","X. Horta","So",2.30,3,1,21.1,15,10,7,7,21,5),
  buildPitcher("St. Joseph","C. Chanley","Sr",3.37,3,1,18.2,15,10,9,15,21,6),
  buildPitcher("St. Joseph","R. Roemling","Sr",2.62,0,0,8,8,5,3,4,10,5),
  buildPitcher("St. Joseph","M. O'Keefe","Jr",4.50,0,0,4.2,8,7,3,1,5,4),

  // TEMPLETON
  buildPitcher("Templeton","L. Olsen","Sr",0.00,1,0,5,1,0,0,3,3,2),
  buildPitcher("Templeton","W. Patch","Sr",0.95,1,0,7.1,7,3,1,7,9,3),
  buildPitcher("Templeton","A. Abatti","Jr",1.88,0,0,22.1,17,20,6,12,22,6),
  buildPitcher("Templeton","L. Rivera","Jr",4.20,2,0,25,34,21,15,16,20,6),
  buildPitcher("Templeton","R. Garcia","Jr",4.85,0,0,13,17,10,9,6,7,6),
  buildPitcher("Templeton","N. Argain","Sr",7.69,1,1,23.2,35,40,26,21,16,8),
  buildPitcher("Templeton","C. Sims","Jr",4.67,0,0,3,5,2,2,0,0,2),

  // MISSION COLLEGE PREP
  buildPitcher("Mission College Prep","H. Drake","Sr",4.38,2,1,8.0,6,0,5,7,4,5),
  buildPitcher("Mission College Prep","B. Augustine","Jr",1.97,2,1,10.2,13,0,3,6,8,5),
  buildPitcher("Mission College Prep","N. Bender","So",11.12,0,0,5.2,10,0,9,3,5,2),
  buildPitcher("Mission College Prep","T. Bernal","Jr",5.38,0,0,13.0,18,0,10,6,12,4),
  buildPitcher("Mission College Prep","C. Mott","Jr",10.50,0,0,2.0,3,0,3,1,1,1),
  buildPitcher("Mission College Prep","B. May","Jr",4.04,0,0,8.2,7,0,5,8,7,7),
  buildPitcher("Mission College Prep","J. Cortez","Sr",0.00,0,0,1.0,1,0,0,0,0,1),
  buildPitcher("Mission College Prep","B. Orfila","Jr",5.92,1,3,26.0,41,0,22,10,15,7),
  buildPitcher("Mission College Prep","C. Treanor","Jr",9.54,0,1,3.2,6,0,5,3,2,3),
  buildPitcher("Mission College Prep","B. Burt","Jr",16.80,0,1,3.1,8,0,8,4,1,2),
];

// ============================================================
// STANDINGS DATA — update W/L records each week
// ============================================================
const standingsData = {
  mountain: [
    { abbr:"SJ",  name:"St. Joseph",          lw:6, ll:1, ow:13, ol:4,  ot:1, str:"W2" },
    { abbr:"AG",  name:"Arroyo Grande",        lw:5, ll:2, ow:14, ol:4,  ot:0, str:"W3" },
    { abbr:"RHS", name:"Righetti",             lw:4, ll:3, ow:11, ol:5,  ot:0, str:"W4" },
    { abbr:"MB",  name:"Morro Bay",            lw:3, ll:4, ow:10, ol:5,  ot:0, str:"L2" },
    { abbr:"MP",  name:"Mission College Prep", lw:2, ll:5, ow:5,  ol:7,  ot:0, str:"L3" },
    { abbr:"LOM", name:"Lompoc",               lw:1, ll:6, ow:7,  ol:8,  ot:0, str:"L5" },
  ],
  sunset: [
    { abbr:"SLO", name:"San Luis Obispo", lw:5, ll:1, ow:9,  ol:6,  ot:0, str:"W1" },
    { abbr:"PAS", name:"Paso Robles",     lw:5, ll:1, ow:9,  ol:7,  ot:1, str:"W4" },
    { abbr:"ATA", name:"Atascadero",      lw:2, ll:4, ow:5,  ol:11, ot:0, str:"L1" },
    { abbr:"TMP", name:"Templeton",       lw:1, ll:3, ow:6,  ol:9,  ot:0, str:"W2" },
    { abbr:"CAB", name:"Cabrillo",        lw:1, ll:5, ow:3,  ol:14, ot:0, str:"L2" },
  ],
  ocean: [
    { abbr:"PV",  name:"Pioneer Valley", lw:4, ll:1, ow:10, ol:6,  ot:1, str:"L1" },
    { abbr:"SY",  name:"Santa Ynez",     lw:2, ll:1, ow:11, ol:3,  ot:0, str:"W1" },
    { abbr:"NIP", name:"Nipomo",         lw:2, ll:1, ow:9,  ol:7,  ot:0, str:"L2" },
    { abbr:"SM",  name:"Santa Maria",    lw:0, ll:5, ow:4,  ol:7,  ot:0, str:"L2" },
  ]
};
