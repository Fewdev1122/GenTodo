// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// 🟢 ไปเอาค่านี้มาจาก Supabase Dashboard > Project Settings > API
const supabaseUrl = 'https://ccyvrsiuwuebcgnfowbk.supabase.co'
const supabaseKey = 'sb_publishable_EkDzyZ9Ywp7KPicBgGD5hg_eHCfNG92'

export const supabase = createClient(supabaseUrl, supabaseKey)