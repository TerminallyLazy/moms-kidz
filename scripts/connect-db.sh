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

# Extract host and database name from URL
DB_HOST=$(echo $NEXT_PUBLIC_SUPABASE_URL | awk -F[/:] '{print $4}')
DB_NAME="postgres"
DB_PORT="5432"
DB_USER="postgres"

echo -e "${YELLOW}Database Connection Info:${NC}"
echo "Host: $DB_HOST"
echo "Database: $DB_NAME"
echo "Port: $DB_PORT"
echo "User: $DB_USER"

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}psql is not installed. Please install PostgreSQL client tools.${NC}"
    exit 1
fi

# Create points table using psql
echo -e "\n${YELLOW}Creating points table...${NC}"
PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -p "$DB_PORT" -c "
CREATE TABLE IF NOT EXISTS public.points (
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

CREATE POLICY \"Users can view their own points\"
    ON public.points
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY \"Users can insert their own points\"
    ON public.points
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

GRANT ALL ON public.points TO authenticated;
GRANT ALL ON public.points TO service_role;
"

# Verify table creation
echo -e "\n${YELLOW}Verifying table creation...${NC}"
PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -p "$DB_PORT" -c "\d public.points"