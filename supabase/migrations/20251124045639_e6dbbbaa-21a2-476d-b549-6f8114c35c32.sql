-- Add policy to allow public users to view fields of public, published forms
create policy "Public users can view fields of public forms"
  on public.form_fields
  for select
  to public
  using (
    exists (
      select 1
      from public.forms
      where forms.id = form_fields.form_id
        and forms.is_public = true
        and forms.status = 'published'
    )
  );