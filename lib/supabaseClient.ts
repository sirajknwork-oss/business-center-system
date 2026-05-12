import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Guard against build-time module evaluation when env vars are not yet available.
// All actual Supabase calls happen inside async functions (useEffect / server actions)
// so a null client is never exercised during static prerendering.
export const supabase = (supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null) as SupabaseClient
