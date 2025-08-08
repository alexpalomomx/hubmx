-- Attach triggers to keep communities.members_count in sync
DROP TRIGGER IF EXISTS trg_members_count_insert ON public.community_members;
DROP TRIGGER IF EXISTS trg_members_count_update ON public.community_members;
DROP TRIGGER IF EXISTS trg_members_count_delete ON public.community_members;

CREATE TRIGGER trg_members_count_insert
AFTER INSERT ON public.community_members
FOR EACH ROW EXECUTE FUNCTION public.update_community_member_count();

CREATE TRIGGER trg_members_count_update
AFTER UPDATE ON public.community_members
FOR EACH ROW EXECUTE FUNCTION public.update_community_member_count();

CREATE TRIGGER trg_members_count_delete
AFTER DELETE ON public.community_members
FOR EACH ROW EXECUTE FUNCTION public.update_community_member_count();