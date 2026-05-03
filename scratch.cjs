require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
supabase.from('artilharia').select('*').order('gols', { ascending: false }).limit(3).then(res => console.log(JSON.stringify(res.data, null, 2)));
