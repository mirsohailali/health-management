/*
  # Add March 2025 appointments

  1. Changes
    - Add mock appointments for March 2025
    - Include a variety of appointment types and statuses
    - Generate appointments for weekdays only
    - Include both in-person and telehealth appointments

  2. Data
    - Appointments will be created for the mock patient and doctor
    - Times will be between 8 AM and 4 PM
    - Mix of statuses: scheduled, confirmed, completed
    - Mix of types: in-person and telehealth
*/

-- Clear any existing March 2025 appointments
DELETE FROM appointments 
WHERE start_time >= '2025-03-01' 
AND start_time < '2025-04-01';

-- Insert appointments for March 2025
INSERT INTO appointments (
  id,
  patient_id,
  provider_id,
  start_time,
  end_time,
  type,
  status,
  notes
) 
SELECT 
  gen_random_uuid(),
  '55555555-5555-5555-5555-555555555555', -- Our mock patient ID
  '22222222-2222-2222-2222-222222222222', -- Our mock doctor ID
  date_series + (interval '1 hour' * (8 + (random() * 8)::integer)), -- Random time between 8 AM and 4 PM
  date_series + (interval '1 hour' * (8 + (random() * 8)::integer) + interval '30 minutes'), -- 30 min appointments
  CASE WHEN random() < 0.3 THEN 'telehealth' ELSE 'in-person' END, -- 30% telehealth appointments
  CASE 
    WHEN random() < 0.6 THEN 'scheduled'
    WHEN random() < 0.8 THEN 'confirmed'
    ELSE 'completed'
  END,
  CASE 
    WHEN random() < 0.25 THEN 'Regular Check-up'
    WHEN random() < 0.5 THEN 'Follow-up Visit'
    WHEN random() < 0.75 THEN 'Consultation'
    ELSE 'Annual Physical'
  END
FROM generate_series(
  '2025-03-01'::date,
  '2025-03-31'::date,
  interval '1 day'
) AS date_series
WHERE EXTRACT(DOW FROM date_series) BETWEEN 1 AND 5; -- Weekdays only

-- Add some specific appointments
INSERT INTO appointments (
  id,
  patient_id,
  provider_id,
  start_time,
  end_time,
  type,
  status,
  notes
)
VALUES
(
  gen_random_uuid(),
  '55555555-5555-5555-5555-555555555555',
  '22222222-2222-2222-2222-222222222222',
  '2025-03-15 10:00:00',
  '2025-03-15 10:45:00',
  'telehealth',
  'confirmed',
  'Diabetes Follow-up'
),
(
  gen_random_uuid(),
  '55555555-5555-5555-5555-555555555555',
  '22222222-2222-2222-2222-222222222222',
  '2025-03-20 14:00:00',
  '2025-03-20 14:30:00',
  'in-person',
  'scheduled',
  'Blood Pressure Check'
),
(
  gen_random_uuid(),
  '55555555-5555-5555-5555-555555555555',
  '22222222-2222-2222-2222-222222222222',
  '2025-03-25 11:00:00',
  '2025-03-25 12:00:00',
  'in-person',
  'confirmed',
  'Annual Physical Examination'
);