CREATE OR REPLACE FUNCTION public.handle_community_join()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.user_id IS NOT NULL AND NEW.status = 'active' AND (OLD IS NULL OR OLD.status != 'active') THEN
    PERFORM public.award_points(
      NEW.user_id,
      10,
      'community_join',
      'Unirse a la comunidad'
    );
  END IF;
  RETURN NEW;
END;
$function$;