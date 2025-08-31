#!/bin/bash
# Remove the existing SQLite database file
if [ -f "db.sqlite3" ]; then
    echo "Deleting existing db.sqlite3 file..."
    rm db.sqlite3
fi
# Run migrations
echo "Running migrations..."
python manage.py makemigrations
python manage.py migrate

# Populate data
echo "Populating tiers..."
python manage.py populate_tiers

echo "Populating profiles..."
python manage.py populate_profiles

echo "Populating recyclers..."
python manage.py populate_recyclers

echo "Populating vouchers..."
python manage.py populate_vouchers

echo "Populating recyclable identifiers..."
python manage.py populate_recyclable_identifiers

echo "Populating appointments..."
python manage.py populate_appointments

echo "Populating chatrooms..."
python manage.py populate_chatrooms

echo "Populating market..."
python manage.py populate_marketplace

# Create a generic superuser for testing
echo "Creating a generic superuser..."
python manage.py shell <<EOF
from django.contrib.auth.models import User
if not User.objects.filter(username="admin").exists():
    User.objects.create_superuser("admin", "admin@example.com", "password")
    print("Superuser 'admin' created with password 'password'")
else:
    print("Superuser 'admin' already exists")
EOF

# Start the server
echo "Starting the server..."
exec "$@"