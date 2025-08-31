# users/admin.py

from django.contrib import admin
from .models import Profile, Notification
from django.utils.safestring import mark_safe
from .models import Profile, RecyclingCentreAdmin, Appointment, Tier
from rewards.models import Voucher

admin.site.register(Voucher)
admin.site.register(Tier)
admin.site.register(RecyclingCentreAdmin)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user_id','user', 'points', 'tier', 'is_verified', 'profile_picture_preview','is_seller']
    list_editable = ['is_verified','is_seller']
    readonly_fields = ['profile_picture_preview']

    def profile_picture_preview(self, obj):
        """Display a small preview of the profile picture in the admin list"""
        if obj.profile_picture:
            return mark_safe(f'<img src="{obj.profile_picture.url}" width="50" height="50" style="border-radius: 50%; object-fit: cover;" />')
        return "No Image"
    profile_picture_preview.short_description = 'Profile Picture'


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

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'message', 'created_at', 'is_read']
    search_fields = ['user__username', 'message']
    list_filter = ['is_read', 'created_at']
    ordering = ['-created_at']