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

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}Error: Missing required environment variables${NC}"
    exit 1
fi

echo -e "${YELLOW}Checking current database state...${NC}"

# List existing tables
curl -s -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/list_tables" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d "{}"

echo -e "\n${YELLOW}Initializing database...${NC}"

# Read and execute schema file
SCHEMA_FILE="src/lib/db/schema.sql"
if [ ! -f "$SCHEMA_FILE" ]; then
    echo -e "${RED}Error: Schema file not found at $SCHEMA_FILE${NC}"
    exit 1
fi

# Execute each statement separately
echo -e "${YELLOW}Executing schema...${NC}"

# Split the schema into individual statements and execute them
cat "$SCHEMA_FILE" | awk '
BEGIN { statement = "" }
/^--/ { next }  # Skip comments
{
    if ($0 ~ /;$/) {
        statement = statement $0
        if (length(statement) > 0) {
            printf "%s\n", statement
        }
        statement = ""
    } else {
        statement = statement $0 " "
    }
}' | while IFS= read -r sql_statement; do
    if [ -n "$sql_statement" ]; then
        echo -e "${YELLOW}Executing:${NC} ${sql_statement:0:100}..."
        
        response=$(curl -s -X POST \
            "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
            -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
            -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
            -H "Content-Type: application/json" \
            -H "Prefer: return=minimal" \
            -d "{\"query\": \"$sql_statement\"}")

        if [[ $response == *"error"* ]]; then
            echo -e "${RED}Error executing statement:${NC}"
            echo "$response"
            # Don't exit on error, continue with next statement
            # exit 1
        fi
    fi
done

echo -e "${GREEN}Database initialization complete${NC}"

echo -e "${YELLOW}Verifying tables...${NC}"
curl -s -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/list_tables" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d "{}"
