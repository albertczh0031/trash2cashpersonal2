from django.db import models
from django.utils import timezone


class Electronic(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    images = models.ImageField()
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title


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

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    images = models.ImageField()
    sizes = models.CharField(max_length=50, choices=SIZE_CHOICES)
    gender = models.CharField(max_length=50, choices=GENDER_CHOICES)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title

class BooksMagazine(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    images = models.ImageField()
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title


class Furniture(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    images = models.ImageField()
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title