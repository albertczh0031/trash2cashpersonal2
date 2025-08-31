from django.contrib import admin
from .models import ChatRoom, Message

@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ['id', 'created_at']
    filter_horizontal = ['participants']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    # Columns to display in the message list view
    list_display = ['id', 'chatroom', 'sender', 'content', 'timestamp', 'is_read']
    # Fields that can be edited directly from the list view
    list_editable = ['is_read']
    # Filters available in the right sidebar of the admin list view
    list_filter = ['timestamp', 'chatroom', 'is_read']
    # Fields to search in the admin search bar
    search_fields = ['content', 'sender__username']
    # Fields to show in the message edit/add form
    fields = ['chatroom', 'sender', 'content', 'timestamp', 'is_read']
    # Fields that are read-only in the form
    readonly_fields = ['timestamp']
    # Custom admin actions
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        """Mark selected messages as read"""
        updated = queryset.update(is_read=True)
        self.message_user(request, f'{updated} messages marked as read.')
    mark_as_read.short_description = "Mark selected messages as read"
    
    def mark_as_unread(self, request, queryset):
        """Mark selected messages as unread"""
        updated = queryset.update(is_read=False)
        self.message_user(request, f'{updated} messages marked as unread.')
    mark_as_unread.short_description = "Mark selected messages as unread"
