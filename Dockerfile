# ========================================
# Dockerfile - Archive System (Django + React)
# ========================================

# ── Stage 1: Build React frontend ──
FROM node:20-slim AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY frontend/ .
RUN npm run build

# ── Stage 2: Python / Django ──
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Copy built frontend from Stage 1
COPY --from=frontend-build /frontend/dist /app/frontend/dist

# Create media directory
RUN mkdir -p /app/media

# Collect static files
RUN python manage.py collectstatic --noinput

# Copy entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 8000

# Run migrations + create superuser at startup, then start gunicorn
ENTRYPOINT ["/app/entrypoint.sh"]
