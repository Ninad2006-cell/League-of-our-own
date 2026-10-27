"""
CricketData.org API Tester Script
---------------------------------
This script safely tests the CricketData.org API using exactly 1 API hit:
1. Queries the lightweight `cricScore` endpoint (which includes current live matches).
2. Displays formatted live match data in the terminal.
3. Saves the full JSON response to `sample_cricket_data.json` so you can inspect
   the schema and develop the UI offline without burning any more daily hits.

Usage:
    python test_cricket_api.py YOUR_API_KEY
    or set environment variable CRICKET_API_KEY and run:
    python test_cricket_api.py
"""

import sys
import os
import json
import urllib.request
import urllib.error

def test_cricket_api(api_key: str):
    if not api_key or api_key == "YOUR_API_KEY":
        print("ERROR: Please provide a valid CricketData.org API key.")
        print("Usage: python test_cricket_api.py <YOUR_API_KEY>")
        return

    # cricScore endpoint returns recent, current live, and upcoming fixtures in 1 call
    url = f"https://api.cricapi.com/v1/cricScore?apikey={api_key}"
    print(f"\n[1/3] Contacting CricketData.org API (consuming 1 hit)...")

    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0"}
        )
        with urllib.request.urlopen(req, timeout=15) as response:
            status_code = response.getcode()
            body = response.read().decode("utf-8")
            data = json.loads(body)
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}")
        try:
            err_data = json.loads(e.read().decode())
            print("API Response:", json.dumps(err_data, indent=2))
        except Exception:
            pass
        return
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    # Check API status
    api_status = data.get("status")
    if api_status != "success":
        print(f"\nAPI returned non-success status: {api_status}")
        print("Response:", json.dumps(data, indent=2))
        return

    # Save to disk so we can reuse the payload for development without extra hits
    output_filename = "sample_cricket_data.json"
    output_path = os.path.join(os.path.dirname(__file__), output_filename)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    matches = data.get("data", [])
    print(f"[2/3] Success! Received {len(matches)} matches.")
    print(f"[3/3] Saved full response to: {output_path}")

    # Summary of live / ongoing matches
    live_matches = []
    completed_matches = []
    upcoming_matches = []

    for m in matches:
        ms = m.get("ms", "").lower()
        match_status = m.get("status", "")
        # ms can be 'live', 'result', 'fixture', etc.
        if "live" in ms or m.get("matchStarted") and not m.get("matchEnded"):
            live_matches.append(m)
        elif m.get("matchEnded") or "won" in match_status.lower() or "result" in ms:
            completed_matches.append(m)
        else:
            upcoming_matches.append(m)

    print("\n" + "=" * 60)
    print(f" CRICKETDATA.ORG LIVE TEST RESULTS")
    print("=" * 60)
    print(f"Total Matches:    {len(matches)}")
    print(f"Currently Live:   {len(live_matches)}")
    print(f"Recently Ended:   {len(completed_matches)}")
    print(f"Upcoming:         {len(upcoming_matches)}")
    print("-" * 60)

    if live_matches:
        print("\n CURRENTLY LIVE MATCHES:")
        for idx, m in enumerate(live_matches[:5], 1):
            t1 = m.get("t1", "Team 1")
            t2 = m.get("t2", "Team 2")
            t1s = m.get("t1s", "-")
            t2s = m.get("t2s", "-")
            status = m.get("status", "In progress")
            match_type = m.get("matchType", "")
            print(f"  {idx}. [{match_type.upper()}] {t1} ({t1s}) vs {t2} ({t2s})")
            print(f"     Status: {status}")
    else:
        print("\n No matches currently live right now. Showing recent results:")
        for idx, m in enumerate(completed_matches[:3], 1):
            t1 = m.get("t1", "Team 1")
            t2 = m.get("t2", "Team 2")
            t1s = m.get("t1s", "-")
            t2s = m.get("t2s", "-")
            status = m.get("status", "")
            print(f"  {idx}. {t1} ({t1s}) vs {t2} ({t2s})")
            print(f"     Result: {status}")

    print("\n" + "=" * 60)
    print("Next step: We can use the saved 'sample_cricket_data.json' to wire up")
    print("your LiveScores UI with real team names, scores, and status flags!")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    key = sys.argv[1] if len(sys.argv) > 1 else os.getenv("CRICKET_API_KEY", "")
    if not key:
        print("Please enter your CricketData.org API key:")
        key = input("API Key: ").strip()
    test_cricket_api(key)
