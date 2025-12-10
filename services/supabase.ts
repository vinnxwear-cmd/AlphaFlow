import { createClient } from '@supabase/supabase-js'

// Cole a URL que você pegou no site do Supabase (Passo 1)
const supabaseUrl = 'https://SEU-PROJETO.supabase.co'

// Cole a chave ANON KEY que você pegou no site do Supabase (Passo 1)
const supabaseKey = 'EYjh...'

export const supabase = createClient(supabaseUrl, supabaseKey)
