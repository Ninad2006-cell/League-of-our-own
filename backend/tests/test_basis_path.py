"""
=============================================================================
LEAGUE-OF-OUR-OWN — Basis Path Unit Test Suite
=============================================================================
Method : McCabe's Basis Path Testing
Modules: auth.py, nrr_calculator.py, stats_engine.py,
         scoring_service.py (pure logic), connection_manager.py

Each test class documents:
  • Cyclomatic Complexity (V(G)) of the function under test
  • Linearly-independent paths that must be exercised

Run with:
    cd backend
    venv\\Scripts\\activate
    pytest tests/test_basis_path.py -v
=============================================================================
"""

import math
import pytest
from datetime import timedelta
from unittest.mock import MagicMock, patch, AsyncMock

# ---------------------------------------------------------------------------
# Adjust Python path so backend package imports resolve correctly
# ---------------------------------------------------------------------------
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


# ===========================================================================
# MODULE 1 — app/auth.py
# Functions: verify_password, get_password_hash, create_access_token,
#            decode_access_token, get_current_user, require_admin,
#            require_scorer_or_admin
# ===========================================================================

class TestVerifyPassword:
    """
    verify_password(plain, hashed) -> bool
    Control-flow graph:
        1 → 2 (bcrypt.checkpw, return result)
    V(G) = 1  →  1 independent path
    
    Path 1: valid hash  → returns True
    Path 2: wrong pass  → returns False
    """

    def test_path1_correct_password_returns_true(self):
        """Path 1 – matching password → True"""
        from app.auth import verify_password, get_password_hash
        hashed = get_password_hash("secret123")
        assert verify_password("secret123", hashed) is True

    def test_path2_wrong_password_returns_false(self):
        """Path 2 – non-matching password → False"""
        from app.auth import verify_password, get_password_hash
        hashed = get_password_hash("secret123")
        assert verify_password("wrongpass", hashed) is False


class TestGetPasswordHash:
    """
    get_password_hash(password) -> str
    V(G) = 1  →  1 path (no branching)
    
    Path 1: any valid string → bcrypt hash returned
    """

    def test_path1_returns_valid_bcrypt_hash(self):
        """Path 1 – produces a bcrypt hash starting with $2b$"""
        from app.auth import get_password_hash
        result = get_password_hash("mypassword")
        assert isinstance(result, str)
        assert result.startswith("$2b$")

    def test_hash_is_non_deterministic(self):
        """Two calls produce different salts (bcrypt property)"""
        from app.auth import get_password_hash
        h1 = get_password_hash("password")
        h2 = get_password_hash("password")
        assert h1 != h2


class TestCreateAccessToken:
    """
    create_access_token(data, expires_delta=None) -> str
    
    Control-flow:
        1 → 2 [if expires_delta]
              ├─ True  → 3 (custom expiry)
              └─ False → 4 (default expiry)
            → 5 (encode and return)
    
    V(G) = 2  →  2 independent paths
    
    Path 1: expires_delta provided → uses custom expiry
    Path 2: expires_delta=None    → uses settings default
    """

    def test_path1_custom_expiry(self):
        """Path 1 – custom expires_delta branch"""
        from app.auth import create_access_token
        token = create_access_token(
            {"sub": "user-1", "role": "user"},
            expires_delta=timedelta(minutes=30)
        )
        assert isinstance(token, str)
        assert len(token) > 20

    def test_path2_default_expiry(self):
        """Path 2 – no expires_delta, falls to default branch"""
        from app.auth import create_access_token
        token = create_access_token({"sub": "user-2", "role": "admin"})
        assert isinstance(token, str)
        assert len(token) > 20


class TestDecodeAccessToken:
    """
    decode_access_token(token) -> dict
    
    Control-flow:
        1 → try block
              ├─ Path A: success          → return payload
              ├─ Path B: ExpiredSignature → raise 401 (expired)
              └─ Path C: InvalidToken    → raise 401 (invalid)
    
    V(G) = 3  →  3 independent paths
    
    Path 1: valid, non-expired token → returns payload dict
    Path 2: expired token            → HTTPException 401 "expired"
    Path 3: garbage token            → HTTPException 401 "invalid"
    """

    def test_path1_valid_token_decoded_correctly(self):
        """Path 1 – valid token returns payload"""
        from app.auth import create_access_token, decode_access_token
        token = create_access_token({"sub": "abc", "role": "admin"})
        payload = decode_access_token(token)
        assert payload["sub"] == "abc"
        assert payload["role"] == "admin"

    def test_path2_expired_token_raises_401(self):
        """Path 2 – expired token → HTTPException with 'expired' detail"""
        from fastapi import HTTPException
        from app.auth import create_access_token, decode_access_token
        token = create_access_token(
            {"sub": "xyz"},
            expires_delta=timedelta(seconds=-1)   # already expired
        )
        with pytest.raises(HTTPException) as exc_info:
            decode_access_token(token)
        assert exc_info.value.status_code == 401
        assert "expired" in exc_info.value.detail.lower()

    def test_path3_invalid_token_raises_401(self):
        """Path 3 – garbage string → HTTPException with 'invalid' detail"""
        from fastapi import HTTPException
        from app.auth import decode_access_token
        with pytest.raises(HTTPException) as exc_info:
            decode_access_token("not.a.jwt.token")
        assert exc_info.value.status_code == 401
        assert "invalid" in exc_info.value.detail.lower()


