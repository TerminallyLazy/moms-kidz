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

# Create required directories
create_directories() {
    echo -e "${YELLOW}Creating monitoring directories...${NC}"
    mkdir -p monitoring/{grafana,prometheus,loki}/data
    chmod -R 777 monitoring/*/data
}

# Initialize Grafana datasources
init_grafana() {
    echo -e "${YELLOW}Initializing Grafana...${NC}"
    
    # Create Grafana admin user
    GRAFANA_USER=${GRAFANA_ADMIN_USER:-admin}
    GRAFANA_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-admin}
    
    # Set environment variables
    export GF_SECURITY_ADMIN_USER=$GRAFANA_USER
    export GF_SECURITY_ADMIN_PASSWORD=$GRAFANA_PASSWORD
    
    echo -e "${GREEN}Grafana initialized with default credentials:${NC}"
    echo -e "Username: ${GRAFANA_USER}"
    echo -e "Password: ${GRAFANA_PASSWORD}"
}

# Initialize Prometheus
init_prometheus() {
    echo -e "${YELLOW}Initializing Prometheus...${NC}"
    
    # Ensure Prometheus data directory exists and has correct permissions
    mkdir -p monitoring/prometheus/data
    chmod 777 monitoring/prometheus/data
}

# Initialize Loki
init_loki() {
    echo -e "${YELLOW}Initializing Loki...${NC}"
    
    # Ensure Loki data directory exists and has correct permissions
    mkdir -p monitoring/loki/data
    chmod 777 monitoring/loki/data
}

# Create example dashboard
create_example_dashboard() {
    echo -e "${YELLOW}Creating example dashboard...${NC}"
    
    # Copy example dashboard to provisioning directory
    mkdir -p monitoring/grafana/dashboards
    cp monitoring/grafana/dashboards/mom-kidz-dashboard.json monitoring/grafana/provisioning/dashboards/
    cp monitoring/grafana/dashboards/care-log-analytics.json monitoring/grafana/provisioning/dashboards/
}

# Initialize monitoring stack
init_monitoring() {
    echo -e "${YELLOW}Initializing monitoring stack...${NC}"
    
    # Check Docker
    check_docker
    
    # Create directories
    create_directories
    
    # Initialize components
    init_grafana
    init_prometheus
    init_loki
    
    # Create example dashboard
    create_example_dashboard
    
    # Start monitoring stack
    echo -e "${YELLOW}Starting monitoring stack...${NC}"
    cd monitoring && docker-compose up -d
    
    # Wait for services to be ready
    echo -e "${YELLOW}Waiting for services to be ready...${NC}"
    sleep 10
    
    # Check service health
    check_service_health
}

# Check service health
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

# Print success message
print_success() {
    echo -e "\n${GREEN}Monitoring stack initialized successfully!${NC}"
    echo -e "\nAccess the monitoring stack at:"
    echo -e "Grafana: ${YELLOW}http://localhost:3001${NC}"
    echo -e "Prometheus: ${YELLOW}http://localhost:9090${NC}"
    echo -e "Loki: ${YELLOW}http://localhost:3100${NC}"
    echo -e "\nGrafana credentials:"
    echo -e "Username: ${YELLOW}${GRAFANA_USER}${NC}"
    echo -e "Password: ${YELLOW}${GRAFANA_PASSWORD}${NC}"
}

# Main script
echo -e "${YELLOW}Starting monitoring stack initialization...${NC}"

# Initialize monitoring stack
init_monitoring

# Print success message
print_success

exit 0