# users/models.py

from django.contrib.auth.models import User
from django.db import models
from django.contrib.auth import get_user_model
from datetime import timedelta
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver

from recycler.models import RecyclingCentre

class Tier(models.Model):
    """
    Tier model to represent user tiers for rewards or discounts.
    """
    TIER_CHOICES = [
        ("Bronze", 'Bronze'),
        ("Silver", 'Silver'),
        ("Gold", 'Gold'),
        ("Platinum", 'Platinum'),
    ]

    tier_id = models.AutoField(primary_key=True)
    tier_desc = models.CharField(max_length=10, choices=TIER_CHOICES, unique=True)

    def __str__(self):
        return f"{self.tier_desc}"


class Profile(models.Model):
    """
    Profile model to extend the User model with additional fields.

    # === Django Default User Model Attributes ===

    # --- Authentication & Identity ---
    # username     : str  - Unique username
    # password     : str  - Hashed password
    # email        : str  - Optional email
    # first_name   : str  - Optional first name
    # last_name    : str  - Optional last name

    # --- Permissions & Status ---
    # is_active    : bool - Is the account active (default: True)
    # is_staff     : bool - Can access Django admin

    # --- Timestamps ---
    # last_login   : datetime - Last login time
    # date_joined  : datetime - Account creation time

    # --- Relationships ---
    # groups            : ManyToMany - Groups the user belongs to
    # user_permissions  : ManyToMany - Direct permissions assigned to user

    # === Extended Profile Attributes ===
    # street        : str  - Street address
    # city          : str  - City
    # postcode      : str  - Postal code
    # points        : int  - Points earned by the user

    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    postcode = models.CharField(max_length=20)
    points = models.IntegerField(default=0)
    tier = models.ForeignKey(Tier, on_delete=models.SET_NULL, null=True, blank=True)  # Link to Tier
    is_verified = models.BooleanField(default=False)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    is_seller = models.BooleanField(default=False)
    request_seller = models.BooleanField(default=False)

    def __str__(self):
        return f"Profile(user={self.user.username}, street={self.street}, city={self.city}, postcode={self.postcode}, points={self.points})"

    def update_tier(self):
        """
        Updates the user's tier based on their points.
        """
        # Define your thresholds here
        thresholds = [
            (0, "Bronze"),
            (3000, "Silver"),
            (5000, "Gold"),
            (7500, "Platinum"),
        ]
        # Find the highest tier the user qualifies for
        tier_desc = "Bronze"
        for threshold, desc in thresholds:
            if self.points >= threshold:
                tier_desc = desc
        # Update the tier if it has changed
        tier_obj = Tier.objects.get(tier_desc=tier_desc)
        if self.tier != tier_obj:
            self.create_tier_change_notification(old_tier=self.tier.tier_desc,
                                                 new_tier=tier_obj)  # Create notification for tier change
            self.tier = tier_obj
            self.save(update_fields=['tier'])

    def add_points(self, amount):
        """
        Adds points and updates tier.
        """
        self.points += amount
        self.save(update_fields=['points'])
        self.update_tier()

    def save(self, *args, **kwargs):
        if not self.tier:
            self.tier = Tier.objects.get(tier_desc="Bronze")
        super().save(*args, **kwargs)
        self.update_tier()

    def approve_seller(self):
        self.seller_verified = True

    def create_tier_change_notification(self, old_tier, new_tier):
        """
        Creates a notification for the user when their tier changes.
        """
        if self.tier != old_tier:
            # Check if the new tier is higher than the old tier
            tier_order = ["Bronze", "Silver", "Gold", "Platinum"]
            if tier_order.index(new_tier.tier_desc) > tier_order.index(old_tier):
                message = f"Your tier has been upgraded from {old_tier} to {new_tier}. You have {self.points} points! Enjoy your new benefits!"
                Notification.objects.create(user=self.user, message=message)
            elif tier_order.index(new_tier.tier_desc) < tier_order.index(old_tier):
                message = f"Your tier has been changed from {old_tier} to {new_tier}. You have {self.points} points. Keep recycling to regain your tier!"
                Notification.objects.create(user=self.user, message=message)




@receiver(post_save, sender=Profile)
def update_profile_tier(sender, instance, **kwargs):
    instance.update_tier()

User = get_user_model()

# This model is created based on conceptual diagram
class Appointment(models.Model):
    # US37: Added status field
    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('Booked', 'Booked'),
        ('Completed', 'Completed'),
        ('Pending', 'Pending'),  # Pending verification
        ('Temporary', 'Temporary'),  # Temporary appointments that are in the system but not yet confirmed
        ('Cancelled', 'Cancelled'),
    ]
    appointment_id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments', null=True, blank=True)
    centre = models.ForeignKey(  # Updated from IntegerField to ForeignKey
        RecyclingCentre, 
        on_delete=models.CASCADE, 
        related_name='appointments',
        null=True,
        blank=True
    )
    category = models.ForeignKey( # Link to Category model in recycler app
        'recycler.Category',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='appointments'
    )  
    item_id = models.IntegerField(null=True, blank=True)
    item_weight = models.FloatField(null=True, blank=True)
    points_earned = models.IntegerField(null=True, blank=True)
    date = models.DateField()  
    time = models.TimeField()
    is_dropoff = models.BooleanField(default=True)
    driver_id = models.IntegerField(null=True, blank=True)  # For Pick-Ups: This is the ID of the driver assigned to the appointment
    arrival_time = models.TimeField(null=True, blank=True)  # For Pick-Ups: This is the time the item is dropped off
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Temporary')  # Default to Temporary
    created_at = models.DateTimeField(auto_now_add=True)  # Track when the appointment was created
    updated_at = models.DateTimeField(auto_now=True)  # Track when the appointment was last updated

    def __str__(self):
        return f"Appointment {self.appointment_id} - User {self.user_id} - Centre {self.centre.name}"  # Access centre name
    
    @classmethod
    def cleanup_temporary_appointments(cls, expiration_minutes=1):
        """
        Deletes appointments with 'Temporary' status that have not been updated within the expiration time.
        """
        from django.utils.timezone import now
        expiration_time = now() - timedelta(minutes=expiration_minutes)
        cls.objects.filter(status='Temporary', updated_at__lt=expiration_time).delete()

class OTP(models.Model):
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=5)


class RecyclingCentreAdmin(models.Model):
    admin = models.ForeignKey(Profile, on_delete=models.CASCADE)
    recycling_centre = models.ForeignKey(RecyclingCentre, on_delete=models.CASCADE)

    def __str__(self):
        return f"Admin: {self.admin}, Recycling Centre: {self.recycling_centre}"

class Notification(models.Model):
    """
    Notification model to store user notifications.
    This model is used to send notifications to users about various events such as reward expiration and tier changes.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False) # Notifications are not shown to the user after they are read
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username} - {self.message[:20]}..."