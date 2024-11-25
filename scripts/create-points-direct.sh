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

echo -e "${YELLOW}Creating points table...${NC}"

# Create table query (escaped for JSON)
TABLE_QUERY=$(cat <<EOF | tr '\n' ' ' | sed 's/"/\\"/g'
CREATE TABLE IF NOT EXISTS public.points (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    amount integer NOT NULL,
    type text NOT NULL,
    description text,
    metadata jsonb,
    created_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT points_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
EOF
)

# Execute create table query
response=$(curl -s -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$TABLE_QUERY\"}")

echo "$response"

echo -e "\n${YELLOW}Enabling RLS...${NC}"

# Enable RLS query (escaped for JSON)
RLS_QUERY=$(cat <<EOF | tr '\n' ' ' | sed 's/"/\\"/g'
ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;
EOF
)

response=$(curl -s -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$RLS_QUERY\"}")

echo "$response"

echo -e "\n${YELLOW}Creating RLS policies...${NC}"

# Create RLS policies query (escaped for JSON)
POLICIES_QUERY=$(cat <<EOF | tr '\n' ' ' | sed 's/"/\\"/g'
DROP POLICY IF EXISTS "Users can view their own points" ON public.points;
DROP POLICY IF EXISTS "Users can insert their own points" ON public.points;

CREATE POLICY "Users can view their own points"
    ON public.points
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points"
    ON public.points
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EOF
)

response=$(curl -s -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$POLICIES_QUERY\"}")

echo "$response"

echo -e "\n${GREEN}Points table setup complete${NC}"

# Verify the table exists
echo -e "\n${YELLOW}Verifying table...${NC}"
curl -s \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/points?select=*&limit=0" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}"

# Final verification using SQL
echo -e "\n\n${YELLOW}Verifying table structure...${NC}"
VERIFY_QUERY=$(cat <<EOF | tr '\n' ' ' | sed 's/"/\\"/g'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'points'
ORDER BY ordinal_position;
EOF
)

curl -s -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$VERIFY_QUERY\"}"
