#!/bin/bash
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Running setup (superuser)..."
python setup.py

echo "Starting gunicorn..."
exec gunicorn --bind 0.0.0.0:8000 --workers 3 student_portal.wsgi:application
