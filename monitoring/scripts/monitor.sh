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

# Function to create required directories
create_directories() {
    echo -e "${YELLOW}Creating required directories...${NC}"
    mkdir -p logs/{mom-kidz,care-log,community,api,error,system,db,ai-chat}
    mkdir -p prometheus/data
    mkdir -p grafana/data
    mkdir -p loki/data
    chmod -R 777 logs prometheus/data grafana/data loki/data
}

# Function to start monitoring stack
start_monitoring() {
    echo -e "${YELLOW}Starting monitoring stack...${NC}"
    docker-compose up -d
    
    # Wait for services to be ready
    echo -e "${YELLOW}Waiting for services to be ready...${NC}"
    sleep 10
    
    # Check service health
    check_service_health
}

# Function to stop monitoring stack
stop_monitoring() {
    echo -e "${YELLOW}Stopping monitoring stack...${NC}"
    docker-compose down
}

# Function to restart monitoring stack
restart_monitoring() {
    echo -e "${YELLOW}Restarting monitoring stack...${NC}"
    docker-compose restart
    
    # Wait for services to be ready
    echo -e "${YELLOW}Waiting for services to be ready...${NC}"
    sleep 10
    
    # Check service health
    check_service_health
}

# Function to check service health
check_service_health() {
    echo -e "${YELLOW}Checking service health...${NC}"
    
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
    echo -e "${YELLOW}Viewing logs for service: $1${NC}"
    docker-compose logs --tail=100 -f "$1"
}

# Function to clean up old data
cleanup_data() {
    echo -e "${YELLOW}Cleaning up old monitoring data...${NC}"
    docker-compose down
    rm -rf prometheus/data/*
    rm -rf grafana/data/*
    rm -rf loki/data/*
    echo -e "${GREEN}Cleanup complete${NC}"
}

# Function to backup data
backup_data() {
    echo -e "${YELLOW}Backing up monitoring data...${NC}"
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Stop services before backup
    docker-compose down
    
    # Backup data
    cp -r prometheus/data "$BACKUP_DIR/prometheus"
    cp -r grafana/data "$BACKUP_DIR/grafana"
    cp -r loki/data "$BACKUP_DIR/loki"
    
    # Restart services
    docker-compose up -d
    
    echo -e "${GREEN}Backup completed: $BACKUP_DIR${NC}"
}

# Function to restore data
restore_data() {
    if [ -z "$1" ]; then
        echo -e "${RED}Error: Please specify backup directory${NC}"
        exit 1
    fi
    
    if [ ! -d "$1" ]; then
        echo -e "${RED}Error: Backup directory not found${NC}"
        exit 1
    }
    
    echo -e "${YELLOW}Restoring monitoring data from: $1${NC}"
    
    # Stop services before restore
    docker-compose down
    
    # Restore data
    rm -rf prometheus/data
    rm -rf grafana/data
    rm -rf loki/data
    
    cp -r "$1/prometheus" prometheus/data
    cp -r "$1/grafana" grafana/data
    cp -r "$1/loki" loki/data
    
    # Restart services
    docker-compose up -d
    
    echo -e "${GREEN}Restore completed${NC}"
}

# Main script
case "$1" in
    start)
        check_docker
        create_directories
        start_monitoring
        ;;
    stop)
        stop_monitoring
        ;;
    restart)
        restart_monitoring
        ;;
    status)
        check_service_health
        ;;
    logs)
        if [ -z "$2" ]; then
            echo -e "${RED}Error: Please specify service name${NC}"
            exit 1
        fi
        view_logs "$2"
        ;;
    cleanup)
        cleanup_data
        ;;
    backup)
        backup_data
        ;;
    restore)
        restore_data "$2"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|cleanup|backup|restore}"
        exit 1
        ;;
esac

exit 0