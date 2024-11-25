#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}Error: Docker is not running${NC}"
        exit 1
    fi
}

# Function to start all services
start_all() {
    echo -e "${YELLOW}Starting all services...${NC}"
    
    # Start monitoring stack
    echo -e "${YELLOW}Starting monitoring stack...${NC}"
    cd monitoring && docker-compose up -d
    
    # Start main application
    echo -e "${YELLOW}Starting main application...${NC}"
    docker-compose up -d
    
    # Wait for services to be ready
    echo -e "${YELLOW}Waiting for services to be ready...${NC}"
    sleep 10
    
    # Check service health
    check_service_health
}

# Function to stop all services
stop_all() {
    echo -e "${YELLOW}Stopping all services...${NC}"
    
    # Stop main application
    echo -e "${YELLOW}Stopping main application...${NC}"
    docker-compose down
    
    # Stop monitoring stack
    echo -e "${YELLOW}Stopping monitoring stack...${NC}"
    cd monitoring && docker-compose down
}

# Function to restart all services
restart_all() {
    stop_all
    start_all
}

# Function to check service health
check_service_health() {
    echo -e "${YELLOW}Checking service health...${NC}"
    
    # Check main application
    if curl -s http://localhost:3000/api/health >/dev/null; then
        echo -e "${GREEN}Main application is healthy${NC}"
    else
        echo -e "${RED}Main application is not responding${NC}"
    fi
    
    # Check Grafana
    if curl -s http://localhost:3001/api/health >/dev/null; then
        echo -e "${GREEN}Grafana is healthy${NC}"
    else
        echo -e "${RED}Grafana is not responding${NC}"
    fi
    
    # Check Prometheus
    if curl -s http://localhost:9090/-/healthy >/dev/null; then
        echo -e "${GREEN}Prometheus is healthy${NC}"
    else
        echo -e "${RED}Prometheus is not responding${NC}"
    fi
    
    # Check Loki
    if curl -s http://localhost:3100/ready >/dev/null; then
        echo -e "${GREEN}Loki is healthy${NC}"
    else
        echo -e "${RED}Loki is not responding${NC}"
    fi
}

# Function to view logs
view_logs() {
    if [ -z "$2" ]; then
        echo -e "${RED}Error: Please specify service name${NC}"
        exit 1
    fi
    
    case "$2" in
        app)
            docker-compose logs --tail=100 -f app
            ;;
        grafana)
            cd monitoring && docker-compose logs --tail=100 -f grafana
            ;;
        prometheus)
            cd monitoring && docker-compose logs --tail=100 -f prometheus
            ;;
        loki)
            cd monitoring && docker-compose logs --tail=100 -f loki
            ;;
        *)
            echo -e "${RED}Error: Unknown service ${2}${NC}"
            exit 1
            ;;
    esac
}

# Function to backup data
backup() {
    echo -e "${YELLOW}Creating backup...${NC}"
    
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Stop services before backup
    stop_all
    
    # Backup monitoring data
    cp -r monitoring/grafana/data "$BACKUP_DIR/grafana"
    cp -r monitoring/prometheus/data "$BACKUP_DIR/prometheus"
    cp -r monitoring/loki/data "$BACKUP_DIR/loki"
    
    # Backup database if needed
    # Add database backup commands here
    
    # Restart services
    start_all
    
    echo -e "${GREEN}Backup completed: $BACKUP_DIR${NC}"
}

# Function to restore from backup
restore() {
    if [ -z "$2" ]; then
        echo -e "${RED}Error: Please specify backup directory${NC}"
        exit 1
    }
    
    if [ ! -d "$2" ]; then
        echo -e "${RED}Error: Backup directory not found${NC}"
        exit 1
    }
    
    echo -e "${YELLOW}Restoring from backup: $2${NC}"
    
    # Stop services before restore
    stop_all
    
    # Restore monitoring data
    rm -rf monitoring/grafana/data
    rm -rf monitoring/prometheus/data
    rm -rf monitoring/loki/data
    
    cp -r "$2/grafana" monitoring/grafana/data
    cp -r "$2/prometheus" monitoring/prometheus/data
    cp -r "$2/loki" monitoring/loki/data
    
    # Restore database if needed
    # Add database restore commands here
    
    # Restart services
    start_all
    
    echo -e "${GREEN}Restore completed${NC}"
}

# Function to update services
update() {
    echo -e "${YELLOW}Updating services...${NC}"
    
    # Pull latest images
    docker-compose pull
    cd monitoring && docker-compose pull
    cd ..
    
    # Restart services
    restart_all
    
    echo -e "${GREEN}Update completed${NC}"
}

# Function to show status
status() {
    echo -e "${YELLOW}Service Status:${NC}"
    check_service_health
    
    echo -e "\n${YELLOW}Docker Containers:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Main script
case "$1" in
    start)
        check_docker
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart_all
        ;;
    status)
        status
        ;;
    logs)
        view_logs "$@"
        ;;
    backup)
        backup
        ;;
    restore)
        restore "$@"
        ;;
    update)
        update
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|backup|restore|update}"
        echo "  start   - Start all services"
        echo "  stop    - Stop all services"
        echo "  restart - Restart all services"
        echo "  status  - Show service status"
        echo "  logs    - View service logs (app|grafana|prometheus|loki)"
        echo "  backup  - Create backup"
        echo "  restore - Restore from backup"
        echo "  update  - Update services"
        exit 1
        ;;
esac

exit 0