#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the absolute path of the project directory
PROJECT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

# Create report directory
REPORT_DIR="$PROJECT_DIR/logs/system/health-reports"
mkdir -p "$REPORT_DIR"

# Report file
REPORT_FILE="$REPORT_DIR/health-report-$(date +%Y%m%d_%H%M%S).txt"

# Function to write to report
write_report() {
    echo "$1" | tee -a "$REPORT_FILE"
}

# Function to check service health
check_service() {
    local service=$1
    local url=$2
    local expected_status=${3:-200}
    
    write_report "\nChecking $service..."
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" -eq "$expected_status" ]; then
        write_report "${GREEN}✓ $service is healthy (Status: $response)${NC}"
        return 0
    else
        write_report "${RED}✗ $service is unhealthy (Status: $response)${NC}"
        return 1
    fi
}

# Function to check system resources
check_system_resources() {
    write_report "\nSystem Resources:"
    
    # CPU Usage
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}')
    write_report "CPU Usage: $cpu_usage%"
    
    # Memory Usage
    local memory_info=$(free -m | grep Mem)
    local total_mem=$(echo "$memory_info" | awk '{print $2}')
    local used_mem=$(echo "$memory_info" | awk '{print $3}')
    local mem_usage=$((used_mem * 100 / total_mem))
    write_report "Memory Usage: $mem_usage% ($used_mem MB / $total_mem MB)"
    
    # Disk Usage
    local disk_usage=$(df -h / | tail -1 | awk '{print $5}')
    write_report "Disk Usage: $disk_usage"
}

# Function to check Docker containers
check_docker_containers() {
    write_report "\nDocker Containers:"
    
    local containers=$(docker ps --format "{{.Names}}\t{{.Status}}\t{{.Ports}}")
    if [ -n "$containers" ]; then
        write_report "$containers"
    else
        write_report "${RED}No running containers found${NC}"
    fi
}

# Function to check logs for errors
check_logs() {
    write_report "\nRecent Errors (last hour):"
    
    local error_count=0
    for log_dir in "$PROJECT_DIR"/logs/*; do
        if [ -d "$log_dir" ]; then
            local dir_name=$(basename "$log_dir")
            local errors=$(find "$log_dir" -type f -name "*.log" -mmin -60 -exec grep -i "error" {} \;)
            if [ -n "$errors" ]; then
                error_count=$((error_count + 1))
                write_report "\n$dir_name Errors:"
                write_report "$errors"
            fi
        fi
    done
    
    if [ "$error_count" -eq 0 ]; then
        write_report "${GREEN}No errors found in the last hour${NC}"
    fi
}

# Function to check database
check_database() {
    write_report "\nDatabase Health:"
    
    if [ -n "$DATABASE_URL" ]; then
        local db_status=$(curl -s "http://localhost:3000/api/health" | grep -o '"database":"[^"]*"' | cut -d'"' -f4)
        if [ "$db_status" = "connected" ]; then
            write_report "${GREEN}✓ Database is connected${NC}"
        else
            write_report "${RED}✗ Database connection issue${NC}"
        fi
    else
        write_report "${YELLOW}⚠ DATABASE_URL not set${NC}"
    fi
}

# Function to check monitoring stack
check_monitoring() {
    write_report "\nMonitoring Stack Health:"
    
    # Check Grafana
    check_service "Grafana" "http://localhost:3001/api/health"
    
    # Check Prometheus
    check_service "Prometheus" "http://localhost:9090/-/healthy"
    
    # Check Loki
    check_service "Loki" "http://localhost:3100/ready"
}

# Function to check cron jobs
check_cron_jobs() {
    write_report "\nCron Jobs Status:"
    
    local cron_jobs=$(crontab -l 2>/dev/null | grep "Mom's Kidz")
    if [ -n "$cron_jobs" ]; then
        write_report "${GREEN}✓ Cron jobs are configured${NC}"
        write_report "$cron_jobs"
    else
        write_report "${YELLOW}⚠ No Mom's Kidz cron jobs found${NC}"
    fi
}

# Main health check
main() {
    write_report "Mom's Kidz Health Check Report"
    write_report "Generated on: $(date)"
    write_report "----------------------------------------"
    
    # Check main application
    check_service "Main Application" "http://localhost:3000/api/health"
    
    # Check system resources
    check_system_resources
    
    # Check Docker containers
    check_docker_containers
    
    # Check database
    check_database
    
    # Check monitoring stack
    check_monitoring
    
    # Check cron jobs
    check_cron_jobs
    
    # Check logs
    check_logs
    
    write_report "\n----------------------------------------"
    write_report "Health check completed at: $(date)"
    
    # Create symlink to latest report
    ln -sf "$REPORT_FILE" "$REPORT_DIR/latest.txt"
    
    echo -e "\n${GREEN}Health check completed. Report saved to: $REPORT_FILE${NC}"
}

# Run main function
main

exit 0