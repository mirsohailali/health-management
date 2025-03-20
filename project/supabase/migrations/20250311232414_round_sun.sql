/*
  # Create tables and mock data for health clinic management system

  1. New Tables
    - appointments: Store appointment information
    - medical_records: Store patient medical records
    - custom_forms: Store form templates
    - form_submissions: Store submitted form data

  2. Mock Data
    - 5 doctors with specialties
    - 10 patients with complete profiles
    - Medical records for each patient
    - Past and future appointments
    - Form templates and submissions
*/

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patient_profiles(id),
  provider_id uuid REFERENCES auth.users(id),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  type text NOT NULL CHECK (type IN ('in-person', 'telehealth')),
  status text NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create medical_records table
CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patient_profiles(id),
  provider_id uuid REFERENCES auth.users(id),
  visit_date timestamptz NOT NULL,
  visit_type text NOT NULL,
  subjective text,
  objective text,
  assessment text,
  plan text,
  vital_signs jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create custom_forms table
CREATE TABLE IF NOT EXISTS custom_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  form_fields jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create form_submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES custom_forms(id),
  patient_id uuid REFERENCES patient_profiles(id),
  submitted_data jsonb NOT NULL,
  submitted_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Patients can view their own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Medical staff can view all appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'role')::text = ANY (ARRAY['doctor', 'nurse', 'admin'])
  );

CREATE POLICY "Patients can view their own medical records"
  ON medical_records
  FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Medical staff can manage medical records"
  ON medical_records
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'role')::text = ANY (ARRAY['doctor', 'nurse', 'admin'])
  );

CREATE POLICY "Medical staff can manage forms"
  ON custom_forms
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'role')::text = ANY (ARRAY['doctor', 'nurse', 'admin'])
  );

CREATE POLICY "Patients can view forms"
  ON custom_forms
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Patients can view their own form submissions"
  ON form_submissions
  FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Medical staff can view all form submissions"
  ON form_submissions
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'role')::text = ANY (ARRAY['doctor', 'nurse', 'admin'])
  );

