#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Log directories
LOG_DIRS=(
    "mom-kidz"
    "care-log"
    "community"
    "api"
    "error"
    "system"
    "db"
    "ai-chat"
)

# Log retention period (in days)
RETENTION_DAYS=30

# Maximum log file size (in MB)
MAX_LOG_SIZE=100

# Function to create log directories
create_log_dirs() {
    echo -e "${YELLOW}Creating log directories...${NC}"
    
    for dir in "${LOG_DIRS[@]}"; do
        mkdir -p "logs/$dir"
        chmod 777 "logs/$dir"
    done
    
    echo -e "${GREEN}Log directories created${NC}"
}

# Function to rotate logs
rotate_logs() {
    echo -e "${YELLOW}Rotating logs...${NC}"
    
    for dir in "${LOG_DIRS[@]}"; do
        # Find and compress logs older than 1 day
        find "logs/$dir" -type f -name "*.log" -mtime +1 ! -name "*.gz" -exec gzip {} \;
        
        # Delete logs older than retention period
        find "logs/$dir" -type f -name "*.gz" -mtime +$RETENTION_DAYS -delete
        
        # Check for oversized logs and rotate if necessary
        for log in "logs/$dir"/*.log; do
            if [ -f "$log" ]; then
                size=$(du -m "$log" | cut -f1)
                if [ "$size" -gt "$MAX_LOG_SIZE" ]; then
                    timestamp=$(date +%Y%m%d_%H%M%S)
                    mv "$log" "${log%.log}_${timestamp}.log"
                    gzip "${log%.log}_${timestamp}.log"
                    touch "$log"
                    chmod 666 "$log"
                fi
            fi
        done
    done
    
    echo -e "${GREEN}Log rotation completed${NC}"
}

# Function to clean old logs
clean_logs() {
    echo -e "${YELLOW}Cleaning old logs...${NC}"
    
    for dir in "${LOG_DIRS[@]}"; do
        # Delete logs older than retention period
        find "logs/$dir" -type f -mtime +$RETENTION_DAYS -delete
    done
    
    echo -e "${GREEN}Old logs cleaned${NC}"
}

# Function to analyze logs
analyze_logs() {
    echo -e "${YELLOW}Analyzing logs...${NC}"
    
    for dir in "${LOG_DIRS[@]}"; do
        echo -e "\n${YELLOW}Analyzing $dir logs:${NC}"
        
        # Count total log files
        total_files=$(find "logs/$dir" -type f | wc -l)
        echo "Total log files: $total_files"
        
        # Calculate total size
        total_size=$(du -sh "logs/$dir" | cut -f1)
        echo "Total size: $total_size"
        
        # Count error occurrences
        if [ -f "logs/$dir/error.log" ]; then
            error_count=$(grep -i "error" "logs/$dir/error.log" | wc -l)
            echo "Error count: $error_count"
        fi
    done
}

# Function to view logs
view_logs() {
    if [ -z "$1" ] || [ -z "$2" ]; then
        echo -e "${RED}Usage: $0 view <directory> [lines] [filter]${NC}"
        exit 1
    fi
    
    dir=$1
    lines=${2:-100}
    filter=$3
    
    if [ ! -d "logs/$dir" ]; then
        echo -e "${RED}Log directory not found: $dir${NC}"
        exit 1
    }
    
    if [ -n "$filter" ]; then
        tail -n "$lines" "logs/$dir"/*.log | grep --color=auto -i "$filter"
    else
        tail -n "$lines" "logs/$dir"/*.log
    fi
}

# Function to monitor logs in real-time
monitor_logs() {
    if [ -z "$1" ]; then
        echo -e "${RED}Usage: $0 monitor <directory> [filter]${NC}"
        exit 1
    fi
    
    dir=$1
    filter=$2
    
    if [ ! -d "logs/$dir" ]; then
        echo -e "${RED}Log directory not found: $dir${NC}"
        exit 1
    }
    
    if [ -n "$filter" ]; then
        tail -f "logs/$dir"/*.log | grep --color=auto -i "$filter"
    else
        tail -f "logs/$dir"/*.log
    fi
}

# Function to archive logs
archive_logs() {
    echo -e "${YELLOW}Archiving logs...${NC}"
    
    timestamp=$(date +%Y%m%d_%H%M%S)
    archive_dir="logs/archive_${timestamp}"
    
    mkdir -p "$archive_dir"
    
    for dir in "${LOG_DIRS[@]}"; do
        if [ -d "logs/$dir" ]; then
            # Create directory in archive
            mkdir -p "$archive_dir/$dir"
            
            # Find and compress logs older than 7 days
            find "logs/$dir" -type f -mtime +7 -exec cp {} "$archive_dir/$dir/" \;
        fi
    done
    
    # Create archive
    tar -czf "${archive_dir}.tar.gz" "$archive_dir"
    rm -rf "$archive_dir"
    
    echo -e "${GREEN}Logs archived to ${archive_dir}.tar.gz${NC}"
}

# Main script
case "$1" in
    create)
        create_log_dirs
        ;;
    rotate)
        rotate_logs
        ;;
    clean)
        clean_logs
        ;;
    analyze)
        analyze_logs
        ;;
    view)
        view_logs "$2" "$3" "$4"
        ;;
    monitor)
        monitor_logs "$2" "$3"
        ;;
    archive)
        archive_logs
        ;;
    *)
        echo "Usage: $0 {create|rotate|clean|analyze|view|monitor|archive}"
        echo "  create   - Create log directories"
        echo "  rotate   - Rotate and compress logs"
        echo "  clean    - Clean old logs"
        echo "  analyze  - Analyze logs"
        echo "  view     - View logs (usage: $0 view <directory> [lines] [filter])"
        echo "  monitor  - Monitor logs in real-time (usage: $0 monitor <directory> [filter])"
        echo "  archive  - Archive logs"
        exit 1
        ;;
esac

exit 0