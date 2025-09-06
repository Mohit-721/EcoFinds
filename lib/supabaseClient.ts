import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

// In this sandboxed environment, process.env variables are not available.
// We are using placeholder values here to allow the application to initialize without crashing.
// To connect to your own Supabase instance, replace these placeholders with your actual project URL and Anon key.
const supabaseUrl = 'https://avuztybgocmdzulnemwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dXp0eWJnb2NtZHp1bG5lbXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDUwOTAsImV4cCI6MjA3MjcyMTA5MH0.bAgjnUUmSKT9lWFQ7e4ID-qrj02sg_oApKnCzNDsyOQ';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be provided.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
