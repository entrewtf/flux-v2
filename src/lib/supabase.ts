import { createClient } from '@supabase/supabase-js'

// 1) tenta nomes "limpos"
let url: string | undefined = import.meta.env.VITE_BASE_URL
let anon: string | undefined = import.meta.env.VITE_BASE_ANON_KEY

// 2) tenta nomes "BOLT" (sem espaco)
if (!url) url = (import.meta as any)?.env?.VITE_BOLT_BASE_URL
if (!anon) anon = (import.meta as any)?.env?.VITE_BOLT_BASE_ANON_KEY

// 3) ultimo fallback: variaveis com ESPACO (painel Bolt)
if (!url) url = (import.meta as any)?.env?.['VITE_Bolt Database_URL']
if (!anon) anon = (import.meta as any)?.env?.['VITE_Bolt Database_ANON_KEY']

// 4) hardcode como rede de seguranca
if (!url) url = 'https://0ec90b57d6e95fcbda19832f.supabase.co'
if (!anon) anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw'

export const supabase = createClient(url!, anon!)

export interface Thought {
  id: string
  job_number: number
  text: string
  size: number
  position_x: number
  position_y: number
  velocity_x: number
  velocity_y: number
  is_backup: boolean
  created_at: string
}

export interface Note {
  id: string
  content: string
  updated_at: string
}
