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

# Create the SQL query and escape it properly
SQL_QUERY=$(cat <<'EOF' | tr '\n' ' ' | sed 's/"/\\"/g'
BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS points;

CREATE TABLE points (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE,
    amount integer NOT NULL,
    type text NOT NULL,
    description text,
    metadata jsonb,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points"
    ON points
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points"
    ON points
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

GRANT ALL ON points TO authenticated;
GRANT ALL ON points TO anon;

COMMIT;
EOF
)

# Create JSON payload
JSON_PAYLOAD="{\"query\": \"$SQL_QUERY\"}"

# Execute the SQL query
echo -e "${YELLOW}Creating points table...${NC}"
echo -e "Sending query: $JSON_PAYLOAD"

response=$(curl -s -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    --data-raw "$JSON_PAYLOAD")

echo "Response: $response"

# Try a simple query to verify permissions
echo -e "\n${YELLOW}Testing permissions...${NC}"
TEST_QUERY="SELECT current_database(), current_user;"
TEST_PAYLOAD="{\"query\": \"$TEST_QUERY\"}"

response=$(curl -s -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    --data-raw "$TEST_PAYLOAD")

echo "Test Response: $response"

# Verify table exists
echo -e "\n${YELLOW}Verifying table...${NC}"
curl -s \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/points?select=*&limit=0" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -i

echo -e "\n${GREEN}Done${NC}"
