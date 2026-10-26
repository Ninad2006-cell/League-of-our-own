-- Cricket Data Management System (CDMS) - Database Schema DDL
-- Database: PostgreSQL (Supabase)

-- 1. USERS & ROLES
CREATE TYPE user_role AS ENUM ('user', 'scorer', 'admin');

CREATE TABLE IF NOT EXISTS users (
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

CREATE TABLE IF NOT EXISTS tournaments (
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
CREATE TABLE IF NOT EXISTS teams (
    team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    coach_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TOURNAMENT_TEAMS (M:N)
CREATE TABLE IF NOT EXISTS tournament_teams (
    tournament_id UUID REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
    PRIMARY KEY (tournament_id, team_id)
);

-- 5. PLAYERS
CREATE TABLE IF NOT EXISTS players (
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
CREATE TABLE IF NOT EXISTS venues (
    venue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    capacity INT
);

-- 7. MATCHES
CREATE TYPE match_status AS ENUM ('scheduled', 'upcoming', 'live', 'suspended', 'completed', 'abandoned');

CREATE TABLE IF NOT EXISTS matches (
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
CREATE TABLE IF NOT EXISTS innings (
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

CREATE TABLE IF NOT EXISTS ball_events (
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
CREATE TABLE IF NOT EXISTS player_stats (
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
CREATE TABLE IF NOT EXISTS points_table (
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
