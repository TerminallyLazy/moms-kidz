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

# Function to backup current configuration
backup_config() {
    echo -e "${YELLOW}Backing up current configuration...${NC}"
    
    BACKUP_DIR="backups/config_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup Grafana dashboards and datasources
    cp -r monitoring/grafana/provisioning "$BACKUP_DIR/grafana_provisioning"
    cp -r monitoring/grafana/dashboards "$BACKUP_DIR/grafana_dashboards"
    
    # Backup Prometheus config
    cp monitoring/prometheus/prometheus.yml "$BACKUP_DIR/prometheus.yml"
    cp -r monitoring/prometheus/rules "$BACKUP_DIR/prometheus_rules"
    
    # Backup Loki config
    cp monitoring/loki/config.yml "$BACKUP_DIR/loki.yml"
    
    echo -e "${GREEN}Configuration backed up to: $BACKUP_DIR${NC}"
}

# Function to update Docker images
update_images() {
    echo -e "${YELLOW}Updating Docker images...${NC}"
    
    cd monitoring
    docker-compose pull
    cd ..
    
    echo -e "${GREEN}Docker images updated${NC}"
}

# Function to update dashboards
update_dashboards() {
    echo -e "${YELLOW}Updating Grafana dashboards...${NC}"
    
    # Ensure dashboard directory exists
    mkdir -p monitoring/grafana/provisioning/dashboards
    
    # Copy updated dashboards
    cp monitoring/grafana/dashboards/*.json monitoring/grafana/provisioning/dashboards/
    
    echo -e "${GREEN}Dashboards updated${NC}"
}

# Function to update Prometheus rules
update_rules() {
    echo -e "${YELLOW}Updating Prometheus rules...${NC}"
    
    # Ensure rules directory exists
    mkdir -p monitoring/prometheus/rules
    
    # Copy updated rules
    cp monitoring/prometheus/rules/*.yml monitoring/prometheus/rules/
    
    echo -e "${GREEN}Prometheus rules updated${NC}"
}

# Function to restart services
restart_services() {
    echo -e "${YELLOW}Restarting monitoring services...${NC}"
    
    cd monitoring
    docker-compose down
    docker-compose up -d
    cd ..
    
    echo -e "${GREEN}Services restarted${NC}"
}

# Function to verify update
verify_update() {
    echo -e "${YELLOW}Verifying update...${NC}"
    
    # Wait for services to be ready
    sleep 10
    
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

# Function to rollback if update fails
rollback() {
    echo -e "${RED}Update failed. Rolling back...${NC}"
    
    # Stop services
    cd monitoring
    docker-compose down
    cd ..
    
    # Restore from backup
    LATEST_BACKUP=$(ls -td backups/config_* | head -1)
    
    if [ -d "$LATEST_BACKUP" ]; then
        # Restore configurations
        cp -r "$LATEST_BACKUP/grafana_provisioning" monitoring/grafana/provisioning
        cp -r "$LATEST_BACKUP/grafana_dashboards" monitoring/grafana/dashboards
        cp "$LATEST_BACKUP/prometheus.yml" monitoring/prometheus/prometheus.yml
        cp -r "$LATEST_BACKUP/prometheus_rules" monitoring/prometheus/rules
        cp "$LATEST_BACKUP/loki.yml" monitoring/loki/config.yml
        
        # Restart services
        cd monitoring
        docker-compose up -d
        cd ..
        
        echo -e "${GREEN}Rollback completed${NC}"
    else
        echo -e "${RED}No backup found for rollback${NC}"
        exit 1
    fi
}

# Main update process
echo -e "${YELLOW}Starting monitoring stack update...${NC}"

# Check Docker
check_docker

# Backup current configuration
backup_config

# Update components
update_images
update_dashboards
update_rules

# Restart services
restart_services

# Verify update
verify_update

# Check if verification succeeded
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}Monitoring stack updated successfully!${NC}"
    echo -e "\nAccess the monitoring stack at:"
    echo -e "Grafana: ${YELLOW}http://localhost:3001${NC}"
    echo -e "Prometheus: ${YELLOW}http://localhost:9090${NC}"
    echo -e "Loki: ${YELLOW}http://localhost:3100${NC}"
else
    echo -e "\n${RED}Update verification failed. Starting rollback...${NC}"
    rollback
fi

exit 0