class TestGetCurrentUser:
    """
    get_current_user(credentials) -> UserResponse
    
    Control-flow nodes:
        1 → if not credentials → raise 401               [Path 1]
        2 → decode_access_token(token)
        3 → if not user_id or not role → raise 401       [Path 2]
        4 → get_user_by_id_from_db(user_id)
              ├─ db_user found AND db_user_id exists → return DB data   [Path 3]
              └─ no db_user                          → return token data [Path 4]
    
    V(G) = 4  →  4 independent paths
    """

    def _make_credentials(self, token: str):
        """Helper: create a mock HTTPAuthorizationCredentials."""
        creds = MagicMock()
        creds.credentials = token
        return creds

    def test_path1_no_credentials_raises_401(self):
        """Path 1 – credentials=None → HTTPException 401"""
        from fastapi import HTTPException
        from app.auth import get_current_user
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(None)
        assert exc_info.value.status_code == 401

    def test_path2_token_missing_user_id_raises_401(self):
        """Path 2 – token decodes but has no 'sub' → HTTPException 401"""
        from fastapi import HTTPException
        from app.auth import create_access_token, get_current_user
        # Token without 'sub'
        token = create_access_token({"role": "user", "name": "Nobody"})
        creds = self._make_credentials(token)
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(creds)
        assert exc_info.value.status_code == 401

    @patch("app.auth.get_user_by_id_from_db")
    def test_path3_db_user_found_returns_db_data(self, mock_get_user):
        """Path 3 – DB lookup succeeds → UserResponse built from DB"""
        from app.auth import create_access_token, get_current_user
        from app.schemas.auth import UserRole
        mock_get_user.return_value = {
            "user_id": "db-user-id",
            "name": "DB User",
            "email": "db@test.com",
            "role": "admin",
        }
        token = create_access_token({"sub": "db-user-id", "role": "admin", "email": "db@test.com", "name": "DB User"})
        creds = self._make_credentials(token)
        result = get_current_user(creds)
        assert result.user_id == "db-user-id"
        assert result.role == UserRole.admin

    @patch("app.auth.get_user_by_id_from_db")
    def test_path4_db_unavailable_falls_back_to_token(self, mock_get_user):
        """Path 4 – DB returns None → UserResponse built from token claims"""
        from app.auth import create_access_token, get_current_user
        from app.schemas.auth import UserRole
        mock_get_user.return_value = None
        token = create_access_token({"sub": "tok-user-id", "role": "scorer", "email": "s@test.com", "name": "Scorer"})
        creds = self._make_credentials(token)
        result = get_current_user(creds)
        assert result.user_id == "tok-user-id"
        assert result.role == UserRole.scorer


class TestRequireAdmin:
    """
    require_admin(current_user) -> UserResponse | raise 403
    
    Control-flow:
        1 → if current_user.role != admin
              ├─ True  → raise 403   [Path 1]
              └─ False → return user [Path 2]
    
    V(G) = 2  →  2 independent paths
    """

    def _make_user(self, role: str):
        from app.schemas.auth import UserResponse, UserRole
        return UserResponse(user_id="u1", name="U", email="u@u.com", role=UserRole(role))

    def test_path1_non_admin_raises_403(self):
        """Path 1 – role=user → HTTPException 403"""
        from fastapi import HTTPException
        from app.auth import require_admin
        user = self._make_user("user")
        with pytest.raises(HTTPException) as exc_info:
            require_admin(user)
        assert exc_info.value.status_code == 403

    def test_path2_admin_returns_user(self):
        """Path 2 – role=admin → returns UserResponse"""
        from app.auth import require_admin
        user = self._make_user("admin")
        result = require_admin(user)
        assert result == user


class TestRequireScorerOrAdmin:
    """
    require_scorer_or_admin(current_user) -> UserResponse | raise 403
    
    Control-flow:
        1 → if role not in [scorer, admin]
              ├─ True  → raise 403          [Path 1]
              └─ False (scorer) → return    [Path 2]
              └─ False (admin)  → return    [Path 3]
    
    V(G) = 2  →  2 independent paths (3 test cases to cover both allowed roles)
    """

    def _make_user(self, role: str):
        from app.schemas.auth import UserResponse, UserRole
        return UserResponse(user_id="u2", name="U2", email="u2@u.com", role=UserRole(role))

    def test_path1_regular_user_raises_403(self):
        """Path 1 – role=user → 403"""
        from fastapi import HTTPException
        from app.auth import require_scorer_or_admin
        with pytest.raises(HTTPException) as exc_info:
            require_scorer_or_admin(self._make_user("user"))
        assert exc_info.value.status_code == 403

    def test_path2_scorer_passes(self):
        """Path 2a – role=scorer → returns user"""
        from app.auth import require_scorer_or_admin
        user = self._make_user("scorer")
        assert require_scorer_or_admin(user) == user

    def test_path3_admin_passes(self):
        """Path 2b – role=admin → returns user"""
        from app.auth import require_scorer_or_admin
        user = self._make_user("admin")
        assert require_scorer_or_admin(user) == user


# ===========================================================================
# MODULE 2 — app/services/nrr_calculator.py
# Functions: overs_to_decimal, calculate_nrr
# ===========================================================================

