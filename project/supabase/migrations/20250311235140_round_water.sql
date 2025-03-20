/*
  # Add mock appointments

  1. Changes
    - Adds sample appointments for the next month
    - Includes both in-person and telehealth appointments
    - Uses existing patient and doctor IDs
    - Adds variety of appointment types and times
*/

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
  current_date,
  current_date + interval '1 month',
  interval '1 day'
) AS date_series
WHERE EXTRACT(DOW FROM date_series) BETWEEN 1 AND 5; -- Weekdays only

-- Add some additional appointments for variety
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
  current_timestamp + interval '2 days' + interval '10 hours',
  current_timestamp + interval '2 days' + interval '10 hours' + interval '45 minutes',
  'telehealth',
  'confirmed',
  'Diabetes Follow-up'
),
(
  gen_random_uuid(),
  '55555555-5555-5555-5555-555555555555',
  '22222222-2222-2222-2222-222222222222',
  current_timestamp + interval '3 days' + interval '14 hours',
  current_timestamp + interval '3 days' + interval '14 hours' + interval '30 minutes',
  'in-person',
  'scheduled',
  'Blood Pressure Check'
),
(
  gen_random_uuid(),
  '55555555-5555-5555-5555-555555555555',
  '22222222-2222-2222-2222-222222222222',
  current_timestamp + interval '5 days' + interval '11 hours',
  current_timestamp + interval '5 days' + interval '11 hours' + interval '1 hour',
  'in-person',
  'confirmed',
  'Annual Physical Examination'
);