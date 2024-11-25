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

echo -e "${YELLOW}Testing Supabase Service Role Key${NC}"
echo -e "Project URL: $NEXT_PUBLIC_SUPABASE_URL"
echo -e "Service Role Key Length: ${#SUPABASE_SERVICE_ROLE_KEY}"

# Test a simple query
echo -e "\n${YELLOW}Testing simple query...${NC}"
response=$(curl -s -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"SELECT current_database(), current_user;\"}")

echo "Response:"
echo "$response" | json_pp

# Test table access
echo -e "\n${YELLOW}Testing table access...${NC}"
response=$(curl -s \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/points?select=*&limit=0" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")

echo "Response:"
echo "$response" | json_pp

# Test schema access
echo -e "\n${YELLOW}Testing schema access...${NC}"
response=$(curl -s -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';\"}")

echo "Response:"
echo "$response" | json_pp