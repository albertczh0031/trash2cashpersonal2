import logging

from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import VoucherInstance, Voucher
from users.models import Notification

@shared_task
def send_voucher_expiry_reminders():
    """
    Celery task to send reminders for vouchers expiring in 3 days.
    This task:
    1. Queries the VoucherInstance model for instances where the voucher's expiration date
    is 3 days from now and the voucher has not been redeemed. It then creates a
    """
    logger = logging.getLogger(__name__)
    logger.info("Starting voucher expiry reminder task.")
    target_date = timezone.now().date() + timedelta(days=3)


    instances = VoucherInstance.objects.filter(
        voucher__expiration_date=target_date, # follows the voucher FK to get the expiration_date attr there
        redeemed=False
    ).select_related('user', 'voucher') # select_related grabs associated user and voucher instances in 1 query

    logger.info(f"Found {instances.count()} voucher instances expiring on {target_date}.")

    for instance in instances:
        # Check if a reminder has already been sent for this instance
        if instance.reminder_sent:
            logger.info(f"Reminder already sent for voucher instance {instance.id}. Skipping.")
            continue

        # If not, create a notification and mark the reminder as sent for the VoucherInstance
        instance.reminder_sent = True  # Mark the reminder as sent
        instance.save()  # Save the instance to update the reminder_sent field
        logger.info(f"Sending reminder for voucher instance {instance.id} to user {instance.user.user.username}.")

        # Create a notification for the user
        Notification.objects.create(
            user=instance.user.user, # Access the User model through the Profile model
            message=f"Your voucher '{instance.voucher.name}' will expire on {instance.voucher.expiration_date}."
        )
        logger.info(f"Notification created for user {instance.user.user.username} about voucher {instance.voucher.name} expiring on {instance.voucher.expiration_date}.")


