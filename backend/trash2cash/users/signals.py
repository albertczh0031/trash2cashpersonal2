# backend/trash2cash/users/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Profile
from users.registration_email import send_registration_verification_email
import logging
import random
logger = logging.getLogger(__name__)

@receiver(post_save, sender=Profile)
def get_profile_details_on_create(sender, instance, created, **kwargs):
    """
    Signal to get profile details when a new Profile instance is created.
    """
    logger.debug("Signal get_profile_details_on_create triggered")
    if created:
        email = instance.user.email
        first_name = instance.user.first_name
        last_name = instance.user.last_name

        otp = str(random.randint(100000, 999999))
        logging.debug("Profile created")
        logging.debug(f"email: {email}, first_name: {first_name}, last_name: {last_name}")
        try:
            send_registration_verification_email(email, first_name, last_name, otp)
        except Exception as e:
            logger.error(f"Exception: {e}")
    else:
        logger.debug("Profile already exists, no action taken")
        return

