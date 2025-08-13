# chat/urls.py
from django.urls import path
from . import views
from .views import UserChatRoomsView 

urlpatterns = [
    path('get-or-create-chatroom/', views.get_or_create_chatroom, name='get_or_create_chatroom'),
    path('messages/<int:chatroom_id>/', views.get_messages, name='get_messages'),
    path('send/', views.send_message, name='send_message'),
    path('my-chatrooms/', UserChatRoomsView.as_view(), name='my-chatrooms'),
    path('typing/', views.set_typing_status, name='set_typing_status'),
    path('typing/<int:chatroom_id>/', views.get_typing_status, name='get_typing_status'),
]