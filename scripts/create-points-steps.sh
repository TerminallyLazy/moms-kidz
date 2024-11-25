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
    echo "Query: $query"
    
    # Escape query for JSON
    local escaped_query=$(echo "$query" | sed 's/"/\\"/g')
    local json_payload="{\"query\": \"$escaped_query\"}"
    
    response=$(curl -s -X POST \
        "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
        -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        -H "Content-Type: application/json" \
        -H "Prefer: return=representation" \
        --data-raw "$json_payload")
    
    echo "Response: $response"
    
    if [[ $response == *"error"* ]]; then
        echo -e "${RED}Error executing query${NC}"
        return 1
    fi
    return 0
}

# Step 1: Test connection
execute_sql "SELECT current_database(), current_user;" "Testing database connection"

# Step 2: Enable UUID extension
execute_sql "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" "Enabling UUID extension"

# Step 3: Drop existing table
execute_sql "DROP TABLE IF EXISTS public.points CASCADE;" "Dropping existing table"

# Step 4: Create table
execute_sql "
CREATE TABLE public.points (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE,
    amount integer NOT NULL,
    type text NOT NULL,
    description text,
    metadata jsonb,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);" "Creating points table"

# Step 5: Enable RLS
execute_sql "ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;" "Enabling RLS"

# Step 6: Create select policy
execute_sql "
CREATE POLICY \"Users can view their own points\"
    ON public.points
    FOR SELECT
    USING (auth.uid() = user_id);" "Creating select policy"

# Step 7: Create insert policy
execute_sql "
CREATE POLICY \"Users can insert their own points\"
    ON public.points
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);" "Creating insert policy"

# Step 8: Grant permissions
execute_sql "
GRANT ALL ON public.points TO authenticated;
GRANT ALL ON public.points TO anon;" "Granting permissions"

# Step 9: Verify table exists
execute_sql "
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'points'
);" "Verifying table exists"

# Step 10: Get table structure
execute_sql "
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'points'
ORDER BY ordinal_position;" "Getting table structure"

echo -e "\n${GREEN}Done${NC}"