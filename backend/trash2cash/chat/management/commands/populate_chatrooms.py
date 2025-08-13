import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from chat.models import ChatRoom, Message
from django.utils import timezone
from datetime import datetime


class Command(BaseCommand):
    help = "Populate ChatRoom and Message models with mock data from text files"

    def handle(self, *args, **options):
        chatrooms_file_path = "chat/chat_mock_data/chatrooms.txt"
        messages_file_path = "chat/chat_mock_data/messages.txt"

        # Check if files exist
        if not os.path.exists(chatrooms_file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {chatrooms_file_path}"))
            return

        if not os.path.exists(messages_file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {messages_file_path}"))
            return

        # Check if users exist
        users = list(User.objects.all())
        if len(users) < 2:
            self.stdout.write(
                self.style.ERROR(
                    "Need at least 2 users in the database to create chatrooms. "
                    "Please run 'python manage.py populate_profiles' first."
                )
            )
            return

        self.stdout.write(f"Found {len(users)} users in the database")

        # Clear existing chatrooms and messages
        ChatRoom.objects.all().delete()
        self.stdout.write(self.style.WARNING("Cleared existing chatrooms and messages"))

        # Create chatrooms from file
        chatrooms_created = []
        with open(chatrooms_file_path, "r") as file:
            for line_num, line in enumerate(file, 1):
                try:
                    line = line.strip()
                    if not line:  # Skip empty lines
                        continue
                    
                    # Parse participant usernames
                    participant_usernames = [username.strip() for username in line.split(";")]
                    
                    # Get User objects
                    participants = []
                    for username in participant_usernames:
                        try:
                            user = User.objects.get(username=username)
                            participants.append(user)
                        except User.DoesNotExist:
                            self.stdout.write(
                                self.style.WARNING(f"User '{username}' not found in line {line_num}. Skipping.")
                            )
                            continue
                    
                    if len(participants) < 2:
                        self.stdout.write(
                            self.style.WARNING(f"Not enough valid participants in line {line_num}. Skipping.")
                        )
                        continue

                    # Create the chatroom
                    chatroom = ChatRoom.objects.create()
                    chatroom.participants.set(participants)
                    chatroom.save()
                    
                    chatrooms_created.append(chatroom)
                    participant_names = [user.username for user in participants]
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"Created chatroom {len(chatrooms_created)} with participants: {', '.join(participant_names)}"
                        )
                    )

                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f"Error processing chatroom line {line_num}: {line}. Error: {e}")
                    )

        # Create messages from file
        messages_created = 0
        with open(messages_file_path, "r") as file:
            for line_num, line in enumerate(file, 1):
                try:
                    line = line.strip()
                    if not line:  # Skip empty lines
                        continue
                    
                    # Parse message data: chatroom_index;sender_username;message_content;date;hour;minute
                    fields = line.split(";")
                    if len(fields) != 6:
                        self.stdout.write(
                            self.style.WARNING(f"Invalid format in messages line {line_num}. Expected 6 fields, got {len(fields)}. Skipping.")
                        )
                        continue
                    
                    chatroom_index, sender_username, message_content, date_str, hour_str, minute_str = fields
                    
                    # Get chatroom (1-indexed in file, 0-indexed in list)
                    try:
                        chatroom_idx = int(chatroom_index.strip()) - 1
                        if chatroom_idx < 0 or chatroom_idx >= len(chatrooms_created):
                            self.stdout.write(
                                self.style.WARNING(f"Invalid chatroom index {chatroom_index} in line {line_num}. Skipping.")
                            )
                            continue
                        chatroom = chatrooms_created[chatroom_idx]
                    except ValueError:
                        self.stdout.write(
                            self.style.WARNING(f"Invalid chatroom index format in line {line_num}. Skipping.")
                        )
                        continue
                    
                    # Get sender
                    try:
                        sender = User.objects.get(username=sender_username.strip())
                        # Verify sender is a participant in the chatroom
                        if sender not in chatroom.participants.all():
                            self.stdout.write(
                                self.style.WARNING(f"User '{sender_username}' is not a participant in chatroom {chatroom_index} (line {line_num}). Skipping.")
                            )
                            continue
                    except User.DoesNotExist:
                        self.stdout.write(
                            self.style.WARNING(f"User '{sender_username}' not found in line {line_num}. Skipping.")
                        )
                        continue
                    
                    # Calculate timestamp from date and time
                    try:
                        # Parse date and time components
                        date_obj = datetime.strptime(date_str.strip(), "%Y-%m-%d").date()
                        hour = int(hour_str.strip())
                        minute = int(minute_str.strip())
                        
                        # Create datetime object with the exact date and time from file
                        message_datetime = datetime.combine(
                            date_obj, 
                            datetime.min.time().replace(hour=hour, minute=minute, second=0)
                        )
                        
                        # Make it timezone-aware (assuming local timezone)
                        message_timestamp = timezone.make_aware(
                            message_datetime, 
                            timezone.get_current_timezone()
                        )
                        
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"Message timestamp: {message_timestamp} (from {date_str} {hour:02d}:{minute:02d})"
                            )
                        )
                        
                    except ValueError as ve:
                        self.stdout.write(
                            self.style.WARNING(f"Invalid date/time format in line {line_num}: {ve}. Skipping.")
                        )
                        continue
                    
                    # Create the message with custom timestamp
                    message = Message.objects.create(
                        chatroom=chatroom,
                        sender=sender,
                        content=message_content.strip(),
                    )
                    
                    # Update the timestamp after creation to override auto_now_add
                    Message.objects.filter(id=message.id).update(timestamp=message_timestamp)
                    messages_created += 1
                    
                    # Verify the timestamp was set correctly
                    updated_message = Message.objects.get(id=message.id)
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"Created message {messages_created}: '{message_content[:50]}...' at {updated_message.timestamp}"
                        )
                    )

                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f"Error processing message line {line_num}: {line}. Error: {e}")
                    )

        # Summary
        self.stdout.write(
            self.style.SUCCESS(
                f"\n=== SUMMARY ===\n"
                f"Successfully created {len(chatrooms_created)} chatrooms\n"
                f"Successfully created {messages_created} messages\n"
                f"Average messages per chatroom: {messages_created / max(len(chatrooms_created), 1):.1f}"
            )
        )

        # Show some statistics
        total_chatrooms = ChatRoom.objects.count()
        total_messages = Message.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f"\n=== DATABASE TOTALS ===\n"
                f"Total chatrooms in database: {total_chatrooms}\n"
                f"Total messages in database: {total_messages}"
            )
        )
