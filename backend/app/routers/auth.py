from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.auth_service import create_access_token

router = APIRouter()

VALID_USERNAMES = ["doctor", "patient"]


class LoginRequest(BaseModel):
    username: str


@router.post("/auth/login")
def login(body: LoginRequest):
    if body.username not in VALID_USERNAMES:
        raise HTTPException(
            status_code=400,
            detail="Invalid username. Use 'doctor' or 'patient'.",
        )
    token = create_access_token(username=body.username, role=body.username)
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": body.username,
    }
