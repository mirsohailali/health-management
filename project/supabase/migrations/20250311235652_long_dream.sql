/*
  # Fix user roles and profiles view

  1. Changes
    - Update user metadata to include roles
    - Update user_profiles view to properly expose role field
  
  2. Security
    - View remains restricted to authenticated users
    - Security barrier maintained
*/

-- Update existing users with roles
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || 
  CASE 
    WHEN id = '11111111-1111-1111-1111-111111111111' THEN 
      jsonb_build_object('role', 'patient')
    WHEN id = '22222222-2222-2222-2222-222222222222' THEN 
      jsonb_build_object('role', 'doctor')
    ELSE 
      jsonb_build_object('role', 'patient')
  END
WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');

-- Recreate the user_profiles view
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  id,
  email,
  (raw_user_meta_data->>'first_name')::text as first_name,
  (raw_user_meta_data->>'last_name')::text as last_name,
  (raw_user_meta_data->>'role')::text as role
FROM auth.users;

-- Grant access to the authenticated users
GRANT SELECT ON user_profiles TO authenticated;

-- Enable security barrier
ALTER VIEW user_profiles SET (security_barrier = true);

COMMENT ON VIEW user_profiles IS 'View exposing user profile data from auth.users';