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

# Extract project reference from URL (get the subdomain part)
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -E 's/https:\/\/([^.]+).*/\1/')
echo -e "${YELLOW}Project Reference: $PROJECT_REF${NC}"

# Set Supabase access token
export SUPABASE_ACCESS_TOKEN="${SUPABASE_SERVICE_ROLE_KEY}"

# Initialize Supabase project with force if config exists (non-interactive)
echo -e "\n${YELLOW}Initializing Supabase project...${NC}"
echo "n" | $SUPABASE init --force

# Create Edge Functions directory if it doesn't exist
mkdir -p supabase/functions/create-tables

# Create Edge Function
echo -e "\n${YELLOW}Creating Edge Function...${NC}"
cat > supabase/functions/create-tables/index.ts << EOF
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const query = \`
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

      DROP POLICY IF EXISTS "Users can view their own points" ON public.points;
      CREATE POLICY "Users can view their own points"
        ON public.points
        FOR SELECT
        USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can insert their own points" ON public.points;
      CREATE POLICY "Users can insert their own points"
        ON public.points
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);

      GRANT ALL ON public.points TO authenticated;
      GRANT ALL ON public.points TO service_role;
    \`

    const response = await fetch(
      Deno.env.get('SUPABASE_URL') + '/rest/v1/sql',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          'Authorization': 'Bearer ' + (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '')
        },
        body: JSON.stringify({ query })
      }
    )

    const result = await response.json()

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
EOF

# Deploy the function
echo -e "\n${YELLOW}Deploying Edge Function...${NC}"
$SUPABASE functions deploy create-tables

# Print current configuration
echo -e "\n${YELLOW}Current configuration:${NC}"
echo "SUPABASE_URL: $NEXT_PUBLIC_SUPABASE_URL"
echo "PROJECT_REF: $PROJECT_REF"
echo "Access Token Length: ${#SUPABASE_ACCESS_TOKEN}"

echo -e "\n${GREEN}Supabase setup complete${NC}"