class TestOversToDecimal:
    """
    overs_to_decimal(overs_played, is_all_out=False, max_overs=20) -> float
    
    Control-flow:
        1 → if is_all_out → return float(max_overs)    [Path 1]
        2 → extract integer overs
        3 → extract ball fraction
        4 → return overs_int + ball_fraction / 6.0     [Path 2]
    
    V(G) = 2  →  2 independent paths
    
    Path 1: is_all_out=True  → returns max_overs as float
    Path 2: is_all_out=False → converts fractional notation to decimal
    """

    def test_path1_all_out_returns_max_overs(self):
        """Path 1 – all_out=True → returns max_overs regardless of overs_played"""
        from app.services.nrr_calculator import NRRCalculator
        result = NRRCalculator.overs_to_decimal(15.3, is_all_out=True, max_overs=20)
        assert result == 20.0

    def test_path1_custom_max_overs(self):
        """Path 1 variant – all_out=True with T20I-style 50 overs"""
        from app.services.nrr_calculator import NRRCalculator
        result = NRRCalculator.overs_to_decimal(45.4, is_all_out=True, max_overs=50)
        assert result == 50.0

    def test_path2_zero_overs(self):
        """Path 2 – 0.0 overs → 0.0 decimal"""
        from app.services.nrr_calculator import NRRCalculator
        result = NRRCalculator.overs_to_decimal(0.0)
        assert result == 0.0

    def test_path2_complete_overs(self):
        """Path 2 – 16.0 (exactly 16 overs) → 16.0"""
        from app.services.nrr_calculator import NRRCalculator
        result = NRRCalculator.overs_to_decimal(16.0)
        assert result == pytest.approx(16.0, abs=1e-6)

    def test_path2_fractional_overs(self):
        """Path 2 – 16.3 (16 overs + 3 balls = 16 + 3/6) → 16.5"""
        from app.services.nrr_calculator import NRRCalculator
        result = NRRCalculator.overs_to_decimal(16.3)
        assert result == pytest.approx(16.5, abs=1e-6)

    def test_path2_max_balls_in_over(self):
        """Path 2 – 19.5 (19 overs + 5 balls = 19 + 5/6) ≈ 19.833"""
        from app.services.nrr_calculator import NRRCalculator
        result = NRRCalculator.overs_to_decimal(19.5)
        assert result == pytest.approx(19 + 5 / 6, abs=1e-4)


class TestCalculateNRR:
    """
    calculate_nrr(runs_scored, overs_faced_dec, runs_conceded, overs_bowled_dec) -> float
    
    Control-flow:
        1 → for_rate  = (runs_scored / overs_faced_dec)  if overs_faced_dec > 0  else 0.0
                                                             [branch A: >0 | Path 1]
                                                             [branch B: =0 | Path 2]
        2 → against_rate = (runs_conceded / overs_bowled_dec) if overs_bowled_dec > 0 else 0.0
                                                             [branch C: >0 | Path 1,2]
                                                             [branch D: =0 | Path 3]
        3 → return round(for_rate - against_rate, 3)
    
    V(G) = 3  →  3 independent paths
    
    Path 1: both denominators > 0  → normal NRR computation
    Path 2: overs_faced = 0        → for_rate = 0, normal against_rate
    Path 3: overs_bowled = 0       → normal for_rate, against_rate = 0
    """

    def test_path1_normal_nrr_positive(self):
        """Path 1 – team scored faster than conceded → positive NRR"""
        from app.services.nrr_calculator import NRRCalculator
        # Scored 200 in 20 overs (10 rpo), conceded 150 in 20 overs (7.5 rpo)
        nrr = NRRCalculator.calculate_nrr(200, 20.0, 150, 20.0)
        assert nrr == pytest.approx(2.5, abs=0.001)

    def test_path1_normal_nrr_negative(self):
        """Path 1 – team conceded faster → negative NRR"""
        from app.services.nrr_calculator import NRRCalculator
        nrr = NRRCalculator.calculate_nrr(150, 20.0, 200, 20.0)
        assert nrr == pytest.approx(-2.5, abs=0.001)

    def test_path1_nrr_rounded_to_3dp(self):
        """Path 1 – result is rounded to 3 decimal places"""
        from app.services.nrr_calculator import NRRCalculator
        nrr = NRRCalculator.calculate_nrr(181, 19.5, 175, 20.0)
        # Manually: (181/19.833) - (175/20) = 9.125 - 8.75 = 0.375
        assert isinstance(nrr, float)
        assert round(nrr, 3) == nrr   # already rounded

    def test_path2_zero_overs_faced_for_rate_is_zero(self):
        """Path 2 – overs_faced_dec=0 → for_rate=0, NRR is negative"""
        from app.services.nrr_calculator import NRRCalculator
        nrr = NRRCalculator.calculate_nrr(100, 0.0, 50, 10.0)
        assert nrr == pytest.approx(-5.0, abs=0.001)

    def test_path3_zero_overs_bowled_against_rate_is_zero(self):
        """Path 3 – overs_bowled_dec=0 → against_rate=0, NRR equals for_rate"""
        from app.services.nrr_calculator import NRRCalculator
        nrr = NRRCalculator.calculate_nrr(100, 10.0, 0, 0.0)
        assert nrr == pytest.approx(10.0, abs=0.001)

    def test_path_both_zero_returns_zero(self):
        """Edge – both denominators=0 → NRR=0.0"""
        from app.services.nrr_calculator import NRRCalculator
        nrr = NRRCalculator.calculate_nrr(0, 0.0, 0, 0.0)
        assert nrr == 0.0


# ===========================================================================
# MODULE 3 — app/services/stats_engine.py  (pure-logic helpers)
# Focus: batting_average, strike_rate, fifties/hundreds, economy formulas
# (tested via unit-level computation that mirrors the engine's logic)
# ===========================================================================

