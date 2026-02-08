"""
SatVach Contact Endpoints
Public endpoint for submitting contact messages.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.deps import get_current_user, get_db
from src.models.contact_message import ContactMessage
from src.schemas.contact import ContactMessageCreate, ContactMessageResponse

router = APIRouter()


@router.post("/", response_model=ContactMessageResponse, status_code=201)
async def create_contact_message(
    data: ContactMessageCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Submit a contact message (public — no auth required).
    If the user is logged in, the frontend sends their user_id.
    """
    msg = ContactMessage(
        name=data.name,
        email=data.email,
        subject=data.subject,
        message=data.message,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


@router.post("/auth", response_model=ContactMessageResponse, status_code=201)
async def create_contact_message_authed(
    data: ContactMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Submit a contact message as an authenticated user.
    Automatically attaches user_id.
    """
    msg = ContactMessage(
        name=data.name,
        email=data.email,
        subject=data.subject,
        message=data.message,
        user_id=current_user.id,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg
