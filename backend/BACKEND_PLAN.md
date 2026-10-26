# Cricket Data Management System (CDMS) - Backend Architecture & Implementation Plan

## 1. Overview & System Objectives
The **Cricket Data Management System (CDMS)** is a web-based, ad-free platform designed to manage and track cricket data across domestic, local, and club circuits as well as international tournaments. 

The backend is built with:
- **FastAPI** (Python 3.10+) for high-performance RESTful APIs and real-time streaming.
- **Supabase (PostgreSQL)** as the primary database with 3NF normalization, Row-Level Security (RLS), and authentication.
- **WebSockets / Supabase Realtime** for sub-2-second live ball-by-ball score updates.
- **Role-Based Access Control (RBAC)** strictly governing access across three registered roles plus public viewers.

---

## 2. User Roles & Access Control (RBAC)

The system supports the following user hierarchy as defined in the project specification:

| Role | Target Interface | Permissions & Capabilities |
| :--- | :--- | :--- |
| **`admin`** | `/admin/dashboard` | **Full Administrative Access**<br>• Create & manage tournaments (`tournaments`)<br>• Register teams (`teams`), venues (`venues`), and players (`players`)<br>• Schedule matches (`matches`) and assign official `scorer_id`<br>• Manage and promote user roles |
| **`scorer`** | `/scorer/console/:matchId` | **Match Operations & Live Scoring**<br>• Initialize assigned matches (record toss results and playing XIs)<br>• Log ball-by-ball events (`ball_events`: runs, extras, wickets, dismissals)<br>• Manage strike rotation and over completion<br>• Undo deliveries on mistakes<br>• Lock innings and declare final match results |
| **`user`** (Default) | Standard User View | **Registered Fan / Enthusiast**<br>• Authenticated account with profile management<br>• Save favorite teams, tournaments, and players |
| **Viewer** (Public) | `/`, `/live-scores`, `/tournaments`, `/teams`, `/players` | **Unauthenticated Public Access**<br>• Access live scores, ball-by-ball commentary, points table (with NRR), and player profiles with zero login required |

---

## 3. Database Schema (PostgreSQL via Supabase - 3NF Normalized)

```sql
-- 1. USERS & ROLES
CREATE TYPE user_role AS ENUM ('user', 'scorer', 'admin');

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 2. TOURNAMENTS
CREATE TYPE tournament_level AS ENUM ('local', 'club', 'domestic', 'international');
CREATE TYPE match_format AS ENUM ('T20', 'ODI', 'Test', 'Other');

CREATE TABLE tournaments (
    tournament_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    level tournament_level NOT NULL,
    format match_format NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TEAMS
CREATE TABLE teams (
    team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    coach_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TOURNAMENT_TEAMS (M:N)
CREATE TABLE tournament_teams (
    tournament_id UUID REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
    PRIMARY KEY (tournament_id, team_id)
);

-- 5. PLAYERS
CREATE TABLE players (
    player_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(team_id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    dob DATE,
    batting_style VARCHAR(50),
    bowling_style VARCHAR(50),
    role VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. VENUES
CREATE TABLE venues (
    venue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    capacity INT
);

-- 7. MATCHES
CREATE TYPE match_status AS ENUM ('scheduled', 'upcoming', 'live', 'suspended', 'completed', 'abandoned');

CREATE TABLE matches (
    match_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
    team1_id UUID REFERENCES teams(team_id),
    team2_id UUID REFERENCES teams(team_id),
    venue_id UUID REFERENCES venues(venue_id),
    scorer_id UUID REFERENCES users(user_id),
    match_date TIMESTAMPTZ NOT NULL,
    overs INT NOT NULL DEFAULT 20,
    status match_status NOT NULL DEFAULT 'scheduled',
    toss_winner_id UUID REFERENCES teams(team_id),
    toss_decision VARCHAR(10), 
    winner_id UUID REFERENCES teams(team_id),
    result_summary VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INNINGS
CREATE TABLE innings (
    innings_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(match_id) ON DELETE CASCADE,
    batting_team_id UUID REFERENCES teams(team_id),
    bowling_team_id UUID REFERENCES teams(team_id),
    innings_no INT NOT NULL,
    total_runs INT DEFAULT 0,
    wickets INT DEFAULT 0,
    overs_played NUMERIC(4,1) DEFAULT 0.0,
    is_completed BOOLEAN DEFAULT FALSE,
    target_runs INT
);

-- 9. BALL_EVENTS
CREATE TYPE extras_type_enum AS ENUM ('wide', 'no_ball', 'bye', 'leg_bye', 'none');
CREATE TYPE wicket_type_enum AS ENUM ('bowled', 'caught', 'lbw', 'run_out', 'stumped', 'hit_wicket', 'none');

CREATE TABLE ball_events (
    ball_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    innings_id UUID REFERENCES innings(innings_id) ON DELETE CASCADE,
    over_no INT NOT NULL,
    ball_no INT NOT NULL,
    striker_id UUID REFERENCES players(player_id),
    non_striker_id UUID REFERENCES players(player_id),
    bowler_id UUID REFERENCES players(player_id),
    runs_scored INT DEFAULT 0,
    extras_type extras_type_enum DEFAULT 'none',
    extras_runs INT DEFAULT 0,
    is_wicket BOOLEAN DEFAULT FALSE,
    wicket_type wicket_type_enum DEFAULT 'none',
    dismissed_player_id UUID REFERENCES players(player_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PLAYER_STATS
CREATE TABLE player_stats (
    player_id UUID PRIMARY KEY REFERENCES players(player_id) ON DELETE CASCADE,
    matches_played INT DEFAULT 0,
    runs INT DEFAULT 0,
    balls_faced INT DEFAULT 0,
    wickets INT DEFAULT 0,
    runs_conceded INT DEFAULT 0,
    overs_bowled NUMERIC(5,1) DEFAULT 0.0,
    strike_rate NUMERIC(6,2) DEFAULT 0.0,
    economy NUMERIC(5,2) DEFAULT 0.0
);

-- 11. POINTS_TABLE
CREATE TABLE points_table (
    tournament_id UUID REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
    played INT DEFAULT 0,
    won INT DEFAULT 0,
    lost INT DEFAULT 0,
    tied INT DEFAULT 0,
    nr INT DEFAULT 0,
    points INT DEFAULT 0,
    nrr NUMERIC(5,3) DEFAULT 0.000,
    PRIMARY KEY (tournament_id, team_id)
);
```

