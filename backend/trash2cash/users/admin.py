# users/admin.py

from django.contrib import admin
from .models import Profile
from .models import Appointment
from rewards.models import Voucher
from .models import Tier

# admin.site.register(Appointment)
admin.site.register(Profile)
admin.site.register(Voucher)
admin.site.register(Tier)

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    # Display all fields in the list view
    list_display = [
        'appointment_id', 'user_id', 'status', 'centre_short', 'date', 'time', 'is_dropoff', 
    ]

    # Allow editing all fields in the admin form
    fields = [
        'user_id', 'centre', 'item_id', 'item_weight', 'category', 'points_earned',
        'date', 'time', 'is_dropoff', 'driver_id', 'arrival_time', 'status'
    ]

    # Add search functionality for specific fields
    search_fields = ['appointment_id', 'user_id__username', 'centre']

    # Add filters for specific fields
    list_filter = ['status', 'date', 'centre']

    # Enable inline editing for certain fields
    list_editable = ['user_id', 'status', 'time', 'date']

    def centre_short(self, obj):
        """Display only first 15 characters of centre name"""
        if obj.centre and obj.centre.name:
            return obj.centre.name[:15] + ('...' if len(obj.centre.name) > 15 else '')
        return '-'
    centre_short.short_description = 'Centre'