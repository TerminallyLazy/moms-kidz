import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigrations() {
  try {
    console.log('Running migrations...')
    
    // Read all migration files from the migrations directory
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()

    for (const migrationFile of migrationFiles) {
      console.log(`Running migration: ${migrationFile}`)
      const migration = fs.readFileSync(
        path.join(migrationsDir, migrationFile),
        'utf8'
      )

      // Split the migration into individual statements
      const statements = migration
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0)

      // Execute each statement
      for (const statement of statements) {
        const { error } = await supabase.rpc('exec', { sql: statement })
        if (error) {
          throw new Error(`Error executing migration ${migrationFile}: ${error.message}`)
        }
      }
    }

    console.log('Migrations completed successfully')
  } catch (error) {
    console.error('Error running migrations:', error)
    process.exit(1)
  }
}

async function runSeeds() {
  try {
    console.log('Running seeds...')
    
    const seedFile = path.join(process.cwd(), 'supabase', 'seed.sql')
    const seed = fs.readFileSync(seedFile, 'utf8')

    // Split the seed into individual statements
    const statements = seed
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0)

    // Execute each statement
    for (const statement of statements) {
      const { error } = await supabase.rpc('exec', { sql: statement })
      if (error) {
        throw new Error(`Error executing seed: ${error.message}`)
      }
    }

    console.log('Seeds completed successfully')
  } catch (error) {
    console.error('Error running seeds:', error)
    process.exit(1)
  }
}

async function resetDatabase() {
  try {
    console.log('Resetting database...')

    // Drop all tables (in reverse order of creation to handle foreign keys)
    const tables = [
      'user_challenges',
      'challenges',
      'streaks',
      'points',
      'achievements',
      'activities',
      'profiles'
    ]

    for (const table of tables) {
      const { error } = await supabase.rpc('exec', {
        sql: `DROP TABLE IF EXISTS ${table} CASCADE`
      })
      if (error) {
        throw new Error(`Error dropping table ${table}: ${error.message}`)
      }
    }

    console.log('Database reset successfully')

    // Run migrations and seeds
    await runMigrations()
    await runSeeds()
  } catch (error) {
    console.error('Error resetting database:', error)
    process.exit(1)
  }
}

// Add the setup command to package.json scripts
async function main() {
  const command = process.argv[2]

  switch (command) {
    case 'migrate':
      await runMigrations()
      break
    case 'seed':
      await runSeeds()
      break
    case 'reset':
      await resetDatabase()
      break
    default:
      console.log('Available commands: migrate, seed, reset')
      process.exit(1)
  }
}

main()