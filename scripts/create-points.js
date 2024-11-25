import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function executeSql(query) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ query })
    }
  );

  const result = await response.json();
  return result;
}

async function createPointsTable() {
  console.log('Creating points table...');

  try {
    // Create the points table
    console.log('Creating table...');
    const createTableResult = await executeSql(`
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
    `);
    console.log('Create table result:', createTableResult);

    // Enable RLS and create policies
    console.log('Setting up RLS...');
    const rlsResult = await executeSql(`
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
      GRANT ALL ON public.points TO anon;
    `);
    console.log('RLS setup result:', rlsResult);

    // Verify table exists
    console.log('Verifying table...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('points')
      .select('*')
      .limit(0);

    if (verifyError) {
      console.error('Error verifying table:', verifyError);
    } else {
      console.log('Table verified successfully');
    }

    // Try to insert test data
    console.log('Inserting test data...');
    const { data: insertData, error: insertError } = await supabase
      .from('points')
      .insert([
        {
          user_id: '00000000-0000-0000-0000-000000000000',
          amount: 100,
          type: 'test',
          description: 'Test points'
        }
      ])
      .select();

    if (insertError) {
      console.error('Error inserting test data:', insertError);
    } else {
      console.log('Test data inserted successfully:', insertData);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

createPointsTable();
