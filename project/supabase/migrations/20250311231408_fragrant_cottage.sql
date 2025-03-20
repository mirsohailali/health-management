/*
  # Create mock user and patient profile

  1. Changes
    - Insert a mock user in auth.users table
    - Insert a mock patient profile linked to the user
    - Includes sample medical data

  2. Security
    - No security changes needed as we're just inserting test data
*/

-- First create the mock user in auth.users
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
  '123e4567-e89b-12d3-a456-426614174000',
  '00000000-0000-0000-0000-000000000000',
  'patient@example.com',
  '$2a$10$Q7HGHS.VWh6O4D8alvUkJOB3J8zI6NGBQMjzRGTnGHGGqYZkBg7Ue', -- Hashed password
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Sarah","last_name":"Johnson","role":"patient"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Then insert the patient profile
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
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '123e4567-e89b-12d3-a456-426614174000',
  '1990-01-01',
  'female',
  'O+',
  ARRAY['Penicillin', 'Pollen'],
  ARRAY['Vitamin D', 'Iron Supplement'],
  ARRAY['Asthma'],
  jsonb_build_object(
    'name', 'John Johnson',
    'relationship', 'Spouse',
    'phone', '555-0123'
  ),
  jsonb_build_object(
    'provider', 'Health Plus Insurance',
    'policyNumber', 'HP123456789',
    'groupNumber', 'G987654'
  )
) ON CONFLICT (id) DO NOTHING;