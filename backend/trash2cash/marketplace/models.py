from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


class Electronic(models.Model):
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='electronic_items')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.title} - {self.seller.username}"


class Clothe(models.Model):
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Unisex', 'Unisex')
    ]
    SIZE_CHOICES = [
        ('XS', 'Extra Small'),
        ('S', 'Small'),
        ('M', 'Medium'),
        ('L', 'Large'),
        ('XL', 'Extra Large'),
        ('XXL', 'Double Extra Large'),
    ]
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='clothe_items')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    sizes = models.CharField(max_length=50, choices=SIZE_CHOICES)
    gender = models.CharField(max_length=50, choices=GENDER_CHOICES)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title

class BooksMagazine(models.Model):
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='books_magazine_items')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title


class Furniture(models.Model):
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='furniture_items')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title
    
# Model for miscellaneous marketplace items
class MiscItem(models.Model):
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='misc_items')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title

# New model for multiple images per listing
class MarketplaceImage(models.Model):
    image = models.ImageField(upload_to='marketplace/')
    electronic = models.ForeignKey(Electronic, on_delete=models.CASCADE, related_name='images', null=True, blank=True)
    clothe = models.ForeignKey(Clothe, on_delete=models.CASCADE, related_name='images', null=True, blank=True)
    books_magazine = models.ForeignKey(BooksMagazine, on_delete=models.CASCADE, related_name='images', null=True, blank=True)
    furniture = models.ForeignKey(Furniture, on_delete=models.CASCADE, related_name='images', null=True, blank=True)
    misc_item = models.ForeignKey('MiscItem', on_delete=models.CASCADE, related_name='images', null=True, blank=True)