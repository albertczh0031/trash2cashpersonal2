from django.contrib import admin
from .models import ChatRoom, Message

@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ['id', 'created_at']
    filter_horizontal = ['participants']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'chatroom', 'sender', 'content', 'timestamp']
    list_filter = ['timestamp', 'chatroom']
    search_fields = ['content', 'sender__username']
    fields = ['chatroom', 'sender', 'content', 'timestamp']
    readonly_fields = ['timestamp']
