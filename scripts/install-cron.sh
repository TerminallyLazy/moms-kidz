#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the absolute path of the project directory
PROJECT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

# Function to check if cron is installed and running
check_cron() {
    if ! command -v cron >/dev/null 2>&1; then
        echo -e "${RED}Error: cron is not installed${NC}"
        echo "Please install cron using your package manager"
        exit 1
    fi

    if ! pgrep cron >/dev/null 2>&1; then
        echo -e "${RED}Error: cron service is not running${NC}"
        echo "Please start the cron service"
        exit 1
    }
}

# Function to backup existing crontab
backup_crontab() {
    echo -e "${YELLOW}Backing up existing crontab...${NC}"
    crontab -l > "$PROJECT_DIR/backups/crontab_$(date +%Y%m%d_%H%M%S).bak" 2>/dev/null || true
}

# Function to prepare crontab file
prepare_crontab() {
    echo -e "${YELLOW}Preparing crontab file...${NC}"
    
    # Create temporary crontab file
    TEMP_CRONTAB=$(mktemp)
    
    # Add header
    echo "# Mom's Kidz Automated Tasks - Installed on $(date)" > "$TEMP_CRONTAB"
    echo "# Project directory: $PROJECT_DIR" >> "$TEMP_CRONTAB"
    echo "" >> "$TEMP_CRONTAB"
    
    # Read example crontab and replace paths
    sed "s|/home/lazy/Projects/moms-kidz-v3|$PROJECT_DIR|g" "$PROJECT_DIR/scripts/crontab.example" >> "$TEMP_CRONTAB"
    
    echo -e "${GREEN}Crontab file prepared${NC}"
    return 0
}

# Function to install crontab
install_crontab() {
    echo -e "${YELLOW}Installing crontab...${NC}"
    
    if crontab "$TEMP_CRONTAB"; then
        echo -e "${GREEN}Crontab installed successfully${NC}"
        rm "$TEMP_CRONTAB"
        return 0
    else
        echo -e "${RED}Failed to install crontab${NC}"
        rm "$TEMP_CRONTAB"
        return 1
    }
}

# Function to verify installation
verify_installation() {
    echo -e "${YELLOW}Verifying crontab installation...${NC}"
    
    INSTALLED_CRONTAB=$(crontab -l)
    if echo "$INSTALLED_CRONTAB" | grep -q "Mom's Kidz"; then
        echo -e "${GREEN}Crontab verification successful${NC}"
        return 0
    else
        echo -e "${RED}Crontab verification failed${NC}"
        return 1
    }
}

# Function to create log directories
create_log_dirs() {
    echo -e "${YELLOW}Creating log directories...${NC}"
    
    # Make log management script executable
    chmod +x "$PROJECT_DIR/scripts/manage-logs.sh"
    
    # Create log directories
    "$PROJECT_DIR/scripts/manage-logs.sh" create
}

# Main installation process
echo -e "${YELLOW}Starting crontab installation...${NC}"

# Create backups directory if it doesn't exist
mkdir -p "$PROJECT_DIR/backups"

# Check prerequisites
check_cron

# Backup existing crontab
backup_crontab

# Prepare new crontab
if ! prepare_crontab; then
    echo -e "${RED}Failed to prepare crontab${NC}"
    exit 1
fi

# Create log directories
create_log_dirs

# Install crontab
if ! install_crontab; then
    echo -e "${RED}Failed to install crontab${NC}"
    exit 1
fi

# Verify installation
if ! verify_installation; then
    echo -e "${RED}Installation verification failed${NC}"
    echo -e "${YELLOW}Rolling back to previous crontab...${NC}"
    LATEST_BACKUP=$(ls -t "$PROJECT_DIR"/backups/crontab_*.bak | head -1)
    if [ -f "$LATEST_BACKUP" ]; then
        crontab "$LATEST_BACKUP"
        echo -e "${GREEN}Rollback successful${NC}"
    else
        echo -e "${RED}No backup found for rollback${NC}"
    fi
    exit 1
fi

echo -e "\n${GREEN}Crontab installation completed successfully!${NC}"
echo -e "\nTo view installed cron jobs, run: ${YELLOW}crontab -l${NC}"
echo -e "To edit cron jobs, run: ${YELLOW}crontab -e${NC}"
echo -e "Logs will be written to: ${YELLOW}$PROJECT_DIR/logs/system/${NC}"

exit 0