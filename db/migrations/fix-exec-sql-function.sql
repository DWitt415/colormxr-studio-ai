-- Create proper exec_sql function with both parameter names for compatibility
-- This version handles both sql_statement and sql_string parameters

-- First drop the old function if it exists (all variations)
DROP FUNCTION IF EXISTS public.exec_sql(text);

-- Create the function with sql_statement parameter (primary)
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

-- Create an alias function with sql_string parameter for backwards compatibility
CREATE OR REPLACE FUNCTION public.exec_sql(sql_string text)
RETURNS json AS
$$
  -- Simply call the main function with the parameter renamed
  SELECT public.exec_sql(sql_string::text);
$$
LANGUAGE sql SECURITY DEFINER;

-- Add comments describing each function
COMMENT ON FUNCTION public.exec_sql(text) IS 'Executes arbitrary SQL. Use with caution, only for admin purposes.';

-- Grant execution permission to authenticated users and anonymous users
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon;
