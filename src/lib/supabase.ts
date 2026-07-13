import { createClient } from '@supabase/supabase-js';

// The REST API endpoint for the Supabase project 'miyracycsbuwybicljpo'
const supabaseUrl = 'https://miyracycsbuwybicljpo.supabase.co';
// Public publishable key for the Supabase project
const supabaseAnonKey = 'sb_publishable_uxXgnPU8WMRZYSqSZDtXxg_nrEqIs1P'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export helpers matching previous Firebase naming
export const auth = supabase.auth;
export const db = supabase; 
// Target bucket name requested by user: 'Photos'
export const storage = supabase.storage.from('Photos');
