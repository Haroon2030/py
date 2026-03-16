import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_portal.settings')
django.setup()

from django.contrib.auth.models import User
from django.core.management import call_command

# Run migrations
print("Running migrations...")
call_command('migrate', '--noinput')

# Create superuser
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print("Superuser created: admin / admin123")
else:
    print("Superuser already exists")

print("Setup complete!")
