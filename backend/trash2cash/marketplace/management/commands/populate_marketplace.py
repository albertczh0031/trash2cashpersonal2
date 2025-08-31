
import os
from django.core.management.base import BaseCommand
from marketplace.models import BooksMagazine, Clothe, Electronic, Furniture, MiscItem, MarketplaceImage
from django.contrib.auth.models import User
from django.utils import timezone

MODEL_FILE_MAP = {
    "booksMagazine.txt": (BooksMagazine, "books_magazine"),
    "clothes.txt": (Clothe, "clothe"),
    "electronics.txt": (Electronic, "electronic"),
    "furniture.txt": (Furniture, "furniture"),
    "misc.txt": (MiscItem, "misc_item")
}

class Command(BaseCommand):
    help = "Populate all marketplace models from marketplace_mock_data/*.txt files, and create MarketplaceImage objects."

    def handle(self, *args, **options):
        # Remove all old listings and images
        self.stdout.write("Deleting all old listings and images...")
        MarketplaceImage.objects.all().delete()
        BooksMagazine.objects.all().delete()
        Clothe.objects.all().delete()
        Electronic.objects.all().delete()
        Furniture.objects.all().delete()
        MiscItem.objects.all().delete()
        self.stdout.write(self.style.SUCCESS("All old listings and images deleted."))

        base_dir = "marketplace/marketplace_mock_data"
        for filename, (Model, image_field) in MODEL_FILE_MAP.items():
            file_path = os.path.join(base_dir, filename)
            if not os.path.exists(file_path):
                self.stdout.write(self.style.WARNING(f"File not found: {file_path}"))
                continue

            with open(file_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith('#'):
                        continue
                    try:
                        # Handle Clothe model with extra fields
                        if Model.__name__ == "Clothe":
                            username, title, description, price, sizes, gender, image_filename, *rest = line.split(";")
                        else:
                            username, title, description, price, image_filename, *rest = line.split(";")
                        try:
                            seller = User.objects.get(username=username)
                        except User.DoesNotExist:
                            self.stdout.write(self.style.WARNING(f"Skipping '{title}' - seller '{username}' not found"))
                            continue

                        # Create the item
                        if Model.__name__ == "Clothe":
                            obj = Model.objects.create(
                                seller=seller,
                                title=title,
                                description=description,
                                price=float(price),
                                sizes=sizes,
                                gender=gender,
                                date=timezone.now(),
                            )
                        else:
                            obj = Model.objects.create(
                                seller=seller,
                                title=title,
                                description=description,
                                price=float(price),
                                date=timezone.now(),
                            )

                        # Create MarketplaceImage(s) for this object, supporting multiple images
                        image_filenames = [img.strip() for img in image_filename.split(",") if img.strip()]
                        for img in image_filenames:
                            img_base = os.path.splitext(img)[0]
                            image_path = os.path.join("marketplace", img)
                            image_kwargs = {image_field: obj, "image": image_path}
                            MarketplaceImage.objects.create(**image_kwargs)

                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Error processing line: {line}. Error: {e}"))

            self.stdout.write(self.style.SUCCESS(f"Database synchronized with {filename}"))