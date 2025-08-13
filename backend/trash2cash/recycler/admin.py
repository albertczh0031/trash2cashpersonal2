from django.contrib import admin
from .models import Item, Category, RecyclingCentre

# Register your models here.
@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category')
    search_fields = ('name',)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(RecyclingCentre)
class RecyclingCentreAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'address', 'latitude', 'longitude', 'opening_time', 'closing_time', 'get_categories', 'tags')

    def get_categories(self, obj):
        return ", ".join([cat.name for cat in obj.accepted_categories.all()])
    get_categories.short_description = 'Accepted Categories'
    
    search_fields = ('name', 'longitude', 'latitude')
    filter_horizontal = ('accepted_categories',)  # Make it easier to select categories
