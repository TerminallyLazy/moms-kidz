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

echo -e "${YELLOW}Checking environment variables...${NC}"
echo -e "NEXT_PUBLIC_SUPABASE_URL: ${#NEXT_PUBLIC_SUPABASE_URL} chars"
echo -e "NEXT_PUBLIC_SUPABASE_ANON_KEY: ${#NEXT_PUBLIC_SUPABASE_ANON_KEY} chars"
echo -e "SUPABASE_SERVICE_ROLE_KEY: ${#SUPABASE_SERVICE_ROLE_KEY} chars"

echo -e "\n${YELLOW}Testing anon key...${NC}"
curl -s \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/points?select=*&limit=0" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -i | head -n 1

echo -e "\n${YELLOW}Testing service role key...${NC}"
curl -s \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/points?select=*&limit=0" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -i | head -n 1

echo -e "\n${YELLOW}Testing simple SQL query with anon key...${NC}"
curl -s -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"query": "SELECT current_database(), current_user;"}' | json_pp

echo -e "\n${YELLOW}Testing simple SQL query with service role key...${NC}"
curl -s -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"query": "SELECT current_database(), current_user;"}' | json_pp

echo -e "\n${YELLOW}Checking project reference...${NC}"
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -E 's/https:\/\/([^.]+).*/\1/')
echo "Project Reference: $PROJECT_REF"

echo -e "\n${YELLOW}Current .env.local file:${NC}"
cat .env.local | grep -v SECRET | grep -v KEY