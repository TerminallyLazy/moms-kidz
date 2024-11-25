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

# Use local Supabase CLI
SUPABASE="npx supabase"

# Initialize Supabase if not already initialized
if [ ! -f "supabase/config.toml" ]; then
    echo -e "${YELLOW}Initializing Supabase project...${NC}"
    $SUPABASE init
fi

# Link to the project
echo -e "${YELLOW}Linking to Supabase project...${NC}"
$SUPABASE link --project-ref "$(echo $NEXT_PUBLIC_SUPABASE_URL | awk -F[/.] '{print $(NF-1)}')"

# Deploy the function
echo -e "${YELLOW}Deploying edge function...${NC}"
$SUPABASE functions deploy create-tables

# Invoke the function
echo -e "${YELLOW}Invoking edge function...${NC}"
$SUPABASE functions invoke create-tables \
    --project-ref "$(echo $NEXT_PUBLIC_SUPABASE_URL | awk -F[/.] '{print $(NF-1)}')" \
    --header "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}"

# Verify table creation
echo -e "\n${YELLOW}Verifying table creation...${NC}"
curl -s \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/points?select=*&limit=0" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -i
