/*
  # Update user profiles view

  1. Changes
    - Create view to expose user profile data including role from metadata
    - Grant appropriate permissions
    - Add security barrier for protection
  
  2. Security
    - View is restricted to authenticated users
    - Security barrier enabled to prevent leaking data
*/

-- Create the user_profiles view
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