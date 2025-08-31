from django.contrib import admin
from .models import Electronic, Clothe, BooksMagazine, Furniture, MiscItem, MarketplaceImage
from django.utils.html import format_html

class MarketplaceImageInline(admin.TabularInline):
	model = MarketplaceImage
	extra = 1
	fields = ('image', 'image_preview')
	readonly_fields = ('image_preview',)

	def image_preview(self, obj):
		if obj.image:
			return format_html('<img src="{}" style="max-height: 100px; max-width: 100px;" />', obj.image.url)
		return ""
	image_preview.short_description = 'Preview'

@admin.register(Electronic)
class ElectronicAdmin(admin.ModelAdmin):
	inlines = [MarketplaceImageInline]

@admin.register(Clothe)
class ClotheAdmin(admin.ModelAdmin):
	inlines = [MarketplaceImageInline]

@admin.register(BooksMagazine)
class BooksMagazineAdmin(admin.ModelAdmin):
	inlines = [MarketplaceImageInline]

@admin.register(Furniture)
class FurnitureAdmin(admin.ModelAdmin):
	inlines = [MarketplaceImageInline]
	
@admin.register(MiscItem)
class MiscItemAdmin(admin.ModelAdmin):
	inlines = [MarketplaceImageInline]

@admin.register(MarketplaceImage)
class MarketplaceImageAdmin(admin.ModelAdmin):
	list_display = ('id', 'image', 'electronic', 'clothe', 'books_magazine', 'furniture')