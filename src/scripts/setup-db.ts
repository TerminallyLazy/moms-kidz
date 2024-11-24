import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { initializeDatabase } from '@/lib/db/init'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function setupDatabase() {
  try {
    console.log('Starting database setup...')

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Read schema SQL
    const schemaPath = path.join(process.cwd(), 'src', 'lib', 'db', 'schema.sql')
    const schemaSql = fs.readFileSync(schemaPath, 'utf8')

    // Split SQL into individual statements
    const statements = schemaSql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0)

    console.log('Executing schema creation...')

    // Execute each statement
    for (const statement of statements) {
      const { error } = await supabase.rpc('exec', { sql: statement })
      if (error) {
        console.error('Error executing statement:', error)
        console.error('Statement:', statement)
        throw error
      }
    }

    console.log('Schema created successfully')

    // Initialize database with sample data
    console.log('Initializing database with sample data...')
    const { success, error } = await initializeDatabase()

    if (!success) {
      throw error || new Error('Failed to initialize database')
    }

    console.log('Database setup completed successfully')

    // Verify tables
    const tables = [
      'profiles',
      'points',
      'achievements',
      'activities',
      'streaks',
      'challenges',
      'user_challenges'
    ]

    console.log('\nVerifying tables...')
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').single()
      if (error) {
        console.error(`Error verifying table ${table}:`, error)
      } else {
        console.log(`✓ Table ${table} exists and is accessible`)
      }
    }

  } catch (error) {
    console.error('Error setting up database:', error)
    process.exit(1)
  }
}

// Add to package.json scripts:
// "setup-db": "ts-node -r tsconfig-paths/register src/scripts/setup-db.ts"

if (require.main === module) {
  setupDatabase()
}

export { setupDatabase }