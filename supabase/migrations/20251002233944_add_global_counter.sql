/*
  # Adicionar Contador Global

  1. Nova Tabela
    - `global_counter`
      - `id` (integer, primary key, sempre 1)
      - `thought_count` (integer) - Contador acumulado de pensamentos
      - `updated_at` (timestamptz) - Última atualização
  
  2. Segurança
    - Enable RLS
    - Permitir leitura e atualização públicas
  
  3. Inicialização
    - Inserir registro inicial com contador = 0
*/

CREATE TABLE IF NOT EXISTS global_counter (
  id integer PRIMARY KEY DEFAULT 1,
  thought_count integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE global_counter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read counter"
  ON global_counter
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public update counter"
  ON global_counter
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

INSERT INTO global_counter (id, thought_count) VALUES (1, 0) ON CONFLICT DO NOTHING;