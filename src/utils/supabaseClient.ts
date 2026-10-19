import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://gpdqjihnnjetoxxfsfxh.supabase.co';

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwZHFqaWhubmpldG94eGZzZnhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NDQxNzksImV4cCI6MjEwODAyMDE3OX0.pAMZfYE0FtTGhWF76xogOQUU_SlKbE3JQM5QV7mEViA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
