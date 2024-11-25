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
        -d "{\"query\": \"$escaped_query\"}")
    
    echo "Response: $response"
}

# Create points table
execute_sql "
BEGIN;

CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";

DROP TABLE IF EXISTS public.points CASCADE;

CREATE TABLE public.points (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE,
    amount integer NOT NULL,
    type text NOT NULL,
    description text,
    metadata jsonb,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS \"Users can view their own points\" ON public.points;
CREATE POLICY \"Users can view their own points\"
    ON public.points
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS \"Users can insert their own points\" ON public.points;
CREATE POLICY \"Users can insert their own points\"
    ON public.points
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

GRANT ALL ON public.points TO authenticated;
GRANT ALL ON public.points TO service_role;

COMMIT;
" "Creating points table"

# Verify table creation
execute_sql "
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'points'
);" "Verifying table exists"

# Get table structure
execute_sql "
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'points'
ORDER BY ordinal_position;" "Getting table structure"

# Get RLS policies
execute_sql "
SELECT polname, polcmd, polpermissive
FROM pg_policy
WHERE polrelid = 'public.points'::regclass;" "Getting RLS policies"

echo -e "\n${GREEN}Table creation complete${NC}"