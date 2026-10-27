import os
from supabase import create_client, Client
from app.config import settings

_supabase_client: Client | None = None
_supabase_admin_client: Client | None = None

def get_supabase() -> Client | None:
    """Returns the standard Supabase client (anon key)."""
    global _supabase_client
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        return None
    if _supabase_client is None:
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _supabase_client

def get_supabase_admin() -> Client | None:
    """Returns the privileged Supabase client (service role key) for backend admin overrides."""
    global _supabase_admin_client
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    if not settings.SUPABASE_URL or not key:
        return None
    if _supabase_admin_client is None:
        _supabase_admin_client = create_client(settings.SUPABASE_URL, key)
    return _supabase_admin_client