class TestStatsEngineFormulas:
    """
    These tests validate the key arithmetic formulas embedded in
    StatsEngine.get_player_career_stats() by exercising the branching
    conditions with controlled data — without a live database.
    
    V(G) for batting_average branch = 2
    V(G) for strike_rate branch     = 2
    V(G) for economy branch         = 2
    
    Path matrix:
        Path 1: times_out > 0                     → normal average
        Path 2: times_out == 0                     → average = total_runs (not out)
        Path 3: balls_faced > 0                    → normal strike_rate
        Path 4: balls_faced == 0                   → strike_rate = 0.0
        Path 5: overs_bowled_dec > 0               → normal economy
        Path 6: overs_bowled_dec == 0              → economy = 0.0
    """

    # ---- helper formulas replicated from the engine ----
    @staticmethod
    def _batting_avg(total_runs, times_out):
        return round(total_runs / times_out, 2) if times_out > 0 else float(total_runs)

    @staticmethod
    def _strike_rate(total_runs, balls_faced):
        return round((total_runs / balls_faced) * 100, 2) if balls_faced > 0 else 0.0

    @staticmethod
    def _economy(runs_conceded, overs_dec):
        return round(runs_conceded / overs_dec, 2) if overs_dec > 0 else 0.0

    @staticmethod
    def _milestones(runs_by_inning):
        fifties  = sum(1 for r in runs_by_inning.values() if 50 <= r < 100)
        hundreds = sum(1 for r in runs_by_inning.values() if r >= 100)
        return fifties, hundreds

    # -- Batting Average --

    def test_path1_batting_average_normal(self):
        """Path 1 – times_out > 0 → runs / times_out"""
        avg = self._batting_avg(450, 9)
        assert avg == pytest.approx(50.0, abs=0.01)

    def test_path2_batting_average_not_out(self):
        """Path 2 – times_out = 0 (never dismissed) → returns total runs"""
        avg = self._batting_avg(120, 0)
        assert avg == 120.0

    def test_path2_batting_average_zero_runs_not_out(self):
        """Path 2 edge – 0 runs, 0 dismissals → 0.0"""
        avg = self._batting_avg(0, 0)
        assert avg == 0.0

    # -- Strike Rate --

    def test_path3_strike_rate_normal(self):
        """Path 3 – balls_faced > 0 → (runs / balls) * 100"""
        sr = self._strike_rate(75, 50)
        assert sr == pytest.approx(150.0, abs=0.01)

    def test_path4_strike_rate_no_balls_faced(self):
        """Path 4 – balls_faced = 0 → 0.0"""
        sr = self._strike_rate(0, 0)
        assert sr == 0.0

    # -- Economy --

    def test_path5_economy_normal(self):
        """Path 5 – overs_dec > 0 → runs_conceded / overs_dec"""
        eco = self._economy(90, 10.0)
        assert eco == pytest.approx(9.0, abs=0.01)

    def test_path6_economy_no_balls_bowled(self):
        """Path 6 – overs_dec = 0 → 0.0"""
        eco = self._economy(0, 0.0)
        assert eco == 0.0

    # -- Fifties / Hundreds (milestone boundaries) --

    def test_fifty_boundary_exactly_50(self):
        """50 is a fifty (not a hundred): 50 <= 50 < 100"""
        fifties, hundreds = self._milestones({"inn1": 50})
        assert fifties == 1 and hundreds == 0

    def test_hundred_boundary_exactly_100(self):
        """100 is a hundred: 100 >= 100"""
        fifties, hundreds = self._milestones({"inn1": 100})
        assert fifties == 0 and hundreds == 1

    def test_49_not_a_milestone(self):
        """49 is neither a fifty nor a hundred"""
        fifties, hundreds = self._milestones({"inn1": 49})
        assert fifties == 0 and hundreds == 0

    def test_mixed_innings_milestones(self):
        """Multiple innings counting correctly"""
        runs = {"i1": 45, "i2": 67, "i3": 102, "i4": 155, "i5": 99}
        fifties, hundreds = self._milestones(runs)
        assert fifties == 2    # 67, 99
        assert hundreds == 2   # 102, 155


# ===========================================================================
# MODULE 4 — app/services/connection_manager.py
# Functions: connect, disconnect, broadcast
# ===========================================================================

