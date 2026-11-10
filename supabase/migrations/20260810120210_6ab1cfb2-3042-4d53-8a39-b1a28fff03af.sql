-- 1) Force moderation on review inserts (defense in depth alongside the existing trigger)
DROP POLICY IF EXISTS reviews_insert_verified ON public.reviews;
CREATE POLICY reviews_insert_verified
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND public.has_delivered_purchase(auth.uid(), product_handle)
  AND status = 'pending'
  AND verified = true
);

-- 2) has_role no longer runs as SECURITY DEFINER.
-- user_roles already lets an authenticated user read their own roles,
-- and every policy calls has_role(auth.uid(), ...), so invoker rights are enough.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;