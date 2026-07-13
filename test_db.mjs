import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://miyracycsbuwybicljpo.supabase.co';
const supabaseAnonKey = 'sb_publishable_uxXgnPU8WMRZYSqSZDtXxg_nrEqIs1P'; 

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('biography').upsert({
    id: 'timeline',
    text: JSON.stringify([{ id: 1, year: '2025', title: 'Test', organization: 'Test Org', description: 'Test desc', iconName: 'Rocket' }])
  });
  console.log("Upsert result:", data, error);

  const { data: fetch, error: fetchErr } = await supabase.from('biography').select('*').eq('id', 'timeline').single();
  console.log("Fetch result:", fetch, fetchErr);
}

check();
