-- SQL to create the exec_sql function in Supabase
-- This function allows executing SQL commands from application code
-- WARNING: This function can be dangerous in production as it allows arbitrary SQL execution
-- Only use in dev/test environments or ensure proper security measures are in place

-- Create the function that allows dynamic SQL execution
-- Note: SQL parameter name has been updated to match the expected parameter name in the error message
CREATE OR REPLACE FUNCTION public.exec_sql(sql_statement text)
RETURNS json AS
$$
DECLARE
  result json;
BEGIN
  -- Execute the SQL provided in the argument and capture the result
  EXECUTE sql_statement;
  
  -- Return a success message as JSON
  result := json_build_object('status', 'success', 'message', 'SQL executed successfully');
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  -- If there's an error, return error information as JSON
  result := json_build_object('status', 'error', 'message', SQLERRM, 'code', SQLSTATE);
  RETURN result;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER;

-- Add a comment describing the function
COMMENT ON FUNCTION public.exec_sql(text) IS 'Executes arbitrary SQL. Use with caution, only for admin purposes.';

-- Grant execution permission to authenticated users
-- You may want to limit this to specific roles in production
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon;