-- Create mock doctors in auth.users
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
  ('d1b23e4d-5f6a-4b8c-9d0e-1f2a3b4c5d6e', '00000000-0000-0000-0000-000000000000', 'dr.thompson.1@example.com', '$2a$10$Q7HGHS.VWh6O4D8alvUkJOB3J8zI6NGBQMjzRGTnGHGGqYZkBg7Ue', NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Emma","last_name":"Thompson","role":"doctor","specialty":"Family Medicine"}', NOW(), NOW()),
  ('e2c34f5e-6f7b-4c8d-9e0f-1a2b3c4d5e6f', '00000000-0000-0000-0000-000000000000', 'dr.patel.1@example.com', '$2a$10$Q7HGHS.VWh6O4D8alvUkJOB3J8zI6NGBQMjzRGTnGHGGqYZkBg7Ue', NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Raj","last_name":"Patel","role":"doctor","specialty":"Cardiology"}', NOW(), NOW()),
  ('f3d45e6f-7e8d-4c9b-8a7c-6d5e4f3a2b1c', '00000000-0000-0000-0000-000000000000', 'dr.rodriguez.1@example.com', '$2a$10$Q7HGHS.VWh6O4D8alvUkJOB3J8zI6NGBQMjzRGTnGHGGqYZkBg7Ue', NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Maria","last_name":"Rodriguez","role":"doctor","specialty":"Pediatrics"}', NOW(), NOW()),
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '00000000-0000-0000-0000-000000000000', 'dr.chen.1@example.com', '$2a$10$Q7HGHS.VWh6O4D8alvUkJOB3J8zI6NGBQMjzRGTnGHGGqYZkBg7Ue', NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Wei","last_name":"Chen","role":"doctor","specialty":"Internal Medicine"}', NOW(), NOW()),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', '00000000-0000-0000-0000-000000000000', 'dr.smith.1@example.com', '$2a$10$Q7HGHS.VWh6O4D8alvUkJOB3J8zI6NGBQMjzRGTnGHGGqYZkBg7Ue', NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"James","last_name":"Smith","role":"doctor","specialty":"Orthopedics"}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create mock patients in auth.users
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'michael.brown.1@example.com', '$2a$10$Q7HGHS.VWh6O4D8alvUkJOB3J8zI6NGBQMjzRGTnGHGGqYZkBg7Ue', NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Michael","last_name":"Brown","role":"patient"}', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'emily.davis.1@example.com', '$2a$10$Q7HGHS.VWh6O4D8alvUkJOB3J8zI6NGBQMjzRGTnGHGGqYZkBg7Ue', NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Emily","last_name":"Davis","role":"patient"}', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'david.wilson.1@example.com', '$2a$10$Q7HGHS.VWh6O4D8alvUkJOB3J8zI6NGBQMjzRGTnGHGGqYZkBg7Ue', NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"David","last_name":"Wilson","role":"patient"}', NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'sophia.lee.1@example.com', '$2a$10$Q7HGHS.VWh6O4D8alvUkJOB3J8zI6NGBQMjzRGTnGHGGqYZkBg7Ue', NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Sophia","last_name":"Lee","role":"patient"}', NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'oliver.taylor.1@example.com', '$2a$10$Q7HGHS.VWh6O4D8alvUkJOB3J8zI6NGBQMjzRGTnGHGGqYZkBg7Ue', NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Oliver","last_name":"Taylor","role":"patient"}', NOW(), NOW()),
  ('66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000000', 'ava.martinez.1@example.com', '$2a$10$Q7HGHS.VWh6O4D8alvUkJOB3J8zI6NGBQMjzRGTnGHGGqYZkBg7Ue', NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Ava","last_name":"Martinez","role":"patient"}', NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777777', '00000000-0000-0000-0000-000000000000', 'ethan.anderson.1@example.com', '$2a$10$Q7HGHS.VWh6O4D8alvUkJOB3J8zI6NGBQMjzRGTnGHGGqYZkBg7Ue', NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Ethan","last_name":"Anderson","role":"patient"}', NOW(), NOW()),
  ('88888888-8888-8888-8888-888888888888', '00000000-0000-0000-0000-000000000000', 'isabella.white.1@example.com', '$2a$10$Q7HGHS.VWh6O4D8alvUkJOB3J8zI6NGBQMjzRGTnGHGGqYZkBg7Ue', NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Isabella","last_name":"White","role":"patient"}', NOW(), NOW()),
  ('99999999-9999-9999-9999-999999999999', '00000000-0000-0000-0000-000000000000', 'lucas.garcia.1@example.com', '$2a$10$Q7HGHS.VWh6O4D8alvUkJOB3J8zI6NGBQMjzRGTnGHGGqYZkBg7Ue', NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Lucas","last_name":"Garcia","role":"patient"}', NOW(), NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'mia.thompson.1@example.com', '$2a$10$Q7HGHS.VWh6O4D8alvUkJOB3J8zI6NGBQMjzRGTnGHGGqYZkBg7Ue', NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Mia","last_name":"Thompson","role":"patient"}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create patient profiles
INSERT INTO patient_profiles (id, user_id, date_of_birth, gender, blood_type, allergies, medications, medical_conditions, emergency_contact, insurance_info)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '1985-03-15', 'male', 'A+', ARRAY['Peanuts', 'Penicillin'], ARRAY['Lisinopril', 'Metformin'], ARRAY['Hypertension', 'Type 2 Diabetes'], '{"name": "Sarah Brown", "relationship": "Spouse", "phone": "555-0101"}', '{"provider": "Blue Cross", "policyNumber": "BC123456", "groupNumber": "G123"}'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', '1992-07-22', 'female', 'O-', ARRAY['Latex'], ARRAY['Sertraline'], ARRAY['Anxiety'], '{"name": "Robert Davis", "relationship": "Father", "phone": "555-0102"}', '{"provider": "Aetna", "policyNumber": "AE789012", "groupNumber": "G456"}'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', '1978-11-30', 'male', 'B+', ARRAY['Shellfish'], ARRAY['Atorvastatin'], ARRAY['High Cholesterol'], '{"name": "Mary Wilson", "relationship": "Sister", "phone": "555-0103"}', '{"provider": "United Health", "policyNumber": "UH345678", "groupNumber": "G789"}'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444', '1995-04-18', 'female', 'AB+', ARRAY['Dust Mites'], ARRAY['Albuterol'], ARRAY['Asthma'], '{"name": "James Lee", "relationship": "Brother", "phone": "555-0104"}', '{"provider": "Cigna", "policyNumber": "CI901234", "groupNumber": "G012"}'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '55555555-5555-5555-5555-555555555555', '1989-09-05', 'male', 'A-', ARRAY['Ibuprofen'], ARRAY['Omeprazole'], ARRAY['GERD'], '{"name": "Emma Taylor", "relationship": "Spouse", "phone": "555-0105"}', '{"provider": "Humana", "policyNumber": "HU567890", "groupNumber": "G345"}'),
  ('11111111-2222-3333-4444-555555555555', '66666666-6666-6666-6666-666666666666', '1993-12-12', 'female', 'O+', ARRAY['Sulfa Drugs'], ARRAY['Levothyroxine'], ARRAY['Hypothyroidism'], '{"name": "Carlos Martinez", "relationship": "Father", "phone": "555-0106"}', '{"provider": "Kaiser", "policyNumber": "KP123789", "groupNumber": "G678"}'),
  ('22222222-3333-4444-5555-666666666666', '77777777-7777-7777-7777-777777777777', '1982-06-25', 'male', 'B-', ARRAY['Dairy'], ARRAY['Fluoxetine'], ARRAY['Depression'], '{"name": "Linda Anderson", "relationship": "Mother", "phone": "555-0107"}', '{"provider": "Anthem", "policyNumber": "AN456012", "groupNumber": "G901"}'),
  ('33333333-4444-5555-6666-777777777777', '88888888-8888-8888-8888-888888888888', '1991-02-14', 'female', 'AB-', ARRAY['Amoxicillin'], ARRAY['Escitalopram'], ARRAY['Anxiety', 'Depression'], '{"name": "Michael White", "relationship": "Spouse", "phone": "555-0108"}', '{"provider": "Molina", "policyNumber": "MO789345", "groupNumber": "G234"}'),
  ('44444444-5555-6666-7777-888888888888', '99999999-9999-9999-9999-999999999999', '1987-08-08', 'male', 'O+', ARRAY['Pollen'], ARRAY['Montelukast'], ARRAY['Seasonal Allergies'], '{"name": "Sofia Garcia", "relationship": "Sister", "phone": "555-0109"}', '{"provider": "Centene", "policyNumber": "CE012678", "groupNumber": "G567"}'),
  ('55555555-6666-7777-8888-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '1994-10-20', 'female', 'A+', ARRAY['Eggs'], ARRAY['Cetirizine'], ARRAY['Food Allergies'], '{"name": "William Thompson", "relationship": "Father", "phone": "555-0110"}', '{"provider": "WellCare", "policyNumber": "WC345901", "groupNumber": "G890"}')
ON CONFLICT (id) DO NOTHING;

-- Create medical records
INSERT INTO medical_records (id, patient_id, provider_id, visit_date, visit_type, subjective, objective, assessment, plan, vital_signs)
SELECT 
  gen_random_uuid(),
  patient.id,
  (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'doctor' ORDER BY random() LIMIT 1),
  NOW() - (interval '1 day' * floor(random() * 365)),
  (ARRAY['Check-up', 'Follow-up', 'Acute Visit', 'Chronic Care', 'Consultation'])[floor(random() * 5 + 1)],
  'Patient reports ' || (ARRAY['feeling well', 'mild fatigue', 'occasional headaches', 'seasonal allergies', 'joint pain'])[floor(random() * 5 + 1)],
  'Physical examination reveals ' || (ARRAY['normal findings', 'slight elevation in blood pressure', 'mild respiratory congestion', 'normal range of motion', 'clear lung sounds'])[floor(random() * 5 + 1)],
  'Patient is ' || (ARRAY['in good health', 'showing improvement', 'responding well to treatment', 'stable', 'making progress'])[floor(random() * 5 + 1)],
  'Continue current medications. ' || (ARRAY['Follow up in 3 months', 'Schedule follow-up in 6 weeks', 'Return if symptoms worsen', 'Maintain healthy lifestyle', 'Monitor blood pressure'])[floor(random() * 5 + 1)],
  jsonb_build_object(
    'temperature', 98.6 + (random() * 2 - 1),
    'bloodPressure', (110 + floor(random() * 30))::text || '/' || (70 + floor(random() * 20))::text,
    'heartRate', 60 + floor(random() * 40),
    'respiratoryRate', 12 + floor(random() * 8),
    'oxygenSaturation', 95 + floor(random() * 5),
    'weight', 120 + floor(random() * 100),
    'height', 60 + floor(random() * 20)
  )
FROM patient_profiles patient
CROSS JOIN generate_series(1, 5) -- 5 records per patient
ON CONFLICT (id) DO NOTHING;

-- Create appointments (past and future)
INSERT INTO appointments (id, patient_id, provider_id, start_time, end_time, type, status, notes)
SELECT 
  gen_random_uuid(),
  patient.id,
  (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'doctor' ORDER BY random() LIMIT 1),
  CASE 
    WHEN s <= 3 THEN NOW() + (interval '1 day' * floor(random() * 30)) -- Future appointments
    ELSE NOW() - (interval '1 day' * floor(random() * 30)) -- Past appointments
  END,
  CASE 
    WHEN s <= 3 THEN NOW() + (interval '1 day' * floor(random() * 30) + interval '30 minutes')
    ELSE NOW() - (interval '1 day' * floor(random() * 30) + interval '30 minutes')
  END,
  (ARRAY['in-person', 'telehealth'])[floor(random() * 2 + 1)],
  (ARRAY['scheduled', 'confirmed', 'completed', 'cancelled'])[floor(random() * 4 + 1)],
  (ARRAY['Regular check-up', 'Follow-up visit', 'Consultation', 'Annual physical', 'Prescription renewal'])[floor(random() * 5 + 1)]
FROM patient_profiles patient
CROSS JOIN generate_series(1, 5) s -- 5 appointments per patient
ON CONFLICT (id) DO NOTHING;

-- Create custom forms
INSERT INTO custom_forms (id, title, description, form_fields, created_by)
VALUES
  (
    gen_random_uuid(),
    'New Patient Intake Form',
    'Complete this form for your first visit',
    '[
      {"id": "1", "type": "text", "label": "Previous Primary Care Physician", "required": true},
      {"id": "2", "type": "textarea", "label": "Current Medications", "required": true},
      {"id": "3", "type": "checkbox", "label": "Past Surgeries", "options": ["Appendectomy", "Tonsillectomy", "Other"], "required": false}
    ]'::jsonb,
    (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'doctor' LIMIT 1)
  ),
  (
    gen_random_uuid(),
    'Medical History Update',
    'Annual medical history update form',
    '[
      {"id": "1", "type": "radio", "label": "Smoking Status", "options": ["Never", "Former", "Current"], "required": true},
      {"id": "2", "type": "select", "label": "Exercise Frequency", "options": ["None", "1-2 times/week", "3-4 times/week", "5+ times/week"], "required": true},
      {"id": "3", "type": "textarea", "label": "Recent Changes in Health", "required": false}
    ]'::jsonb,
    (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'doctor' LIMIT 1)
  )
ON CONFLICT (id) DO NOTHING;

-- Create form submissions
INSERT INTO form_submissions (id, form_id, patient_id, submitted_data, submitted_at)
SELECT
  gen_random_uuid(),
  form.id,
  patient.id,
  CASE 
    WHEN form.title = 'New Patient Intake Form' THEN
      '{"1": "Dr. Smith", "2": "None", "3": ["Appendectomy"]}'::jsonb
    ELSE
      '{"1": "Never", "2": "3-4 times/week", "3": "No significant changes"}'::jsonb
  END,
  NOW() - (interval '1 day' * floor(random() * 30))
FROM custom_forms form
CROSS JOIN patient_profiles patient
LIMIT 20 -- 2 submissions per patient
ON CONFLICT (id) DO NOTHING;