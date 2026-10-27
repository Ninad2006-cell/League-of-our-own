import uuid
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse, UserRole
from app.auth import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    get_current_user,
    get_user_from_db,
    MOCK_USERS_DB
)
from app.supabase_client import get_supabase, get_supabase_admin

router = APIRouter()

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister):
    """
    Registers a new user. Defaults to role = 'user' if not specified.
    """
    email_key = user_in.email.lower().strip()
    supabase = get_supabase_admin() or get_supabase()

    if supabase:
        try:
            # Check if user already exists using helper function
            existing_user = get_user_from_db(email_key)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="An account with this email address already exists."
                )

            # Hash password with bcrypt
            password_hash = get_password_hash(user_in.password)
            
            # Generate user_id
            user_id = str(uuid.uuid4())
            
            # Insert record in public.users table with hashed password
            user_role = user_in.role or UserRole.user
            supabase.table("users").insert({
                "user_id": user_id,
                "name": user_in.name,
                "email": email_key,
                "password": password_hash,
                "role": user_role.value,
            }).execute()

            token = create_access_token({
                "sub": user_id,
                "email": email_key,
                "role": user_role.value,
                "name": user_in.name,
            })
            return TokenResponse(
                access_token=token,
                user=UserResponse(
                    user_id=user_id,
                    name=user_in.name,
                    email=email_key,
                    role=user_role,
                )
            )
        except HTTPException:
            raise
        except Exception as e:
            # If Supabase errors
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Registration failed: {str(e)}"
            )

    # Local fallback storage
    if email_key in MOCK_USERS_DB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )
    
    new_user_id = str(uuid.uuid4())
    user_role = user_in.role or UserRole.user
    user_record = {
        "user_id": new_user_id,
        "name": user_in.name,
        "email": email_key,
        "password_hash": get_password_hash(user_in.password),
        "role": user_role,
    }
    MOCK_USERS_DB[email_key] = user_record

    token = create_access_token({
        "sub": new_user_id,
        "email": email_key,
        "role": user_role.value,
        "name": user_in.name,
    })

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            user_id=new_user_id,
            name=user_in.name,
            email=email_key,
            role=user_role,
        )
    )

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin):
    """
    Authenticates user by email & password, returning JWT access token with role.
    """
    email_key = credentials.email.lower().strip()
    supabase = get_supabase()

    if supabase:
        try:
            # Fetch user from database using helper function
            user_data = get_user_from_db(email_key)
            
            if not user_data:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            password_hash = user_data.get("password")
            
            if not password_hash:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Verify password using bcrypt
            if not verify_password(credentials.password, password_hash):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            user_id = user_data.get("user_id")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid user data.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            role_val = user_data.get("role", "user")
            name_val = user_data.get("name", "User")

            token = create_access_token({
                "sub": user_id,
                "email": email_key,
                "role": role_val,
                "name": name_val,
            })
            return TokenResponse(
                access_token=token,
                user=UserResponse(
                    user_id=user_id,
                    name=name_val,
                    email=email_key,
                    role=UserRole(role_val),
                )
            )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # Local fallback authentication
    user = MOCK_USERS_DB.get(email_key)
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({
        "sub": user["user_id"],
        "email": user["email"],
        "role": user["role"].value,
        "name": user["name"],
    })

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            user_id=user["user_id"],
            name=user["name"],
            email=user["email"],
            role=user["role"],
        )
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: UserResponse = Depends(get_current_user)):
    """
    Returns profile information and role of the currently logged-in user.
    """
    return current_user
