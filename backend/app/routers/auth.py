from fastapi import APIRouter, HTTPException, status, Depends
from supabase_client import get_supabase_client
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, UserResponse, TokenResponse

router = APIRouter(tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(req: UserRegisterRequest):
    """
    Registers a new user account with hashed password.
    Defaults to role = 'user' unless specified.
    """
    supabase = get_supabase_client()
    normalized_email = req.email.lower().strip()

    # Check for existing user
    existing = supabase.table("users").select("user_id").eq("email", normalized_email).execute()
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    hashed_pw = get_password_hash(req.password)
    insert_data = {
        "name": req.name.strip(),
        "email": normalized_email,
        "password": hashed_pw,
        "role": req.role or "user"
    }

    res = supabase.table("users").insert(insert_data).execute()
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account."
        )

    user_record = res.data[0]
    token = create_access_token(data={"sub": user_record["user_id"], "role": user_record["role"]})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            user_id=user_record["user_id"],
            name=user_record["name"],
            email=user_record["email"],
            role=user_record["role"],
            created_at=str(user_record.get("created_at", ""))
        )
    )


@router.post("/login", response_model=TokenResponse)
def login_user(req: UserLoginRequest):
    """
    Authenticates user with email and password.
    Returns signed JWT access token and user profile.
    """
    supabase = get_supabase_client()
    normalized_email = req.email.lower().strip()

    res = supabase.table("users").select("*").eq("email", normalized_email).execute()
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    user_record = res.data[0]
    stored_hash = user_record.get("password") or ""

    if not verify_password(req.password, stored_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token(data={"sub": user_record["user_id"], "role": user_record["role"]})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            user_id=user_record["user_id"],
            name=user_record["name"],
            email=user_record["email"],
            role=user_record["role"],
            created_at=str(user_record.get("created_at", ""))
        )
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: dict = Depends(get_current_user)):
    """
    Returns profile information for the currently authenticated user.
    """
    return UserResponse(
        user_id=user["user_id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        created_at=str(user.get("created_at", ""))
    )
