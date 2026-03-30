import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '../env'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        fetch: (url, options) => fetch(url, { 
          ...options, 
          // @ts-ignore - Increasing timeout to 30s to prevent 10s ConnectTimeout errors
          signal: AbortSignal.timeout(30000) 
        })
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
