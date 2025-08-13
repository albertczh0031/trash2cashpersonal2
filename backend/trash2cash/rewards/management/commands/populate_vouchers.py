import os
from django.core.management.base import BaseCommand
from rewards.models import Voucher
from users.models import Tier
from recycler.models import RecyclingCentre
from datetime import datetime

class Command(BaseCommand):
    help = "Populate Voucher model from vouchers.txt file"

    def handle(self, *args, **kwargs):
        file_path = "rewards/rewards_mock_data/vouchers.txt"  # Relative path to the .txt file

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        with open(file_path, "r") as file:
            for line in file:
                try:
                    # Parse the line into fields
                    name, tier_desc, discount_amt, points, description, recycle_center_code, claimable_count, expiration_date = line.strip().split(";")

                    # Get the tier object
                    tier = Tier.objects.filter(tier_desc=tier_desc.strip()).first()
                    if not tier:
                        self.stdout.write(self.style.ERROR(f"Tier not found: {tier_desc}"))
                        continue

                    # get the Recycling Centre object
                    recycle_center = RecyclingCentre.objects.filter(id=int(recycle_center_code.strip())).first()
                    if not recycle_center:
                        self.stdout.write(self.style.ERROR(f"RecyclingCentre not found for id: {recycle_center_code}"))
                        continue

                    # Create or update the voucher
                    voucher, created = Voucher.objects.update_or_create(
                        name=name.strip(),
                        defaults={
                            "tier": tier,
                            "discount_amt": float(discount_amt.strip()),
                            "points": int(points.strip()),
                            "description": description.strip(),
                            "recycle_center_code": recycle_center,
                            "claimable_count": int(claimable_count.strip()),
                            "expiration_date": datetime.strptime(expiration_date.strip(), "%Y-%m-%d").date(),
                            "is_active": True,
                        },
                    )

                    action = "Created" if created else "Updated"
                    self.stdout.write(self.style.SUCCESS(f"{action} voucher: {name}"))

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error processing line: {line}. Error: {e}"))

        self.stdout.write(self.style.SUCCESS("Database synchronized with vouchers.txt"))