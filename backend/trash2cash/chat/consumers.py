# chat/consumers.py
"""
WebSocket Consumer for Real-time Chat

This file handles WebSocket connections for instant messaging.
Unlike traditional HTTP requests, WebSocket connections stay open
and allow bidirectional real-time communication between client and server.
"""

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from django.utils import timezone
from .models import ChatRoom, Message


class ChatConsumer(AsyncWebsocketConsumer):
    """
    Handles WebSocket connections for chat functionality.
    
    Each user that opens a chat room creates a WebSocket connection.
    This consumer manages that connection and handles real-time messaging.
    """

    async def connect(self):
        """
        Called when the WebSocket connection is established.
        
        When a user opens a chat room page, their browser creates a WebSocket
        connection to: ws://localhost:8000/ws/chat/1/ (for chatroom 1)
        """
        # Extract chatroom ID from the WebSocket URL
        # URL pattern: ws://localhost:8000/ws/chat/<chatroom_id>/
        self.chatroom_id = self.scope['url_route']['kwargs']['chatroom_id']
        
        # Create a unique group name for this chatroom
        # All users in the same chatroom join the same group
        self.chatroom_group_name = f'chat_{self.chatroom_id}'

        # Add this connection to the chatroom group
        # This allows us to broadcast messages to all users in the room
        await self.channel_layer.group_add(
            self.chatroom_group_name,
            self.channel_name  # Unique identifier for this connection
        )
        
        # Accept the WebSocket connection
        # Browser will now be connected and can send/receive messages
        await self.accept()

    async def disconnect(self, close_code):
        """
        Called when the WebSocket connection is closed.
        """
        # Remove this connection from the chatroom group
        # Prevents sending messages to disconnected users
        await self.channel_layer.group_discard(
            self.chatroom_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """
        Called when the browser sends a message through the WebSocket.
        """
        # Parse the JSON message from the browser
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        username = text_data_json['username']

        # Save the message to the database
        # This ensures the message persists even after WebSocket disconnects
        await self.save_message(username, message)

        # Broadcast the message to ALL users in this chatroom
        # This is what makes the chat "real-time"
        await self.channel_layer.group_send(
            self.chatroom_group_name,
            {
                'type': 'chat_message',  # Calls the chat_message method below
                'message': message,
                'username': username,
                'timestamp': str(timezone.now())
            }
        )

    async def chat_message(self, event):
        """
        Called when a message is broadcast to the chatroom group.
        """
        # Send message data to the user's browser
        # The frontend JavaScript will receive this and display the message
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'username': event['username'],
            'timestamp': event['timestamp']
        }))

    @database_sync_to_async
    def save_message(self, username, message):
        """
        Save the message to the database.
        """
        # Get the user who sent the message
        user = User.objects.get(username=username)
        
        # Get the chatroom where the message was sent
        chatroom = ChatRoom.objects.get(id=self.chatroom_id)
        
        # Create and save the message to the database
        # This makes the message permanent and available via REST API
        Message.objects.create(
            chatroom=chatroom,
            sender=user,
            content=message
        )