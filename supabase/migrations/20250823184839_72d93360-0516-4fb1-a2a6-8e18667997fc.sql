-- Temporarily modify is_admin function to allow current user admin access
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- Temporary admin bootstrap: return true for any authenticated user
  -- This allows the first user to access /admin and set up proper admin users
  SELECT CASE 
    WHEN $1 IS NOT NULL THEN true  -- Any authenticated user gets admin access temporarily
    ELSE false
  END;
$function$;