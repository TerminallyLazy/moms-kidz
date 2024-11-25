#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required environment variables are set
check_env() {
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        echo -e "${RED}Error: Missing required environment variables.${NC}"
        echo "Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
        exit 1
    fi
}

# Run schema initialization
init_schema() {
    echo -e "${YELLOW}Initializing database schema...${NC}"
    if [ -f "src/lib/db/schema.sql" ]; then
        curl -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec" \
            -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
            -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
            -H "Content-Type: application/json" \
            -d "{\"sql\": \"$(cat src/lib/db/schema.sql | tr -d '\n' | sed 's/\"/\\\"/g')\"}"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Successfully initialized schema${NC}"
        else
            echo -e "${RED}Failed to initialize schema${NC}"
            exit 1
        fi
    else
        echo -e "${RED}Schema file not found at src/lib/db/schema.sql${NC}"
        exit 1
    fi
}

# Run migrations
run_migrations() {
    echo -e "${YELLOW}Running database migrations...${NC}"
    for file in supabase/migrations/*.sql; do
        if [ -f "$file" ]; then
            echo -e "${YELLOW}Applying migration: ${file}${NC}"
            curl -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec" \
                -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
                -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
                -H "Content-Type: application/json" \
                -d "{\"sql\": \"$(cat "$file" | tr -d '\n' | sed 's/\"/\\\"/g')\"}"
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}Successfully applied migration: ${file}${NC}"
            else
                echo -e "${RED}Failed to apply migration: ${file}${NC}"
                exit 1
            fi
        fi
    done
}

# Run seeds
run_seeds() {
    echo -e "${YELLOW}Running database seeds...${NC}"
    if [ -f "supabase/seed.sql" ]; then
        curl -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec" \
            -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
            -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
            -H "Content-Type: application/json" \
            -d "{\"sql\": \"$(cat supabase/seed.sql | tr -d '\n' | sed 's/\"/\\\"/g')\"}"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Successfully applied seeds${NC}"
        else
            echo -e "${RED}Failed to apply seeds${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}No seed file found${NC}"
    fi
}

# Reset database
reset_database() {
    echo -e "${RED}Warning: This will delete all data in the database.${NC}"
    read -p "Are you sure you want to continue? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Resetting database...${NC}"
        
        # Drop all tables
        tables=("user_challenges" "challenges" "streaks" "points" "achievements" "activities" "profiles")
        for table in "${tables[@]}"; do
            curl -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec" \
                -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
                -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
                -H "Content-Type: application/json" \
                -d "{\"sql\": \"DROP TABLE IF EXISTS ${table} CASCADE;\"}"
        done
        
        # Initialize schema, run migrations and seeds
        init_schema
        run_migrations
        run_seeds
        
        echo -e "${GREEN}Database reset complete${NC}"
    else
        echo -e "${YELLOW}Database reset cancelled${NC}"
    fi
}

# Main script
case "$1" in
    "init")
        check_env
        init_schema
        ;;
    "migrate")
        check_env
        run_migrations
        ;;
    "seed")
        check_env
        run_seeds
        ;;
    "reset")
        check_env
        reset_database
        ;;
    *)
        echo -e "${YELLOW}Usage: $0 {init|migrate|seed|reset}${NC}"
        echo "  init    - Initialize database schema"
        echo "  migrate - Run all migrations"
        echo "  seed    - Run database seeds"
        echo "  reset   - Reset database and run migrations and seeds"
        exit 1
        ;;
esac

exit 0
