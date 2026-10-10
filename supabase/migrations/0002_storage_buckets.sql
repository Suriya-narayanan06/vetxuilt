-- Private buckets. Upload flows must validate file type/size and use authenticated user folders.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values
 ('student-documents','student-documents',false,10485760,array['image/jpeg','image/png','application/pdf']),
 ('project-files','project-files',false,52428800,array['application/pdf','image/jpeg','image/png','text/plain','application/zip','application/x-zip-compressed']),
 ('profile-photos','profile-photos',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "Users can upload own student documents" on storage.objects
for insert to authenticated with check (bucket_id='student-documents' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "Users can view own student documents or admins can review" on storage.objects
for select to authenticated using (bucket_id='student-documents' and ((storage.foldername(name))[1]=auth.uid()::text or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')));
create policy "Users can update own student documents" on storage.objects
for update to authenticated using (bucket_id='student-documents' and (storage.foldername(name))[1]=auth.uid()::text) with check (bucket_id='student-documents' and (storage.foldername(name))[1]=auth.uid()::text);

create policy "Project participants can upload project files" on storage.objects
for insert to authenticated with check (
 bucket_id='project-files' and exists (
   select 1 from public.projects p
   where p.id::text=(storage.foldername(name))[1]
   and (p.client_id=auth.uid() or exists(select 1 from public.bids b where b.project_id=p.id and b.developer_id=auth.uid() and b.status='accepted'))
 )
);
create policy "Project participants can read project files" on storage.objects
for select to authenticated using (
 bucket_id='project-files' and exists (
   select 1 from public.projects p
   where p.id::text=(storage.foldername(name))[1]
   and (p.client_id=auth.uid() or exists(select 1 from public.bids b where b.project_id=p.id and b.developer_id=auth.uid() and b.status='accepted'))
 )
);
create policy "Users can manage own profile photos" on storage.objects
for insert to authenticated with check (bucket_id='profile-photos' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "Profile photos are public" on storage.objects
for select to anon, authenticated using (bucket_id='profile-photos');
