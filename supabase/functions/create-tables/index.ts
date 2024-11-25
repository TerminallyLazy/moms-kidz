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
    const query = `
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
    `

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
