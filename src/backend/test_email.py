import asyncio

from dotenv import load_dotenv

# Load .env explicitly for script
load_dotenv(".env")

from src.core.config import settings
from src.services.email import send_verification_email


async def main():
    print(f"Sending email from: {settings.MAIL_FROM}")
    print(f"Sending email to: {settings.MAIL_USERNAME}")
    print(f"Using server: {settings.MAIL_SERVER}:{settings.MAIL_PORT}")

    try:
        await send_verification_email(settings.MAIL_USERNAME, "123456")
        print("Email sent successfully!")
    except Exception as e:
        print(f"Failed to send email: {e}")


if __name__ == "__main__":
    asyncio.run(main())
