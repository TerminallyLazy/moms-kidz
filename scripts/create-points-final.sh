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

# Create the SQL query (all in one line, properly escaped)
SQL_QUERY="CREATE TABLE IF NOT EXISTS public.points (id uuid DEFAULT uuid_generate_v4() PRIMARY KEY, user_id uuid REFERENCES auth.users ON DELETE CASCADE, amount integer NOT NULL, type text NOT NULL, description text, metadata jsonb, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL); ALTER TABLE public.points ENABLE ROW LEVEL SECURITY; CREATE POLICY \"Users can view their own points\" ON public.points FOR SELECT USING (auth.uid() = user_id); CREATE POLICY \"Users can insert their own points\" ON public.points FOR INSERT WITH CHECK (auth.uid() = user_id); GRANT ALL ON public.points TO authenticated; GRANT ALL ON public.points TO anon;"

# Create JSON payload
JSON_PAYLOAD=$(jq -n --arg query "$SQL_QUERY" '{"query": $query}')

# Execute the SQL query
echo -e "${YELLOW}Creating points table...${NC}"
echo -e "Sending query..."

response=$(curl -s -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "$JSON_PAYLOAD")

echo "Response: $response"

# Verify table exists using REST API
echo -e "\n${YELLOW}Verifying table...${NC}"
curl -s \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/points?select=*&limit=0" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -i

# Try to insert a test row
echo -e "\n${YELLOW}Trying to insert test data...${NC}"
curl -s -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/points" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d '{
        "user_id": "00000000-0000-0000-0000-000000000000",
        "amount": 100,
        "type": "test",
        "description": "Test points"
    }'

echo -e "\n${GREEN}Done${NC}"