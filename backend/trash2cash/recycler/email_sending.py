import os
import smtplib
import ssl
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging

# Set up logging
logger = logging.getLogger(__name__)


def send_appointment_email(
        to_email, name, centre_name, centre_address, appointment_time,
        appointment_date, user_street = None, user_city = None, user_postcode = None, drop_off=True):
    """
    Sends an appointment email via Google SMTP.
    """


    # Fallback to environment variables
    smtp_username = os.environ.get("EMAIL_HOST_USER")
    smtp_password = os.environ.get("EMAIL_HOST_PASSWORD")

    # Validate the SMTP credentials
    if not smtp_username or not smtp_password:
        raise ValueError("SMTP username and password are required")

    # Build the HTML content for the email
    if drop_off:
        mode = "Drop-off"
        action = "drop-off"
        html_content = f"""
        <html>
            <body>
                <h2>Trash2Cash Appointment Confirmation</h2>
                <p>Dear {name},</p>
                <p>Your appointment for {mode} at {centre_name} has been confirmed.</p>
                <p><strong>Date:</strong> {appointment_date}</p>
                <p><strong>Time:</strong> {appointment_time}</p>
                <p><strong>Address:</strong> {centre_address}</p>
                <p>Thank you for using Trash2Cash!</p>
            </body>
        </html>
        """
    else:
        mode = "Collection"
        action = "collection"
        html_content = f"""
        <html>
            <body>
                <h2>Trash2Cash Appointment Confirmation</h2>
                <p>Dear {name},</p>
                <p>Your appointment for {mode} at your residence has been confirmed.</p>
                <p><strong>Date:</strong> {appointment_date}</p>
                <p><strong>Time:</strong> {appointment_time}</p>
                <p><strong>Address:</strong> {centre_address}</p>
                <p><strong>Your Address:</strong></br>{user_street}, {user_city}, {user_postcode}</p>
                <p>Thank you for using Trash2Cash!</p>
            </body>
        </html>
        """

    # Prepare the email content
    msg = MIMEMultipart()
    msg['From'] = smtp_username
    msg['To'] = to_email
    msg['Subject'] = f"Your Trash2Cash {mode} Appointment {action.capitalize()}"

    # Attach HTML content
    msg.attach(MIMEText(html_content, 'html'))

    # Setup secure SSL context
    context = ssl.create_default_context()

    try:
        # Connect to the Gmail SMTP server and send the email
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(smtp_username, smtp_password)
            server.sendmail(smtp_username, to_email, msg.as_string())

        logger.info(f"Email successfully sent to {to_email}")
        return {"success": True, "message": "Email sent successfully"}

    except Exception as e:
        logger.error(f"Error sending email to {to_email}: {e}")
        return {"success": False, "error": str(e)}


def send_drop_off_email(to_email, user, centre, drop_off_time):
    """
    Sends a drop-off email to the user.
    """
    name = f"{user.first_name} {user.last_name}"
    # get the date today
    today = datetime.now().date()

    # Fallback to environment variables
    smtp_username = os.environ.get("EMAIL_HOST_USER")
    smtp_password = os.environ.get("EMAIL_HOST_PASSWORD")

    # Validate the SMTP credentials
    if not smtp_username or not smtp_password:
        raise ValueError("SMTP username and password are required")

    # Build the HTML content for the email
    html_content = f"""
    <html>
        <body>
            <h2>Trash2Cash Drop-off Appointment Confirmation</h2>
            <p>Dear {name},</p>
            <p>Your item has been successfully dropped off at {centre.name}.</p>
            
            <p><strong>Time:</strong> {drop_off_time}</p>
            <p><strong>Date:</strong> {today}</p>
            <p><strong>Address:</strong> {centre.address}</p>
            <p>Thank you for using Trash2Cash!</p>
        </body>
    </html>
    """

    # Prepare the email content
    msg = MIMEMultipart()
    msg['From'] = smtp_username
    msg['To'] = to_email
    msg['Subject'] = "Trash2Cash Drop-off Appointment Confirmation"

    # Attach HTML content
    msg.attach(MIMEText(html_content, 'html'))

    # Setup secure SSL context
    context = ssl.create_default_context()

    try:
        # Connect to the Gmail SMTP server and send the email
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(smtp_username, smtp_password)
            server.sendmail(smtp_username, to_email, msg.as_string())

        logger.info(f"Email successfully sent to {to_email}")
        return {"success": True, "message": "Email sent successfully"}

    except Exception as e:
        logger.error(f"Error sending email to {to_email}: {e}")
        return {"success": False, "error": str(e)}




