import httpx
import json

BASE_URL = "http://localhost:8000"
client = httpx.Client(timeout=25.0)


def run_tests():
    print("=== STARTING TRACK 2 TEST SUITE ===")

    # 1. List matches
    res = client.get(f"{BASE_URL}/api/matches")
    assert res.status_code == 200, f"List matches failed: {res.text}"
    matches = res.json()
    assert len(matches) > 0, "No matches returned"
    match = matches[0]
    match_id = match["match_id"]
    print(f"[PASS] Found Match: {match['team1']['team_name']} vs {match['team2']['team_name']} ({match_id})")

    # Fetch players to use for scoring
    # In our seed: team1 is Rangers, team2 is Strikers
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).resolve().parent.parent))
    from supabase_client import get_supabase_client
    supabase = get_supabase_client()
    players = supabase.table("players").select("*").execute().data
    rohit = next(p for p in players if p["name"] == "Rohit S.")
    virat = next(p for p in players if p["name"] == "Virat K.")
    arjun = next(p for p in players if p["name"] == "Arjun K.")

    # 2. Start Match
    start_payload = {
        "toss_winner_id": match["team1_id"],
        "toss_decision": "bat",
        "striker_id": rohit["player_id"],
        "non_striker_id": virat["player_id"],
        "bowler_id": arjun["player_id"],
        "overs": 20
    }
    start_res = client.post(f"{BASE_URL}/api/scoring/matches/{match_id}/start", json=start_payload)
    assert start_res.status_code == 200, f"Start match failed: {start_res.text}"
    print("[PASS] Match started with toss recorded.")

    # 3. Record Ball 1: 4 runs by Rohit
    b1_payload = {
        "striker_id": rohit["player_id"],
        "non_striker_id": virat["player_id"],
        "bowler_id": arjun["player_id"],
        "runs_scored": 4,
        "extras_type": "none",
        "extras_runs": 0,
        "is_wicket": False
    }
    b1_res = client.post(f"{BASE_URL}/api/scoring/matches/{match_id}/ball", json=b1_payload)
    assert b1_res.status_code == 200, f"Ball 1 failed: {b1_res.text}"
    scorecard = b1_res.json()
    assert scorecard["total_runs"] >= 4
    print(f"[PASS] Ball 1 logged (4 runs): Total = {scorecard['total_runs']}/{scorecard['wickets']}")

    # 4. Record Ball 2: 1 single run -> Strike should swap
    b2_payload = {
        "striker_id": rohit["player_id"],
        "non_striker_id": virat["player_id"],
        "bowler_id": arjun["player_id"],
        "runs_scored": 1,
        "extras_type": "none",
        "extras_runs": 0,
        "is_wicket": False
    }
    b2_res = client.post(f"{BASE_URL}/api/scoring/matches/{match_id}/ball", json=b2_payload)
    assert b2_res.status_code == 200, f"Ball 2 failed: {b2_res.text}"
    scorecard = b2_res.json()
    print(f"[PASS] Ball 2 logged (Single): Strike rotated. Striker is now: {scorecard['striker']['name']}")
    assert scorecard["striker"]["name"] == "Virat K."

    # 5. Record Ball 3: Wide delivery
    b3_payload = {
        "striker_id": virat["player_id"],
        "non_striker_id": rohit["player_id"],
        "bowler_id": arjun["player_id"],
        "runs_scored": 0,
        "extras_type": "wide",
        "extras_runs": 0,
        "is_wicket": False
    }
    b3_res = client.post(f"{BASE_URL}/api/scoring/matches/{match_id}/ball", json=b3_payload)
    assert b3_res.status_code == 200, f"Ball 3 wide failed: {b3_res.text}"
    scorecard = b3_res.json()
    print(f"[PASS] Ball 3 logged (Wide): Total = {scorecard['total_runs']}, Overs = {scorecard['overs_played']}")

    # 6. Undo the Wide delivery
    undo_res = client.post(f"{BASE_URL}/api/scoring/matches/{match_id}/undo")
    assert undo_res.status_code == 200, f"Undo failed: {undo_res.text}"
    scorecard = undo_res.json()
    print(f"[PASS] Delivery Undone successfully: Total = {scorecard['total_runs']}")

    # 7. Check Live Scorecard endpoint
    live_res = client.get(f"{BASE_URL}/api/matches/{match_id}/live")
    assert live_res.status_code == 200, f"Live scorecard failed: {live_res.text}"
    live_data = live_res.json()
    print(f"[PASS] Live Scorecard Verified: {live_data['tournament']}, Score: {live_data['total_runs']}/{live_data['wickets']}, CRR: {live_data['crr']}")

    # 8. Check Commentary feed
    comm_res = client.get(f"{BASE_URL}/api/matches/{match_id}/commentary")
    assert comm_res.status_code == 200, f"Commentary failed: {comm_res.text}"
    commentary = comm_res.json()
    print(f"[PASS] Commentary Feed Verified: {len(commentary)} balls logged.")
    for c in commentary[:3]:
        print(f"       -> {c['over']}: {c['text']}")

    print("\n>>> ALL TRACK 2 TESTS PASSED PERFECTLY! <<<")

if __name__ == "__main__":
    run_tests()
