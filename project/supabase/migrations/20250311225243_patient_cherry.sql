/*
  # Add Dummy Patient Profiles

  1. Changes
    - Insert test users into auth.users
    - Create corresponding patient profiles
    - Add realistic medical data

  2. Security
    - Maintain data consistency with foreign keys
    - Use realistic but fake data
*/

-- Insert test users into auth.users
DO $$
DECLARE
  user1_id uuid;
  user2_id uuid;
  user3_id uuid;
BEGIN
  -- Create test users in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'patient',
    'sarah.johnson@example.com',
    crypt('dummy-password', gen_salt('bf')),
    now(),
    jsonb_build_object(
      'first_name', 'Sarah',
      'last_name', 'Johnson',
      'role', 'patient'
    ),
    now(),
    now()
  ) RETURNING id INTO user1_id;

  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'patient',
    'michael.smith@example.com',
    crypt('dummy-password', gen_salt('bf')),
    now(),
    jsonb_build_object(
      'first_name', 'Michael',
      'last_name', 'Smith',
      'role', 'patient'
    ),
    now(),
    now()
  ) RETURNING id INTO user2_id;

  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'patient',
    'emily.davis@example.com',
    crypt('dummy-password', gen_salt('bf')),
    now(),
    jsonb_build_object(
      'first_name', 'Emily',
      'last_name', 'Davis',
      'role', 'patient'
    ),
    now(),
    now()
  ) RETURNING id INTO user3_id;

  -- Create patient profiles
  INSERT INTO patient_profiles (
    user_id,
    date_of_birth,
    gender,
    blood_type,
    allergies,
    medications,
    medical_conditions,
    emergency_contact,
    insurance_info
  ) VALUES
  (
    user1_id,
    '1985-03-15',
    'female',
    'O+',
    ARRAY['Penicillin', 'Pollen'],
    ARRAY['Lisinopril 10mg', 'Vitamin D3'],
    ARRAY['Hypertension', 'Seasonal allergies'],
    jsonb_build_object(
      'name', 'John Johnson',
      'relationship', 'Spouse',
      'phone', '(555) 123-4567'
    ),
    jsonb_build_object(
      'provider', 'Blue Cross',
      'policyNumber', 'BC123456789',
      'groupNumber', 'GRP987654'
    )
  ),
  (
    user2_id,
    '1978-08-22',
    'male',
    'A+',
    ARRAY['Shellfish', 'Ibuprofen'],
    ARRAY['Metformin 500mg', 'Atorvastatin 20mg'],
    ARRAY['Type 2 Diabetes', 'High cholesterol'],
    jsonb_build_object(
      'name', 'Lisa Smith',
      'relationship', 'Wife',
      'phone', '(555) 234-5678'
    ),
    jsonb_build_object(
      'provider', 'Aetna',
      'policyNumber', 'AET987654321',
      'groupNumber', 'GRP123456'
    )
  ),
  (
    user3_id,
    '1992-11-30',
    'female',
    'B-',
    ARRAY['Latex'],
    ARRAY['Sertraline 50mg', 'Albuterol inhaler'],
    ARRAY['Asthma', 'Anxiety'],
    jsonb_build_object(
      'name', 'Robert Davis',
      'relationship', 'Father',
      'phone', '(555) 345-6789'
    ),
    jsonb_build_object(
      'provider', 'UnitedHealth',
      'policyNumber', 'UH456789123',
      'groupNumber', 'GRP345678'
    )
  );
END $$;