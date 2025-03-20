/*
  # Fix Patient Profile Policies

  1. Changes
    - Add INSERT policy for patient profiles
    - Add UPDATE policy for patient profiles
    - Add DELETE policy for patient profiles
    - Modify existing policies to be more permissive

  2. Security
    - Medical staff can manage all patient profiles
    - Patients can only read their own profiles
*/

-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Medical staff can read all patient profiles" ON patient_profiles;
    DROP POLICY IF EXISTS "Patients can read their own profiles" ON patient_profiles;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create new policies for patient_profiles
CREATE POLICY "Medical staff can manage all patient profiles"
  ON patient_profiles
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('doctor', 'nurse', 'admin'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('doctor', 'nurse', 'admin'));

CREATE POLICY "Patients can read their own profiles"
  ON patient_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);