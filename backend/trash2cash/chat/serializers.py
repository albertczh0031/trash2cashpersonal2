from rest_framework import serializers
from .models import ChatRoom, Message

class ChatRoomSerializer(serializers.ModelSerializer):
    participants = serializers.StringRelatedField(many=True)
    last_message = serializers.SerializerMethodField()
    last_activity = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ['id', 'participants', 'created_at', 'last_message', 'last_activity']
    
    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-timestamp').first()
        if last_message:
            return {
                'content': last_message.content,
                'sender': last_message.sender.username,
                'timestamp': last_message.timestamp
            }
        return None
    
    def get_last_activity(self, obj):
        last_message = obj.messages.order_by('-timestamp').first()
        if last_message:
            return last_message.timestamp
        return obj.created_at