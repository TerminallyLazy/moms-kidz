import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function executeSql(query, description) {
  console.log(`\nExecuting: ${description}`);
  console.log('Query:', query);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ sql: query })
    }
  );

  const responseText = await response.text();
  console.log('Response status:', response.status);
  
  if (!response.ok) {
    console.error('Error executing query:', responseText);
    throw new Error(`Failed to execute query: ${responseText}`);
  }

  try {
    return responseText ? JSON.parse(responseText) : null;
  } catch (e) {
    return responseText;
  }
}

async function applyMigration() {
  try {
    // First, create the exec function
    await executeSql(`
      CREATE OR REPLACE FUNCTION exec(sql text) RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      GRANT EXECUTE ON FUNCTION exec TO authenticated;
      GRANT EXECUTE ON FUNCTION exec TO anon;
    `, 'Creating exec function');

    // Create points table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS public.points (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id uuid REFERENCES auth.users ON DELETE CASCADE,
        amount integer NOT NULL,
        type text NOT NULL,
        description text,
        metadata jsonb,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );
    `, 'Creating points table');

    // Enable RLS
    await executeSql(`
      ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;
    `, 'Enabling RLS');

    // Create select policy
    await executeSql(`
      DROP POLICY IF EXISTS "Users can view their own points" ON public.points;
      CREATE POLICY "Users can view their own points"
        ON public.points
        FOR SELECT
        USING (auth.uid() = user_id);
    `, 'Creating select policy');

    // Create insert policy
    await executeSql(`
      DROP POLICY IF EXISTS "Users can insert their own points" ON public.points;
      CREATE POLICY "Users can insert their own points"
        ON public.points
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    `, 'Creating insert policy');

    // Grant permissions
    await executeSql(`
      GRANT ALL ON public.points TO authenticated;
      GRANT ALL ON public.points TO anon;
    `, 'Granting permissions');

    // Verify table exists
    const verifyResult = await executeSql(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'points'
      );
    `, 'Verifying table exists');
    console.log('Table exists:', verifyResult);

    // Get table structure
    const structureResult = await executeSql(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'points'
      ORDER BY ordinal_position;
    `, 'Getting table structure');
    console.log('Table structure:', structureResult);

    // Try to insert test data
    const insertResult = await executeSql(`
      INSERT INTO public.points (user_id, amount, type, description)
      VALUES (
        '00000000-0000-0000-0000-000000000000',
        100,
        'test',
        'Test points'
      )
      RETURNING *;
    `, 'Inserting test data');
    console.log('Insert result:', insertResult);

    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

applyMigration();
