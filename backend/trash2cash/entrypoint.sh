#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

echo "✅ entrypoint.sh executed"

# Run migrations (do NOT create migrations in production)
echo "📦 Applying migrations..."
python manage.py migrate --noinput

# Populate data if needed
echo "🌱 Populating initial data..."
python manage.py populate_tiers || true
python manage.py populate_profiles || true
python manage.py populate_recyclers || true
python manage.py populate_vouchers || true
python manage.py populate_recyclable_identifiers || true
python manage.py populate_appointments || true
python manage.py populate_chatrooms || true

# Create admin user if not exists
echo "👤 Ensuring admin user exists..."
python manage.py shell <<EOF
from django.contrib.auth.models import User
if not User.objects.filter(username="admin").exists():
    User.objects.create_superuser("admin", "admin@example.com", "password")
    print("✅ Superuser 'admin' created with password 'password'")
else:
    print("ℹ️ Superuser 'admin' already exists")
EOF

# Start the app
echo "🚀 Starting the server..."
exec "$@"
