import { createClient } from '@supabase/supabase-js';

// Fonte oficial sem espaço no nome (Vercel/Netlify/Local)
let url: string | undefined = import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_BASE_URL;
let anon: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_BASE_ANON_KEY;

// SHIM de compatibilidade: cobre o caso bizarro do Bolt injetar nomes com espaço.
// Aciona só se as oficiais não vierem definidas.
const weirdUrl = (import.meta as any)?.env?.['VITE_Bolt Database_URL'];
const weirdAnon = (import.meta as any)?.env?.['VITE_Bolt Database_ANON_KEY'];
if (!url && typeof weirdUrl === 'string') url = weirdUrl;
if (!anon && typeof weirdAnon === 'string') anon = weirdAnon;

if (!url || !anon) {
  throw new Error('Missing Supabase environment variables. Expected VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY (ou VITE_BASE_*).');
}

export const supabase = createClient(url, anon);

export interface Thought {
  id: string;
  job_number: number;
  text: string;
  size: number;
  position_x: number;
  position_y: number;
  velocity_x: number;
  velocity_y: number;
  is_backup: boolean;
  created_at: string;
}

export interface Note {
  id: string;
  content: string;
  updated_at: string;
}
