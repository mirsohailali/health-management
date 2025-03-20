/*
  # Fix Patient Profile Policies

  1. Changes
    - Add policy to allow creating patient profiles during signup
    - Keep existing policies for medical staff and patients

  2. Security
    - Maintain RLS protection
    - Allow profile creation during signup
    - Preserve medical staff access
*/

-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Medical staff can select patient profiles" ON patient_profiles;
    DROP POLICY IF EXISTS "Medical staff can insert patient profiles" ON patient_profiles;
    DROP POLICY IF EXISTS "Medical staff can update patient profiles" ON patient_profiles;
    DROP POLICY IF EXISTS "Medical staff can delete patient profiles" ON patient_profiles;
    DROP POLICY IF EXISTS "Patients can read their own profiles" ON patient_profiles;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create policies for patient_profiles
CREATE POLICY "Allow profile creation during signup"
  ON patient_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Medical staff can select patient profiles"
  ON patient_profiles
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('doctor', 'nurse', 'admin'));

CREATE POLICY "Medical staff can update patient profiles"
  ON patient_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('doctor', 'nurse', 'admin'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('doctor', 'nurse', 'admin'));

CREATE POLICY "Medical staff can delete patient profiles"
  ON patient_profiles
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('doctor', 'nurse', 'admin'));

CREATE POLICY "Patients can read their own profiles"
  ON patient_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);