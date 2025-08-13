import os
from django.core.management.base import BaseCommand
from users.models import Profile, Tier
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = "Populate Profile model from profiles.txt file"

    def handle(self, *args, **kwargs):
        file_path = "users/users_mock_data/profiles.txt"

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        with open(file_path, "r") as file:
            for line in file:
                try:
                    fields = line.strip().split(";")
                    if len(fields) == 11:
                        username, first_name, last_name, email, street, city, postcode, points, tier_desc, password, admin_flag = fields
                    else:
                        username, first_name, last_name, email, street, city, postcode, points, tier_desc, password = fields
                        admin_flag = "is_admin=False"

                    user, created = User.objects.get_or_create(username=username.strip(), defaults={
                        "first_name": first_name.strip(),
                        "last_name": last_name.strip(),
                        "email": email.strip(),
                    })

                    # Always update user details and password
                    user.first_name = first_name.strip()
                    user.last_name = last_name.strip()
                    user.email = email.strip()
                    user.set_password(password.strip())

                    # Set admin status
                    is_admin = admin_flag.strip().lower() == "is_admin=true"
                    user.is_staff = is_admin
                    user.is_superuser = is_admin
                    user.save()

                    tier = Tier.objects.filter(tier_desc=tier_desc.strip()).first()

                    profile, created = Profile.objects.update_or_create(
                        user=user,
                        defaults={
                            "street": street.strip(),
                            "city": city.strip(),
                            "postcode": postcode.strip(),
                            "points": int(points.strip()),
                            "tier": tier,
                        },
                    )

                    action = "Created" if created else "Updated"
                    self.stdout.write(self.style.SUCCESS(f"{action} profile for user: {username}"))

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error processing line: {line}. Error: {e}"))

        self.stdout.write(self.style.SUCCESS("Database synchronized with profiles.txt"))