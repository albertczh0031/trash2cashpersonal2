# chat/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer
from django.contrib.auth.models import User
from django.core.cache import cache
from datetime import datetime, timedelta

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_or_create_chatroom(request):
    other_user_id = request.data.get('user_id')
    
    if not other_user_id:
        return Response({'error': 'user_id is required'}, status=400)
    
    try:
        other_user = User.objects.get(id=other_user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    
    # Find or create a chatroom that contains exactly these two users
    # First, try to find an existing chatroom with both users
    chatrooms = ChatRoom.objects.filter(participants=request.user).filter(participants=other_user)
    
    # Filter to get only private chats (2 participants)
    for chatroom in chatrooms:
        if chatroom.participants.count() == 2:
            return Response({'chatroom_id': chatroom.id})
    
    # If no existing private chatroom found, create a new one
    chatroom = ChatRoom.objects.create()
    chatroom.participants.add(request.user, other_user)
    return Response({'chatroom_id': chatroom.id})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    chatroom_id = request.data.get('chatroom_id')
    content = request.data.get('content')
    chatroom = ChatRoom.objects.get(id=chatroom_id)
    message = Message.objects.create(
        chatroom=chatroom, sender=request.user, content=content
    )
    return Response({'id': message.id, 'content': message.content})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_messages(request, chatroom_id):
    messages = Message.objects.filter(chatroom_id=chatroom_id).order_by('timestamp')
    return Response([
        {
            'id': m.id,
            'sender': m.sender.username,
            'sender_id': m.sender.id,  # Add sender ID for frontend comparison
            'content': m.content,
            'timestamp': m.timestamp
        } for m in messages
    ])

class UserChatRoomsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Max

        # Get chatrooms and add last message info
        chatrooms = ChatRoom.objects.filter(participants=request.user).annotate(
            last_message_time=Max('messages__timestamp')
        ).order_by('-last_message_time', '-created_at')
        
        serializer = ChatRoomSerializer(chatrooms, many=True)
        return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_typing_status(request):
    """Set typing status for a user in a chatroom"""
    chatroom_id = request.data.get('chatroom_id')
    is_typing = request.data.get('is_typing', False)
    
    if not chatroom_id:
        return Response({'error': 'Chatroom ID required'}, status=400)
    
    # Use cache to store typing status with expiration
    cache_key = f"typing_{chatroom_id}_{request.user.id}"
    
    if is_typing:
        # Set typing status for 10 seconds
        cache.set(cache_key, {
            'user_id': request.user.id,
            'username': request.user.username,
            'timestamp': datetime.now().isoformat()
        }, timeout=10)
    else:
        # Remove typing status
        cache.delete(cache_key)
    
    return Response({'status': 'success'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_typing_status(request, chatroom_id):
    """Get who is currently typing in a chatroom"""
    typing_users = []
    
    # Get all users in the chatroom
    try:
        chatroom = ChatRoom.objects.get(id=chatroom_id)
        participants = chatroom.participants.all()
        
        for participant in participants:
            if participant.id != request.user.id:  # Don't include current user
                cache_key = f"typing_{chatroom_id}_{participant.id}"
                typing_status = cache.get(cache_key)
                if typing_status:
                    typing_users.append(typing_status)
        
    except ChatRoom.DoesNotExist:
        return Response({'error': 'Chatroom not found'}, status=404)
    
    return Response({'typing_users': typing_users})