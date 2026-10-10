-- VETXUILT initial schema for Supabase/Postgres.
-- Apply using Supabase SQL Editor or Supabase CLI. Review security policy before production.
create extension if not exists pgcrypto;

create type public.app_role as enum ('both','client','developer','admin');
create type public.verification_status as enum ('not_submitted','pending','verified','rejected');
create type public.project_status as enum ('draft','open','in_progress','in_review','completed','cancelled','disputed');
create type public.bid_status as enum ('pending','accepted','rejected','withdrawn');
create type public.milestone_status as enum ('pending','in_progress','submitted','approved','paid','blocked');
create type public.payment_status as enum ('not_started','pending','authorized','paid','failed','refunded','disputed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  college_name text,
  course text,
  department text,
  study_year text,
  bio text check (char_length(coalesce(bio,'')) <= 1500),
  skills text[] not null default '{}',
  portfolio_url text,
  avatar_url text,
  role public.app_role not null default 'both',
  verification_status public.verification_status not null default 'not_submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  institution_name text not null,
  course text not null,
  student_id_last4 text check (student_id_last4 is null or char_length(student_id_last4) <= 4),
  document_path text not null,
  status public.verification_status not null default 'pending',
  admin_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(title) between 5 and 120),
  description text not null check (char_length(description) between 30 and 10000),
  category text not null default 'Other',
  skills text[] not null default '{}',
  budget_min numeric(12,2) check (budget_min is null or budget_min >= 0),
  budget_max numeric(12,2) check (budget_max is null or budget_max >= 0),
  deadline date,
  deliverables text,
  status public.project_status not null default 'open',
  accepted_bid_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (budget_min is null or budget_max is null or budget_max >= budget_min)
);
create index projects_status_created_idx on public.projects(status,created_at desc);
create index projects_client_idx on public.projects(client_id);

create table public.bids (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  developer_id uuid not null references public.profiles(id) on delete restrict,
  proposed_amount numeric(12,2) not null check (proposed_amount >= 0),
  delivery_days integer not null check (delivery_days > 0 and delivery_days <= 3650),
  proposal text not null check (char_length(proposal) between 20 and 5000),
  status public.bid_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique(project_id,developer_id)
);
alter table public.projects add constraint projects_accepted_bid_fk foreign key (accepted_bid_id) references public.bids(id) on delete set null;
create index bids_project_idx on public.bids(project_id,created_at desc);
create index bids_developer_idx on public.bids(developer_id,created_at desc);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 160),
  description text,
  amount numeric(12,2) not null check (amount >= 0),
  due_date date,
  status public.milestone_status not null default 'pending',
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);
create index milestones_project_idx on public.milestones(project_id,created_at);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index messages_project_created_idx on public.messages(project_id,created_at);

create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  submitted_by uuid not null references public.profiles(id) on delete restrict,
  storage_path text not null,
  note text,
  version integer not null default 1 check (version > 0),
  status text not null default 'submitted' check (status in ('submitted','accepted','revision_requested')),
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  communication integer check (communication between 1 and 5),
  quality integer check (quality between 1 and 5),
  timeliness integer check (timeliness between 1 and 5),
  comment text check (char_length(coalesce(comment,'')) <= 2000),
  created_at timestamptz not null default now(),
  unique(project_id,reviewer_id),
  check (reviewer_id <> reviewee_id)
);

create table public.payment_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  milestone_id uuid references public.milestones(id) on delete restrict,
  payer_id uuid not null references public.profiles(id) on delete restrict,
  payee_id uuid not null references public.profiles(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'INR' check (char_length(currency)=3),
  status public.payment_status not null default 'not_started',
  provider text,
  provider_order_id text,
  provider_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_project_idx on public.payment_records(project_id,created_at desc);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open','investigating','resolved','dismissed')),
  created_at timestamptz not null default now()
);

-- Create a profile row for every newly registered auth user.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id,email,full_name,phone,role)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data->>'full_name',''),
    nullif(new.raw_user_meta_data->>'phone',''),
    case when new.raw_user_meta_data->>'role' in ('client','developer','both')
      then (new.raw_user_meta_data->>'role')::public.app_role else 'both'::public.app_role end
  ) on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_updated_at before update on public.profiles
for each row execute procedure public.touch_updated_at();
create trigger projects_updated_at before update on public.projects
for each row execute procedure public.touch_updated_at();
create trigger payment_records_updated_at before update on public.payment_records
for each row execute procedure public.touch_updated_at();

-- Keep profile verification state synchronized with reviewed verification requests.
create or replace function public.sync_verification_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set verification_status = new.status where id = new.user_id;
  return new;
end;
$$;
create trigger verification_status_sync after insert or update of status on public.student_verifications
for each row execute procedure public.sync_verification_status();

-- Row-level security is mandatory. Client uses anon/publishable key only.
alter table public.profiles enable row level security;
alter table public.student_verifications enable row level security;
alter table public.projects enable row level security;
alter table public.bids enable row level security;
alter table public.milestones enable row level security;
alter table public.messages enable row level security;
alter table public.deliveries enable row level security;
alter table public.reviews enable row level security;
alter table public.payment_records enable row level security;
alter table public.reports enable row level security;

-- Public profile fields are visible to signed-in users; verification docs and private identifiers are not.
create policy "Signed-in users can view profiles" on public.profiles for select to authenticated using (true);
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id and role <> 'admin') with check (auth.uid() = id and role <> 'admin');

