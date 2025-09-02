from django.db import models
from django.core.exceptions import ValidationError
# from django_google_maps import fields as map_fields

    
def validate_latitude(value):
    if value < -90 or value > 90:
        raise ValidationError(f'{value} is not a valid latitude.')

def validate_longitude(value):
    if value < -180 or value > 180:
        raise ValidationError(f'{value} is not a valid longitude.')
       

class Category(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name
    

class Item(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, related_name='items', on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class RecyclingCentre(models.Model):
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=80)
    address = models.CharField(max_length=255)  # need to change this location_address >> address
    latitude = models.FloatField(validators=[validate_latitude])
    longitude = models.FloatField(validators=[validate_longitude])
    opening_time = models.TimeField()
    closing_time = models.TimeField()

    # might be dupe
    accepted_categories = models.ManyToManyField(Category, related_name='recycling_centres')  # Accept categories, not items
    tags = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    