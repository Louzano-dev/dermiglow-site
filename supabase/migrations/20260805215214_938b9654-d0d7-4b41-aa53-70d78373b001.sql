CREATE OR REPLACE FUNCTION public.has_delivered_purchase(_user_id uuid, _handle text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.order_items i ON i.order_id = o.id
    WHERE o.user_id = _user_id
      AND i.product_handle = _handle
      AND o.delivered_at IS NOT NULL
  );
$$;
REVOKE ALL ON FUNCTION public.has_delivered_purchase(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_delivered_purchase(uuid, text) TO authenticated, service_role;