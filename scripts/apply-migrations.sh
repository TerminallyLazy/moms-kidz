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

# Function to execute SQL file
execute_sql_file() {
    local file="$1"
    echo -e "${YELLOW}Executing migration: $file${NC}"
    
    # Read and escape SQL content
    SQL_CONTENT=$(cat "$file" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | tr '\n' ' ')
    
    # Execute SQL
    response=$(curl -s -X POST \
        "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
        -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$SQL_CONTENT\"}")
    
    if [[ $response == *"error"* ]]; then
        echo -e "${RED}Error executing migration:${NC}"
        echo "$response" | json_pp
        return 1
    else
        echo -e "${GREEN}Migration successful${NC}"
        return 0
    fi
}

# Apply migrations in order
echo -e "${YELLOW}Applying migrations...${NC}"

# Get list of migration files
migration_files=(supabase/migrations/*.sql)

# Sort files by name
IFS=$'\n' sorted_files=($(sort <<<"${migration_files[*]}"))
unset IFS

# Execute each migration file
for file in "${sorted_files[@]}"; do
    if execute_sql_file "$file"; then
        echo -e "${GREEN}Successfully applied migration: $file${NC}"
    else
        echo -e "${RED}Failed to apply migration: $file${NC}"
        exit 1
    fi
done

echo -e "${GREEN}All migrations completed successfully${NC}"

# Verify tables
echo -e "\n${YELLOW}Verifying tables...${NC}"
tables=("activities" "points" "challenges" "achievements" "streaks" "user_challenges")

for table in "${tables[@]}"; do
    echo -e "\n${YELLOW}Checking table: $table${NC}"
    response=$(curl -s \
        "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/$table?select=*&limit=0" \
        -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")
    
    if [[ $response == "[]" ]]; then
        echo -e "${GREEN}Table $table exists and is accessible${NC}"
    else
        echo -e "${RED}Table $table verification failed:${NC}"
        echo "$response" | json_pp
    fi
done