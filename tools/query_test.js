import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTY3OTU1NDYxOSwiZXhwIjoyMDAxNTExNDE5LCJhdWQiOiJhdXRoZW50aWNhdGVkIiwicm9sZSI6ImFub24ifQ.p' // just dummy, wait, I can extract from .env
)
