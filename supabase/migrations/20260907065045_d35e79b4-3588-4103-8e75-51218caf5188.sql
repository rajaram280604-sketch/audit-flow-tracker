drop policy if exists "Engagement users can manage misstatements" on public.misstatements;
create policy "Engagement users can manage misstatements" on public.misstatements for all to authenticated using (
  exists (select 1 from public.engagements e where e.id = misstatements.engagement_id and e.owner_id = auth.uid())
  or exists (select 1 from public.engagement_members m where m.engagement_id = misstatements.engagement_id and m.user_id = auth.uid())
) with check (
  (identified_by = auth.uid())
  or exists (select 1 from public.engagements e where e.id = misstatements.engagement_id and e.owner_id = auth.uid())
  or exists (select 1 from public.engagement_members m where m.engagement_id = misstatements.engagement_id and m.user_id = auth.uid())
);

drop policy if exists "Engagement users can view materiality" on public.materiality_assessments;
create policy "Engagement users can view materiality" on public.materiality_assessments for select to authenticated using (
  exists (select 1 from public.engagements e where e.id = materiality_assessments.engagement_id and e.owner_id = auth.uid())
  or exists (select 1 from public.engagement_members m where m.engagement_id = materiality_assessments.engagement_id and m.user_id = auth.uid())
);

drop policy if exists "Users can view engagement hours" on public.time_entries;
create policy "Users can view engagement hours" on public.time_entries for select to authenticated using (
  user_id = auth.uid()
  or exists (select 1 from public.engagements e where e.id = time_entries.engagement_id and e.owner_id = auth.uid())
  or exists (select 1 from public.engagement_members m where m.engagement_id = time_entries.engagement_id and m.user_id = auth.uid())
);

drop policy if exists "Users can log their own hours" on public.time_entries;
create policy "Users can log their own hours" on public.time_entries for insert to authenticated with check (
  user_id = auth.uid()
  and (
    exists (select 1 from public.engagements e where e.id = time_entries.engagement_id and e.owner_id = auth.uid())
    or exists (select 1 from public.engagement_members m where m.engagement_id = time_entries.engagement_id and m.user_id = auth.uid())
  )
);

drop policy if exists "Engagement users can view audit events" on public.audit_events;
create policy "Engagement users can view audit events" on public.audit_events for select to authenticated using (
  exists (select 1 from public.engagements e where e.id = audit_events.engagement_id and e.owner_id = auth.uid())
  or exists (select 1 from public.engagement_members m where m.engagement_id = audit_events.engagement_id and m.user_id = auth.uid())
);

drop policy if exists "Engagement users can record audit events" on public.audit_events;
create policy "Engagement users can record audit events" on public.audit_events for insert to authenticated with check (
  actor_id = auth.uid()
  and (
    exists (select 1 from public.engagements e where e.id = audit_events.engagement_id and e.owner_id = auth.uid())
    or exists (select 1 from public.engagement_members m where m.engagement_id = audit_events.engagement_id and m.user_id = auth.uid())
  )
);

revoke update, delete on public.audit_events from authenticated;
revoke update, delete on public.audit_events from anon;

drop function if exists public.record_audit_event(uuid, public.audit_event_type, text, uuid, text, jsonb);
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
security definer
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