---

## 4. Directory Structure Plan

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI application entry, middleware, router mounts, WS endpoint
│   ├── config.py                   # App settings (Supabase URL, Anon Key, Service Role Key, JWT Secret)
│   ├── supabase_client.py          # Supabase client singleton (Anon & Admin clients)
│   ├── auth.py                     # Auth dependencies (get_current_user, require_admin, require_scorer)
│   ├── schemas/                    # Pydantic v2 schemas
│   │   ├── auth.py                 # Login, Registration, Token schemas
│   │   ├── tournament.py           # Tournament request & response schemas
│   │   ├── team.py                 # Team and TournamentTeam schemas
│   │   ├── player.py               # Player profile and stats schemas
│   │   ├── match.py                # Fixture and Match info schemas
│   │   └── scoring.py              # BallEvent, Scorecard, Inning schemas
│   ├── routers/                    # API endpoints
│   │   ├── auth.py                 # /api/auth (login, register, me)
│   │   ├── tournaments.py          # /api/tournaments
│   │   ├── teams.py                # /api/teams
│   │   ├── players.py              # /api/players
│   │   ├── matches.py              # /api/matches (fixtures, public scorecards)
│   │   ├── scoring.py              # /api/scoring (ball entry, undo, innings end, match complete)
│   │   └── admin.py                # /api/admin (management CRUD, scorer assignment)
│   ├── services/                   # Business logic engines
│   │   ├── scoring_service.py      # Ball event processor, strike swap, extras handling
│   │   ├── stats_engine.py         # Player career aggregates and milestones updater
│   │   ├── nrr_calculator.py       # Net Run Rate (NRR) computation engine
│   │   └── connection_manager.py   # WebSocket broadcast connection manager
│   └── seed/                       # Database seeding script
│       └── seed_supabase.py        # Seeds initial data (City Champions League, Rangers, Strikers, players)
├── supabase_schema.sql             # SQL DDL script for Supabase SQL Editor
├── requirements.txt                # Python dependencies
└── BACKEND_PLAN.md                 # This documentation file
```

---

## 5. API Endpoints Specification

### 5.1. Authentication (`/api/auth`)
* `POST /api/auth/register` — Registers a new user account (defaults to `role = 'user'`).
* `POST /api/auth/login` — Authenticates with email & password, returns JWT token, user info, and assigned `role`.
* `GET /api/auth/me` — Returns current logged-in user details and role.

### 5.2. Public Viewer Endpoints (No Auth Required)
* `GET /api/tournaments` — List all tournaments with status, level, format, and dates.
* `GET /api/tournaments/{tournament_id}` — Details for a specific tournament.
* `GET /api/tournaments/{tournament_id}/fixtures` — Fixtures with query filter (`?status=live|upcoming|completed`).
* `GET /api/tournaments/{tournament_id}/standings` — Standings points table with calculated NRR.
* `GET /api/matches/{match_id}/live` — Full live match scorecard payload:
  - Match details (Teams, Venue, Toss, Status)
  - Current Inning totals (Runs, Wickets, Overs, CRR, RRR, Target)
  - Batting table (R, B, 4s, 6s, SR, active striker)
  - Bowling table (O, M, R, W, ECO)
  - Current over balls array
* `GET /api/matches/{match_id}/commentary` — Ball-by-ball commentary feed.
* `GET /api/teams` — List of all franchise and domestic teams.
* `GET /api/teams/{team_id}` — Team profile, squad roster, and match history.
* `GET /api/players` — Search and filter players by role (`Batter`, `Bowler`, `All-Rounder`, `Wicket-Keeper`).
* `GET /api/players/{player_id}` — Player profile, biographical details, career stats, and recent 5 match performances.

### 5.3. Live Scorer Endpoints (`require_scorer_or_admin`)
* `POST /api/scoring/matches/{match_id}/start` — Sets toss winner, toss decision, and playing XI squad.
* `POST /api/scoring/matches/{match_id}/ball` — Processes a delivery:
  - Validates legal ball vs. extras (`wide` and `no_ball` do not increment legal ball count).
  - Updates runs scored and extras.
  - Updates wickets and records dismissal details.
  - Handles strike rotation on odd runs and at the end of each completed over (6 legal deliveries).
  - Broadcasts live update via WebSockets to connected viewers.
* `POST /api/scoring/matches/{match_id}/undo` — Reverses the most recent ball event.
* `POST /api/scoring/matches/{match_id}/end-innings` — Locks current inning and computes 2nd inning target.
* `POST /api/scoring/matches/{match_id}/complete` — Declares winner, locks match, and triggers automatic stats recalculation.

### 5.4. Administrator Endpoints (`require_admin`)
* `POST /api/admin/tournaments` — Creates a tournament (`created_by` = current admin).
* `POST /api/admin/teams` — Registers a new team.
* `POST /api/admin/players` — Adds a player and assigns them to a team.
* `POST /api/admin/venues` — Adds a stadium/venue.
* `POST /api/admin/matches` — Schedules a match fixture and assigns a `scorer_id`.
* `GET /api/admin/scorers` — Lists all registered scorers available for match assignment.
* `PATCH /api/admin/users/{user_id}/role` — Updates user role (`user`, `scorer`, `admin`).

---

## 6. Cricket Mathematics & Domain Logic Rules

### 6.1. Net Run Rate (NRR) Formula
$$\text{NRR} = \left(\frac{\text{Total Runs Scored}}{\text{Total Overs Faced}}\right) - \left(\frac{\text{Total Runs Conceded}}{\text{Total Overs Bowled}}\right)$$
* Fractional overs are precisely converted into decimal values:  
  An over of $16.2$ balls is evaluated as $16 + \frac{2}{6} = 16.333$ overs.
* If a team is bowled out (all out) before completing their allotted quota of overs, the full quota (e.g. 20.0 overs) is used for calculation.

### 6.2. Batting & Bowling Metrics
* **Batting Strike Rate**: $\text{SR} = \left(\frac{\text{Runs}}{\text{Balls Faced}}\right) \times 100$
* **Batting Average**: $\text{Avg} = \frac{\text{Runs}}{\text{Innings} - \text{Not Outs}}$
* **Bowling Economy**: $\text{ECO} = \frac{\text{Runs Conceded}}{\text{Overs Bowled}}$
* **Current Run Rate (CRR)**: $\text{CRR} = \frac{\text{Total Runs}}{\text{Overs Played}}$
* **Required Run Rate (RRR)**: $\text{RRR} = \frac{\text{Target} - \text{Current Runs}}{\text{Remaining Overs}}$

---

## 7. Next Steps for Implementation
1. Execute the DDL in `backend/supabase_schema.sql` on the Supabase project.
2. Configure `.env` with `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
3. Scaffold the FastAPI modular routers and business services.
4. Execute `seed_supabase.py` to populate initial demo data (*City Champions League, Rangers vs Strikers*).
5. Connect the React frontend API client to replace placeholder data.
