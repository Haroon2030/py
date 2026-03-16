# ========================================
# Dockerfile - Student Portal (Django)
# ========================================
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Run migrations and create superuser during build
RUN python setup.py

# Expose port
EXPOSE 8000

# Start gunicorn on 0.0.0.0
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "student_portal.wsgi:application"]
