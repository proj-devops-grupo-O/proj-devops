#!/bin/bash

echo "Starting API..."

cleanup() {
    echo "Stopping services..."
    kill $API_PID $WORKER_PID 2>/dev/null
    wait $API_PID $WORKER_PID 2>/dev/null
    echo "Services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "Checking Docker services..."
if ! docker compose ps | grep -q "postgres.*running"; then
    echo "Starting Docker services..."
    docker compose up -d
    sleep 3
fi

echo "Checking database connection..."
if ! docker compose exec postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "Error: PostgreSQL not available"
    exit 1
fi

echo "PostgreSQL connected"

echo "Checking Redis connection..."
if ! docker compose exec redis redis-cli ping > /dev/null 2>&1; then
    echo "Error: Redis not available"
    exit 1
fi

echo "Redis connected"

echo "Starting NestJS API on port 3001..."
npm run start:dev > api.log 2>&1 &
API_PID=$!

sleep 8

if ! curl -s http://localhost:3001/api/cobrancas > /dev/null 2>&1; then
    echo "Error: API failed to start"
    tail -20 api.log
    kill $API_PID 2>/dev/null
    exit 1
fi

echo "NestJS API running at http://localhost:3001/api"

echo "======================================"
echo "System started successfully!"
echo ""
echo "API:     http://localhost:3001/api"
echo "Worker:  Processing emails automatically"
echo ""
echo "Real-time logs:"
echo "  API:    tail -f api.log"
echo ""
echo "Stop: Ctrl+C"
echo "======================================"

# Monitor processes
while true; do
    sleep 1
    
    if ! kill -0 $API_PID 2>/dev/null; then
        echo "API stopped unexpectedly"
        break
    fi
done

cleanup 