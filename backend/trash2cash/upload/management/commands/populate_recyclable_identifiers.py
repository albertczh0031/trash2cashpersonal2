import os
from django.core.management.base import BaseCommand
from upload.models import RecyclableIdentifier
from recycler.models import Category

class Command(BaseCommand):
    help = "Populate RecyclableIdentifier and Category models from recyclable_categories.txt file"

    def handle(self, *args, **kwargs):
        file_path = "upload/upload_mock_data/recyclable_categories.txt"  # Relative path to the .txt file

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        # Parse the file into main categories and subcategories
        categories = {}
        with open(file_path, "r") as file:
            current_category = None
            for line in file:
                line = line.strip()
                if not line:
                    continue
                if line.endswith(":"):  # Main category
                    current_category = line[:-1]
                    categories[current_category] = []
                elif current_category:  # Subcategory
                    categories[current_category].append(line)

        # Synchronize the RecyclableIdentifier model with the parsed categories
        db_entries = RecyclableIdentifier.objects.all()
        db_categories = {(entry.category, entry.subcategory) for entry in db_entries}

        # Add or update entries in RecyclableIdentifier
        new_entries = set()
        for category, subcategories in categories.items():
            for subcategory in subcategories:
                new_entries.add((category, subcategory))
                if (category, subcategory) not in db_categories:
                    RecyclableIdentifier.objects.create(category=category, subcategory=subcategory)
                    self.stdout.write(self.style.SUCCESS(f"Added: {category} - {subcategory}"))

        # Remove entries not in the file
        for db_entry in db_entries:
            if (db_entry.category, db_entry.subcategory) not in new_entries:
                db_entry.delete()
                self.stdout.write(self.style.WARNING(f"Removed from RecyclableIdentifier: {db_entry.category} - {db_entry.subcategory}"))

        # Synchronize the Category model with the main categories
        existing_categories = set(Category.objects.values_list("name", flat=True))
        for category in categories.keys():
            if category not in existing_categories:
                Category.objects.create(name=category)
                self.stdout.write(self.style.SUCCESS(f"Added to Category: {category}"))

        self.stdout.write(self.style.SUCCESS("Database synchronized with recyclable_categories.txt"))