from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., pattern=r"^[^@]+@[^@]+\.[^@]+$")
    password: str = Field(..., min_length=6, max_length=100)
    role: Optional[Literal["user", "scorer", "admin"]] = "user"


class UserLoginRequest(BaseModel):
    email: str = Field(..., pattern=r"^[^@]+@[^@]+\.[^@]+$")
    password: str


class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str
    role: str
    created_at: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class RoleUpdateRequest(BaseModel):
    role: Literal["user", "scorer", "admin"]
