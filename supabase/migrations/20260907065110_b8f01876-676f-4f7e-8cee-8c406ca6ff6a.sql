create or replace function public.record_audit_event(
  _engagement_id uuid,
  _event_type public.audit_event_type,
  _entity_type text,
  _entity_id uuid,
  _message text,
  _metadata jsonb default '{}'::jsonb
)
returns public.audit_events
language plpgsql
security invoker
set search_path = public
as $$
declare
  _actor_id uuid := auth.uid();
  _event public.audit_events;
begin
  if _actor_id is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1 from public.engagements e
    where e.id = _engagement_id and e.owner_id = _actor_id
  ) and not exists (
    select 1 from public.engagement_members m
    where m.engagement_id = _engagement_id and m.user_id = _actor_id
  ) then
    raise exception 'Not authorized for this engagement';
  end if;

  insert into public.audit_events (engagement_id, actor_id, event_type, entity_type, entity_id, message, metadata)
  values (_engagement_id, _actor_id, _event_type, _entity_type, _entity_id, _message, coalesce(_metadata, '{}'::jsonb))
  returning * into _event;

  return _event;
end;
$$;

grant execute on function public.record_audit_event(uuid, public.audit_event_type, text, uuid, text, jsonb) to authenticated;
revoke execute on function public.record_audit_event(uuid, public.audit_event_type, text, uuid, text, jsonb) from anon;