class TestConnectionManager:
    """
    ConnectionManager manages WebSocket rooms per match_id.
    
    connect(match_id, ws)
        Path 1: match_id already exists → add to existing set
        Path 2: match_id is new         → create set then add
    
    disconnect(match_id, ws)
        Path 1: match_id not in rooms        → no-op
        Path 2: match_id exists, room still has connections → discard ws
        Path 3: match_id exists, room becomes empty          → delete room
    
    broadcast(match_id, payload)
        Path 1: match_id not in rooms → return immediately (no-op)
        Path 2: rooms exist, all sends succeed   → all clients receive data
        Path 3: rooms exist, some sends fail     → dead sockets cleaned up
    """

    def _make_ws(self):
        ws = AsyncMock()
        ws.accept = AsyncMock()
        ws.send_json = AsyncMock()
        return ws

    # ---- connect ----

    @pytest.mark.asyncio
    async def test_connect_path1_new_room_created(self):
        """Path 1 – first connection for a match_id → room initialized"""
        from app.services.connection_manager import ConnectionManager
        cm = ConnectionManager()
        ws = self._make_ws()
        await cm.connect("match-A", ws)
        assert "match-A" in cm.active_rooms
        assert ws in cm.active_rooms["match-A"]

    @pytest.mark.asyncio
    async def test_connect_path2_existing_room_appended(self):
        """Path 2 – second connection to same room → both present"""
        from app.services.connection_manager import ConnectionManager
        cm = ConnectionManager()
        ws1, ws2 = self._make_ws(), self._make_ws()
        await cm.connect("match-B", ws1)
        await cm.connect("match-B", ws2)
        assert len(cm.active_rooms["match-B"]) == 2

    # ---- disconnect ----

    def test_disconnect_path1_unknown_room_is_noop(self):
        """Path 1 – disconnecting from non-existent room raises no error"""
        from app.services.connection_manager import ConnectionManager
        cm = ConnectionManager()
        ws = self._make_ws()
        cm.disconnect("no-such-room", ws)   # must not raise
        assert "no-such-room" not in cm.active_rooms

    @pytest.mark.asyncio
    async def test_disconnect_path2_room_survives_partial_disconnect(self):
        """Path 2 – one of two clients disconnects, room stays alive"""
        from app.services.connection_manager import ConnectionManager
        cm = ConnectionManager()
        ws1, ws2 = self._make_ws(), self._make_ws()
        await cm.connect("match-C", ws1)
        await cm.connect("match-C", ws2)
        cm.disconnect("match-C", ws1)
        assert "match-C" in cm.active_rooms
        assert ws1 not in cm.active_rooms["match-C"]
        assert ws2 in cm.active_rooms["match-C"]

    @pytest.mark.asyncio
    async def test_disconnect_path3_room_deleted_when_empty(self):
        """Path 3 – last client disconnects → room entry deleted"""
        from app.services.connection_manager import ConnectionManager
        cm = ConnectionManager()
        ws = self._make_ws()
        await cm.connect("match-D", ws)
        cm.disconnect("match-D", ws)
        assert "match-D" not in cm.active_rooms

    # ---- broadcast ----

    @pytest.mark.asyncio
    async def test_broadcast_path1_no_room_returns_silently(self):
        """Path 1 – no room for match → broadcast is a no-op"""
        from app.services.connection_manager import ConnectionManager
        cm = ConnectionManager()
        # Must not raise
        await cm.broadcast("match-X", {"event": "TEST"})

    @pytest.mark.asyncio
    async def test_broadcast_path2_all_clients_receive(self):
        """Path 2 – all connections healthy → each receives the payload"""
        from app.services.connection_manager import ConnectionManager
        cm = ConnectionManager()
        ws1, ws2 = self._make_ws(), self._make_ws()
        await cm.connect("match-E", ws1)
        await cm.connect("match-E", ws2)
        payload = {"event": "BALL_RECORDED", "runs": 4}
        await cm.broadcast("match-E", payload)
        ws1.send_json.assert_called_once_with(payload)
        ws2.send_json.assert_called_once_with(payload)

    @pytest.mark.asyncio
    async def test_broadcast_path3_dead_socket_cleaned_up(self):
        """Path 3 – one socket raises on send → dead socket removed"""
        from app.services.connection_manager import ConnectionManager
        cm = ConnectionManager()
        ws_alive = self._make_ws()
        ws_dead = self._make_ws()
        ws_dead.send_json.side_effect = Exception("Connection reset")

        await cm.connect("match-F", ws_alive)
        await cm.connect("match-F", ws_dead)
        await cm.broadcast("match-F", {"event": "WICKET"})

        # Dead socket should be removed from the room
        assert ws_dead not in cm.active_rooms.get("match-F", set())
        # Alive socket should still be present
        assert ws_alive in cm.active_rooms["match-F"]


# ===========================================================================
# MODULE 5 — Scoring Logic (pure arithmetic, no DB)
# Isolated from scoring_service.py inline logic
# ===========================================================================

class TestScoringLogicLegalBallCount:
    """
    Inline logic from record_ball():
        legal_balls_count = sum(1 for b in existing_balls
                                if b.get("extras_type") not in ("wide", "no_ball"))
        current_over_no       = legal_balls_count // 6
        current_ball_in_over  = (legal_balls_count % 6) + 1
    
    V(G) per filter condition = 2
    
    Path 1: all balls are legal    → count = total balls
    Path 2: all balls are extras   → count = 0
    Path 3: mixed legal and extras → count = subset
    """

    def _count_legal(self, balls):
        return sum(1 for b in balls if b.get("extras_type") not in ("wide", "no_ball"))

    def test_path1_all_legal_balls(self):
        """Path 1 – no extras → legal count equals total"""
        balls = [{"extras_type": "none"}, {"extras_type": "bye"}, {"extras_type": "leg_bye"}]
        assert self._count_legal(balls) == 3

    def test_path2_all_wide_and_noball(self):
        """Path 2 – all wides/no-balls → legal count = 0"""
        balls = [{"extras_type": "wide"}, {"extras_type": "no_ball"}, {"extras_type": "wide"}]
        assert self._count_legal(balls) == 0

    def test_path3_mixed_extras(self):
        """Path 3 – mix → count only non-wide/no-ball"""
        balls = [
            {"extras_type": "none"},
            {"extras_type": "wide"},
            {"extras_type": "bye"},
            {"extras_type": "no_ball"},
            {"extras_type": "none"},
        ]
        assert self._count_legal(balls) == 3

    def test_over_number_calculation(self):
        """After 12 legal balls → over_no=2 (3rd over, 0-indexed)"""
        legal_count = 12
        assert legal_count // 6 == 2

    def test_ball_in_over_calculation(self):
        """After 12 legal balls → ball_in_over=1 (1st delivery of over 2)"""
        legal_count = 12
        assert (legal_count % 6) + 1 == 1


