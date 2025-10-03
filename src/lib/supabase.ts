import { createClient } from '@supabase/supabase-js';

// oficiais (sem espaço, civilizadas)
let url: string | undefined =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_BASE_URL;

let anon: string | undefined =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_BASE_ANON_KEY;

// fallbacks "BOLT" (sem espaço, versão que sua tela pede)
if (!url)  url  = (import.meta as any)?.env?.VITE_BOLT_BASE_URL;
if (!anon) anon = (import.meta as any)?.env?.VITE_BOLT_BASE_ANON_KEY;

// fallback final: aberração com ESPAÇO (caso o Bolt injete isso no preview interno)
if (!url)  url  = (import.meta as any)?.env?.['VITE_Bolt Database_URL'];
if (!anon) anon = (import.meta as any)?.env?.['VITE_Bolt Database_ANON_KEY'];

if (!url || !anon) {
  throw new Error(
    'Missing Supabase envs. Defina VITE_BASE_URL/VITE_BASE_ANON_KEY (ou VITE_BOLT_BASE_*; ou as malditas com espaço do Bolt).'
  );
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