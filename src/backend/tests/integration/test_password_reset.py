import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.user import User


@pytest.mark.asyncio
async def test_password_reset_flow(async_client: AsyncClient, db_session: AsyncSession):
    # 1. Create a user
    email = "reset_test@example.com"
    password = "oldpassword123"
    username = "resettest"

    response = await async_client.post(
        "/api/v1/auth/signup",
        json={
            "email": email,
            "password": password,
            "username": username,
            "is_active": True,  # Create active user for this test, or activate them
        },
    )
    # If signup requires verification, we might need to activate manually or check inactive user logic
    # Our signup makes them inactive by default.

    # Let's activate the user manually for standard flow
    stmt = select(User).where(User.email == email)
    result = await db_session.execute(stmt)
    user = result.scalars().first()
    assert user is not None
    user.is_active = True
    await db_session.commit()

    # 2. Request password reset
    response = await async_client.post(f"/api/v1/auth/password-recovery/{email}")
    assert response.status_code == 200
    assert response.json()["message"] == "If email exists, password recovery code sent"

    # 3. Get code from DB
    await db_session.refresh(user)
    reset_code = user.verification_code
    assert reset_code is not None

    # 4. Reset password
    new_password = "newpassword123"
    response = await async_client.post(
        "/api/v1/auth/reset-password",
        json={"email": email, "code": reset_code, "new_password": new_password},
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Password reset successfully"

    # 5. Verify new password works
    login_data = {"username": email, "password": new_password}
    response = await async_client.post("/api/v1/auth/login/access-token", data=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()

    # 6. Verify old password fails
    login_data_old = {"username": email, "password": password}
    response = await async_client.post("/api/v1/auth/login/access-token", data=login_data_old)
    assert response.status_code == 400
