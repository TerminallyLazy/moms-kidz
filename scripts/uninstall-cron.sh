#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the absolute path of the project directory
PROJECT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

# Function to backup existing crontab
backup_crontab() {
    echo -e "${YELLOW}Backing up existing crontab...${NC}"
    mkdir -p "$PROJECT_DIR/backups"
    crontab -l > "$PROJECT_DIR/backups/crontab_$(date +%Y%m%d_%H%M%S).bak" 2>/dev/null || true
}

# Function to remove project-specific cron jobs
remove_cron_jobs() {
    echo -e "${YELLOW}Removing Mom's Kidz cron jobs...${NC}"
    
    # Create temporary file
    TEMP_CRONTAB=$(mktemp)
    
    # Get current crontab
    crontab -l > "$TEMP_CRONTAB" 2>/dev/null || true
    
    # Remove our cron jobs (lines containing our project path or Mom's Kidz)
    sed -i "/Mom's Kidz/d" "$TEMP_CRONTAB"
    sed -i "\|$PROJECT_DIR|d" "$TEMP_CRONTAB"
    
    # Install modified crontab
    if crontab "$TEMP_CRONTAB"; then
        echo -e "${GREEN}Cron jobs removed successfully${NC}"
        rm "$TEMP_CRONTAB"
        return 0
    else
        echo -e "${RED}Failed to update crontab${NC}"
        rm "$TEMP_CRONTAB"
        return 1
    fi
}

# Function to verify removal
verify_removal() {
    echo -e "${YELLOW}Verifying cron jobs removal...${NC}"
    
    CURRENT_CRONTAB=$(crontab -l 2>/dev/null || true)
    
    if echo "$CURRENT_CRONTAB" | grep -q "Mom's Kidz" || echo "$CURRENT_CRONTAB" | grep -q "$PROJECT_DIR"; then
        echo -e "${RED}Verification failed: Some cron jobs still exist${NC}"
        return 1
    else
        echo -e "${GREEN}Verification successful: All project cron jobs removed${NC}"
        return 0
    fi
}

# Function to handle rollback
rollback() {
    echo -e "${YELLOW}Rolling back changes...${NC}"
    
    LATEST_BACKUP=$(ls -t "$PROJECT_DIR"/backups/crontab_*.bak 2>/dev/null | head -1)
    
    if [ -f "$LATEST_BACKUP" ]; then
        if crontab "$LATEST_BACKUP"; then
            echo -e "${GREEN}Rollback successful${NC}"
            return 0
        else
            echo -e "${RED}Rollback failed${NC}"
            return 1
        fi
    else
        echo -e "${RED}No backup found for rollback${NC}"
        return 1
    fi
}

# Main uninstallation process
echo -e "${YELLOW}Starting cron jobs uninstallation...${NC}"

# Backup current crontab
backup_crontab

# Remove cron jobs
if ! remove_cron_jobs; then
    echo -e "${RED}Failed to remove cron jobs${NC}"
    echo -e "${YELLOW}Attempting rollback...${NC}"
    rollback
    exit 1
fi

# Verify removal
if ! verify_removal; then
    echo -e "${RED}Failed to verify cron jobs removal${NC}"
    echo -e "${YELLOW}Attempting rollback...${NC}"
    rollback
    exit 1
fi

echo -e "\n${GREEN}Cron jobs uninstallation completed successfully!${NC}"
echo -e "\nTo verify, you can check your current crontab with: ${YELLOW}crontab -l${NC}"
echo -e "A backup of your previous crontab was saved to: ${YELLOW}$PROJECT_DIR/backups/${NC}"

# Optionally clean up log directories
read -p "Would you like to clean up log directories? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Cleaning up log directories...${NC}"
    
    # Archive existing logs
    ARCHIVE_DIR="$PROJECT_DIR/backups/logs_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$ARCHIVE_DIR"
    
    if [ -d "$PROJECT_DIR/logs" ]; then
        mv "$PROJECT_DIR/logs"/* "$ARCHIVE_DIR/" 2>/dev/null || true
        rm -rf "$PROJECT_DIR/logs"
        echo -e "${GREEN}Logs archived to: $ARCHIVE_DIR${NC}"
    else
        echo -e "${YELLOW}No logs directory found${NC}"
    fi
fi

exit 0