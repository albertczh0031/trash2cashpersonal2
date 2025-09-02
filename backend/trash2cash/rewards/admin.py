from django.contrib import admin
from .models import Voucher
from .models import VoucherInstance


# admin.site.register(Voucher)

from django import forms

@admin.register(VoucherInstance)
class VoucherInstanceAdmin(admin.ModelAdmin):
    list_display = ("username", "voucher", "redeemed", "date",)
    list_editable = ("voucher", "redeemed",)

    def username(self, obj):
        return obj.user.user.username
    username.short_description = 'User'
    username.admin_order_field = 'user__user__username'