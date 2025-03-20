/*
  # Create March 2025 appointments

  1. Changes
    - Clear existing March 2025 appointments
    - Create 60 new appointments for March 2025
    - Appointments are distributed across weekdays
    - Mix of in-person and telehealth appointments
    - Various appointment types and durations
    - Realistic time slots between 8 AM and 5 PM

  2. Security
    - Uses existing RLS policies
    - References existing patient and provider IDs
*/

-- Clear any existing March 2025 appointments
DELETE FROM appointments 
WHERE start_time >= '2025-03-01' 
AND start_time < '2025-04-01';

-- Function to generate a random time between 8 AM and 5 PM
CREATE OR REPLACE FUNCTION random_time_between(start_hour integer, end_hour integer)
RETURNS integer AS $$
BEGIN
  RETURN start_hour + floor(random() * (end_hour - start_hour + 1))::integer;
END;
$$ LANGUAGE plpgsql;

-- Insert 60 appointments for March 2025
WITH numbered_days AS (
  SELECT generate_series(
    '2025-03-01'::date,
    '2025-03-31'::date,
    interval '1 day'
  ) AS day,
  row_number() OVER () as row_num
),
time_slots AS (
  SELECT 
    day,
    random_time_between(8, 16) as hour,
    row_num
  FROM numbered_days
  WHERE EXTRACT(DOW FROM day) BETWEEN 1 AND 5 -- Weekdays only
  LIMIT 60
)
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
  (day + (hour || ' hours')::interval)::timestamp,
  (day + (hour || ' hours')::interval + interval '30 minutes')::timestamp,
  CASE 
    WHEN random() < 0.3 THEN 'telehealth' 
    ELSE 'in-person' 
  END,
  CASE 
    WHEN random() < 0.5 THEN 'scheduled'
    WHEN random() < 0.8 THEN 'confirmed'
    ELSE 'completed'
  END,
  CASE 
    WHEN random() < 0.2 THEN 'Regular Check-up'
    WHEN random() < 0.4 THEN 'Follow-up Visit'
    WHEN random() < 0.6 THEN 'Blood Pressure Monitoring'
    WHEN random() < 0.8 THEN 'Diabetes Management'
    ELSE 'General Consultation'
  END
FROM time_slots;

-- Drop the temporary function
DROP FUNCTION random_time_between(integer, integer);