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

# Function to execute SQL
execute_sql() {
    local query="$1"
    local description="$2"
    
    echo -e "\n${YELLOW}$description${NC}"
    
    # Escape the query properly for JSON
    local escaped_query=$(echo "$query" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | tr '\n' ' ')
    
    response=$(curl -s -X POST \
        "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
        -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        -H "Content-Type: application/json" \
        -H "Prefer: return=representation" \
        -d "{\"query\": \"$escaped_query\"}")
    
    echo "Response: $response"
}

# Function to use REST API
rest_api() {
    local method="$1"
    local path="$2"
    local data="$3"
    local description="$4"
    
    echo -e "\n${YELLOW}$description${NC}"
    
    if [ -n "$data" ]; then
        response=$(curl -s -X "$method" \
            "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/$path" \
            -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
            -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
            -H "Content-Type: application/json" \
            -H "Prefer: return=representation" \
            -d "$data")
    else
        response=$(curl -s -X "$method" \
            "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/$path" \
            -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
            -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
            -H "Prefer: return=representation")
    fi
    
    echo "Response: $response"
}

# Check if table exists
echo -e "${YELLOW}Checking if points table exists...${NC}"
rest_api "GET" "points?select=*&limit=0" "" "Getting table definition"

# Try to insert a test row
echo -e "\n${YELLOW}Trying to insert test data...${NC}"
rest_api "POST" "points" '{
    "user_id": "00000000-0000-0000-0000-000000000000",
    "amount": 100,
    "type": "test",
    "description": "Test points"
}' "Inserting test row"

# Try to select data
echo -e "\n${YELLOW}Trying to select data...${NC}"
rest_api "GET" "points?select=*" "" "Getting all points"

# Get table structure using SQL
execute_sql "
SELECT 
    table_schema,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
    AND table_name = 'points'
ORDER BY 
    ordinal_position;" "Getting detailed table structure"

# Get RLS policies
execute_sql "
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM 
    pg_policies 
WHERE 
    schemaname = 'public' 
    AND tablename = 'points';" "Getting RLS policies"

echo -e "\n${GREEN}Test complete${NC}"