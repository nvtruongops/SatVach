"""
Email Service
"""

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

from src.core.config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=settings.USE_CREDENTIALS,
    VALIDATE_CERTS=settings.VALIDATE_CERTS,
)


async def send_verification_email(email_to: str, code: str) -> None:
    """
    Send verification email with code.
    """
    print(
        f"DEBUG: Attempting to send verification email to {email_to} via {settings.MAIL_SERVER}:{settings.MAIL_PORT}"
    )
    try:
        subject = "Verify your SatVach account"
        html_content = f"""
        <html>
            <body>
                <h1>Welcome to SatVach!</h1>
                <p>Please use the following code to verify your account:</p>
                <h2 style="background-color: #f3f4f6; padding: 10px; display: inline-block; border-radius: 5px;">
                    {code}
                </h2>
                <p>This code will expire in 15 minutes.</p>
                <p>If you did not request this verification, please ignore this email.</p>
            </body>
        </html>
        """

        message = MessageSchema(
            subject=subject, recipients=[email_to], body=html_content, subtype=MessageType.html
        )

        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"DEBUG: Verification email successfully sent to {email_to}")
    except Exception as e:
        print(f"ERROR: Failed to send verification email to {email_to}: {e}")
        import traceback

        traceback.print_exc()


async def send_password_reset_email(email_to: str, code: str) -> None:
    """
    Send password reset email with code.
    """
    print(f"DEBUG: Attempting to send password reset email to {email_to}")
    try:
        subject = "Reset your SatVach password"
        html_content = f"""
        <html>
            <body>
                <h1>Password Reset Request</h1>
                <p>You have requested to reset your password. Use the following code:</p>
                <h2 style="background-color: #f3f4f6; padding: 10px; display: inline-block; border-radius: 5px;">
                    {code}
                </h2>
                <p>This code will expire in 15 minutes.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
            </body>
        </html>
        """

        message = MessageSchema(
            subject=subject, recipients=[email_to], body=html_content, subtype=MessageType.html
        )

        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"DEBUG: Password reset email successfully sent to {email_to}")
    except Exception as e:
        print(f"ERROR: Failed to send password reset email to {email_to}: {e}")
        import traceback

        traceback.print_exc()