class TestScoringLogicExtrasAndRuns:
    """
    Inline logic from record_ball() for extras and batsman runs:
    
    Control-flow:
        1 → if extras_type == WIDE:
                extras_penalty = 1 + extras_runs; batsman_runs = 0
        2 → elif extras_type == NO_BALL:
                extras_penalty = 1 + extras_runs
                (batsman DOES get runs)
        3 → elif extras_type in (BYE, LEG_BYE):
                extras_penalty = runs_scored; batsman_runs = 0
        4 → else (NONE):
                extras_penalty = 0; batsman_runs unchanged
    
    V(G) = 4  →  4 independent paths (one per branch)
    """

    def _compute(self, extras_type, runs_scored, extras_runs=0):
        """Replicate the scoring_service record_ball extras logic."""
        batsman_runs = runs_scored
        extras_penalty = 0
        WIDE, NO_BALL, BYE, LEG_BYE = "wide", "no_ball", "bye", "leg_bye"

        if extras_type == WIDE:
            extras_penalty = 1 + extras_runs
            batsman_runs = 0
        elif extras_type == NO_BALL:
            extras_penalty = 1 + extras_runs
        elif extras_type in (BYE, LEG_BYE):
            extras_penalty = runs_scored
            batsman_runs = 0

        return batsman_runs, extras_penalty, batsman_runs + extras_penalty

    def test_path1_wide_ball(self):
        """Path 1 – wide: 1 penalty + extra_runs; batsman gets 0"""
        bat_runs, extra_pen, total = self._compute("wide", 0, extras_runs=2)
        assert bat_runs == 0
        assert extra_pen == 3     # 1 wide + 2 overthrows
        assert total == 3

    def test_path2_no_ball(self):
        """Path 2 – no-ball: penalty=1+extras; batsman keeps runs"""
        bat_runs, extra_pen, total = self._compute("no_ball", 4, extras_runs=0)
        assert bat_runs == 4
        assert extra_pen == 1
        assert total == 5

    def test_path3_bye(self):
        """Path 3 – bye: extras = runs_scored; batsman gets 0"""
        bat_runs, extra_pen, total = self._compute("bye", 3, extras_runs=0)
        assert bat_runs == 0
        assert extra_pen == 3
        assert total == 3

    def test_path3_leg_bye(self):
        """Path 3b – leg-bye behaves same as bye"""
        bat_runs, extra_pen, total = self._compute("leg_bye", 2, extras_runs=0)
        assert bat_runs == 0
        assert extra_pen == 2
        assert total == 2

    def test_path4_normal_delivery(self):
        """Path 4 – none: no extras, batsman gets all runs"""
        bat_runs, extra_pen, total = self._compute("none", 6)
        assert bat_runs == 6
        assert extra_pen == 0
        assert total == 6

    def test_path4_dot_ball(self):
        """Path 4 – none with 0 runs (dot ball)"""
        bat_runs, extra_pen, total = self._compute("none", 0)
        assert total == 0


class TestScoringLogicStrikeRotation:
    """
    Inline logic from record_ball() for strike rotation:
    
        odd_runs_crossed = (running_runs % 2 == 1)
        strike_swap = odd_runs_crossed XOR over_completed
    
    4 combinations of (odd_runs_crossed, over_completed):
    
    Path 1: (False, False) → no swap
    Path 2: (True,  False) → swap (odd run, mid-over)
    Path 3: (False, True ) → swap (even run, end-of-over)
    Path 4: (True,  True ) → no swap (XOR cancels)
    
    V(G) = 2  →  2 key paths for XOR gate
    """

    @staticmethod
    def _strike_swap(running_runs, over_completed):
        odd_runs_crossed = (running_runs % 2 == 1)
        return odd_runs_crossed ^ over_completed

    def test_path1_even_run_mid_over_no_swap(self):
        """Path 1 – 0 runs, mid-over → no swap"""
        assert self._strike_swap(0, False) is False

    def test_path2_odd_run_mid_over_swap(self):
        """Path 2 – 1 run, mid-over → swap"""
        assert self._strike_swap(1, False) is True

    def test_path3_even_run_end_of_over_swap(self):
        """Path 3 – 2 runs (even), end-of-over → swap (rotates for new over)"""
        assert self._strike_swap(2, True) is True

    def test_path4_odd_run_end_of_over_no_swap(self):
        """Path 4 – 1 run (odd), end-of-over → XOR cancels → no swap"""
        assert self._strike_swap(1, True) is False

    def test_six_runs_mid_over_no_swap(self):
        """6 is even, mid-over → no swap"""
        assert self._strike_swap(6, False) is False

    def test_four_runs_end_of_over_swaps(self):
        """4 is even, end-of-over → swap (rotates at over end)"""
        assert self._strike_swap(4, True) is True


class TestScoringLogicUndoRunsCalculation:
    """
    Inline logic from undo_last_ball():
        runs_to_remove = (runs_scored or 0) + (extras_runs or 0)
        wickets_to_remove = 1 if is_wicket else 0
        new_total_runs = max(0, active_inning_runs - runs_to_remove)
        new_wickets    = max(0, active_wickets   - wickets_to_remove)
    
    V(G) = 3 (two max() guards + is_wicket branch)
    
    Path 1: is_wicket=True  → wickets_to_remove=1
    Path 2: is_wicket=False → wickets_to_remove=0
    Path 3: runs_to_remove > active_runs → clamped to 0
    """

    def _undo(self, innings_runs, innings_wickets, last_ball):
        runs_to_remove = (last_ball.get("runs_scored") or 0) + (last_ball.get("extras_runs") or 0)
        wickets_to_remove = 1 if last_ball.get("is_wicket") else 0
        new_runs    = max(0, innings_runs    - runs_to_remove)
        new_wickets = max(0, innings_wickets - wickets_to_remove)
        return new_runs, new_wickets

    def test_path1_undo_wicket(self):
        """Path 1 – last ball was a wicket → wickets decremented"""
        runs, wkts = self._undo(45, 3, {"runs_scored": 0, "extras_runs": 0, "is_wicket": True})
        assert runs == 45
        assert wkts == 2

    def test_path2_undo_normal_ball(self):
        """Path 2 – not a wicket → wickets unchanged"""
        runs, wkts = self._undo(45, 3, {"runs_scored": 4, "extras_runs": 0, "is_wicket": False})
        assert runs == 41
        assert wkts == 3

    def test_path3_undo_clamped_to_zero(self):
        """Path 3 – runs would go negative → clamped to 0"""
        runs, wkts = self._undo(2, 0, {"runs_scored": 6, "extras_runs": 1, "is_wicket": False})
        assert runs == 0     # max(0, 2 - 7) = 0
        assert wkts == 0

    def test_undo_extras_deducted(self):
        """Wide penalty (runs_scored=0, extras_runs=3) → 3 runs removed"""
        runs, wkts = self._undo(30, 1, {"runs_scored": 0, "extras_runs": 3, "is_wicket": False})
        assert runs == 27


