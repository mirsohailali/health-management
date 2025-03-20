/*
  # Patient Profiles and Medical Records Schema Update
  
  1. Changes
    - Add user_profiles view for safe auth.users data access
    - Add IF NOT EXISTS checks for triggers
    - Safe handling of existing objects
    
  2. Security
    - Maintain existing RLS setup
    - Safe exposure of user data
*/

-- Create a view to expose auth.users data safely
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  id,
  email,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name
FROM auth.users;

-- Patient Profiles
CREATE TABLE IF NOT EXISTS patient_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  date_of_birth date NOT NULL,
  gender text,
  blood_type text,
  allergies text[],
  medications text[],
  medical_conditions text[],
  emergency_contact jsonb,
  insurance_info jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Medical Records (SOAP Notes)
CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patient_profiles(id),
  provider_id uuid REFERENCES auth.users(id),
  visit_date timestamptz DEFAULT now(),
  subjective text,
  objective text,
  assessment text,
  plan text,
  visit_type text,
  vital_signs jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Medical Files
CREATE TABLE IF NOT EXISTS medical_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid REFERENCES medical_records(id),
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_url text NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Custom Forms
CREATE TABLE IF NOT EXISTS custom_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  form_fields jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Form Submissions
CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES custom_forms(id),
  patient_id uuid REFERENCES patient_profiles(id),
  submitted_data jsonb NOT NULL,
  submitted_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Medical staff can read all patient profiles" ON patient_profiles;
    DROP POLICY IF EXISTS "Patients can read their own profiles" ON patient_profiles;
    DROP POLICY IF EXISTS "Medical staff can create and update records" ON medical_records;
    DROP POLICY IF EXISTS "Patients can view their own records" ON medical_records;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create new policies
CREATE POLICY "Medical staff can read all patient profiles"
  ON patient_profiles
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('doctor', 'nurse', 'admin'));

CREATE POLICY "Patients can read their own profiles"
  ON patient_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Medical staff can create and update records"
  ON medical_records
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('doctor', 'nurse', 'admin'));

CREATE POLICY "Patients can view their own records"
  ON medical_records
  FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

-- Trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DO $$
BEGIN
    DROP TRIGGER IF EXISTS update_patient_profiles_updated_at ON patient_profiles;
    DROP TRIGGER IF EXISTS update_medical_records_updated_at ON medical_records;
    DROP TRIGGER IF EXISTS update_custom_forms_updated_at ON custom_forms;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

-- Create triggers
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_patient_profiles_updated_at'
    ) THEN
        CREATE TRIGGER update_patient_profiles_updated_at
        BEFORE UPDATE ON patient_profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_medical_records_updated_at'
    ) THEN
        CREATE TRIGGER update_medical_records_updated_at
        BEFORE UPDATE ON medical_records
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_custom_forms_updated_at'
    ) THEN
        CREATE TRIGGER update_custom_forms_updated_at
        BEFORE UPDATE ON custom_forms
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
    END IF;
END $$;