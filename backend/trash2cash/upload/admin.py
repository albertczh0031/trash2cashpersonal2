from django.contrib import admin
from .models import *


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('category', 'confidence', 'created_at', 'display_all_confidence_scores')

    def display_all_confidence_scores(self, obj):

        # Retrieve all identifier labels of the item
        labels = obj.labels if obj.labels else []

        # Format for labels and their confidence scores
        formatted_scores = [
            f"{label['description']}: {label['score']:.2f}" for label in labels
        ]

        # Display all identifiers with their confidence scores
        return ", ".join(formatted_scores) if formatted_scores else "No associated identifiers"

    display_all_confidence_scores.short_description = 'Confidence Scores'


@admin.register(RecyclableIdentifier)
class RecyclableIdentifierAdmin(admin.ModelAdmin):
    list_display = ('category', 'subcategory')  
    list_filter = ('category',)  
    search_fields = ('category', 'subcategory')  
    list_editable = ['category'] 
    list_display_links = ('subcategory',) 