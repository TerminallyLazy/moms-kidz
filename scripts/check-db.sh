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

echo -e "${YELLOW}Checking database tables...${NC}"

# Array of tables to check
tables=("profiles" "activities" "achievements" "points")

for table in "${tables[@]}"; do
    echo -e "\n${YELLOW}Checking table: $table${NC}"
    
    # Try to get table definition
    response=$(curl -s \
        "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/$table?select=*&limit=0" \
        -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}")
    
    if [[ $response == *"\"code\""* ]]; then
        echo -e "${RED}Error: Table might not exist or not accessible${NC}"
        echo "$response" | json_pp
    else
        echo -e "${GREEN}Table exists and is accessible${NC}"
        
        # Get table columns
        echo -e "\n${YELLOW}Table columns:${NC}"
        curl -s \
            "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/$table?select=*&limit=0" \
            -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
            -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
            -H "Prefer: return=headers-only" \
            -I | grep -i 'content-range\|accept-range'
    fi
done

echo -e "\n${YELLOW}Checking database functions...${NC}"
curl -s \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/handle_updated_at" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d "{}" | json_pp
