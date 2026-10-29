# Real-Life Live Scoring Implementation Documentation

This document provides a comprehensive record of the live scoring integration built for the **League Of Our Own (CDMS)** platform using the **CricketData.org (CricAPI v1)** service.

---

## 1. Overview & Objectives

* **Goal:** Display real-world live cricket matches with up-to-date scores, team logos, and match statuses on the viewer's Live Scores screen.
* **Scope:** Match snapshot/summary updates when viewing the page (ball-by-ball WebSocket streaming was explicitly not required).
* **Constraint:** The CricketData.org free tier grants **only 100 API hits per day**. Direct client-side calls would quickly deplete this quota through page refreshes, tab switching, and Vite Hot Module Replacement (HMR).

---

## 2. Architecture & Quota Safeguard System

To guarantee that the daily quota is never accidentally exhausted, a **Backend Cache & Fallback Architecture** was implemented:

```
[ Browser / React Frontend ]
           │
           ▼
[ FastAPI Backend: GET /api/live-scores ]
           │
           ├─► Check In-Memory Cache (TTL: 5 mins)
           │     ├─► Valid (<5m) ──► Return Cached Data (0 Hits)
           │
           ├─► If Cache Expired or "force_refresh=true":
           │     ├─► Call CricketData.org API (1 Hit)
           │     ├─► Update In-Memory Cache
           │     └─► Save snapshot to backend/sample_cricket_data.json
           │
           └─► If Network/API Error or Rate Limited (HTTP 429):
                 └─► Serve Local Fallback Data (0 Hits, Zero UI Downtime)
```

### Hit Usage Summary Table

| Scenario | API Hits Used | Data Source |
|---|---|---|
| Opening/Refreshing within 5 minutes | **0 hits** | FastAPI memory cache |
| First visit / Refreshing after 5 minutes | **1 hit** | CricketData.org live endpoint |
| Clicking "Update Score" (Force refresh) | **1 hit** | CricketData.org live endpoint |
| Switching to "Sample Mode" | **0 hits** | Local saved JSON file |
| Rapid browser reloads (e.g., 50 times) | **0 hits** | Protected by backend cache |

---

## 3. Files Created and Modified

### Summary of Modified & Added Files

