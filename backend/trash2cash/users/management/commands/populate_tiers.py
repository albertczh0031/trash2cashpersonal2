import os
from django.core.management.base import BaseCommand
from users.models import Tier

class Command(BaseCommand):
    help = "Populate Tier model from tiers.txt file"

    def handle(self, *args, **kwargs):
        file_path = "users/users_mock_data/tiers.txt"  # Relative path to the .txt file

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        with open(file_path, "r") as file:
            for line in file:
                try:
                    # Parse the line into fields
                    tier_desc = line.strip()

                    # Create or update the tier
                    tier, created = Tier.objects.update_or_create(
                        tier_desc=tier_desc,
                        defaults={"tier_desc": tier_desc},
                    )

                    action = "Created" if created else "Updated"
                    self.stdout.write(self.style.SUCCESS(f"{action} tier: {tier_desc}"))

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error processing line: {line}. Error: {e}"))

        self.stdout.write(self.style.SUCCESS("Database synchronized with tiers.txt"))