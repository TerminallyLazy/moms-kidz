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

# Function to execute SQL with service role
execute_sql() {
    local query="$1"
    local description="$2"
    
    echo -e "\n${YELLOW}$description${NC}"
    
    # Escape the query properly for JSON
    local escaped_query=$(echo "$query" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | tr '\n' ' ')
    
    response=$(curl -s -X POST \
        "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
        -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Content-Type: application/json" \
        -H "Prefer: return=representation" \
        -d "{\"query\": \"$escaped_query\"}")
    
    echo "Response: $response"
    
    if [[ $response == *"error"* ]]; then
        echo -e "${RED}Error executing query${NC}"
        return 1
    fi
    return 0
}

# Create points table with transaction
echo -e "${YELLOW}Creating points table...${NC}"
execute_sql "
DO \$\$
BEGIN
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";

    -- Drop existing table if it exists
    DROP TABLE IF EXISTS public.points CASCADE;

    -- Create points table
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

    -- Enable RLS
    ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;

    -- Create policies
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

    -- Grant permissions
    GRANT ALL ON public.points TO authenticated;
    GRANT ALL ON public.points TO service_role;

    -- Verify table exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'points'
    ) THEN
        RAISE EXCEPTION 'Table points was not created successfully';
    END IF;
END \$\$;" "Creating points table with transaction"

# Verify table structure
echo -e "\n${YELLOW}Verifying table structure...${NC}"
execute_sql "
SELECT 
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
    ordinal_position;" "Getting table structure"

# Verify RLS policies
echo -e "\n${YELLOW}Verifying RLS policies...${NC}"
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

echo -e "\n${GREEN}Table creation complete${NC}"
