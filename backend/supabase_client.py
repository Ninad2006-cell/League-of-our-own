import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
from supabase import create_client, Client

# Always resolve .env relative to this file so it works regardless of working directory
ENV_FILE = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=ENV_FILE)

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "").strip()


def is_supabase_configured() -> bool:
    """Check if valid Supabase credentials are provided."""
    return bool(
        SUPABASE_URL
        and SUPABASE_KEY
        and "your-project-id" not in SUPABASE_URL
        and "your-anon-or-service-role-key" not in SUPABASE_KEY
    )


def get_supabase_client() -> Client:
    """
    Returns an initialized Supabase Python client.
    Raises ValueError if credentials are not configured.
    """
    if not is_supabase_configured():
        raise ValueError(
            f"Supabase credentials not configured in {ENV_FILE}. "
            "Please ensure SUPABASE_URL and SUPABASE_KEY are set."
        )

    return create_client(SUPABASE_URL, SUPABASE_KEY)


# Export a ready-to-use client instance if configured
supabase: Optional[Client] = None
if is_supabase_configured():
    try:
        supabase = get_supabase_client()
    except Exception as _err:
        pass


if __name__ == "__main__":
    print(f"Checking environment at: {ENV_FILE}")
    print(f"SUPABASE_URL: {SUPABASE_URL[:25]}..." if SUPABASE_URL else "SUPABASE_URL: Not set")
    print("SUPABASE_KEY: [Configured]" if SUPABASE_KEY else "SUPABASE_KEY: Not set")
    
    if is_supabase_configured():
        try:
            test_client = get_supabase_client()
            print("SUCCESS: Supabase client initialized successfully!")
        except Exception as e:
            print(f"FAILED: Error initializing client: {e}")
    else:
        print("FAILED: Credentials not valid.")
