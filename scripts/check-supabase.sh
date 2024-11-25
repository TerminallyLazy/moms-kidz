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

echo -e "${YELLOW}Checking Supabase Configuration${NC}"
echo -e "URL: $NEXT_PUBLIC_SUPABASE_URL"
echo -e "Anon Key Length: ${#NEXT_PUBLIC_SUPABASE_ANON_KEY}"
echo -e "Service Role Key Length: ${#SUPABASE_SERVICE_ROLE_KEY}"

echo -e "\n${YELLOW}Testing Anon Key Access${NC}"
curl -s \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/points?select=*&limit=0" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -v 2>&1 | grep "< HTTP"

echo -e "\n${YELLOW}Testing Service Role Key Access${NC}"
curl -s \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/points?select=*&limit=0" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -v 2>&1 | grep "< HTTP"

echo -e "\n${YELLOW}Testing Simple Query with Service Role${NC}"
curl -s -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"SELECT current_user, current_database();\"}" | json_pp

echo -e "\n${YELLOW}Project Reference:${NC}"
echo "$NEXT_PUBLIC_SUPABASE_URL" | awk -F[/.] '{print $(NF-1)}'