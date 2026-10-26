import sys
from pathlib import Path
import uuid
import httpx

sys.path.append(str(Path(__file__).resolve().parent.parent))

BASE_URL = "http://127.0.0.1:8000"
client = httpx.Client(base_url=BASE_URL, timeout=25.0)


def test_auth_and_admin_workflow():
    print("\n=== STARTING TRACK 1 TEST SUITE (AUTH & ADMIN) ===")

    # 1. Register a new user
    unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    reg_payload = {
        "name": "Jane Fan",
        "email": unique_email,
        "password": "strongPassword123!",
        "role": "user"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 201, f"Register failed: {reg_res.text}"
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == unique_email
    assert reg_data["user"]["role"] == "user"
    user_token = reg_data["access_token"]
    user_id = reg_data["user"]["user_id"]
    print(f"[PASS] POST /api/auth/register -> User created ({unique_email}) with token")

    # 2. Login with existing user
    login_res = client.post("/api/auth/login", json={"email": unique_email, "password": "strongPassword123!"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    login_data = login_res.json()
    assert login_data["access_token"] is not None
    print(f"[PASS] POST /api/auth/login -> Logged in successfully")

    # 3. Test GET /api/auth/me with Bearer token
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {user_token}"})
    assert me_res.status_code == 200, f"Auth me failed: {me_res.text}"
    me_data = me_res.json()
    assert me_data["email"] == unique_email
    print(f"[PASS] GET /api/auth/me -> Authenticated as {me_data['name']} ({me_data['role']})")

    # 4. RBAC Check: Regular user should be forbidden (403) from admin endpoints
    forbidden_res = client.post(
        "/api/admin/tournaments",
        json={
            "name": "Unauthorized Cup",
            "level": "local",
            "format": "T20",
            "start_date": "2025-09-01",
            "end_date": "2025-09-10"
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert forbidden_res.status_code == 403, f"Expected 403 Forbidden, got {forbidden_res.status_code}"
    print(f"[PASS] RBAC Enforced: Non-admin user blocked from /api/admin/tournaments (403 Forbidden)")

    # 5. Admin Login with seeded admin credentials
    admin_login_res = client.post("/api/auth/login", json={"email": "admin@cdms.com", "password": "password123"})
    assert admin_login_res.status_code == 200, f"Admin login failed: {admin_login_res.text}"
    admin_token = admin_login_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print(f"[PASS] Admin login verified with role 'admin'")

    # 6. Admin: List available scorers
    scorers_res = client.get("/api/admin/scorers", headers=admin_headers)
    assert scorers_res.status_code == 200, f"List scorers failed: {scorers_res.text}"
    scorers = scorers_res.json()
    assert len(scorers) > 0
    print(f"[PASS] GET /api/admin/scorers -> {len(scorers)} scorer(s) found")

    # 7. Admin: Create Tournament
    tourn_payload = {
        "name": f"Admin Cup {uuid.uuid4().hex[:6]}",
        "level": "club",
        "format": "T20",
        "start_date": "2025-10-01",
        "end_date": "2025-10-15"
    }
    create_tourn_res = client.post("/api/admin/tournaments", json=tourn_payload, headers=admin_headers)
    assert create_tourn_res.status_code == 201, f"Create tournament failed: {create_tourn_res.text}"
    created_tourn = create_tourn_res.json()
    tourn_id = created_tourn["tournament_id"]
    print(f"[PASS] POST /api/admin/tournaments -> Created: {created_tourn['name']} ({tourn_id})")

    # 8. Admin: Create Team
    team_payload = {
        "team_name": f"Hawks {uuid.uuid4().hex[:4]}",
        "city": "Chennai",
        "coach_name": "Stephen F."
    }
    create_team_res = client.post("/api/admin/teams", json=team_payload, headers=admin_headers)
    assert create_team_res.status_code == 201, f"Create team failed: {create_team_res.text}"
    created_team = create_team_res.json()
    team_id = created_team["team_id"]
    print(f"[PASS] POST /api/admin/teams -> Created: {created_team['team_name']} ({team_id})")

    # 9. Admin: Create Player
    player_payload = {
        "name": "Michael Hussey",
        "team_id": team_id,
        "role": "Batter",
        "batting_style": "Left-hand bat",
        "bowling_style": "Right-arm medium"
    }
    create_player_res = client.post("/api/admin/players", json=player_payload, headers=admin_headers)
    assert create_player_res.status_code == 201, f"Create player failed: {create_player_res.text}"
    created_player = create_player_res.json()
    print(f"[PASS] POST /api/admin/players -> Created: {created_player['name']} in team {team_id}")

    # 10. Admin: Promote user role
    role_res = client.patch(f"/api/admin/users/{user_id}/role", json={"role": "scorer"}, headers=admin_headers)
    assert role_res.status_code == 200, f"Role update failed: {role_res.text}"
    assert role_res.json()["user"]["role"] == "scorer"
    print(f"[PASS] PATCH /api/admin/users/{user_id}/role -> User promoted to 'scorer'")

    print("\n>>> ALL TRACK 1 TESTS PASSED PERFECTLY! <<<")


if __name__ == "__main__":
    test_auth_and_admin_workflow()
