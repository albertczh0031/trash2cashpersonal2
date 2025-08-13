import os
import smtplib
import ssl
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging
from random import random

from users.models import OTP

# Set up logging
logger = logging.getLogger(__name__)



def send_registration_verification_email(to_email, first_name, last_name, otp):
    """
    Sends a registration verification email to the user using the provided OTP.
    """

    smtp_username = os.environ.get("EMAIL_HOST_USER")
    smtp_password = os.environ.get("EMAIL_HOST_PASSWORD")

    if not smtp_username or not smtp_password:
        raise ValueError("SMTP username and password are required")

    # Save the OTP to DB
    OTP.objects.create(email=to_email, code=otp, created_at=datetime.now())
    logger.info(f"OTP: {otp}")

    message = f"""
    Hi {first_name} {last_name},

    Thank you for registering with Trash2Cash! Please verify your account by inputing the OTP below:

    <h2 style="color: #4CAF50;">Your OTP: {otp}</h2>

    Best regards,
    Trash2Cash Team
    """

    msg = MIMEMultipart()
    msg['From'] = smtp_username
    msg['To'] = to_email
    msg['Subject'] = "Trash2Cash Registration Verification"
    msg.attach(MIMEText(message, 'html'))

    context = ssl.create_default_context()

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.set_debuglevel(1)
            server.login(smtp_username, smtp_password)
            server.sendmail(smtp_username, to_email, msg.as_string())
            logger.info("Email sent to %s", to_email)

        return {"success": True, "message": "Email sent successfully"}
    except Exception as e:
        logger.error(f"Error sending email to {to_email}: {e}")
        return {"success": False, "error": str(e)}



# def generate_otp():
#     return str(random())[2:8]  # Generate a 6-digit OTP from a random float
# """
# 1. create the otp
# 2. send the otp to the user via email
# 3. verify the opt inputted by the user
# """