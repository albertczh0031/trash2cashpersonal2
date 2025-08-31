from rest_framework import serializers
from .models import ChatRoom, Message
from django.contrib.auth.models import User

class ChatRoomSerializer(serializers.ModelSerializer):
    participants = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    last_activity = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ['id', 'participants', 'created_at', 'last_message', 'last_activity']
    
    def get_participants(self, obj):
        participants_data = []
        for participant in obj.participants.all():
            participant_info = {
                'id': participant.id,
                'username': participant.username,
                'first_name': participant.first_name,
                'last_name': participant.last_name,
            }
            
            # Check if the user has a profile and profile picture
            try:
                if hasattr(participant, 'profile') and participant.profile and participant.profile.profile_picture:
                    # Try to access the URL, handle file not found gracefully
                    participant_info['profile_picture'] = participant.profile.profile_picture.url
                else:
                    participant_info['profile_picture'] = None
            except (ValueError, FileNotFoundError):
                # Handle case where file doesn't exist
                participant_info['profile_picture'] = None
                
            participants_data.append(participant_info)
        return participants_data
    
    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-timestamp').first()
        if last_message:
            sender_profile_picture = None
            try:
                if hasattr(last_message.sender, 'profile') and last_message.sender.profile and last_message.sender.profile.profile_picture:
                    sender_profile_picture = last_message.sender.profile.profile_picture.url
            except (ValueError, FileNotFoundError):
                # Handle case where file doesn't exist
                sender_profile_picture = None
            
            return {
                'content': last_message.content,
                'sender': last_message.sender.username,
                'sender_id': last_message.sender.id,
                'sender_profile_picture': sender_profile_picture,
                'timestamp': last_message.timestamp
            }
        return None
    
    def get_last_activity(self, obj):
        last_message = obj.messages.order_by('-timestamp').first()
        if last_message:
            return last_message.timestamp
        return obj.created_at