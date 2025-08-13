from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib, ssl, os
import logging
from datetime import datetime
from celery import shared_task

logger = logging.getLogger(__name__)

@shared_task
def send_appointment_reminder_email(user_email, appointment_time_iso, appointment_details):
    """
    A celery task to send an appointment reminder email to the user.
    """
    smtp_username = os.getenv("EMAIL_HOST_USER")
    smtp_password = os.getenv("EMAIL_HOST_PASSWORD")

    if not smtp_username or not smtp_password:
        raise ValueError("SMTP username and password are required")

    appointment_time = datetime.fromisoformat(appointment_time_iso)
    logger.debug("send_appointment_reminder_email called")
    logger.debug("appointment_time: {}".format(appointment_time))
    logger.debug("appointment_details: {}".format(appointment_details))


    # Compose email
    msg = MIMEMultipart()
    msg['From'] = smtp_username
    msg['To'] = user_email
    msg['Subject'] = f"Reminder: Your Trash2Cash Appointment at {appointment_time.strftime('%H:%M %p')}"

    html_content = f"""
    <html>
    <body>
        <p>Hi,<br><br>
           This is a reminder about your appointment scheduled for <b>{appointment_time.strftime('%Y-%m-%d %H:%M:%S')}</b>.<br><br>
           <b>Details:</b><br>{appointment_details}<br><br>
           Please make sure to be on time!<br><br>
           – Trash2Cash Team
        </p>
    </body>
    </html>
    """

    msg.attach(MIMEText(html_content, 'html'))

    context = ssl.create_default_context()

    try:
        # Send email
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(smtp_username, smtp_password)
            server.sendmail(smtp_username, user_email, msg.as_string())

        logger.info(f"Reminder email sent to {user_email}")
        return f"Reminder email sent to {user_email}"

    except Exception as e:
        logger.error(f"Error sending reminder email: {e}")
        return f"Error: {str(e)}"