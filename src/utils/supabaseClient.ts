import { createClient } from '@supabase/supabase-js';

// Polyfill minimal WebSocket interface in Node environments (< v22) where globalThis.WebSocket
// is undefined, preventing @supabase/realtime-js from crashing server-side REST execution.
if (typeof globalThis !== 'undefined' && typeof (globalThis as any).WebSocket === 'undefined') {
  class NodeWebSocketStub {
    static get CONNECTING() { return 0; }
    static get OPEN() { return 1; }
    static get CLOSING() { return 2; }
    static get CLOSED() { return 3; }
    get readyState() { return 3; }
    onopen: any = null;
    onclose: any = null;
    onerror: any = null;
    onmessage: any = null;
    constructor(_url: string, _protocols?: any) {}
    close() {}
    send() {}
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() { return false; }
  }
  (globalThis as any).WebSocket = NodeWebSocketStub;
}

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
