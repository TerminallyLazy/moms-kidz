import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import { logger } from '@/lib/logger'

async function initializeDatabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables')
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    logger.info('Reading schema file...')
    const schemaPath = join(process.cwd(), 'src', 'lib', 'db', 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf8')

    logger.info('Executing schema...')
    const { error } = await supabase.from('profiles').select('id').limit(1)
    
    if (error && error.code === '42P01') {
      // Table doesn't exist, create schema
      logger.info('Creating database schema...')
      const { error: schemaError } = await supabase.rpc('exec', { sql: schema })
      
      if (schemaError) {
        throw schemaError
      }
      
      logger.info('Database schema created successfully')
    } else {
      logger.info('Database schema already exists')
    }

    // Test connection and permissions
    const { data: testData, error: testError } = await supabase.from('profiles').select('id').limit(1)
    if (testError) {
      throw testError
    }

    logger.info('Database initialization complete')
    return true
  } catch (error) {
    logger.error('Database initialization failed:', error as Error)
    throw error
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to initialize database:', error)
      process.exit(1)
    })
}

export default initializeDatabase