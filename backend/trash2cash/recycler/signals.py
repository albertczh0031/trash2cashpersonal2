import logging
from zoneinfo import ZoneInfo

from django_celery_beat.utils import now
from django.db.models.signals import post_save
from django.dispatch import receiver
from pytz import timezone
from timezone_field.backends import pytz

from trash2cash import settings
from users.models import Appointment, User, Profile
from recycler.models import RecyclingCentre
from recycler.email_sending import send_appointment_email
from datetime import timedelta, datetime
from django.utils.timezone import make_aware, now, localtime, get_current_timezone
from recycler.scheduler import send_appointment_reminder_email
from upload.models import Item


logger = logging.getLogger(__name__)
logger.debug("Signal triggered")



@receiver(post_save, sender=Appointment)
def send_appointment_confirmation(sender, instance, created, **kwargs):
    """
    Signal handler to send appointment confirmation emails when an appointment instance is
    created or updated
    """
    logger.debug("Signal triggered for Appointment")
    logger.debug(f"Appointment instance: {instance}")
    # Get centre instance from the centre id
    centre = RecyclingCentre.objects.get(id=instance.centre_id)
    logger.debug(f"RecyclingCentre fetched: {centre}")

    if created:
        logger.info("Appointment created, No email sent")
        return

    # if not instance.is_dropoff and instance.arrival_time is None:
    #     raise Exception("Pickup appointment must have arrival time")

    # Get the user instance from the user id
    if instance.user_id and instance.get_status_display() == "Booked":
        user = instance.user_id
        logger.debug(f"User fetched: {user}")
        # Get the user's name and email from the instance
        user_first_name = user.first_name
        logger.debug(f"User first_name: {user_first_name}")
        user_last_name = user.last_name
        logger.debug(f"User last_name: {user_last_name}")
        user_email = user.email
        logger.debug(f"User email: {user_email}")
        profile = Profile.objects.get(user=user)
        user_street = profile.street
        user_city = profile.city
        user_postcode = profile.postcode
        logger.debug(f"time : {instance.time}")
        # logger.debug(f"arrival_time : {instance.arrival_time}")

        # logger.debug(f"appt time: {instance.time if instance.is_dropoff else instance.arrival_time}")

        send_appointment_email(
            to_email=user_email,
            name=f"{user_first_name} {user_last_name}",
            centre_name=centre.name,
            centre_address=centre.address,
            appointment_date=instance.date,
            # appointment_time= instance.time if instance.is_dropoff else instance.arrival_time,
            appointment_time= instance.time,
            drop_off=instance.is_dropoff,
            user_city=user_city,
            user_street=user_street,
            user_postcode=user_postcode
        )

        # Add points to user profile
        increment_user_points(user)




        # Schedule the reminder email 1 hour before appointment
        # appointment_datetime = datetime.combine(instance.date, instance.time if instance.is_dropoff else instance.arrival_time)
        appointment_datetime = datetime.combine(instance.date, instance.time)
        logging.debug(f"appointment_datetime: {appointment_datetime}")

        # Create a naive datetime (no timezone info)

        kl_tz = ZoneInfo(settings.TIME_ZONE)
        logging.debug("tz: {}".format(kl_tz))
        aware_time = make_aware(appointment_datetime, timezone= kl_tz)

        logger.debug("aware_time: {}".format(aware_time))

        eta = aware_time - timedelta(hours=1)
        eta = eta.astimezone(kl_tz)
        logger.debug("eta: {}".format(eta))


        now_kl = now().astimezone(kl_tz)
        logger.debug("now_kl: {}".format(now_kl))
        eta = eta if eta > now_kl else now_kl
        logger.debug("eta: {}".format(eta))

        logger.debug("calling send_appointment_reminder_email")
        send_appointment_reminder_email.apply_async(
            args=[user_email, aware_time.isoformat(),
                  f"Appointment at {centre.name}, {centre.address}"],
            eta=eta   # prevent scheduling in the past
        )

def increment_user_points(user: User):
    """
    Increment the user's points based on the item category and the item weight
    """

    # Get the latest item from the user's items
    try:
        item = Item.objects.filter(user=user).order_by('-created_at').first()
        if not item:
            logger.warning(f"No items found for user {user}")
            return
        logger.debug(f"Latest item fetched: {item}")
    except Item.DoesNotExist:
        logger.error(f"Item for user {user} does not exist")
        return

    # Get the category of the item
    category = item.category
    if not category:
        logger.warning(f"Item {item} does not have a category")
        return


    # Multiply the item weight (in kg) by the points for the category (based on https://www.ipc.com.my/services/recycling-buy-back-center)
    Category_to_points_mapping = {
        "paper": 10,
        "plastic": 11,
        "metal": 20,
        "cardboard": 12,
        "e-waste": 25,
        "clothes": 5,
        "glass": 8,
    }

    # Check if the category exists in the mapping
    category_multiplier = Category_to_points_mapping.get(category, 0)
    if category_multiplier == 0:
        logger.warning(f"Category {category} not found in mapping")
        return
    logger.debug(f"Category multiplier for {category}: {category_multiplier}")

    # Get the user's profile
    try:
        profile = Profile.objects.get(user=user)
        logger.debug(f"Profile fetched: {profile}")
    except Profile.DoesNotExist:
        logger.error(f"Profile for user {user} does not exist")
        return

    # Increment the user's points
    item_weight = item.weight if hasattr(item, 'weight') else 0  # Default weight to 0 if not set
    points_earned = int(float(item_weight) * category_multiplier)
    logger.debug(f"Points earned: {points_earned} for item weight: {item_weight} and category multiplier: {category_multiplier}")
    profile.points += points_earned
    profile.save()
    logger.info(f"User {user} points incremented by {points_earned}. New points total: {profile.points}")






