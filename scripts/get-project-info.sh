#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo -e "${RED}Error: .env.local file not found${NC}"
    exit 1
fi

# Extract project reference from URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | awk -F[/.] '{print $(NF-1)}')
echo -e "${YELLOW}Project Reference: $PROJECT_REF${NC}"

# Get project configuration
echo -e "\n${YELLOW}Project Configuration:${NC}"
curl -s \
    "https://api.supabase.com/v1/projects/$PROJECT_REF" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | json_pp

# Get database configuration
echo -e "\n${YELLOW}Database Configuration:${NC}"
curl -s \
    "https://api.supabase.com/v1/projects/$PROJECT_REF/database/config" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | json_pp

# Get database schema
echo -e "\n${YELLOW}Database Schema:${NC}"
curl -s \
    "https://api.supabase.com/v1/projects/$PROJECT_REF/database/schema" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | json_pp

# Get project settings
echo -e "\n${YELLOW}Project Settings:${NC}"
curl -s \
    "https://api.supabase.com/v1/projects/$PROJECT_REF/settings" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | json_pp

# Get connection info
echo -e "\n${YELLOW}Connection Info:${NC}"
curl -s \
    "https://api.supabase.com/v1/projects/$PROJECT_REF/database/connection-string" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | json_pp

# Get database backups
echo -e "\n${YELLOW}Database Backups:${NC}"
curl -s \
    "https://api.supabase.com/v1/projects/$PROJECT_REF/database/backups" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | json_pp