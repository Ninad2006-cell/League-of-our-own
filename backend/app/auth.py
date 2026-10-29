from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
from app.schemas.auth import UserRole, UserResponse
from app.supabase_client import get_supabase

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_user_from_db(email: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve user from database by email.
    Returns user data dict if found, None otherwise.
    """
    supabase = get_supabase()
    if not supabase:
        return None
    
    try:
        profile = supabase.table("users").select("*").eq("email", email.lower().strip()).execute()
        if profile.data and len(profile.data) > 0:
            return profile.data[0]
        return None
    except Exception:
        return None

def get_user_by_id_from_db(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve user from database by user_id.
    Returns user data dict if found, None otherwise.
    """
    supabase = get_supabase()
    if not supabase:
        return None
    
    try:
        profile = supabase.table("users").select("*").eq("user_id", user_id).execute()
        if profile.data and len(profile.data) > 0:
            return profile.data[0]
        return None
    except Exception:
        return None

# Mock in-memory user repository for seamless local offline/dev fallback
# when SUPABASE_URL / live DB connection credentials are not provided
MOCK_USERS_DB = {
    "admin@cdms.com": {
        "user_id": "11111111-1111-1111-1111-111111111111",
        "name": "Head Administrator",
        "email": "admin@cdms.com",
        "password_hash": get_password_hash("admin123"),
        "role": UserRole.admin,
    },
    "scorer@cdms.com": {
        "user_id": "22222222-2222-2222-2222-222222222222",
        "name": "Official Match Scorer",
        "email": "scorer@cdms.com",
        "password_hash": get_password_hash("scorer123"),
        "role": UserRole.scorer,
    },
    "user@cdms.com": {
        "user_id": "33333333-3333-3333-3333-333333333333",
        "name": "Cricket Enthusiast",
        "email": "user@cdms.com",
        "password_hash": get_password_hash("user123"),
        "role": UserRole.user,
    },
}

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> UserResponse:
    """Dependency to retrieve the currently authenticated user from Bearer Token."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    email = payload.get("email")
    role = payload.get("role")
    name = payload.get("name", "User")
    
    if not user_id or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user identity claims.",
        )
    
    # Optionally validate user against database to ensure they still exist
    db_user = get_user_by_id_from_db(user_id)
    if db_user:
        # Use fresh data from database
        db_user_id = db_user.get("user_id")
        if db_user_id:
            return UserResponse(
                user_id=db_user_id,
                name=db_user.get("name", name),
                email=db_user.get("email", email or ""),
                role=UserRole(db_user.get("role", role)),
            )
    
    # Fallback to token data if database not available
    return UserResponse(
        user_id=user_id,
        name=name,
        email=email or "",
        role=UserRole(role),
    )

def require_admin(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """RBAC Guard: Restricts endpoint access strictly to 'admin' role."""
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Administrator privileges required.",
        )
    return current_user

def require_scorer_or_admin(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """RBAC Guard: Restricts endpoint access to 'scorer' or 'admin' roles."""
    if current_user.role not in [UserRole.scorer, UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Scorer or Administrator credentials required.",
        )
    return current_user
