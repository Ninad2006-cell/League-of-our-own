import asyncio
import json
import websockets

async def test_ws():
    match_id = "3fdeaefc-1e20-41a6-a89b-42c645958f7c"
    uri = f"ws://127.0.0.1:8000/ws/matches/{match_id}"
    print(f"Connecting to {uri}...")
    async with websockets.connect(uri) as ws:
        msg = await asyncio.wait_for(ws.recv(), timeout=5.0)
        data = json.loads(msg)
        print("[PASS] Received initial WebSocket payload:")
        print(f"       Event: {data.get('event')}")
        print(f"       Score: {data.get('scorecard', {}).get('total_runs')}/{data.get('scorecard', {}).get('wickets')}")
        assert data.get("event") == "CONNECTED"
        print(">>> WEBSOCKET REAL-TIME TEST PASSED! <<<")

if __name__ == "__main__":
    asyncio.run(test_ws())
