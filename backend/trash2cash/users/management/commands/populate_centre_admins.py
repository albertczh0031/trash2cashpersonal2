"""
Management command to assign centre admin users to their respective RecyclingCentre by ID.
Reads users/users_mock_data/centre_admins.txt with lines: username,centre_id
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import Profile, RecyclingCentreAdmin
from recycler.models import RecyclingCentre
import os

DATA_FILE = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    '../../users_mock_data/centre_admins.txt'
)

class Command(BaseCommand):
    help = 'Assign centre admin users to their respective RecyclingCentre by ID.'

    def handle(self, *args, **options):
        User = get_user_model()
        if not os.path.exists(DATA_FILE):
            self.stderr.write(self.style.ERROR(f"File not found: {DATA_FILE}"))
            return

        # Parse all valid (username, centre_id) pairs from file
        valid_pairs = set()
        with open(DATA_FILE, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                try:
                    username, centre_id = line.split(',')
                    centre_id = int(centre_id)
                    valid_pairs.add((username, centre_id))
                except ValueError:
                    self.stderr.write(self.style.WARNING(f"Skipping malformed line: {line}"))
                    continue

        # Remove any RecyclingCentreAdmin entries not in the file
        for obj in RecyclingCentreAdmin.objects.all():
            uname = obj.admin.user.username
            cid = obj.recycling_centre.id
            if (uname, cid) not in valid_pairs:
                obj.delete()
                self.stdout.write(self.style.WARNING(f"Removed inconsistent admin assignment: {uname} -> centre {cid}"))

        # Now ensure all pairs in the file exist
        for username, centre_id in valid_pairs:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                self.stderr.write(self.style.WARNING(f"User not found: {username}"))
                continue

            try:
                centre = RecyclingCentre.objects.get(id=centre_id)
            except RecyclingCentre.DoesNotExist:
                self.stderr.write(self.style.WARNING(f"Centre not found: ID {centre_id}"))
                continue

            profile = getattr(user, 'profile', None)
            if not profile:
                self.stderr.write(self.style.WARNING(f"Profile not found for user: {username}"))
                continue

            obj, created = RecyclingCentreAdmin.objects.get_or_create(
                admin=profile,
                recycling_centre=centre
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Assigned {username} to centre {centre_id}"))
            else:
                self.stdout.write(self.style.WARNING(f"{username} already assigned to centre {centre_id}"))
