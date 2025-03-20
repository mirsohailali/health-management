/*
  # Update Patient Profile Data

  Updates the mock patient profile with more realistic information.

  1. Changes
    - Updates patient profile for John Doe with realistic medical data
    - Adds proper emergency contact information
    - Adds insurance details
*/

-- Update the patient profile with more realistic data
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