| File Path | Status | Purpose |
|---|---|---|
| [`backend/test_cricket_api.py`](file:///c:/Users/Madhur/Desktop/Madhur/Academics/Sem%205/SE%20Lab/CDMS/backend/test_cricket_api.py) | **Created** | Standalone verification script that safely tests the API with 1 hit and saves the response. |
| [`backend/sample_cricket_data.json`](file:///c:/Users/Madhur/Desktop/Madhur/Academics/Sem%205/SE%20Lab/CDMS/backend/sample_cricket_data.json) | **Created** | Saved snapshot of real API data (133 matches) used for offline testing and fallback. |
| [`backend/main.py`](file:///c:/Users/Madhur/Desktop/Madhur/Academics/Sem%205/SE%20Lab/CDMS/backend/main.py) | **Modified** | Added `/api/live-scores` endpoint with in-memory caching and match categorization. |
| [`frontend/src/data/sample_cricket_data.json`](file:///c:/Users/Madhur/Desktop/Madhur/Academics/Sem%205/SE%20Lab/CDMS/frontend/src/data/sample_cricket_data.json) | **Created** | Frontend fallback copy ensuring the UI works even if backend is offline. |
| [`frontend/src/pages/LiveScores.jsx`](file:///c:/Users/Madhur/Desktop/Madhur/Academics/Sem%205/SE%20Lab/CDMS/frontend/src/pages/LiveScores.jsx) | **Modified** | Real-world Match Center, dynamic hero card, mode toggle, and quota status display. |

---

## 4. Backend Implementation (`backend/main.py`)

### 4.1 Endpoint Specification

* **Route:** `GET /api/live-scores`
* **Query Parameters:**
  * `mode` (optional, default: `"live"`):
    * `"live"`: Uses live API with 5-minute memory caching.
    * `"sample"`: Reads directly from local sample file (0 hits).
  * `force_refresh` (optional, default: `false`):
    * `true`: Bypasses the 5-minute memory cache and forces a fresh external request.

### 4.2 Categorization Logic

Matches returned by CricketData.org are parsed into three distinct groups:

1. **`live`**: Matches where `ms == "live"` or the status contains indicators like `"stumps"`, `"day "`, or `"in progress"` (and `matchEnded` is false).
2. **`recent`**: Matches where `ms == "result"`, `matchEnded == true`, or status includes `"won"`, `"tied"`, or `"drawn"`.
3. **`upcoming`**: Scheduled fixtures that have not yet started.

### 4.3 Key Configuration Variables

```python
SAMPLE_FILE = os.path.join(os.path.dirname(__file__), "sample_cricket_data.json")
API_KEY = os.getenv("CRICKET_API_KEY", "f5775aef-f666-46e8-b3f7-20057593b870")
CACHE_TTL = 300  # 5 minutes in seconds
```

---

## 5. Frontend Implementation (`frontend/src/pages/LiveScores.jsx`)

### 5.1 Real-World Match Center
* A horizontal scrollable bar at the top featuring all ongoing and recent matches.
* Allows the user to click any match to inspect its detailed scoreboard in the main hero card.
* Filter pills allow toggling between:
  * **Live** matches (e.g., 22 matches)
  * **Recent** results (e.g., 46 matches)
  * **Upcoming** fixtures (e.g., 65 matches)

### 5.2 Dynamic Hero Scorecard
* Displays the official series/tournament name (e.g., *Ranji Trophy Plate 2026-27*, *WBBL*).
* Renders real team names and short codes (e.g., `Nagaland [NGL]`, `Sikkim [SKM]`).
* Displays official team logos (`t1img`, `t2img`) with fallback to initial badges.
* Shows formatted real scores (e.g., `187/10 (72.5)` vs `30/1 (15)`).
* Shows match status summary (e.g., `"Day 1: Stumps - Sikkim trail by 157 runs"`).
* Displays match format tag (`TEST`, `T20`, `ODI`) and date/time.

### 5.3 Quota Status & Controls
* **Live Status Badge:** Shows cache age and hit usage (`"Cached 15s ago (0 API hits used)"`).
* **Mode Toggle Pill:** One-click switch between `Live API Active` and `Sample Mode (0 hits)`.
* **Update Score Button:** Triggers `force_refresh=true` to immediately pull fresh scores from CricketData.org.

---

## 6. How to Run and Test

### 1. Start the Backend API Server

```powershell
cd "c:\Users\Madhur\Desktop\Madhur\Academics\Sem 5\SE Lab\CDMS\backend"
python -m uvicorn main:app --reload --port 8000
```
* Backend health check: [http://localhost:8000/health](http://localhost:8000/health)
* Live scores API: [http://localhost:8000/api/live-scores](http://localhost:8000/api/live-scores)
* Interactive Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Start the Frontend Development Server

```powershell
cd "c:\Users\Madhur\Desktop\Madhur\Academics\Sem 5\SE Lab\CDMS\frontend"
npm run dev
```
* Open in browser: [http://localhost:5173/live-scores](http://localhost:5173/live-scores)

### 3. Re-Testing the API Directly (Consumes 1 Hit)

If you ever wish to test the raw API independently:

```powershell
cd "c:\Users\Madhur\Desktop\Madhur\Academics\Sem 5\SE Lab\CDMS\backend"
python test_cricket_api.py f5775aef-f666-46e8-b3f7-20057593b870
```

---

## 7. Security & Best Practices

1. **API Key Protection:** The API key is stored and called only from the FastAPI backend. It is never exposed in client-side bundle code or browser network calls to CricketData.org.
2. **Environment Variable:** You can override the API key at any time by setting the `CRICKET_API_KEY` environment variable without changing the code:
   ```powershell
   $env:CRICKET_API_KEY="your-new-api-key"
   ```
3. **Resilience:** If CricketData.org experiences downtime or the 100 hits limit is reached, the frontend automatically falls back to `sample_cricket_data.json`, preventing broken screens or errors for users.