create policy "Users can view own verification" on public.student_verifications for select to authenticated using (auth.uid() = user_id or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "Users can submit own verification" on public.student_verifications for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own pending verification" on public.student_verifications for update to authenticated using (auth.uid() = user_id and status in ('not_submitted','rejected')) with check (auth.uid() = user_id and status='pending');
create policy "Admins can review verification" on public.student_verifications for update to authenticated using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));

create policy "Anyone signed in can view open projects" on public.projects for select to authenticated using (status='open' or client_id=auth.uid() or exists(select 1 from public.bids b where b.project_id=id and b.developer_id=auth.uid()) or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "Verified students can post projects" on public.projects for insert to authenticated with check (client_id=auth.uid() and exists(select 1 from public.profiles p where p.id=auth.uid() and p.verification_status='verified'));
create policy "Client can update own project" on public.projects for update to authenticated using (client_id=auth.uid()) with check (client_id=auth.uid());

create policy "Project participants can view bids" on public.bids for select to authenticated using (developer_id=auth.uid() or exists(select 1 from public.projects p where p.id=project_id and p.client_id=auth.uid()) or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "Verified developers can create bid" on public.bids for insert to authenticated with check (developer_id=auth.uid() and exists(select 1 from public.profiles p where p.id=auth.uid() and p.verification_status='verified') and exists(select 1 from public.projects p where p.id=project_id and p.status='open' and p.client_id<>auth.uid()));
create policy "Developer can withdraw own pending bid" on public.bids for update to authenticated using (developer_id=auth.uid() and status='pending') with check (developer_id=auth.uid() and status='withdrawn');
create policy "Client can accept or reject bid" on public.bids for update to authenticated using (exists(select 1 from public.projects p where p.id=project_id and p.client_id=auth.uid())) with check (exists(select 1 from public.projects p where p.id=project_id and p.client_id=auth.uid()));

create policy "Project participants can view milestones" on public.milestones for select to authenticated using (exists(select 1 from public.projects p where p.id=project_id and (p.client_id=auth.uid() or exists(select 1 from public.bids b where b.project_id=p.id and b.developer_id=auth.uid() and b.status='accepted'))));
create policy "Client can create milestones" on public.milestones for insert to authenticated with check (exists(select 1 from public.projects p where p.id=project_id and p.client_id=auth.uid()));
create policy "Participants can update milestones" on public.milestones for update to authenticated using (exists(select 1 from public.projects p where p.id=project_id and (p.client_id=auth.uid() or exists(select 1 from public.bids b where b.project_id=p.id and b.developer_id=auth.uid() and b.status='accepted')))) with check (exists(select 1 from public.projects p where p.id=project_id and (p.client_id=auth.uid() or exists(select 1 from public.bids b where b.project_id=p.id and b.developer_id=auth.uid() and b.status='accepted'))));

create policy "Participants can view project messages" on public.messages for select to authenticated using (exists(select 1 from public.projects p where p.id=project_id and (p.client_id=auth.uid() or exists(select 1 from public.bids b where b.project_id=p.id and b.developer_id=auth.uid() and b.status='accepted'))));
create policy "Participants can send project messages" on public.messages for insert to authenticated with check (sender_id=auth.uid() and exists(select 1 from public.projects p where p.id=project_id and (p.client_id=auth.uid() or exists(select 1 from public.bids b where b.project_id=p.id and b.developer_id=auth.uid() and b.status='accepted'))));

create policy "Participants can view deliveries" on public.deliveries for select to authenticated using (exists(select 1 from public.projects p where p.id=project_id and (p.client_id=auth.uid() or exists(select 1 from public.bids b where b.project_id=p.id and b.developer_id=auth.uid() and b.status='accepted'))));
create policy "Accepted developer can submit delivery" on public.deliveries for insert to authenticated with check (submitted_by=auth.uid() and exists(select 1 from public.bids b join public.projects p on p.id=b.project_id where b.project_id=deliveries.project_id and b.developer_id=auth.uid() and b.status='accepted'));

create policy "Signed-in users can view reviews" on public.reviews for select to authenticated using (true);
create policy "Project participants can review completed work" on public.reviews for insert to authenticated with check (reviewer_id=auth.uid() and exists(select 1 from public.projects p where p.id=project_id and p.status='completed' and (p.client_id=auth.uid() or exists(select 1 from public.bids b where b.project_id=p.id and b.developer_id=auth.uid() and b.status='accepted'))));

create policy "Participants can view payment records" on public.payment_records for select to authenticated using (payer_id=auth.uid() or payee_id=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "Payer can create own payment record" on public.payment_records for insert to authenticated with check (payer_id=auth.uid() and exists(select 1 from public.projects p where p.id=project_id and p.client_id=auth.uid()));
-- Payment status changes must be done by a verified server-side provider webhook, not by the browser.

create policy "Users can view reports they submitted" on public.reports for select to authenticated using (reporter_id=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "Users can submit reports" on public.reports for insert to authenticated with check (reporter_id=auth.uid());

-- Admin setup: after creating your account and profile, run manually in SQL editor:
-- update public.profiles set role='admin' where email='YOUR_ADMIN_EMAIL';
-- Never expose the Supabase service-role key in client-side code.
