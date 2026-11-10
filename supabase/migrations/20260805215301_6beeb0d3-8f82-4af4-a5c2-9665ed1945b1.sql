CREATE OR REPLACE FUNCTION public.force_review_pending()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.status = 'pending';
  NEW.verified = true;
  RETURN NEW;
END;
$$;
CREATE TRIGGER reviews_force_pending BEFORE INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.force_review_pending();