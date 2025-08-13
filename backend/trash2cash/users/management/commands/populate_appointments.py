import os
from django.core.management.base import BaseCommand
from users.models import Appointment
from datetime import datetime
from django.db import connection
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = "Populate Appointment model from appointments.txt file, remove outdated appointments, and reset appointment_id sequence if necessary"

    def handle(self, *args, **kwargs):
        file_path = "users/users_mock_data/appointments.txt"  # Relative path to the .txt file

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        # Parse the file into appointments
        with open(file_path, "r") as file:
            entries = file.read().split("\n\n")  # Split by double newlines for each centre

        processed_appointments = set()  # Track processed appointments

        for entry in entries:
            if not entry.strip():
                continue

            # Parse each centre's appointments
            lines = entry.strip().splitlines()
            centre_id_line = lines[0]
            if not centre_id_line.startswith("centre id:"):
                self.stdout.write(self.style.ERROR(f"Invalid format: {centre_id_line}"))
                continue

            # Extract centre ID
            try:
                centre_id = int(centre_id_line.split(":")[1].strip())
            except ValueError:
                self.stdout.write(self.style.ERROR(f"Invalid centre ID: {centre_id_line}"))
                continue

            # Process each appointment for the centre
            for line in lines[1:]:
                try:
                    # Parse the appointment details
                    parts = [part.strip() for part in line.split(";") if part.strip()]
                    # Defaults
                    user_obj = None
                    points_earned = None
                    category_obj = None
                    item_weight = None

                    # Parse required fields
                    date_str = parts[0].split(":", 1)[1].strip()
                    time_str = parts[1].split(":", 1)[1].strip()
                    status = parts[2].split(":", 1)[1].strip()
                    is_dropoff_str = parts[3].split("=", 1)[1].strip() if len(parts) > 3 else "True"

                    # Parse optional fields
                    for part in parts[4:]:
                        if part.startswith("user_id"):
                            user_value = part.split("=", 1)[1].strip()
                            user_obj = User.objects.filter(username=user_value).first()
                            if not user_obj:
                                self.stdout.write(self.style.WARNING(f"User '{user_value}' not found for appointment: {line}"))
                        elif part.startswith("points_earned"):
                            points_value = part.split("=", 1)[1].strip()
                            try:
                                points_earned = int(points_value)
                            except ValueError:
                                self.stdout.write(self.style.WARNING(f"Invalid points_earned '{points_value}' for appointment: {line}"))
                        elif part.startswith("category"):
                            category_value = part.split("=", 1)[1].strip()
                            from recycler.models import Category
                            category_obj = Category.objects.filter(name=category_value).first()
                            if not category_obj:
                                self.stdout.write(self.style.WARNING(f"Category '{category_value}' not found for appointment: {line}"))
                        elif part.startswith("item_weight"):
                            weight_value = part.split("=", 1)[1].strip()
                            try:
                                item_weight = float(weight_value)
                            except ValueError:
                                self.stdout.write(self.style.WARNING(f"Invalid item_weight '{weight_value}' for appointment: {line}"))

                    # Convert date, time, and is_dropoff to proper formats
                    date = datetime.strptime(date_str, "%Y-%m-%d").date()
                    time = datetime.strptime(time_str, "%H:%M:%S").time()
                    is_dropoff = is_dropoff_str.lower() == "true"

                    # Prepare defaults for update_or_create
                    defaults = {
                        "status": status,
                        "user_id": user_obj,
                        "category": category_obj,
                        "item_weight": item_weight,
                    }
                    if points_earned is not None:
                        defaults["points_earned"] = points_earned

                    # Create or update the appointment
                    appointment, created = Appointment.objects.update_or_create(
                        centre_id=centre_id,
                        date=date,
                        time=time,
                        is_dropoff=is_dropoff,
                        defaults=defaults,
                    )

                    # Add the processed appointment to the set
                    processed_appointments.add((centre_id, date, time, is_dropoff))

                    action = "Created" if created else "Updated"
                    self.stdout.write(self.style.SUCCESS(
                        f"{action} appointment: Centre {centre_id} on {date} at {time} ({status}, is_dropoff={is_dropoff}, user_id={user_obj}, points_earned={points_earned})"
                    ))

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error processing line: {line}. Error: {e}"))

        # Remove appointments not in the file
        existing_appointments = Appointment.objects.values_list("centre_id", "date", "time", "is_dropoff")
        for appointment in existing_appointments:
            if appointment not in processed_appointments:
                Appointment.objects.filter(
                    centre_id=appointment[0],
                    date=appointment[1],
                    time=appointment[2],
                    is_dropoff=appointment[3]
                ).delete()
                self.stdout.write(self.style.WARNING(
                    f"Deleted outdated appointment: Centre {appointment[0]} on {appointment[1]} at {appointment[2]} (is_dropoff={appointment[3]})"
                ))

        # Reset the appointment_id sequence if all appointments are deleted
        if not Appointment.objects.exists():
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM sqlite_sequence WHERE name='users_appointment';")
            self.stdout.write(self.style.SUCCESS("Appointment ID sequence reset to start from 1."))

        self.stdout.write(self.style.SUCCESS("Database synchronized with appointments.txt"))