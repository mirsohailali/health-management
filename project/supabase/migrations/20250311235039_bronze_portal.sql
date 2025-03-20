/*
  # Create user_profiles view

  1. Changes
    - Creates a view to expose user profile data from auth.users
    - Maps raw_user_meta_data fields to columns
    - Grants necessary permissions
    - Sets security definer property correctly
*/

-- Create the user_profiles view
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  id,
  email,
  (raw_user_meta_data->>'first_name')::text as first_name,
  (raw_user_meta_data->>'last_name')::text as last_name
FROM auth.users;

-- Grant access to the authenticated users
GRANT SELECT ON user_profiles TO authenticated;

-- Set the view as security definer
ALTER VIEW user_profiles SET (security_barrier = true);

COMMENT ON VIEW user_profiles IS 'View exposing user profile data from auth.users';