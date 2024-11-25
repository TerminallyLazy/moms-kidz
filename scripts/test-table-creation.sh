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

# Function to execute SQL query
execute_query() {
    local query="$1"
    local description="$2"
    
    echo -e "\n${YELLOW}$description${NC}"
    
    # Escape the query properly for JSON
    local escaped_query=$(echo "$query" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | tr '\n' ' ')
    
    echo -e "${YELLOW}Executing query...${NC}"
    
    response=$(curl -s -X POST \
        "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
        -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        -H "Content-Type: application/json" \
        -H "Prefer: return=representation" \
        -d "{\"query\": \"$escaped_query\"}")
    
    if [[ $response == *"error"* ]] || [[ $response == *"hint"* ]]; then
        echo -e "${RED}Error executing query:${NC}"
        echo "$response" | json_pp
        return 1
    else
        echo -e "${GREEN}Query executed successfully${NC}"
        if [ ! -z "$response" ]; then
            echo "Response:"
            echo "$response" | json_pp
        fi
        return 0
    fi
}

# First, let's check if we can execute a simple query
echo -e "\n${YELLOW}Testing database connection...${NC}"
execute_query "SELECT current_database(), current_user;" "Simple test query"

# Create extension if not exists
echo -e "\n${YELLOW}Ensuring UUID extension is available...${NC}"
execute_query "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" "Creating UUID extension"

# Drop existing points table if it exists
echo -e "\n${YELLOW}Dropping existing points table...${NC}"
execute_query "DROP TABLE IF EXISTS public.points CASCADE;" "Dropping points table"

# Create points table
echo -e "\n${YELLOW}Creating points table...${NC}"
execute_query "
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

# Enable RLS
echo -e "\n${YELLOW}Enabling Row Level Security...${NC}"
execute_query "ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;" "Enabling RLS"

# Create policies
echo -e "\n${YELLOW}Creating RLS policies...${NC}"
execute_query "
DROP POLICY IF EXISTS \"Users can view their own points\" ON public.points;
CREATE POLICY \"Users can view their own points\"
    ON public.points
    FOR SELECT
    USING (auth.uid() = user_id);" "Creating select policy"

execute_query "
DROP POLICY IF EXISTS \"Users can insert their own points\" ON public.points;
CREATE POLICY \"Users can insert their own points\"
    ON public.points
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);" "Creating insert policy"

# Grant permissions
echo -e "\n${YELLOW}Granting permissions...${NC}"
execute_query "
GRANT ALL ON public.points TO authenticated;
GRANT ALL ON public.points TO service_role;" "Granting permissions"

# Verify table exists
echo -e "\n${YELLOW}Verifying table creation...${NC}"
execute_query "
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'points'
);" "Checking if table exists"

# Get table structure
echo -e "\n${YELLOW}Getting table structure...${NC}"
execute_query "
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'points'
ORDER BY ordinal_position;" "Getting table structure"

# Get RLS policies
echo -e "\n${YELLOW}Checking RLS policies...${NC}"
execute_query "
SELECT polname, polcmd, polpermissive
FROM pg_policy
WHERE polrelid = 'public.points'::regclass;" "Getting RLS policies"

echo -e "\n${GREEN}Table creation test complete${NC}"
