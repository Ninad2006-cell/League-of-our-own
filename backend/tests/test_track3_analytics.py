import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

import httpx
import json
from app.services.nrr_calculator import nrr_calculator
from app.services.stats_engine import stats_engine



BASE_URL = "http://127.0.0.1:8000"


def test_cricket_math_nrr_rules():
    print("\n--- Testing Cricket Domain Math: NRR Engine ---")
    
    # 1. Fractional over conversion test
    # 16.2 overs = 16 + 2/6 = 16.3333...
    dec_overs = nrr_calculator.overs_to_decimal(16.2, is_all_out=False, max_overs=20)
    assert abs(dec_overs - 16.3333) < 0.001, f"Expected ~16.333, got {dec_overs}"
    print(f"[PASS] Fractional over 16.2 correctly evaluated as {dec_overs:.4f}")

    # 2. All-Out Quota Rule test
    # If a team is bowled out at 14.3 overs, full quota of 20 overs must be applied
    all_out_overs = nrr_calculator.overs_to_decimal(14.3, is_all_out=True, max_overs=20)
    assert all_out_overs == 20.0, f"Expected 20.0 full quota overs on all-out, got {all_out_overs}"
    print(f"[PASS] All-out rule applied full quota: {all_out_overs} overs")

    # 3. NRR calculation formula:
    # Team scored 180 runs in 20.0 overs (Rate = 9.000)
    # Team conceded 150 runs in 20.0 overs (Rate = 7.500)
    # NRR = 9.000 - 7.500 = +1.500
    nrr = nrr_calculator.calculate_nrr(180, 20.0, 150, 20.0)
    assert nrr == 1.500, f"Expected +1.500, got {nrr}"
    print(f"[PASS] NRR correctly calculated: {nrr:+.3f}")


client = httpx.Client(base_url=BASE_URL, timeout=20.0)

def test_public_api_endpoints():
    print("\n--- Testing Track 3 Public Viewer APIs ---")

    # 1. GET /api/tournaments
    res = client.get("/api/tournaments")
    assert res.status_code == 200, f"Failed: {res.text}"
    tournaments = res.json()
    assert len(tournaments) > 0, "No tournaments returned"
    tourn_id = tournaments[0]["tournament_id"]
    print(f"[PASS] GET /api/tournaments -> Found {len(tournaments)} tournaments ({tournaments[0]['name']})")

    # 2. GET /api/tournaments/{tournament_id}
    res = client.get(f"/api/tournaments/{tourn_id}")
    assert res.status_code == 200, f"Failed: {res.text}"
    print(f"[PASS] GET /api/tournaments/{tourn_id} -> Format: {res.json().get('format')}")

    # 3. GET /api/tournaments/{tournament_id}/fixtures
    res = client.get(f"/api/tournaments/{tourn_id}/fixtures")
    assert res.status_code == 200, f"Failed: {res.text}"
    fixtures = res.json()
    print(f"[PASS] GET /api/tournaments/{tourn_id}/fixtures -> {len(fixtures)} fixtures found")

    # 4. GET /api/tournaments/{tournament_id}/standings
    res = client.get(f"/api/tournaments/{tourn_id}/standings")
    assert res.status_code == 200, f"Failed: {res.text}"
    standings = res.json()
    print(f"[PASS] GET /api/tournaments/{tourn_id}/standings -> Standings table generated with NRR:")
    for row in standings:
        print(f"       Rank {row.get('rank')}: {row['team_name']} | P: {row['played']} | W: {row['won']} | Pts: {row['points']} | NRR: {row['nrr']:+.3f}")

    # 5. GET /api/teams
    res = client.get("/api/teams")
    assert res.status_code == 200, f"Failed: {res.text}"
    teams = res.json()
    assert len(teams) > 0, "No teams returned"
    team_id = teams[0]["team_id"]
    print(f"[PASS] GET /api/teams -> {len(teams)} teams listed ({teams[0]['team_name']})")

    # 6. GET /api/teams/{team_id}
    res = client.get(f"/api/teams/{team_id}")
    assert res.status_code == 200, f"Failed: {res.text}"
    team_profile = res.json()
    print(f"[PASS] GET /api/teams/{team_id} -> Squad count: {len(team_profile['squad'])}, Coach: {team_profile['coach_name']}")

    # 7. GET /api/players (with search & filter)
    res = client.get("/api/players?search=Rohit")
    assert res.status_code == 200, f"Failed: {res.text}"
    players = res.json()
    assert len(players) > 0, "Rohit not found in player search"
    player_id = players[0]["player_id"]
    print(f"[PASS] GET /api/players?search=Rohit -> Found: {players[0]['name']} ({players[0]['role']})")

    # 8. GET /api/players/{player_id}
    res = client.get(f"/api/players/{player_id}")
    assert res.status_code == 200, f"Failed: {res.text}"
    player_detail = res.json()
    c_stats = player_detail["career_stats"]
    print(f"[PASS] GET /api/players/{player_id} -> Detailed Profile:")
    print(f"       Name: {player_detail['name']} | Team: {player_detail['team_name']}")
    print(f"       Runs: {c_stats['runs']} | Balls: {c_stats['balls_faced']} | SR: {c_stats['strike_rate']} | Avg: {c_stats['batting_average']}")


    print("\n>>> ALL TRACK 3 TESTS PASSED PERFECTLY! <<<")


if __name__ == "__main__":
    test_cricket_math_nrr_rules()
    test_public_api_endpoints()
