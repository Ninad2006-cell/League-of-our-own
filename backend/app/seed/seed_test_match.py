import sys
from pathlib import Path
from datetime import date, datetime, timezone

sys.path.append(str(Path(__file__).resolve().parent.parent.parent))
from supabase_client import get_supabase_client

def seed():
    supabase = get_supabase_client()
    print("Checking existing data...")

    # 1. Venue
    venue_res = supabase.table("venues").select("*").eq("venue_name", "Greenfield Stadium").execute()
    if not venue_res.data:
        venue = supabase.table("venues").insert({
            "venue_name": "Greenfield Stadium",
            "city": "Mumbai",
            "capacity": 45000
        }).execute().data[0]
        print(f"Created Venue: {venue['venue_name']} ({venue['venue_id']})")
    else:
        venue = venue_res.data[0]

    # 2. Tournament
    tourn_res = supabase.table("tournaments").select("*").eq("name", "City Champions League").execute()
    if not tourn_res.data:
        tourn = supabase.table("tournaments").insert({
            "name": "City Champions League",
            "level": "club",
            "format": "T20",
            "start_date": "2025-08-01",
            "end_date": "2025-08-30"
        }).execute().data[0]
        print(f"Created Tournament: {tourn['name']} ({tourn['tournament_id']})")
    else:
        tourn = tourn_res.data[0]

    # 3. Teams
    rangers_res = supabase.table("teams").select("*").eq("team_name", "Rangers").execute()
    if not rangers_res.data:
        rangers = supabase.table("teams").insert({
            "team_name": "Rangers",
            "city": "Mumbai",
            "coach_name": "Rahul D."
        }).execute().data[0]
    else:
        rangers = rangers_res.data[0]

    strikers_res = supabase.table("teams").select("*").eq("team_name", "Strikers").execute()
    if not strikers_res.data:
        strikers = supabase.table("teams").insert({
            "team_name": "Strikers",
            "city": "Delhi",
            "coach_name": "Ricky P."
        }).execute().data[0]
    else:
        strikers = strikers_res.data[0]

    print(f"Teams: {rangers['team_name']} ({rangers['team_id']}) vs {strikers['team_name']} ({strikers['team_id']})")

    # 4. Players
    def get_or_create_player(team_id, name, role, bat="Right", bowl="Right"):
        p_res = supabase.table("players").select("*").eq("name", name).execute()
        if not p_res.data:
            return supabase.table("players").insert({
                "team_id": team_id,
                "name": name,
                "role": role,
                "batting_style": bat,
                "bowling_style": bowl
            }).execute().data[0]
        return p_res.data[0]

    rohit = get_or_create_player(rangers["team_id"], "Rohit S.", "Batter")
    virat = get_or_create_player(rangers["team_id"], "Virat K.", "Batter")
    hardik = get_or_create_player(rangers["team_id"], "Hardik P.", "All-Rounder")
    rahul = get_or_create_player(rangers["team_id"], "KL Rahul", "Wicket-Keeper")
    jadeja = get_or_create_player(rangers["team_id"], "Ravindra J.", "All-Rounder", bat="Left", bowl="Left")
    bumrah = get_or_create_player(rangers["team_id"], "Jasprit B.", "Bowler")
    shami = get_or_create_player(rangers["team_id"], "Mohammed S.", "Bowler")

    arjun = get_or_create_player(strikers["team_id"], "Arjun K.", "Bowler", bat="Left", bowl="Left")
    sameer = get_or_create_player(strikers["team_id"], "Sameer R.", "Bowler")
    dev = get_or_create_player(strikers["team_id"], "Dev M.", "Bowler")
    suresh = get_or_create_player(strikers["team_id"], "Suresh R.", "Bowler", bat="Left", bowl="Left")

    # 5. Match
    match_res = supabase.table("matches").select("*").eq("tournament_id", tourn["tournament_id"]).execute()
    if not match_res.data:
        match = supabase.table("matches").insert({
            "tournament_id": tourn["tournament_id"],
            "team1_id": rangers["team_id"],
            "team2_id": strikers["team_id"],
            "venue_id": venue["venue_id"],
            "match_date": datetime.now(timezone.utc).isoformat(),
            "overs": 20,
            "status": "scheduled"
        }).execute().data[0]
        print(f"Created Match: {match['match_id']}")
    else:
        match = match_res.data[0]
        print(f"Using Existing Match: {match['match_id']}")

    print("\n--- SEED COMPLETE ---")
    print(f"Match ID: {match['match_id']}")
    print(f"Rangers ID: {rangers['team_id']}")
    print(f"Strikers ID: {strikers['team_id']}")
    print(f"Rohit ID (Striker): {rohit['player_id']}")
    print(f"Virat ID (Non-Striker): {virat['player_id']}")
    print(f"Arjun ID (Bowler): {arjun['player_id']}")

if __name__ == "__main__":
    seed()
