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

# Function to check table existence using REST API
check_table() {
    local table="$1"
    echo -e "\n${YELLOW}Checking table: $table${NC}"
    
    # Try to get table definition
    response=$(curl -s \
        "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/$table?select=*&limit=0" \
        -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        -H "Content-Type: application/json" \
        -i)
    
    # Check HTTP status code
    status_code=$(echo "$response" | grep -i "^HTTP" | awk '{print $2}')
    
    if [[ "$status_code" == "200" ]]; then
        echo -e "${GREEN}Table $table exists (Status: $status_code)${NC}"
        
        # Get table structure
        echo -e "\n${YELLOW}Getting table structure...${NC}"
        curl -s -X POST \
            "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
            -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
            -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
            -H "Content-Type: application/json" \
            -d "{\"query\": \"SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '$table' ORDER BY ordinal_position;\"}" | json_pp
        
        return 0
    else
        echo -e "${RED}Table $table does not exist or is not accessible (Status: $status_code)${NC}"
        return 1
    fi
}

# Function to check RLS policies
check_policies() {
    local table="$1"
    echo -e "\n${YELLOW}Checking RLS policies for table: $table${NC}"
    
    curl -s -X POST \
        "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
        -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"SELECT polname, polcmd, polpermissive FROM pg_policy WHERE polrelid = 'public.$table'::regclass;\"}" | json_pp
}

# Tables to check
tables=("activities" "points" "challenges" "achievements" "streaks" "user_challenges")

# Check each table
for table in "${tables[@]}"; do
    if check_table "$table"; then
        check_policies "$table"
    fi
done

echo -e "\n${YELLOW}Checking database version and connection info...${NC}"
curl -s -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"SELECT version(), current_database(), current_user;\"}" | json_pp