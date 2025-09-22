#!/bin/bash

echo "Starting API with Docker Compose..."

cleanup() {
    echo "Stopping services..."
    docker compose -f docker-compose.dev.yml down
    echo "Services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "Starting Docker services..."
docker compose -f docker-compose.dev.yml up -d

echo "Waiting for services to be ready..."
sleep 10

echo "Checking database connection..."
if ! docker compose -f docker-compose.dev.yml exec postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "Error: PostgreSQL not available"
    exit 1
fi

echo "PostgreSQL connected"

echo "Checking Redis connection..."
if ! docker compose -f docker-compose.dev.yml exec redis redis-cli ping > /dev/null 2>&1; then
    echo "Error: Redis not available"
    exit 1
fi

echo "Redis connected"

echo "Checking application health..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Application is healthy!"
        break
    fi
    
    echo "Attempt $((attempt + 1))/$max_attempts: Application not ready yet..."
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Application failed to start properly"
    docker compose -f docker-compose.dev.yml logs app
    exit 1
fi

echo "======================================"
echo "System started successfully!"
echo ""
echo "API:     http://localhost:3000/api"
echo "Health:  http://localhost:3000/health"
echo "Docs:    http://localhost:3000/api/docs"
echo ""
echo "Real-time logs:"
echo "  docker compose -f docker-compose.dev.yml logs -f app"
echo ""
echo "Stop: Ctrl+C"
echo "======================================"

while true; do
    sleep 5
done