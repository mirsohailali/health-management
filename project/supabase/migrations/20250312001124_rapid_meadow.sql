/*
  # Update Patient Profile Data

  Updates the mock patient profile with realistic information and ensures proper user linkage.

  1. Changes
    - Ensures patient profile exists for mock user
    - Updates profile with realistic medical data
    - Adds proper emergency contact information
    - Adds insurance details
*/

-- First ensure the patient profile exists
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
)
VALUES (
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
  )
)
ON CONFLICT (id) DO UPDATE 
SET
  date_of_birth = EXCLUDED.date_of_birth,
  gender = EXCLUDED.gender,
  blood_type = EXCLUDED.blood_type,
  allergies = EXCLUDED.allergies,
  medications = EXCLUDED.medications,
  medical_conditions = EXCLUDED.medical_conditions,
  emergency_contact = EXCLUDED.emergency_contact,
  insurance_info = EXCLUDED.insurance_info;