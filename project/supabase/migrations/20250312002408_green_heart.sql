/*
  # Add mock patients for Schedule view

  1. New Data
    - Adds 10 mock patients with realistic data
    - Each patient has:
      - Full name
      - Date of birth
      - Medical conditions
      - Contact info
      - Insurance details

  2. Changes
    - Inserts new patient profiles
    - Links profiles to mock user accounts
    - Distributes appointments across patients
*/

-- Create mock patients
INSERT INTO auth.users (
  id,
  email,
  raw_user_meta_data,
  created_at
)
SELECT 
  gen_random_uuid(),
  'patient' || n || '@example.com',
  jsonb_build_object(
    'first_name', (
      CASE (n % 10)
        WHEN 0 THEN 'Emma'
        WHEN 1 THEN 'James'
        WHEN 2 THEN 'Sophia'
        WHEN 3 THEN 'William'
        WHEN 4 THEN 'Olivia'
        WHEN 5 THEN 'Benjamin'
        WHEN 6 THEN 'Isabella'
        WHEN 7 THEN 'Lucas'
        WHEN 8 THEN 'Mia'
        WHEN 9 THEN 'Henry'
      END
    ),
    'last_name', (
      CASE (n % 10)
        WHEN 0 THEN 'Smith'
        WHEN 1 THEN 'Johnson'
        WHEN 2 THEN 'Williams'
        WHEN 3 THEN 'Brown'
        WHEN 4 THEN 'Jones'
        WHEN 5 THEN 'Garcia'
        WHEN 6 THEN 'Miller'
        WHEN 7 THEN 'Davis'
        WHEN 8 THEN 'Rodriguez'
        WHEN 9 THEN 'Martinez'
      END
    ),
    'role', 'patient'
  ),
  now()
FROM generate_series(1, 10) n
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'patient' || n || '@example.com'
);

-- Create patient profiles for new users
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
SELECT
  gen_random_uuid(),
  id,
  (current_date - (interval '1 year' * (20 + (random() * 40)::integer)))::date,
  CASE WHEN random() < 0.5 THEN 'Male' ELSE 'Female' END,
  (ARRAY['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])[floor(random() * 8 + 1)],
  CASE WHEN random() < 0.7
    THEN ARRAY[
      (ARRAY['Penicillin', 'Pollen', 'Dust', 'Latex', 'Peanuts', 'Shellfish'])[floor(random() * 6 + 1)],
      (ARRAY['Dairy', 'Soy', 'Eggs', 'Tree Nuts', 'Wheat'])[floor(random() * 5 + 1)]
    ]
    ELSE ARRAY[]::text[]
  END,
  CASE WHEN random() < 0.8
    THEN ARRAY[
      (ARRAY['Lisinopril 10mg', 'Metformin 500mg', 'Levothyroxine 50mcg', 'Amlodipine 5mg'])[floor(random() * 4 + 1)],
      (ARRAY['Omeprazole 20mg', 'Simvastatin 20mg', 'Metoprolol 25mg', 'Sertraline 50mg'])[floor(random() * 4 + 1)]
    ]
    ELSE ARRAY[]::text[]
  END,
  CASE WHEN random() < 0.6
    THEN ARRAY[
      (ARRAY['Hypertension', 'Type 2 Diabetes', 'Asthma', 'Arthritis'])[floor(random() * 4 + 1)],
      (ARRAY['High Cholesterol', 'Anxiety', 'Depression', 'GERD'])[floor(random() * 4 + 1)]
    ]
    ELSE ARRAY[]::text[]
  END,
  jsonb_build_object(
    'name', 
    CASE WHEN random() < 0.5 THEN 'John' ELSE 'Mary' END || ' ' ||
    (ARRAY['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'])[floor(random() * 5 + 1)],
    'relationship',
    (ARRAY['Spouse', 'Parent', 'Sibling', 'Child'])[floor(random() * 4 + 1)],
    'phone',
    '(' || (floor(random() * 900 + 100))::text || ') ' ||
    (floor(random() * 900 + 100))::text || '-' ||
    (floor(random() * 9000 + 1000))::text
  ),
  jsonb_build_object(
    'provider',
    (ARRAY['Aetna', 'Blue Cross', 'Cigna', 'UnitedHealth', 'Humana'])[floor(random() * 5 + 1)],
    'policyNumber',
    'POL' || (floor(random() * 90000000 + 10000000))::text,
    'groupNumber',
    'GRP' || (floor(random() * 900000 + 100000))::text
  )
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'patient'
  AND NOT EXISTS (
    SELECT 1 FROM patient_profiles WHERE patient_profiles.user_id = auth.users.id
  );

-- Distribute appointments across patients
WITH patient_ids AS (
  SELECT id FROM patient_profiles WHERE id != '55555555-5555-5555-5555-555555555555'
)
UPDATE appointments
SET patient_id = (
  SELECT id FROM patient_ids ORDER BY random() LIMIT 1
)
WHERE random() < 0.7 -- Distribute 70% of appointments to other patients
  AND start_time >= '2025-03-01' 
  AND start_time < '2025-04-01';