import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

// Server-side database instance
export const supabaseServer = createServerComponentClient<Database>({ cookies })

// Example of a server-side function
export async function getServerData(userId: string) {
  const { data, error } = await supabaseServer
    .from('some_table')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error

  return data
}


// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'

// export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
//   return createServerComponentClient({
//     cookies: () => cookieStore,
//   })
// }
