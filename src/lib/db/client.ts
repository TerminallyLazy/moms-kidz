import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

// Client-side database instance
export const supabaseClient = createClientComponentClient<Database>()

// Define useDb as a function that returns the client
export function useDb() {
  return supabaseClient
}

// Example of a client-side function
export async function getClientData(userId: string) {
  const { data, error } = await supabaseClient
    .from('some_table')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error

  return data
}


