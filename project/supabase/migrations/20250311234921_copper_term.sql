/*
  # Add user profile data with existence check

  1. Changes
    - Insert user profile data for mock users if they don't already exist
    - Uses DO block to safely handle existing records
*/

DO $$
BEGIN
  -- Insert first user if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '11111111-1111-1111-1111-111111111111') THEN
    INSERT INTO auth.users (
      id,
      email,
      raw_user_meta_data,
      created_at
    ) VALUES (
      '11111111-1111-1111-1111-111111111111',
      'patient@example.com',
      jsonb_build_object(
        'first_name', 'John',
        'last_name', 'Doe'
      ),
      now()
    );
  END IF;

  -- Insert second user if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '22222222-2222-2222-2222-222222222222') THEN
    INSERT INTO auth.users (
      id,
      email,
      raw_user_meta_data,
      created_at
    ) VALUES (
      '22222222-2222-2222-2222-222222222222',
      'dr.sarah.wilson@example.com',
      jsonb_build_object(
        'first_name', 'Sarah',
        'last_name', 'Wilson'
      ),
      now()
    );
  END IF;
END $$;