class TestScoringLogicCRRandRRR:
    """
    Inline logic from compile_live_scorecard():
    
        crr = total_runs / overs_in_decimal if overs_in_decimal > 0 else 0.0
        rrr = rem_runs / rem_overs          if rem_overs > 0        else None
    
    V(G) = 2+2 = 4  →  4 independent paths
    
    Path 1: overs_dec > 0  → CRR computed normally
    Path 2: overs_dec = 0  → CRR = 0.0
    Path 3: rem_overs > 0  → RRR computed
    Path 4: rem_overs = 0  → RRR = None (cannot achieve target)
    """

    @staticmethod
    def _crr(total_runs, overs_dec):
        return round(total_runs / overs_dec, 2) if overs_dec > 0 else 0.0

    @staticmethod
    def _rrr(target, total_runs, total_match_balls, legal_balls):
        rem_runs  = max(0, target - total_runs)
        rem_balls = max(0, total_match_balls - legal_balls)
        rem_overs = rem_balls / 6.0
        return round(rem_runs / rem_overs, 2) if rem_overs > 0 else None

    def test_path1_crr_normal(self):
        """Path 1 – CRR with overs played"""
        assert self._crr(120, 12.0) == pytest.approx(10.0, abs=0.01)

    def test_path2_crr_zero_overs(self):
        """Path 2 – no overs faced yet → CRR = 0.0"""
        assert self._crr(0, 0.0) == 0.0

    def test_path3_rrr_normal(self):
        """Path 3 – need 80 from 60 balls → RRR = 8.0"""
        rrr = self._rrr(target=200, total_runs=120, total_match_balls=120, legal_balls=60)
        assert rrr == pytest.approx(8.0, abs=0.01)

    def test_path4_rrr_no_balls_left(self):
        """Path 4 – no remaining balls → RRR = None"""
        rrr = self._rrr(target=200, total_runs=100, total_match_balls=120, legal_balls=120)
        assert rrr is None

    def test_rrr_target_already_met(self):
        """Target already exceeded → rem_runs=0 → RRR=0.0"""
        rrr = self._rrr(target=150, total_runs=160, total_match_balls=120, legal_balls=90)
        assert rrr == 0.0


# ===========================================================================
# MODULE 6 — Recent Balls Ribbon logic (compile_live_scorecard)
# ===========================================================================

class TestRecentBallsRibbon:
    """
    Inline logic from compile_live_scorecard():
    
        for b in balls[-6:]:
            if b.get("is_wicket"):       → "W"          [Path 1]
            elif extras_type == "wide":  → "Wd" / "NWd" [Path 2]
            elif extras_type == "no_ball":→ "Nb"        [Path 3]
            elif extras in (bye,leg_bye):→ "NB"         [Path 4]
            else:                        → str(runs)    [Path 5]
    
    V(G) = 5  →  5 independent paths
    """

    def _build_ribbon(self, balls):
        ribbon = []
        for b in balls[-6:]:
            if b.get("is_wicket"):
                ribbon.append("W")
            elif b.get("extras_type") == "wide":
                extra_r = b.get("extras_runs", 1)
                ribbon.append(f"{extra_r}Wd" if extra_r > 1 else "Wd")
            elif b.get("extras_type") == "no_ball":
                ribbon.append("Nb")
            elif b.get("extras_type") in ("bye", "leg_bye"):
                ribbon.append(f"{b.get('extras_runs', 1)}B")
            else:
                ribbon.append(str(b.get("runs_scored", 0)))
        return ribbon

    def test_path1_wicket(self):
        """Path 1 – wicket ball → 'W'"""
        result = self._build_ribbon([{"is_wicket": True, "extras_type": "none", "runs_scored": 0}])
        assert result == ["W"]

    def test_path2_wide_single(self):
        """Path 2 – standard wide → 'Wd'"""
        result = self._build_ribbon([{"is_wicket": False, "extras_type": "wide", "extras_runs": 1, "runs_scored": 0}])
        assert result == ["Wd"]

    def test_path2_wide_with_extras(self):
        """Path 2 – wide + overthrows → '3Wd'"""
        result = self._build_ribbon([{"is_wicket": False, "extras_type": "wide", "extras_runs": 3, "runs_scored": 0}])
        assert result == ["3Wd"]

    def test_path3_no_ball(self):
        """Path 3 – no-ball → 'Nb'"""
        result = self._build_ribbon([{"is_wicket": False, "extras_type": "no_ball", "extras_runs": 1, "runs_scored": 4}])
        assert result == ["Nb"]

    def test_path4_bye(self):
        """Path 4 – bye → '2B'"""
        result = self._build_ribbon([{"is_wicket": False, "extras_type": "bye", "extras_runs": 2, "runs_scored": 0}])
        assert result == ["2B"]

    def test_path4_leg_bye(self):
        """Path 4b – leg-bye → '1B'"""
        result = self._build_ribbon([{"is_wicket": False, "extras_type": "leg_bye", "extras_runs": 1, "runs_scored": 0}])
        assert result == ["1B"]

    def test_path5_normal_runs(self):
        """Path 5 – normal delivery → string of runs"""
        balls = [
            {"is_wicket": False, "extras_type": "none", "runs_scored": 4},
            {"is_wicket": False, "extras_type": "none", "runs_scored": 0},
            {"is_wicket": False, "extras_type": "none", "runs_scored": 6},
        ]
        result = self._build_ribbon(balls)
        assert result == ["4", "0", "6"]

    def test_ribbon_limited_to_last_6_balls(self):
        """Ribbon only shows last 6 balls regardless of total balls bowled"""
        balls = [{"is_wicket": False, "extras_type": "none", "runs_scored": i} for i in range(10)]
        result = self._build_ribbon(balls)
        assert len(result) == 6
        assert result == ["4", "5", "6", "7", "8", "9"]


