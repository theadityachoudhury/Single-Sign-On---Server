#!/bin/bash

# docker-scripts.sh - Utility scripts for Docker operations

# Development commands
dev_up() {
    echo "🚀 Starting development environment..."
    docker-compose up -d
}

dev_down() {
    echo "🛑 Stopping development environment..."
    docker-compose down
}

dev_logs() {
    echo "📋 Showing development logs..."
    docker-compose logs -f identity-service
}

dev_shell() {
    echo "🐚 Opening shell in identity service container..."
    docker-compose exec identity-service sh
}

# Production commands
prod_up() {
    echo "🚀 Starting production environment..."
    docker-compose -f docker-compose.prod.yml up -d
}

prod_down() {
    echo "🛑 Stopping production environment..."
    docker-compose -f docker-compose.prod.yml down
}

prod_logs() {
    echo "📋 Showing production logs..."
    docker-compose -f docker-compose.prod.yml logs -f identity-service
}

# Utility commands
clean() {
    echo "🧹 Cleaning up Docker resources..."
    docker-compose down -v
    docker system prune -f
    docker volume prune -f
}

build() {
    echo "🔨 Building Docker images..."
    docker-compose build --no-cache
}

rebuild() {
    echo "🔄 Rebuilding and restarting..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
}

# Health check
health() {
    echo "🏥 Checking service health..."
    curl -f http://localhost:3000/health || echo "❌ Service is not healthy"
}

# Help
help() {
    echo "📚 Docker Management Scripts for HeapMind Identity Service"
    echo ""
    echo "Development Commands:"
    echo "  dev_up     - Start development environment"
    echo "  dev_down   - Stop development environment"
    echo "  dev_logs   - Show development logs"
    echo "  dev_shell  - Open shell in container"
    echo ""
    echo "Production Commands:"
    echo "  prod_up    - Start production environment"
    echo "  prod_down  - Stop production environment"
    echo "  prod_logs  - Show production logs"
    echo ""
    echo "Utility Commands:"
    echo "  clean      - Clean up Docker resources"
    echo "  build      - Build Docker images"
    echo "  rebuild    - Rebuild and restart"
    echo "  health     - Check service health"
    echo "  help       - Show this help"
    echo ""
    echo "Note: Using hosted MongoDB - no local database commands available"
}

# Main script logic
case "$1" in
    dev_up|dev-up) dev_up ;;
    dev_down|dev-down) dev_down ;;
    dev_logs|dev-logs) dev_logs ;;
    dev_shell|dev-shell) dev_shell ;;
    prod_up|prod-up) prod_up ;;
    prod_down|prod-down) prod_down ;;
    prod_logs|prod-logs) prod_logs ;;
    clean) clean ;;
    build) build ;;
    rebuild) rebuild ;;
    health) health ;;
    help) help ;;
    *) help ;;
esac