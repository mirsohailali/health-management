/*
  # Update John Doe's Patient Data

  1. Changes
    - Updates John Doe's patient profile with correct personal information
    - Ensures data matches the specified values

  2. Data Updates
    - Date of Birth: June 15, 1985
    - Gender: Male
    - Blood Type: A+
    - Allergies: Sulfa drugs, Shellfish
    - Medications: Lisinopril, Metformin, Aspirin
    - Medical Conditions: Type 2 Diabetes, Hypertension, High Cholesterol
    - Emergency Contact: Mary Doe (Wife)
    - Insurance: Aetna Health Insurance
*/

-- Update John Doe's patient profile
UPDATE patient_profiles
SET
  date_of_birth = '1985-06-15',
  gender = 'Male',
  blood_type = 'A+',
  allergies = ARRAY['Sulfa drugs', 'Shellfish'],
  medications = ARRAY['Lisinopril 10mg daily', 'Metformin 500mg twice daily', 'Aspirin 81mg daily'],
  medical_conditions = ARRAY['Type 2 Diabetes', 'Hypertension', 'High Cholesterol'],
  emergency_contact = jsonb_build_object(
    'name', 'Mary Doe',
    'relationship', 'Wife',
    'phone', '(555) 123-4567'
  ),
  insurance_info = jsonb_build_object(
    'provider', 'Aetna Health Insurance',
    'policyNumber', 'AET1234567890',
    'groupNumber', 'GRP987654321'
  )
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- Update John Doe's user profile
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'first_name', 'John',
  'last_name', 'Doe',
  'role', 'patient'
)
WHERE id = '11111111-1111-1111-1111-111111111111';