import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);

async function applyMigration() {
  try {
    console.log('Reading migration file...');
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20231125_create_points.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
      console.log('Statement:', stmt.substring(0, 100) + '...');

      const { data, error } = await supabase.rpc('exec', {
        sql: stmt + ';'
      });

      if (error) {
        if (error.message.includes('function "exec" does not exist')) {
          console.log('Creating exec function...');
          const createExecFn = `
            CREATE OR REPLACE FUNCTION exec(sql text) RETURNS void AS $$
            BEGIN
              EXECUTE sql;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
            GRANT EXECUTE ON FUNCTION exec TO authenticated;
            GRANT EXECUTE ON FUNCTION exec TO anon;
          `;

          const { error: fnError } = await supabase
            .from('_sql')
            .select('*')
            .eq('query', createExecFn)
            .single();

          if (fnError) {
            console.error('Error creating exec function:', fnError);
            continue;
          }

          // Retry the original statement
          const { error: retryError } = await supabase.rpc('exec', {
            sql: stmt + ';'
          });

          if (retryError) {
            console.error(`Error executing statement ${i + 1}:`, retryError);
          }
        } else {
          console.error(`Error executing statement ${i + 1}:`, error);
        }
      } else {
        console.log(`Statement ${i + 1} executed successfully`);
      }
    }

    // Verify table exists
    console.log('\nVerifying points table...');
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
    console.log('\nInserting test data...');
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
    console.error('Migration failed:', error);
  }
}

applyMigration();