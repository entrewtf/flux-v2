/*
  # Create Thoughts and Notes Tables

  ## New Tables
  
  ### `thoughts`
  - `id` (uuid, primary key)
  - `job_number` (integer) - Sequential job number (JOB 1, JOB 2, etc.)
  - `text` (text) - The thought content
  - `size` (integer) - Size level (1-5)
  - `position_x` (numeric) - X coordinate position
  - `position_y` (numeric) - Y coordinate position
  - `velocity_x` (numeric) - X velocity for movement
  - `velocity_y` (numeric) - Y velocity for movement
  - `is_backup` (boolean) - Whether thought is in backup
  - `created_at` (timestamptz) - Creation timestamp
  
  ### `notes`
  - `id` (uuid, primary key)
  - `content` (text) - Note content
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on both tables
  - Public access policies for demo (no auth required)
*/

CREATE TABLE IF NOT EXISTS thoughts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_number integer NOT NULL,
  text text NOT NULL,
  size integer DEFAULT 1,
  position_x numeric DEFAULT 0,
  position_y numeric DEFAULT 0,
  velocity_x numeric DEFAULT 0,
  velocity_y numeric DEFAULT 0,
  is_backup boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read thoughts"
  ON thoughts
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert thoughts"
  ON thoughts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update thoughts"
  ON thoughts
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete thoughts"
  ON thoughts
  FOR DELETE
  USING (true);

CREATE POLICY "Allow public read notes"
  ON notes
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert notes"
  ON notes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update notes"
  ON notes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

INSERT INTO notes (content) VALUES ('') ON CONFLICT DO NOTHING;