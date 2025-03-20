/*
  # Create Patient Profile for Mock User

  1. Changes
    - Creates patient profile for mock user if it doesn't exist
    - Uses ON CONFLICT to handle potential duplicates
    - Includes complete medical history and contact information

  2. Security
    - No security changes needed
*/

INSERT INTO patient_profiles (
  id,
  user_id,
  date_of_birth,
  gender,
  blood_type,
  allergies,
  medications,
  medical_conditions,
  emergency_contact,
  insurance_info,
  created_at,
  updated_at
) VALUES (
  '55555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  '1985-06-15',
  'Male',
  'A+',
  ARRAY['Sulfa drugs', 'Shellfish'],
  ARRAY['Lisinopril 10mg daily', 'Metformin 500mg twice daily', 'Aspirin 81mg daily'],
  ARRAY['Type 2 Diabetes', 'Hypertension', 'High Cholesterol'],
  jsonb_build_object(
    'name', 'Mary Doe',
    'relationship', 'Wife',
    'phone', '(555) 123-4567'
  ),
  jsonb_build_object(
    'provider', 'Aetna Health Insurance',
    'policyNumber', 'AET1234567890',
    'groupNumber', 'GRP987654321'
  ),
  now(),
  now()
) ON CONFLICT (id) DO UPDATE 
SET
  user_id = EXCLUDED.user_id,
  date_of_birth = EXCLUDED.date_of_birth,
  gender = EXCLUDED.gender,
  blood_type = EXCLUDED.blood_type,
  allergies = EXCLUDED.allergies,
  medications = EXCLUDED.medications,
  medical_conditions = EXCLUDED.medical_conditions,
  emergency_contact = EXCLUDED.emergency_contact,
  insurance_info = EXCLUDED.insurance_info,
  updated_at = now();

-- Also ensure the user exists and has correct metadata
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'patient@example.com',
  '$2a$10$Q7HGHS.VWh6O4D8alvUkJOB3J8zI6NGBQMjzRGTnGHGGqYZkBg7Ue',
  now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object(
    'first_name', 'John',
    'last_name', 'Doe',
    'role', 'patient'
  ),
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO UPDATE
SET raw_user_meta_data = jsonb_build_object(
  'first_name', 'John',
  'last_name', 'Doe',
  'role', 'patient'
);