import { createClient } from '@supabase/supabase-js';

const procEnv = typeof process !== 'undefined' ? process.env : {};
const viteEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env || {} : {};

const supabaseUrl =
  viteEnv.VITE_SUPABASE_URL ||
  procEnv.VITE_SUPABASE_URL ||
  procEnv.SUPABASE_URL ||
  'https://gpdqjihnnjetoxxfsfxh.supabase.co';

const supabaseAnonKey =
  viteEnv.VITE_SUPABASE_ANON_KEY ||
  procEnv.VITE_SUPABASE_ANON_KEY ||
  procEnv.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwZHFqaWhubmpldG94eGZzZnhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NDQxNzksImV4cCI6MjEwODAyMDE3OX0.pAMZfYE0FtTGhWF76xogOQUU_SlKbE3JQM5QV7mEViA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
