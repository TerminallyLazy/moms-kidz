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
    echo -e "${YELLOW}Executing SQL file: $file${NC}"
    
    # Read and escape SQL content
    SQL_CONTENT=$(cat "$file" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | tr '\n' ' ')
    
    # Execute SQL
    response=$(curl -s -X POST \
        "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
        -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$SQL_CONTENT\"}")
    
    echo "Response: $response"
    
    if [[ $response == *"error"* ]]; then
        echo -e "${RED}Error executing SQL file${NC}"
        return 1
    else
        echo -e "${GREEN}SQL file executed successfully${NC}"
        return 0
    fi
}

# Execute each migration file
for file in supabase/migrations/*.sql; do
    echo -e "\n${YELLOW}Processing $file...${NC}"
    if execute_sql_file "$file"; then
        echo -e "${GREEN}Successfully executed $file${NC}"
    else
        echo -e "${RED}Failed to execute $file${NC}"
        exit 1
    fi
done

# Execute seed file
if [ -f supabase/seed.sql ]; then
    echo -e "\n${YELLOW}Executing seed file...${NC}"
    if execute_sql_file "supabase/seed.sql"; then
        echo -e "${GREEN}Successfully executed seed file${NC}"
    else
        echo -e "${RED}Failed to execute seed file${NC}"
        exit 1
    fi
fi

# Verify tables
echo -e "\n${YELLOW}Verifying tables...${NC}"
tables=("activities" "points" "challenges" "achievements" "streaks" "user_challenges")

for table in "${tables[@]}"; do
    echo -e "\n${YELLOW}Checking table: $table${NC}"
    response=$(curl -s \
        "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/$table?select=*&limit=0" \
        -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}")
    
    if [[ $response == "[]" ]]; then
        echo -e "${GREEN}Table $table exists and is accessible${NC}"
    else
        echo -e "${RED}Table $table verification failed:${NC}"
        echo "$response" | json_pp
    fi
done

echo -e "\n${GREEN}Database setup complete${NC}"