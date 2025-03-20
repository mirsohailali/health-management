/*
  # Fix Patient Profile Policies

  1. Changes
    - Add separate policies for each operation (SELECT, INSERT, UPDATE, DELETE)
    - Make policies more granular and specific
    - Ensure medical staff can perform all operations
    - Allow patients to only read their own profiles

  2. Security
    - Medical staff (doctor, nurse, admin) can perform all operations
    - Patients can only read their own profiles
    - Prevent unauthorized access
*/

-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Medical staff can manage all patient profiles" ON patient_profiles;
    DROP POLICY IF EXISTS "Patients can read their own profiles" ON patient_profiles;
    DROP POLICY IF EXISTS "Medical staff can read all patient profiles" ON patient_profiles;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create granular policies for patient_profiles
CREATE POLICY "Medical staff can select patient profiles"
  ON patient_profiles
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('doctor', 'nurse', 'admin'));

CREATE POLICY "Medical staff can insert patient profiles"
  ON patient_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' IN ('doctor', 'nurse', 'admin'));

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