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

echo -e "${YELLOW}Checking Supabase project configuration...${NC}"

# Extract project reference from URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | awk -F[/.] '{print $(NF-1)}')
echo -e "Project Reference: $PROJECT_REF"

# Try to get project configuration
echo -e "\n${YELLOW}Project Tables:${NC}"
curl -s \
    "https://api.supabase.com/v1/projects/$PROJECT_REF/database/tables" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" | json_pp

# Try to get database schema
echo -e "\n${YELLOW}Database Schema:${NC}"
curl -s \
    "https://api.supabase.com/v1/projects/$PROJECT_REF/database/schema" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" | json_pp

# Try to get project settings
echo -e "\n${YELLOW}Project Settings:${NC}"
curl -s \
    "https://api.supabase.com/v1/projects/$PROJECT_REF" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" | json_pp