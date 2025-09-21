#!/bin/bash

echo "Stopping all services..."

# Stop development environment
if [ -f "docker-compose.dev.yml" ]; then
    echo "Stopping development services..."
    docker compose -f docker-compose.dev.yml down
fi

# Stop staging environment
if [ -f "docker-compose.staging.yml" ]; then
    echo "Stopping staging services..."
    docker compose -f docker-compose.staging.yml down
fi

# Stop production environment
if [ -f "docker-compose.yml" ]; then
    echo "Stopping production services..."
    docker compose down
fi

echo "All services stopped"
echo "To start again, run: ./script/start.sh"
