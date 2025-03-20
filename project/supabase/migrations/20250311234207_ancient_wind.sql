/*
  # Create patient profile for mock user

  1. New Data
    - Creates a patient profile for our mock user with updated ID
    - Includes sample medical data
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
  insurance_info
) VALUES (
  '55555555-5555-5555-5555-555555555555', -- New unique ID
  '11111111-1111-1111-1111-111111111111', -- Matches our mock user ID
  '1990-01-01',
  'Male',
  'O+',
  ARRAY['Penicillin', 'Pollen'],
  ARRAY['Metformin 500mg', 'Lisinopril 10mg'],
  ARRAY['Type 2 Diabetes', 'Hypertension'],
  jsonb_build_object(
    'name', 'Jane Doe',
    'relationship', 'Spouse',
    'phone', '555-0123'
  ),
  jsonb_build_object(
    'provider', 'Blue Cross Blue Shield',
    'policyNumber', 'BC123456789',
    'groupNumber', 'G987654321'
  )
);