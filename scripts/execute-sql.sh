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

if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide a SQL file path${NC}"
    exit 1
fi

SQL_FILE="$1"

if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}Error: SQL file not found: $SQL_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}Executing SQL file: $SQL_FILE${NC}"

# Read the SQL file content
SQL_CONTENT=$(cat "$SQL_FILE")

# Execute the SQL
response=$(curl -s -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$SQL_CONTENT\"}")

if [[ $response == *"error"* ]]; then
    echo -e "${RED}Error executing SQL:${NC}"
    echo "$response" | json_pp
    exit 1
else
    echo -e "${GREEN}SQL executed successfully${NC}"
fi