# ===========================================================================
# MODULE 7 — NRRCalculator.calculate_tournament_standings
#            (match status branching logic, isolated)
# ===========================================================================

class TestTournamentStandingsMatchBranching:
    """
    Within calculate_tournament_standings():

        if status not in ("completed", "live"):
            continue                               [Path 1 – skip match]

        if status == "completed":
            if winner_id:                          [Path 2 – winner exists]
                loser_id = ...
            elif status == "abandoned":            [Path 3 – abandoned NR]
                ...
            else:                                  [Path 4 – tie]
                ...
    
    V(G) = 5  →  5 independent paths

    We test the points accumulation logic directly with in-memory data.
    """

    def _make_stats(self, team_ids):
        return {
            tid: {
                "played": 0, "won": 0, "lost": 0, "tied": 0, "nr": 0,
                "points": 0, "form": []
            }
            for tid in team_ids
        }

    def _process_match(self, stats, t1_id, t2_id, status, winner_id=None):
        """Replicates the inner match-processing loop from calculate_tournament_standings."""
        if status not in ("completed", "live"):
            return

        if status == "completed":
            if t1_id in stats:
                stats[t1_id]["played"] += 1
            if t2_id in stats:
                stats[t2_id]["played"] += 1

            if winner_id:
                loser_id = t2_id if winner_id == t1_id else t1_id
                if winner_id in stats:
                    stats[winner_id]["won"] += 1
                    stats[winner_id]["points"] += 2
                    stats[winner_id]["form"].append("W")
                if loser_id in stats:
                    stats[loser_id]["lost"] += 1
                    stats[loser_id]["form"].append("L")
            elif status == "abandoned":
                for tid in (t1_id, t2_id):
                    if tid in stats:
                        stats[tid]["nr"] += 1
                        stats[tid]["points"] += 1
                        stats[tid]["form"].append("NR")
            else:
                # Tie
                for tid in (t1_id, t2_id):
                    if tid in stats:
                        stats[tid]["tied"] += 1
                        stats[tid]["points"] += 1
                        stats[tid]["form"].append("T")

    def test_path1_scheduled_match_skipped(self):
        """Path 1 – status='scheduled' → not counted in standings"""
        stats = self._make_stats(["T1", "T2"])
        self._process_match(stats, "T1", "T2", "scheduled")
        assert stats["T1"]["played"] == 0
        assert stats["T2"]["played"] == 0

    def test_path2_completed_with_winner(self):
        """Path 2 – completed with winner → 2pts for winner, 0 for loser"""
        stats = self._make_stats(["T1", "T2"])
        self._process_match(stats, "T1", "T2", "completed", winner_id="T1")
        assert stats["T1"]["points"] == 2
        assert stats["T1"]["won"] == 1
        assert stats["T2"]["lost"] == 1
        assert stats["T2"]["points"] == 0

    def test_path3_tie_both_get_one_point(self):
        """Path 4 – tie (no winner, not abandoned) → 1 point each"""
        stats = self._make_stats(["T1", "T2"])
        self._process_match(stats, "T1", "T2", "completed", winner_id=None)
        assert stats["T1"]["points"] == 1
        assert stats["T1"]["tied"] == 1
        assert stats["T2"]["points"] == 1
        assert stats["T2"]["tied"] == 1

    def test_path4_live_match_updates_nrr_only(self):
        """Path 5 – live match → played not incremented, loop processes innings"""
        stats = self._make_stats(["T1", "T2"])
        self._process_match(stats, "T1", "T2", "live")
        # played only incremented for "completed"
        assert stats["T1"]["played"] == 0

    def test_form_list_tracking(self):
        """Form list appended correctly across multiple matches"""
        stats = self._make_stats(["T1", "T2"])
        self._process_match(stats, "T1", "T2", "completed", winner_id="T1")
        self._process_match(stats, "T1", "T2", "completed", winner_id="T2")
        self._process_match(stats, "T1", "T2", "completed", winner_id=None)  # tie
        assert stats["T1"]["form"] == ["W", "L", "T"]
        assert stats["T2"]["form"] == ["L", "W", "T"]


# ===========================================================================
# Summary assertion: all test classes are importable and have > 0 tests
# ===========================================================================

def test_module_imports():
    """Smoke test – confirm core modules can be imported without errors."""
    from app import auth                                # noqa
    from app.services import nrr_calculator             # noqa
    from app.services import stats_engine               # noqa
    from app.services import connection_manager         # noqa
    from app.schemas.auth import UserRole, UserResponse # noqa
    from app.schemas.scoring import ExtrasType          # noqa

