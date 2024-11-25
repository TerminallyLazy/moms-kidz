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

echo -e "${YELLOW}Creating points table...${NC}"

# Create table definition
TABLE_DEF='{
  "id": {
    "type": "uuid",
    "primaryKey": true,
    "default": "uuid_generate_v4()"
  },
  "user_id": {
    "type": "uuid",
    "references": "auth.users.id",
    "onDelete": "cascade"
  },
  "amount": {
    "type": "integer",
    "notNull": true
  },
  "type": {
    "type": "text",
    "notNull": true
  },
  "description": {
    "type": "text"
  },
  "metadata": {
    "type": "jsonb"
  },
  "created_at": {
    "type": "timestamptz",
    "notNull": true,
    "default": "now()"
  },
  "updated_at": {
    "type": "timestamptz",
    "notNull": true,
    "default": "now()"
  }
}'

# Create table using REST API
echo -e "\n${YELLOW}Creating table...${NC}"
curl -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/points" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "$TABLE_DEF"

# Enable RLS
echo -e "\n${YELLOW}Enabling RLS...${NC}"
curl -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"query": "ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;"}'

# Create RLS policies
echo -e "\n${YELLOW}Creating RLS policies...${NC}"
curl -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d '{
      "query": "CREATE POLICY \"Users can view their own points\" ON public.points FOR SELECT USING (auth.uid() = user_id);"
    }'

curl -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d '{
      "query": "CREATE POLICY \"Users can insert their own points\" ON public.points FOR INSERT WITH CHECK (auth.uid() = user_id);"
    }'

# Verify table
echo -e "\n${YELLOW}Verifying table...${NC}"
curl -s \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/points?select=*&limit=0" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -i

echo -e "\n${GREEN}Points table setup complete${NC}"
