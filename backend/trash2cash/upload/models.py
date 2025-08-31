from django.utils import timezone

from django.db import models

from users.models import Appointment, User


# Model to store recyclable items identified by the Google Vision API
class Item(models.Model):
    item_id = models.AutoField(primary_key=True)
    category = models.CharField(max_length=255) # Identified category of the item
    confidence = models.DecimalField(max_digits=5, decimal_places=2) # Confidence score from Google Vision API
    description = models.TextField(blank=True, null=True) 
    weight = models.CharField(max_length=50, blank=True, null=True)
    brand = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    labels = models.JSONField(blank=True, null=True) # Category labels from Google Vision API
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='items', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='items', null=True, blank=True)

    def __str__(self):
        return self.category


# Model to store categories of permitted recyclables
class RecyclableIdentifier(models.Model):
    CATEGORY_CHOICES = [
        ('plastic', 'Plastic'),
        ('paper', 'Paper'),
        ('cardboard', 'Cardboard'),
        ('glass', 'Glass'),
        ('metal', 'Metal'),
        ('e-waste', 'E-Waste'),
    ]

    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    subcategory = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        unique_together = ('category', 'subcategory')

    def __str__(self):
        return f"{self.category} - {self.subcategory}" if self.subcategory else self.category

class OneTimeToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(default=timezone.now)

    def is_expired(self):
        return (timezone.now() - self.created_at).total_seconds() > 1

    def __str__(self):
        return f"{self.user.username} - {self.token}"