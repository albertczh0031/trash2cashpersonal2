import os
from django.core.management.base import BaseCommand
from recycler.models import RecyclingCentre, Category
from django.utils.dateparse import parse_time

class Command(BaseCommand):
    help = "Populate RecyclingCentre model from recycler.txt file and Category model from recyclable_categories.txt"

    def handle(self, *args, **kwargs):
        # --- 1. Sync categories from recyclable_categories.txt ---
        category_file_path = "upload/upload_mock_data/recyclable_categories.txt"

        if os.path.exists(category_file_path):
            with open(category_file_path, "r") as cat_file:
                for line in cat_file:
                    line = line.strip()
                    if line.endswith(":"):  # main category
                        main_category = line[:-1]
                        obj, created = Category.objects.get_or_create(name=main_category)
                        if created:
                            self.stdout.write(self.style.SUCCESS(f"Added Category: {main_category}"))
        else:
            self.stdout.write(self.style.WARNING(f"Category file not found: {category_file_path}"))

        # --- 2. Sync recycling centres from recyclers.txt ---
        file_path = "recycler/recycler_mock_data/recyclers.txt"  # Relative path to the .txt file

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        # Parse the file into centers
        with open(file_path, "r") as file:
            entries = file.read().split("---\n")

        for entry in entries:
            if not entry.strip():
                continue

            # Parse each line into a dictionary
            data = {}
            for line in entry.strip().splitlines():
                if ':' not in line:
                    continue
                key, value = line.split(":", 1)
                data[key.strip()] = value.strip()


            try:
                centre, created = RecyclingCentre.objects.update_or_create(
                    name=data.get("name"),
                    defaults={
                        "email": data.get("email"),
                        "address": data.get("address"),
                        "latitude": float(data.get("latitude")),
                        "longitude": float(data.get("longitude")),
                        "opening_time": parse_time(data.get("opening_time")),
                        "closing_time": parse_time(data.get("closing_time")),
                        "tags": data.get("tags", "")
                    }
                )

                # Assign accepted categories from the "accepted categories:" field
                accepted_categories = data.get("accepted categories", "").split(",")
                accepted_categories = [cat.strip() for cat in accepted_categories if cat.strip()]
                category_objects = Category.objects.filter(name__in=accepted_categories)
                centre.accepted_categories.set(category_objects)

                action = "Created" if created else "Updated"
                self.stdout.write(self.style.SUCCESS(f"{action}: {centre.name}"))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error processing entry: {data.get('name', 'Unknown')}. Error: {e}"))

        self.stdout.write(self.style.SUCCESS("Database synchronized with recyclers.txt"))