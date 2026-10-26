import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent.parent))
from supabase_client import get_supabase_client
from app.auth import get_password_hash

DEFAULT_USERS = [
    {
        "name": "Admin User",
        "email": "admin@cdms.com",
        "password": get_password_hash("password123"),
        "role": "admin"
    },
    {
        "name": "Match Scorer",
        "email": "scorer@cdms.com",
        "password": get_password_hash("password123"),
        "role": "scorer"
    },
    {
        "name": "Cricket Fan",
        "email": "fan@cdms.com",
        "password": get_password_hash("password123"),
        "role": "user"
    }
]

def seed_users():
    supabase = get_supabase_client()
    print("Seeding default CDMS users...")

    for user in DEFAULT_USERS:
        existing = supabase.table("users").select("user_id, email, role").eq("email", user["email"]).execute()
        if not existing.data:
            res = supabase.table("users").insert(user).execute()
            print(f"[CREATED] {user['name']} ({user['email']}) - Role: {user['role']}")
        else:
            print(f"[EXISTS] {user['name']} ({user['email']}) - Role: {existing.data[0]['role']}")

    print("User seeding completed!")

if __name__ == "__main__":
    seed_users()
